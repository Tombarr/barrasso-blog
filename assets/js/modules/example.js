// Example module demonstrating ES6+ features that will be transpiled
export const greet = (name = 'World') => {
  return `Hello, ${name}!`;
};

export class Example {
  constructor(message) {
    this.message = message;
  }

  log() {
    console.log(this.message);
  }
}
