class Generator {
  generatorId() {
    return (
      Math.random().toString(36).substr(2, 7) +
      Date.now().toString(36).substr(4, 9)
    );
  }
}

export const generator = new Generator();
