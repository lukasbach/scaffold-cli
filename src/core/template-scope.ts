import * as fs from "fs-extra";
import * as path from "path";
import simpleGit from "simple-git";
import { fileNames, getAllParentPaths, isNotNullish, readYaml } from "../util";
import { TemplateRootData, TemplateUsageDeclaration } from "../types";

export class TemplateScope {
  private loadedTemplates: Record<string, TemplateUsageDeclaration & { repoPath?: string }> = {};

  private repos: {
    localPath: string;
    isRemote: boolean;
    name?: string;
    description?: string;
    author?: string;
  }[] = [];

  constructor(private cwd: string) {}

  async initialize() {
    const potentialTemplateRoots = [...this.getAllParentPaths(), os.homedir()];
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

    for (const templateRoot of templateRoots) {
      for (const repo of templateRoot.repositories ?? []) {
        await this.initRepository(templateRoot, repo);
      }
    }

    for (const templateRoot of templateRoots) {
      for (const [key, templateData] of Object.entries(templateRoot.templates ?? {})) {
        const source = path.join(
          path.dirname(templateRoot.path),
          typeof templateData === "string" ? templateData : templateData.source
        );
        this.loadedTemplates[key] = {
          ...(typeof templateData === "string" ? {} : templateData),
          source: await this.resolveTemplateSourceFilePath(source),
        };
      }
    }
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
    if (topLevelFiles.includes("yarn.lock")) {
      scaffold.logger.log(`Updating dependencies for ${gitFolder} with yarn...`);
      $("yarn", { cwd: gitFolder });
    } else if (topLevelFiles.includes("package.json")) {
      scaffold.logger.log(`Updating dependencies for ${gitFolder} with npm install...`);
      $("npm install", { cwd: gitFolder });
    }
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

    const [owner, repo, ...folderPieces] = repoPath.split("/");
    const gitFolderParent = path.join(fileNames.localReposDir, "repos");
    const gitFolder = path.join(gitFolderParent, `${owner}-${repo}`);
    const localPath = path.join(gitFolder, ...folderPieces);
    this.repos.push({ localPath, isRemote: true, ...(await this.loadRepoMetadata(localPath)) });

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
    console.log(`Cloning ${githubHost} to ${gitFolder}...`);
    await simpleGit().clone(githubHost, gitFolder);
    await this.installRepoDeps(gitFolder);

    if (!fs.existsSync(localPath)) {
      throw new Error(`Repo ${githubHost} does not contain the path ${folderPieces.join("/")}.`);
    }

    return localPath;
  }

  private async initRepository(templateRoot: TemplateRootData, repoPath: string) {
    const resolvedRepoPath = await this.resolveRepoPath(templateRoot, repoPath);

    await Promise.all(
      (
        await fs.readdir(resolvedRepoPath, { withFileTypes: true })
      )
        .filter(file => file.isDirectory() || path.extname(file.name) === ".ts")
        .map(file => [file.name, path.join(resolvedRepoPath, file.name)])
        .map(async ([key, source]) => {
          this.loadedTemplates[path.basename(key, path.extname(key))] = {
            source: await this.resolveTemplateSourceFilePath(source),
            repoPath: path.join(this.cwd, repoPath),
          };
        })
    );
  }

  private async loadRepoMetadata(localPath: string) {
    const metaFile = path.join(localPath, "scaffold-templates.yml");
    if (fs.existsSync(metaFile)) {
      return yaml.parse(await fs.readFile(metaFile, { encoding: "utf-8" })) as {
        name?: string;
        description?: string;
        author?: string;
      };
    }
    return {};
  }
}
