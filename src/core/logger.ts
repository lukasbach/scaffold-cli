/* eslint-disable class-methods-use-this */
export class Logger {
  get logLevel() {
    return scaffold.args.getOption("log-level");
  }

  log(...values: any[]) {
    console.log(...values);
  }

  verbose(...values: any[]) {
    if (this.logLevel !== "verbose" && this.logLevel !== "debug") {
      return;
    }

    console.debug(...values);
  }

  debug(...values: any[]) {
    if (this.logLevel !== "debug") {
      return;
    }

    console.debug(...values);
  }

  output(...values: any[]) {
    console.log(...values);
  }

  error(...values: any[]) {
    console.error(...values);
  }
}
