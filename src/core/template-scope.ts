import * as fs from "fs-extra";
import * as path from "path";
import { fileNames, getAllParentPaths, isNotNullish, promisePool, readYaml } from "../util";
import { TemplateRootData, TemplateUsageDeclaration } from "../types";

export class TemplateScope {
  private loadedTemplates: Record<string, TemplateUsageDeclaration> = {};

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

    await promisePool(run => {
      for (const templateRoot of templateRoots) {
        for (const repo of templateRoot.repositories) {
          run(this.initRepository(path.join(path.dirname(templateRoot.path), repo)));
        }
      }
    });

    for (const templateRoot of templateRoots) {
      for (const [key, templateData] of Object.entries(templateRoot.templates)) {
        const source = typeof templateData === "string" ? templateData : templateData.source;
        this.loadedTemplates[key] = {
          ...(typeof templateData === "string" ? {} : templateData),
          source: path.join(path.dirname(templateRoot.path), source),
        };
      }
    }
  }

  getTemplates() {
    return this.loadedTemplates;
  }

  private getAllParentPaths() {
    return getAllParentPaths(this.cwd);
  }

  private async initRepository(repoPath: string) {
    (await fs.readdir(repoPath, { withFileTypes: true }))
      .filter(file => file.isDirectory() || path.extname(file.name) === ".ts")
      .map(file => [file.name, path.join(repoPath, file.name)])
      .forEach(([key, source]) => {
        this.loadedTemplates[path.basename(key, path.extname(key))] = { source };
      });
  }
}
