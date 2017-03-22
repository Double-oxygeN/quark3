class Painter {
  constructor(canvas) {
    Object.defineProperty(this, 'canvas', {
      value: canvas,
      writable: false,
      enumerable: true,
      configurable: false
    });
    Object.defineProperty(this, 'offScreenCanvas', {
      value: document.createElement('canvas'),
      writable: false,
      enumerable: false,
      configurable: false
    });
    this.offScreenCanvas.width = canvas.width;
    this.offScreenCanvas.height = canvas.height;
  }

  /* width :: Int */
  get width() {
    return this.canvas.width;
  }

  /* height :: Int */
  get height() {
    return this.canvas.height;
  }

  /* create :: DOM -> IO Painter */
  static create(canvas) {
    return M_IO.unit(new Painter(canvas));
  }

  /* imitator :: () -> IO Painter */
  imitator() {
    return new M_IO((world) => {
      let cv = world.document.createElement('canvas');
      cv.width = this.width;
      cv.height = this.height;
      return new Tuple(new Painter(cv), world);
    });
  }

  /* toString :: Painter -> String */
  toString() {
    return '[Painter]';
  }
}

class Painter2d extends Painter {
  constructor(canvas) {
    super(canvas);
    Object.defineProperty(this, 'context', {
      value: canvas.getContext('2d'),
      writable: false,
      enumerable: true,
      configurable: false
    });
    Object.defineProperty(this, 'offScreenContext', {
      value: this.offScreenCanvas.getContext('2d'),
      writable: false,
      enumerable: false,
      configurable: false
    });
    this.recentFontSettings = {
      font: 'sans-serif',
      size: 20,
      align: 'left',
      baseline: 'alphabetic',
      lineHeight: '100%',
    };
    this.recentLineSettings = {
      cap: 'butt',
      join: 'miter',
      width: 1.0,
      miterLimit: 10.0
    };
  }

  /* create :: DOM -> IO Painter2d */
  static create(canvas) {
    return M_IO.unit(new Painter2d(canvas));
  }

  /* imitator :: () -> IO Painter2d */
  imitator() {
    return new M_IO((world) => {
      let cv = document.createElement('canvas');
      cv.width = this.width;
      cv.height = this.height;
      return new Tuple(new Painter2d(cv), world);
    });
  }

  /* setScreen :: Painter2d -> IO Painter2d */
  setScreen() {
    return new M_IO((world) => {
      let bodyStyle = world.document.body.style,
        htmlStyle = world.document.getElementsByTagName('html')[0].style,
        onrsz = () => {
          let rct = world.document.body.getBoundingClientRect(),
            canvasStyle = this.canvas.style,
            scaleX = rct.width / this.canvas.width,
            scaleY = rct.height / this.canvas.height,
            windowScale = (scaleX < scaleY) ? scaleX : scaleY;
          canvasStyle.transform = 'scale(' + windowScale.toString(10) + ', ' + windowScale.toString(10) + ')';
          canvasStyle.position = 'fixed';
          canvasStyle.left = ((windowScale - 1) * canvas.width / 2 + (rct.width - canvas.width * windowScale) / 2).toString(10) + 'px';
          canvasStyle.top = ((windowScale - 1) * canvas.height / 2 + (rct.height - canvas.height * windowScale) / 2).toString(10) + 'px';
        };
      bodyStyle.margin = htmlStyle.margin = '0px';
      bodyStyle.padding = htmlStyle.padding = '0px';
      bodyStyle.width = htmlStyle.width = '100%';
      bodyStyle.height = htmlStyle.height = '100%';
      bodyStyle.overflow = htmlStyle.overflow = 'hidden';
      world.addEventListener('resize', onrsz);
      onrsz();
      return new Tuple(this, world);
    });
  }

  /* background :: Painter2d -> String -> IO () */
  background(color) {
    return this.rect(0, 0, this.canvas.width, this.canvas.height).fill(color);
  }

