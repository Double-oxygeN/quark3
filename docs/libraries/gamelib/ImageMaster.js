class ImageMaster {
  constructor(list) {
    Object.defineProperty(this, '_imageList', {
      value: list,
      writable: false,
      enumerable: true,
      configurable: false
    });
  }

  /* empty :: () -> ImageMaster */
  static empty() {
    return new ImageMaster(M_List.Nil());
  }

  /* regImage :: ImageMaster -> (String, String) -> ImageMaster */
  regImage(path, keyword) {
    let image = new Image(),
      newList;
    image.src = './resources/' + path;
    image.alt = '[IMAGE<' + keyword + '>]';
    newList = M_List.Cons({
      keyword: keyword,
      image: image
    })(this._imageList);
    return new ImageMaster(newList);
  }

  /* getImage :: ImageMaster -> String -> IO Image */
  getImage(keyword) {
    return new M_IO((world) => {
      let image = this._imageList.filter(x => x.keyword === keyword).nth(0).match({
        nothing: () => {
          world.console.error("Image Error: " + keyword + " is not registered.");
          return new Image();
        },
        just: (im) => im.image
      });
      return new Tuple(image, world);
    });
  }

  /* toString :: ImageMaster -> String */
  toString() {
    return '[ImageMaster <' + this._imageList.length.toString() + '>]';
  }
}
