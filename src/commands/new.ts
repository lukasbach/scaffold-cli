import { Command } from "commander";
import { templateScope } from "../core/template-scope";
import { logger } from "../core/logger";
import { hash } from "../util";
import { runner } from "../core/runner";

export const newCommand = new Command("new");

newCommand
  .allowUnknownOption(true)
  .allowExcessArguments(true)
  .action(async () => {
    await templateScope.initialize();
    const [templateName, ...restArgs] = newCommand.args;
    const args = restArgs.filter(a => !a.startsWith("-"));
    const options = restArgs
      .filter(a => a.startsWith("--"))
      .map(a => a.slice(2).split("="))
      .map(([option, value]) => ({ option, value }));
    const template = templateScope.getTemplates()[templateName];
    if (!template) {
      throw new Error(`No template registered with the name ${template}`);
    }
    await runner.runTemplate(template, {});
  });