  /* pathOperation :: Painter2d -> IO () -> Object */
  pathOperation(path) {
    return {
      fill: (color) => path.bind(_ => new M_IO((world) => {
        this.offScreenContext.fillStyle = color;
        this.offScreenContext.fill();
        return new Tuple(null, world);
      })),
      stroke: (color, option) => path.bind(_ => new M_IO((world) => {
        let _opt = option || {};
        _opt["cap"] = _opt.cap || this.recentLineSettings.cap;
        _opt["join"] = _opt.join || this.recentLineSettings.join;
        _opt["width"] = _opt.width || this.recentLineSettings.width;
        _opt["miterLimit"] = _opt.miterLimit || this.recentLineSettings.miterLimit;

        this.offScreenContext.lineCap = _opt.cap;
        this.offScreenContext.lineJoin = _opt.join;
        this.offScreenContext.lineWidth = _opt.width;
        this.offScreenContext.miterLimit = _opt.miterLimit;
        this.offScreenContext.strokeStyle = color;

        this.recentLineSettings = _opt;
        this.offScreenContext.stroke();
        return new Tuple(null, world);
      })),
      clip: (paint) => path.bind(_ => new M_IO((world) => {
        this.offScreenContext.save();
        this.offScreenContext.clip();
        return new Tuple(null, world);
      })).bind(_ => paint).bind(_ => new M_IO((world) => {
        this.offScreenContext.restore();
        return new Tuple(null, world);
      }))
    };
  }

  /* rect :: Painter2d -> (Int, Int, Int, Int) -> Object */
  rect(x, y, w, h) {
    let rectPath = new M_IO((world) => {
      this.offScreenContext.beginPath();
      this.offScreenContext.rect(x, y, w, h);
      return new Tuple(null, world);
    });
    return this.pathOperation(rectPath);
  }

  /* roundRect :: Painter2d -> (Int, Int, Int, Int, Int) -> Object */
  roundRect(x, y, w, h, r) {
    let roundRectPath = new M_IO((world) => {
      this.offScreenContext.beginPath();
      this.offScreenContext.moveTo(x + r, y);
      this.offScreenContext.arcTo(x, y, x, y + r, r);
      this.offScreenContext.lineTo(x, y + h - r);
      this.offScreenContext.arcTo(x, y + h, x + r, y + h, r);
      this.offScreenContext.lineTo(x + w - r, y + h);
      this.offScreenContext.arcTo(x + w, y + h, x + w, y + h - r, r);
      this.offScreenContext.lineTo(x + w, y + r);
      this.offScreenContext.arcTo(x + w, y, x + w - r, y, r);
      this.offScreenContext.closePath();
      return new Tuple(null, world);
    });
    return this.pathOperation(roundRectPath);
  }

  /* circle :: Painter2d -> (Int, Int, Int) -> Object */
  circle(x, y, r) {
    let circlePath = new M_IO((world) => {
      this.offScreenContext.beginPath();
      this.offScreenContext.arc(x, y, r, 0, 2 * Math.PI, false);
      return new Tuple(null, world);
    });
    return this.pathOperation(circlePath);
  }

  /* ellipse :: Painter2d -> (Int, Int, Int, Int) -> Object */
  ellipse(x, y, w, h) {
    let ellipsePath = new M_IO((world) => {
      this.offScreenContext.beginPath();
      this.offScreenContext.transform(w / 2, 0, 0, h / 2, x + w / 2, y + h / 2);
      this.offScreenContext.arc(0, 0, 1, 0, 2 * Math.PI, false);
      this.offScreenContext.transform(2 / w, 0, 0, 2 / h, -2 * x / w - 1, -2 * y / h - 1);
      return new Tuple(null, world);
    });
    return this.pathOperation(ellipsePath);
  }

  /* polygon :: Painter2d -> [[Int]] -> Object */
  polygon(vertices) {
    let polygonPath = new M_IO((world) => {
      this.offScreenContext.beginPath();
      this.offScreenContext.moveTo(vertices[0][0], vertices[0][1]);
      vertices.slice(1).forEach(point => {
        this.offScreenContext.lineTo(point[0], point[1]);
      });
      this.offScreenContext.closePath();
      return new Tuple(null, world);
    });
    return this.pathOperation(polygonPath);
  }

