class Tuple {
  constructor() {
    let args = Array.prototype.slice.call(arguments);
    Object.defineProperty(this, 'data', {
      value: (pattern) => pattern['tuple_' + args.length].apply(pattern, args),
      writable: false,
      enumerable: true,
      configurable: false
    });
    Object.defineProperty(this, 'length', {
      value: args.length,
      writable: false,
      enumerable: false,
      configurable: false
    });
  }

  match(pattern) {
    return this.data(pattern);
  }

  nth(n) {
    return this.match(Object.defineProperty({}, 'tuple_' + this.length, {
      value: function () {
        return arguments[n]
      }
    }));
  }

  toString() {
    return this.match(Object.defineProperty({}, 'tuple_' + this.length, {
      value: function () {
        return '(' + Array.prototype.slice.call(arguments).toString() + ')';
      }
    }));
  }
}
