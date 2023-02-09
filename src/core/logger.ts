/* eslint-disable class-methods-use-this */
export class Logger {
  log(...values: any[]) {
    console.log(...values);
  }

  verbose(...values: any[]) {
    // TODO only with verbose flag
    console.debug(...values);
  }

  debug(...values: any[]) {
    // TODO only with debug flag
    console.debug(...values);
  }

  output(...values: any[]) {
    console.log(...values);
  }

  error(...values: any[]) {
    console.error(...values);
  }
}
