import * as fs from "fs-extra";
import * as path from "path";
import simpleGit from "simple-git";
import { ExecaChildProcess } from "execa";
import { fileNames, getAllParentPaths, isNotNullish, readYaml } from "../util";
import { RepoMetaData, TemplateRootData, TemplateUsageDeclaration } from "../types";

type AllRepoData = {
  localPath: string;
  isRemote: boolean;
  gitFolder?: string;
} & RepoMetaData;

export class TemplateScope {
  private loadedTemplates: Record<
    string,
    TemplateUsageDeclaration & { repoPath: string; repoMetaData?: RepoMetaData; sourceKey: string }
  > = {};

  private repos: AllRepoData[] = [];

  private userTemplateRoot: TemplateRootData;

  private nearestTemplateRoot: TemplateRootData;

  constructor(private cwd: string) {}

  async ensureUserTemplateRoot() {
    const userRootFile = path.join(os.homedir(), fileNames.templateRoot);
    if (!fs.existsSync(userRootFile)) {
      await fs.writeFile(
        userRootFile,
        "# Add template repositories that should be available everywhere on your system here:\n" +
          "repositories:\n#  - lukasbach/scaffold-cli/templates/react"
      );
    }
  }

  async initialize() {
    const potentialTemplateRoots = [os.homedir(), ...this.getAllParentPaths()];
    const templateRoots = (
      await Promise.all(
        potentialTemplateRoots.map<Promise<TemplateRootData | null>>(async folder => {
          const templateRoot = path.join(folder, fileNames.templateRoot);
          if (fs.existsSync(templateRoot)) {
            return {
              ...(await readYaml<TemplateRootData>(templateRoot)),
              path: templateRoot,
            };
          }
          return null;
        })
      )
    ).filter(isNotNullish);

    // eslint-disable-next-line prefer-destructuring
    this.userTemplateRoot = templateRoots[0];
    this.nearestTemplateRoot = templateRoots[templateRoots.length - 1];

    const coreRepo = "lukasbach/scaffold-cli/templates/core";
    await this.initRepository(
      { repositories: [coreRepo], path: os.homedir(), isInternal: true, templates: {} },
      coreRepo
    );

    for (const templateRoot of templateRoots) {
      for (const repo of templateRoot.repositories ?? []) {
        await this.initRepository(templateRoot, repo);
      }
    }

    for (const templateRoot of templateRoots) {
      for (const [key, templateData] of Object.entries(templateRoot.templates ?? {})) {
        const sourcePath = typeof templateData === "string" ? templateData : templateData.source;
        if (!sourcePath) {
          throw new Error(`Source string of template ${key} is invalid`);
        }
        const isRelativeSource = sourcePath.startsWith(".");
        const source = isRelativeSource
          ? path.join(path.dirname(templateRoot.path), sourcePath)
          : this.getGitFolder(sourcePath).localPath;
        const repoPath = isRelativeSource ? path.dirname(templateRoot.path) : this.getGitFolder(sourcePath).gitFolder;
        scaffold.logger.debug(`Registering explicitly defined template ${key} from ${repoPath}`);
        this.loadedTemplates[key] = {
          ...(typeof templateData === "string" ? {} : templateData),
          repoPath,
          sourceKey: sourcePath,
          source: await this.resolveTemplateSourceFilePath(source),
        };
      }
    }
  }

  getUserTemplateRoot() {
    return this.userTemplateRoot;
  }

  getNearestTemplateRoot() {
    return this.nearestTemplateRoot;
  }

  getTemplates() {
    return this.loadedTemplates;
  }

  getRepositories() {
    return this.repos;
  }

  async updateRepo(gitFolder: string) {
    scaffold.logger.log(`Pulling ${gitFolder}...`);
    await simpleGit(gitFolder).pull();
    await this.installRepoDeps(gitFolder);
  }

  private async installRepoDeps(gitFolder: string) {
    const topLevelFiles = await fs.readdir(gitFolder);
    let cmd: ExecaChildProcess<string> | null = null;
    if (topLevelFiles.includes("yarn.lock")) {
      scaffold.logger.debug(`Updating dependencies for ${gitFolder} with yarn...`);
      cmd = $("yarn", { cwd: gitFolder, stdout: "ignore" });
    } else if (topLevelFiles.includes("package.json")) {
      scaffold.logger.debug(`Updating dependencies for ${gitFolder} with npm install...`);
      cmd = $("npm install", { cwd: gitFolder, stdout: "ignore" });
    }
    cmd?.stdout?.pipe(process.stdout);
    cmd?.stderr?.pipe(process.stderr);
    await cmd;
  }

