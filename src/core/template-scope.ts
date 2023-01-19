import * as fs from "fs-extra";
import * as path from "path";
import simpleGit from "simple-git";
import { fileNames, getAllParentPaths, isNotNullish, promisePool, readYaml } from "../util";
import { TemplateRootData, TemplateUsageDeclaration } from "../types";

export class TemplateScope {
  private loadedTemplates: Record<string, TemplateUsageDeclaration> = {};

  private repos: { localPath: string; isRemote: boolean }[] = [];

  constructor(private cwd: string) {}

  async initialize() {
    const templateRoots = (
      await Promise.all(
        this.getAllParentPaths().map<Promise<TemplateRootData | null>>(async folder => {
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
      for (const repo of templateRoot.repositories) {
        await this.initRepository(templateRoot, repo);
      }
    }

    for (const templateRoot of templateRoots) {
      for (const [key, templateData] of Object.entries(templateRoot.templates)) {
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
      this.repos.push({ localPath: relativePath, isRemote: false });
      return relativePath;
    }

    const [owner, repo, ...folderPieces] = repoPath.split("/");
    const gitFolderParent = path.join(fileNames.localReposDir, "repos");
    const gitFolder = path.join(gitFolderParent, `${owner}-${repo}`);
    const localPath = path.join(gitFolder, ...folderPieces);
    this.repos.push({ localPath, isRemote: true });

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
    await simpleGit().clone(githubHost, gitFolder);
    console.log(`Cloned ${githubHost} to ${gitFolder}`);

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
          };
        })
    );
  }
}
