import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export class ArgumentParser {
  private readonly argv: any;

  private readonly arguments: string[];

  private readonly templateName: string;

  constructor() {
    const y = yargs(hideBin(process.argv));
    this.argv = y.argv;
    const [templateName, ...args] = (y.argv as any)._;
    this.templateName = templateName;
    this.arguments = args;
  }

  getArguments() {
    return this.arguments;
  }

  getOption(key: string, shortKey?: string) {
    return this.argv[key] ?? (shortKey ? this.argv[shortKey] : undefined);
  }

  getTemplateName() {
    return this.templateName;
  }
}
