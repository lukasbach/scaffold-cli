export type RuntimeData = {
  actions: Record<string, (...args: any[]) => any>;
  conditions: Record<string, (...args: any[]) => boolean | Promise<boolean>>;
  data: Record<string, any>;
};
