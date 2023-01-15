import { RuntimeData } from "./types";
import { PropertyInitializer } from "./PropertyInitializer";

export class ScaffoldSdk<T extends RuntimeData> {
  public text(key: string) {
    return new PropertyInitializer(key, "string", this);
  }

  public number(key: string) {
    return new PropertyInitializer(key, "number", this);
  }

  public boolean(key: string) {
    return new PropertyInitializer(key, "boolean", this);
  }
}
