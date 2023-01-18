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

  registerOutput(path: string, content: string) {}

  registerParameter(parameter: ParameterInitializer<any>) {}
}
