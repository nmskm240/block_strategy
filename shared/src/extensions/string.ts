declare global {
  interface String {
    capitalize(): string;
  }
}

export function installStringExtensions(): void {
  if (typeof String.prototype.capitalize === "function") {
    return;
  }

  Object.defineProperty(String.prototype, "capitalize", {
    value: function capitalize(this: string): string {
      if (this.length === 0) {
        return this;
      }
      return this[0]!.toUpperCase() + this.slice(1);
    },
    writable: true,
    configurable: true,
  });
}

export {};
