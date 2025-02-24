export {};

declare global {
  interface Array<T> {
    pushUnique(item: T): void;
  }
}

Array.prototype.pushUnique = function(item): void {
  if (this.indexOf(item) == -1) {
    this.push(item);
  }
};
