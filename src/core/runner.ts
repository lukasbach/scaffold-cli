import * as esbuild from "esbuild";
import path from "path";
import { TemplateUsageDeclaration } from "../types";
import { createSdk } from "../sdk/create-sdk";
import { fileNames, hash } from "../util";

export class Runner {
  private arguments: string[] = [];

  private options: Record<string, string | true> = {};

  private shortOptions: Record<string, string | true> = {};

  private template: TemplateUsageDeclaration;

  private targetPath: string;

  async runTemplate(template: TemplateUsageDeclaration, cliArgs: string[], targetPath: string) {
    this.initParameters(cliArgs);
    this.template = template;
    this.targetPath = targetPath;

    const outfile = path.join(fileNames.tempDir, `${hash(template.source)}.js`);

    await esbuild.build({
      entryPoints: [path.join(template.source, "template.ts")],
      bundle: true,
      allowOverwrite: true,
      outfile,
    });

    global.createSdk = createSdk;

    await import(`file://${outfile}`);
  }

  getArguments() {
    return this.arguments;
  }

  getOption(key: string, shortKey?: string) {
    return this.options[key] ?? (shortKey ? this.shortOptions[shortKey] : undefined);
  }

  private initParameters(cliArgs: string[]) {
    this.arguments = cliArgs.filter(a => !a.startsWith("-"));
    this.options = cliArgs
      .filter(a => a.startsWith("--"))
      .map(a => a.slice(2).split("="))
      .reduce((opts, [option, value]) => ({ ...opts, [option]: value ?? true }), {});
    this.shortOptions = cliArgs
      .filter(a => a.startsWith("-") && !a.startsWith("--"))
      .map(a => a.slice(1).split("="))
      .reduce((opts, [option, value]) => ({ ...opts, [option]: value ?? true }), {});
  }
}

export const runner = new Runner();
