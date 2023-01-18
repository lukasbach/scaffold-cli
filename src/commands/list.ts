import { Command } from "commander";

export const listCommand = new Command("list");

listCommand.action(async () => {
  await scaffold.templateScope.initialize();
  for (const [key, { source }] of Object.entries(scaffold.templateScope.getTemplates())) {
    scaffold.logger.output(`${key}: ${source}`);
  }
});
