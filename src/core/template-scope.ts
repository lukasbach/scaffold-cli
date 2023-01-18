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

  private async initRepository(repoPath: string) {
    await Promise.all(
      (
        await fs.readdir(repoPath, { withFileTypes: true })
      )
        .filter(file => file.isDirectory() || path.extname(file.name) === ".ts")
        .map(file => [file.name, path.join(repoPath, file.name)])
        .map(async ([key, source]) => {
          this.loadedTemplates[path.basename(key, path.extname(key))] = {
            source: await this.resolveTemplateSourceFilePath(source),
          };
        })
    );
  }
}
