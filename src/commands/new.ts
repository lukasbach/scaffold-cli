import { Command } from "commander";
import { templateScope } from "../core/template-scope";
import { runner } from "../core/runner";

export const newCommand = new Command("new");

newCommand
  .allowUnknownOption(true)
  .allowExcessArguments(true)
  .action(async () => {
    await templateScope.initialize();
    const [templateName, ...restArgs] = newCommand.args;

    const template = templateScope.getTemplates()[templateName];
    if (!template) {
      throw new Error(`No template registered with the name ${template}`);
    }

    await runner.runTemplate(template, restArgs, process.cwd());
  });
