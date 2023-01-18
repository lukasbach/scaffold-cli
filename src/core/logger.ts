/* eslint-disable class-methods-use-this */
export class Logger {
  log(...values: any[]) {
    console.log(...values);
  }

  debug(...values: any[]) {
    console.debug(...values);
  }

  output(...values: any[]) {
    console.log(...values);
  }
}
