export type RuntimeData = {
  actions: Record<string, (...args: any[]) => any>;
  conditions: Record<string, (...args: any[]) => boolean>;
};
