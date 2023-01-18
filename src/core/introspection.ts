import { ParameterInitializer } from "../sdk";

export class Introspection {
  private isActive = false;

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
    console.log(path, content);
  }

  registerParameter(parameter: ParameterInitializer<any>) {}

  async documentTemplate(output: string) {}
}