  /* text :: Painter2d -> (String, Int, Int, Object) -> Object */
  text(str, x, y, option) {
    let textIO = new M_IO((world) => {
      let _opt = option || {},
        lineHeight;
      _opt["font"] = _opt.font || this.recentFontSettings.font;
      _opt["size"] = _opt.size || this.recentFontSettings.size;
      _opt["align"] = _opt.align || this.recentFontSettings.align;
      _opt["baseline"] = _opt.baseline || this.recentFontSettings.baseline;
      _opt["lineHeight"] = _opt.lineHeight || this.recentFontSettings.lineHeight;

      this.offScreenContext.font = _opt.size.toString(10) + "px " + _opt.font;
      this.offScreenContext.textAlign = _opt.align;
      this.offScreenContext.textBaseline = _opt.baseline;
      if ((/%$/).test(_opt.lineHeight)) {
        lineHeight = _opt.size * parseFloat(_opt.lineHeight.slice(0, -1)) / 100;
      } else if ((/px$/).test(_opt.lineHeight)) {
        lineHeight = parseFloat(_opt.lineHeight.slice(0, -2));
      } else if ((/^(0|[1-9][0-9]*)(\.[0-9]+)?$/).test(_opt.lineHeight)) {
        lineHeight = parseFloat(_opt.lineHeight);
      }
      this.recentFontSettings = _opt;
      return new Tuple(lineHeight, world);
    });
    return {
      fill: (color) => {
        return textIO.bind(lineHeight => new M_IO((world) => {
          this.offScreenContext.fillStyle = color;
          str.split('\n').forEach((line, lineNum) => {
            this.offScreenContext.fillText(line, x, y + lineHeight * lineNum);
          });
          return new Tuple(null, world);
        }));
      },
      stroke: (color, lineOption) => {
        return textIO.bind(lineHeight => new M_IO((world) => {
          let _opt = lineOption || {};
          _opt["cap"] = _opt.cap || this.recentLineSettings.cap;
          _opt["join"] = _opt.join || this.recentLineSettings.join;
          _opt["width"] = _opt.width || this.recentLineSettings.width;
          _opt["miterLimit"] = _opt.miterLimit || this.recentLineSettings.miterLimit;

          this.offScreenContext.lineCap = _opt.cap;
          this.offScreenContext.lineJoin = _opt.join;
          this.offScreenContext.lineWidth = _opt.width;
          this.offScreenContext.miterLimit = _opt.miterLimit;
          this.offScreenContext.strokeStyle = color;

          this.recentLineSettings = _opt;
          str.split('\n').forEach((line, lineNum) => {
            this.offScreenContext.strokeText(line, x, y + lineHeight * lineNum);
          });
          return new Tuple(null, world);
        }));
      },
      outlined: (innerColor, outerColor, lineWidth) => {
        return textIO.bind(lineHeight => new M_IO((world) => {
          this.offScreenContext.fillStyle = innerColor;
          this.offScreenContext.strokeStyle = outerColor;
          this.offScreenContext.lineCap = 'round';
          this.offScreenContext.lineJoin = 'round';
          this.offScreenContext.lineWidth = lineWidth * 2;
          str.split('\n').forEach((line, lineNum) => {
            this.offScreenContext.strokeText(line, x, y + lineHeight * lineNum);
            this.offScreenContext.fillText(line, x, y + lineHeight * lineNum);
          });
          return new Tuple(null, world);
        }));
      }
    }
  }

  /* image :: Painter2d -> (Image, ...Int) -> IO () */
  image() {
    return new M_IO((world) => {
      this.offScreenContext.drawImage.apply(this.offScreenContext, arguments);
      return new Tuple(null, world);
    });
  }

  /* sprite :: Painter2d -> (Image, Int, Int) -> (Int, Int, Int) -> IO () */
  sprite(image, width, height) {
    let column = Math.floor(image.width / width);
    return (frame, x, y) => {
      return this.image(image, (frame % column) * width, Math.floor(frame / column) * height, width, height, x, y, width, height);
    };
  }

  /* globalAlpha :: Painter2d -> Float -> IO () -> IO () */
  globalAlpha(alpha) {
    return (paint) => {
      let _prevAlpha = this.offScreenContext.globalAlpha;
      return new M_IO((world) => {
        this.offScreenContext.globalAlpha *= alpha;
        return new Tuple(null, world);
      }).bind(_ => paint).bind(_ => new M_IO((world) => {
        this.offScreenContext.globalAlpha = _prevAlpha;
        return new Tuple(null, world);
      }));
    };
  }

  /* tilt :: Painter2d -> (Int, Int, Float) -> IO () -> IO () */
  tilt(centerX, centerY, angle) {
    return (paint) => {
      return new M_IO((world) => {
        this.offScreenContext.transform(Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), centerX, centerY);
        return new Tuple(null, world);
      }).bind(_ => paint).bind(_ => new M_IO((world) => {
        this.offScreenContext.transform(Math.cos(angle), -Math.sin(angle), Math.sin(angle), Math.cos(angle), -centerX * Math.cos(angle) - centerY * Math.sin(angle), centerX * Math.sin(angle) - centerY * Math.cos(angle));
        return new Tuple(null, world);
      }));
    };
  }

  /* show :: Painter2d -> IO () */
  show() {
    return new M_IO((world) => {
      this.context.drawImage(this.offScreenCanvas, 0, 0);
      return new Tuple(null, world);
    });
  }

  /* toString :: Painter2d -> String */
  toString() {
    return '[Painter2d]';
  }
}
