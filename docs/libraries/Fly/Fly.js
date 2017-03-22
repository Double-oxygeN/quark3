class Fly {
  static id(x) {
    return x;
  }

  static constant(k) {
    return () => k;
  }

  static compose(f, g) {
    return (arg) => f(g(arg));
  }
}
