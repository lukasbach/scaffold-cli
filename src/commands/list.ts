import { Command } from "commander";
import { templateScope } from "../core/template-scope";
import { logger } from "../core/logger";

export const listCommand = new Command("list");

listCommand.action(async () => {
  await templateScope.initialize();
  for (const [key, { source }] of Object.entries(templateScope.getTemplates())) {
    logger.output(`${key}: ${source}`);
  }
});
