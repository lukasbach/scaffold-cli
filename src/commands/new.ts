import { Command } from "commander";

export const newCommand = new Command("new");

newCommand
  .allowUnknownOption(true)
  .allowExcessArguments(true)
  .action(async () => {
    await scaffold.templateScope.initialize();
    const [templateName, ...restArgs] = newCommand.args;

    const template = scaffold.templateScope.getTemplates()[templateName];
    if (!template) {
      throw new Error(`No template registered with the name ${template}`);
    }

    await scaffold.runner.runTemplate(template, restArgs, process.cwd());
  });