  private async resolveTemplateSourceFilePath(sourceString: string) {
    if (!fs.existsSync(sourceString)) {
      if (fs.existsSync(`${sourceString}.ts`)) {
        return `${sourceString}.ts`;
      }
      throw Error(`Template ${sourceString} not found.`);
    }
    if ((await fs.stat(sourceString)).isDirectory()) {
      const source = path.join(sourceString, "template.ts");
      if (!fs.existsSync(source)) {
        throw Error(`Template ${sourceString} resolved as folder, but does not contain a template.ts file.`);
      }
      return source;
    }
    return sourceString;
  }

  private getAllParentPaths() {
    return getAllParentPaths(this.cwd);
  }

  private async resolveRepoPath(templateRoot: TemplateRootData, repoPath: string) {
    const relativePath = path.join(path.dirname(templateRoot.path), repoPath);

    if (fs.existsSync(relativePath)) {
      this.repos.push({
        localPath: relativePath,
        isRemote: false,
        ...(await this.loadRepoMetadata(relativePath)),
      });
      return relativePath;
    }

    const { localPath, gitFolder, gitFolderParent, owner, repo, folderPieces } = this.getGitFolder(repoPath);
    this.repos.push({ localPath, isRemote: true, gitFolder, ...(await this.loadRepoMetadata(localPath)) });

    if (fs.existsSync(localPath)) {
      return localPath;
    }

    if (fs.existsSync(gitFolder)) {
      throw new Error(
        `Repo is already cloned to ${gitFolder}, but folder ${localPath} does not exist. ` +
          `You can try to update the repo with "scaf update".`
      );
    }

    await fs.ensureDir(gitFolderParent);

    const githubHost = `https://github.com/${owner}/${repo}.git`;
    scaffold.logger.log(`Template Repository ${repoPath} is prepared for the first time, this can take a while...`);
    scaffold.logger.debug(`Cloning ${githubHost} to ${gitFolder}...`);
    await simpleGit().clone(githubHost, gitFolder);
    await this.installRepoDeps(gitFolder);

    if (!fs.existsSync(localPath)) {
      throw new Error(`Repo ${githubHost} does not contain the path ${folderPieces.join("/")}.`);
    }

    return localPath;
  }

  private getGitFolder(repoPath: string) {
    const [owner, repo, ...folderPieces] = repoPath.split("/");
    const gitFolderParent = path.join(fileNames.localReposDir, "repos");
    const gitFolder = path.join(gitFolderParent, `${owner}-${repo}`);
    const localPath = path.join(gitFolder, ...folderPieces);
    return { gitFolder, localPath, gitFolderParent, owner, repo, folderPieces };
  }

  private async initRepository(templateRoot: TemplateRootData, repoPath: string) {
    const resolvedRepoPath = await this.resolveRepoPath(templateRoot, repoPath);

    scaffold.logger.debug(`Initializing repo ${repoPath} and registering templates defined in there...`);

    await Promise.all(
      (
        await fs.readdir(resolvedRepoPath, { withFileTypes: true })
      )
        .filter(file => file.isDirectory() || path.extname(file.name) === ".ts")
        .map(file => [file.name, path.join(resolvedRepoPath, file.name)])
        .map(async ([key, source]) => {
          const cleanedKey = path.basename(key, path.extname(key));
          // console.log(
          //   "!!",
          //   repoPath,
          //   resolvedRepoPath,
          //   isUserTemplateRoot
          //     ? this.getGitFolder(repoPath).localPath
          //     : path.join(path.dirname(templateRoot.path), repoPath)
          // );
          scaffold.logger.debug(`Registering implicit template ${key} from ${resolvedRepoPath}`);
          this.loadedTemplates[cleanedKey] = {
            source: await this.resolveTemplateSourceFilePath(source),
            sourceKey: [repoPath, cleanedKey].join("/"),
            repoPath: resolvedRepoPath,
            repoMetaData: await this.loadRepoMetadata(resolvedRepoPath),
          };
        })
    );
  }

  private async loadRepoMetadata(localPath: string) {
    const metaFile = path.join(localPath, "scaffold-templates.yml");
    if (fs.existsSync(metaFile)) {
      return yaml.parse(await fs.readFile(metaFile, { encoding: "utf-8" })) as RepoMetaData;
    }
    return {};
  }
}
