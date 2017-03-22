class IMap {
  constructor(obj) {
    Object.defineProperty(this, '_object', {
      value: Object.freeze(obj),
      writable: false,
      enumerable: true,
      configurable: false
    });
  }

  /* empty :: () -> IMap */
  static empty() {
    return new IMap({});
  }

  /* get :: IMap -> String -> a */
  get(keyword) {
    if (keyword in this._object) {
      return this._object[keyword];
    } else {
      console.error("IMap Error: " + keyword + " is not defined.");
      return null;
    }
  }

  /* hasKey :: IMap -> String -> Bool */
  hasKey(keyword) {
    return (keyword in this._object);
  }

  /* set :: IMap -> Map -> IMap */
  set(obj) {
    return new IMap(Object.assign({}, this._object, obj));
  }

  /* toString :: IMap -> String */
  toString() {
    return this._object.toString();
  }
}
