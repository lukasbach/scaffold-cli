import noindent from "noindent";
import * as handlebars from "handlebars";
import path from "path";
import fs from "fs-extra";
import * as Handlebars from "handlebars";
import { ParameterInitializer } from "../sdk";
import { scaffold } from "../scaffold";

const markdownTemplate = noindent(`
  ## Template {{ templateName }}
  
  > \`{{>invokeCommand}}\`
  
  {{ templateDescription }}
  
  ### Parameters
  
  {{#each parameters}}
  * \`{{ key }}{{#if optional}}?{{/if}}\`{{#if description}}: _{{ description }}_{{/if}}
    * Usage: {{#if isArgument}}argument{{/if}}{{#unless isArgument}}\`{{>optionDetails}}\`{{/unless}}{{#if choices}}
    * Choices: {{#each choicesText}}{{#if @index}}, {{/if}}\`{{this}}\`{{/each}}{{/if}}{{#if default}}
    * Default: \`{{default}}\`{{/if}}
  {{/each}}
  
  ### Outputs
  
  Outputs shown below are generated based on default inputs.
  Change the values listed above to customize the results.
  
  {{#each output}}
  <details>
    <summary>{{filename}}</summary>
    
  \`\`\`
  {{{content}}}
  \`\`\`
  </details>
  {{/each}}
  
  ### Used Actions
  
  When run in default settings, the following actions are used:
  
  \`\`\`
  {{#each actions}}{{#if @index}}, {{/if}}{{this}}{{/each}}
  \`\`\`
  `);

export class Introspection {
  private isActive = false;

  private templateName: string;

  private templateDescription: string;

  private parameters: ParameterInitializer<any>[] = [];

  private output: Record<string, string> = {};

  private actionCalls = new Set<string>();

  private hb: typeof Handlebars;

  constructor() {
    this.hb = handlebars.create();
    this.hb.registerPartial("optionDetails", "{{#if shortKey}}-{{shortKey}},{{/if}}--{{key}}");
    this.hb.registerPartial(
      "invokeCommand",
      "scaffold {{templateKey}} " +
        "{{#each arguments}}{{#if optional}}[{{/if}}<{{key}}>{{#if optional}}]{{/if}} {{/each}}" +
        "{{#each options}}{{#if optional}}[{{/if}}{{>optionDetails}}{{#if optional}}]{{/if}} {{/each}}"
    );
  }

  get isIntrospectionRun() {
    return this.isActive;
  }

  startIntrospection() {
    this.isActive = true;
  }

  endIntrospection() {
    this.isActive = false;
  }

  registerOutput(path: string, content: string) {
    this.output[path] = content;
  }

  registerParameter(parameter: ParameterInitializer<any>) {
    this.parameters.push(parameter);
  }

  registerActionCall(actionKey: string) {
    this.actionCalls.add(actionKey);
  }

  async documentTemplate(targetFile: string) {
    const markdown = this.hb.compile(markdownTemplate)(this.getIntrospectionData());
    await fs.writeFile(path.join(process.cwd(), targetFile), markdown);
  }

  setTemplateName(name: string) {
    this.templateName = name;
  }

  setTemplateDescription(descr: string) {
    this.templateDescription = descr;
  }

  private getIntrospectionData() {
    const parameters = this.parameters.map(p => p.getConfig());
    return {
      templateKey: scaffold.args.getTemplateName(), // TODO rename to key
      templateName: this.templateName,
      templateDescription: this.templateDescription,
      parameters,
      arguments: parameters.filter(p => p.isArgument),
      options: parameters.filter(p => !p.isArgument),
      output: Object.entries(this.output).map(([filename, content]) => ({
        filename,
        content,
        extension: path.extname(filename),
      })),
      actions: [...this.actionCalls],
    };
  }
}
