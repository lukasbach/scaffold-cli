import noindent from "noindent";
import * as handlebars from "handlebars";
import path from "path";
import fs from "fs-extra";
import { ParameterInitializer } from "../sdk";
import { scaffold } from "../scaffold";

const markdownTemplate = noindent(`
  ## Template {{{ templateName }}}
  
  > \`{{>invokeCommand}}\`
  
  {{{ templateDescription }}}
  
  ### Parameters
  
  {{#each parameters}}
  * \`{{{ key }}}{{#if optional}}?{{/if}}\`{{#if description}}: _{{{ description }}}_{{/if}}
    * Usage: {{#if isArgument}}argument{{/if}}{{#unless isArgument}}\`{{>optionDetails}}\`{{/unless}}{{#if choices}}
    * Choices: {{#each choicesText}}{{#if @index}}, {{/if}}\`{{{this}}}\`{{/each}}{{/if}}{{#if default}}
    * Default: \`{{{default}}}\`{{/if}}
  {{/each}}
  
  ### Outputs
  
  Outputs shown below are generated based on default inputs.
  Change the values listed above to customize the results.
  
  {{#each output}}
  <details>
    <summary>{{{filename}}}</summary>
    
  \`\`\`
  {{{content}}}
  \`\`\`
  </details>
  {{/each}}
  
  ### Used Actions
  
  When run in default settings, the following actions are used:
  
  \`\`\`
  {{#each actions}}{{#if @index}}, {{/if}}{{{this}}}{{/each}}
  \`\`\`
  `);

const title = (text: string) => `━━ ${text} ${"━".repeat(100 - 4 - text.length)}`;

const parameterManpageTemplate =
  // "  {{ key }}{{#if optional}}?{{/if}}   - " +
  "  " +
  "{{#if isArgument}}<{{{ key }}}>{{/if}}" +
  "{{#unless isArgument}}{{>optionDetails}}{{/unless}}" +
  "{{manpageParamSpaces key}}{{#manpageParamDescr key}}" +
  "{{#if description}}{{{ description }}}{{/if}}" +
  "{{#if choices}}. Choices: {{#each choicesText}}{{#if @index}}, {{/if}}`{{{this}}}`{{/each}}{{/if}}" +
  '{{#if default}}, Default: "{{{default}}}"{{/if}}{{/manpageParamDescr}}\n  \n  ';

const manpageTemplate = noindent(`
  {{{ templateName }}}
  
  {{{ templateDescription }}}
  
  ${title("Usage")}
  $ {{>invokeCommand}}
  
  ${title("Options")}
  
  You can also use the --all parameter to interactively prompt all options.
  
  {{#each parameters}}${parameterManpageTemplate}{{/each}}
  
  ${title("Scaffold Options")}
  
    -h,--help               - Display details on the template, i.e. this page
    --documentTemplate     - Create a markdown documentation for the template
    --all                   - Ask for all parameter values not provided as arguments, even those not required
    --logLevel=#           - Logging level. Choices: verbose, debug.
  `);

const countParameterDefinition = (parameterKey: string, options: any) => {
  const param: ReturnType<typeof ParameterInitializer.prototype.getConfig> = options.data.root.parameters.find(
    p => p.key === parameterKey
  );
  if (!param) {
    return 2;
  }
  let i = 0;
  if (param.isArgument) {
    i += 2 + param.key.length;
  } else {
    i += 2 + param.key.length + (param.type !== "boolean" ? 2 : 0);
  }
  if (param.shortKey) {
    i += 1 + param.shortKey.length + 1;
  }
  return i;
};

export class Introspection {
  private isActive = false;

  private templateName: string;

  private templateDescription: string;

  private parameters: ParameterInitializer<any>[] = [];

  private output: Record<string, string> = {};

  private actionCalls = new Set<string>();

  private hb: typeof Handlebars;

  private parameterOverwrite: Record<string, any> = {};

  constructor() {
    this.hb = handlebars.create();
    this.hb.registerHelper("unlessEquals", function unlessEquals(arg1, arg2, options) {
      if (arguments.length !== 3) {
        throw new Error("#unlessEquals requires exactly 2 arguments");
      }
      return arg1 !== arg2 ? options.fn(this) : options.inverse(this);
    });
    this.hb.registerHelper("manpageParamSpaces", (parameterKey, options) =>
      " ".repeat(30 - countParameterDefinition(parameterKey, options))
    );
    this.hb.registerHelper("manpageParamDescr", function manageParamDescr(parameterKey, options) {
      const lines: string[] = options.fn(this).match(/.{1,60}\S*/g);
      return [lines[0], ...lines.slice(1).map(l => `${" ".repeat(1 + 30)}${l}`)].join("\n");
      return options.fn(this);
    });
    this.hb.registerPartial(
      "optionDetails",
      '{{#if shortKey}}-{{shortKey}},{{/if}}--{{key}}{{#unlessEquals type "boolean"}}=#{{/unlessEquals}}'
    );
    this.hb.registerPartial(
      "invokeCommand",
      "scaf {{templateKey}} " +
        "{{#each arguments}}{{#if optional}}[{{/if}}<{{key}}>{{#if optional}}]{{/if}} {{/each}}" +
        "{{#each options}}{{#if optional}}[{{/if}}{{>optionDetails}}{{#if optional}}]{{/if}} {{/each}}"
    );
  }

  get isIntrospectionRun() {
    return this.isActive;
  }

  startIntrospection() {
    this.isActive = true;
    this.output = {};
    this.actionCalls.clear();
    this.parameters = [];
  }

  endIntrospection() {
    this.isActive = false;
  }

  setParameterOverwrite(parameterKey: string, value: any) {
    this.parameterOverwrite[parameterKey] = value;
  }

  resetParameterOverwrite() {
    this.parameterOverwrite = {};
  }

  getParameterOverwrite(parameterKey: string) {
    return this.parameterOverwrite[parameterKey];
  }

  getRegisteredParameters() {
    return this.parameters.map(p => p.getConfig());
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
    const target = path.join(process.cwd(), targetFile);
    await fs.ensureDir(path.dirname(target));
    await fs.writeFile(target, markdown);
  }

  getManpage() {
    return this.hb.compile(manpageTemplate)(this.getIntrospectionData());
  }

  getInvokeCommandSnippet(templateKey?: string) {
    return this.hb.compile("{{>invokeCommand}}")({ ...this.getIntrospectionData(), templateKey });
  }

  setTemplateName(name: string) {
    this.templateName = name;
  }

  setTemplateDescription(descr: string) {
    this.templateDescription = descr;
  }

  public getIntrospectionData() {
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

  public getRegisteredOutputs() {
    return this.output;
  }
}
