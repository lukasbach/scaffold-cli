import * as esbuild from "esbuild";
import path from "path";
import * as handlebars from "handlebars";
import { fileNames, hash } from "../util";
import { TemplateUsageDeclaration } from "../types";
import { ScaffoldSdk } from "../sdk";

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
    await (await import(outfile)).default();

    if (template.postActions?.length) {
      for (const action of template.postActions) {
        scaffold.logger.debug(`Running pre-action ${action}`);
        await this.runExtraAction(global.lastSdk, action);
      }
    }
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
    this.changedFiles.clear();
    const outfile = await this.buildTemplate(template);
    scaffold.introspection.startIntrospection();
    await (await import(outfile)).default();
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

  private async runExtraAction(sdk: ScaffoldSdk, actionKey: string) {
    const action = sdk.actions[actionKey];

    if (!action) {
      throw new Error(
        `Action ${actionKey} was explicitly run in addition to template, but was not found. ` +
          `Try removing this action from the template config.`
      );
    }

    try {
      await action();
    } catch (e) {
      scaffold.logger.error(
        `Action ${actionKey} was explicitly run in addition to a template, but failed. ` +
          `The action might not be suitable to run on its own or without parameters. Try removing this action ` +
          `from the template config.`
      );
      throw e;
    }
  }
}
