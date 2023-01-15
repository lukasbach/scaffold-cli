import * as esbuild from "esbuild";
import path from "path";
import { TemplateUsageDeclaration } from "../types";
import { createSdk } from "../sdk/create-sdk";
import { fileNames, hash } from "../util";

export class Runner {
  async runTemplate(template: TemplateUsageDeclaration, properties: Record<string, any>) {
    const outfile = path.join(fileNames.tempDir, `${hash(template.source)}.js`);

    await esbuild.build({
      entryPoints: [path.join(template.source, "template.ts")],
      bundle: true,
      allowOverwrite: true,
      outfile,
    });

    console.log(outfile);

    global.properties = properties;
    global.createSdk = createSdk;

    await import(`file://${outfile}`);
  }
}

export const runner = new Runner();
