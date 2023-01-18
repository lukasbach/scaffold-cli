import * as esbuild from "esbuild";
import path from "path";
import * as handlebars from "handlebars";
import fs from "fs-extra";
import { fileNames, hash } from "../util";
import { TemplateUsageDeclaration } from "../types";

export class Runner {
  private template: TemplateUsageDeclaration;

  private targetPath: string;

  private changedFiles = new Set<string>();

  public readonly handlebars = handlebars.create();

  public data: any = {};

  async runTemplate(template: TemplateUsageDeclaration, targetPath: string) {
    this.template = template;
    this.targetPath = targetPath;

    const outfile = await this.buildTemplate(template);
    await (await import(`file://${outfile}`)).default.default();
  }

  async buildTemplate(template: TemplateUsageDeclaration) {
    const outfile = path.join(fileNames.tempDir, `${hash(template.source)}.js`);

    await esbuild.build({
      entryPoints: [template.source],
      bundle: true,
      allowOverwrite: true,
      outfile,
      platform: "node",
    });

    return outfile;
  }

  async introspectTemplate(template: TemplateUsageDeclaration) {
    const outfile = await this.buildTemplate(template);
    scaffold.introspection.startIntrospection();
    await (await import(`file://${outfile}`)).default.default();
    scaffold.introspection.endIntrospection();
  }

  getTemplate() {
    return this.template;
  }

  getChangedFiles() {
    return this.changedFiles;
  }

  getTargetPath() {
    return this.targetPath;
  }

  addChangedFiles(...files: string[]) {
    for (const file of files) {
      this.changedFiles.add(file);
    }
  }
}
