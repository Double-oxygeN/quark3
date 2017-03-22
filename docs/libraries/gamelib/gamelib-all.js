class Pos2d {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // 点が矩形の上に乗っているかどうかを判定
  isOverRect(x, y, w, h) {
    return x < this.x && this.x < x + w && y < this.y && this.y < y + h;
  }

  // 点が円形の上に乗っているかどうかを判定
  isOverCircle(x, y, r) {
    return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) < r * r;
  }

  // 別の点との距離
  distanceTo(another) {
    return Math.hypot(another.x - this.x, another.y - this.y);
  }

  static distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  // 別の点への向き
  directionTo(another) {
    return Math.atan2(another.y - this.y, another.x - this.x);
  }

  static direction(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  // 別の点へのベクトル
  toVec2d(another) {
    return new Vec2d(another.x - this.x, another.y - this.y);
  }

  // 文字列化
  toString() {
    return "(" + this.x + "," + this.y + ")";
  }
}

class Vec2d extends Pos2d {
  constructor(x, y) {
    super(x, y);
  }

  // 内積を出力
  static innerProd(a, b) {
    return a.x * b.x + a.y * b.y;
  }

  // 外積のzの値を出力
  static crossProd(a, b) {
    return a.x * b.y - a.y * b.x;
  }

  scalar(k) {
    return new Vec2d(k * this.x, k * this.y);
  }

  norm(n) {
    let _n = n || 2;
    return Math.pow(Math.pow(this.x, _n) + Math.pow(this.y, _n), 1 / _n);
  }

  normalize() {
    return this.scalar(1 / this.norm(2));
  }
}

class Pos3d {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // 点が球内部にあるかどうかを判定
  isInSphere(x, y, z, r) {
    return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) + (z - this.z) * (z - this.z) < r * r;
  }

  // 別の点との距離
  distanceTo(another) {
    return Math.hypot(another.x - this.x, another.y - this.y, another.z - this.z);
  }

  static distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
  }

  // 別の点へのベクトル
  toVec3d(another) {
    return new Vec3d(another.x - this.x, another.y - this.y, another.z - this.z);
  }

  // 文字列化
  toString() {
    return "(" + this.x + "," + this.y + "," + this.z + ")";
  }
}

class Vec3d extends Pos3d {
  constructor(x, y, z) {
    super(x, y, z);
  }

  // 内積を出力
  static innerProd(a, b) {
    return a.x * b.x + a.y + b.y + a.z * b.z;
  }

  // 外積を出力
  static crossProd(a, b) {
    return new Vec3d(a.y * b.z - b.y * a.z, a.z * b.x - b.z * a.x, a.x * b.y - b.x * a.y);
  }

  scalar(k) {
    return new Vec3d(k * this.x, k * this.y, k * this.z);
  }

  norm(n) {
    let _n = n || 2;
    return Math.pow(Math.pow(this.x, _n) + Math.pow(this.y, _n) + Math.pow(this.z, _n), 1 / _n);
  }

  normalize() {
    return this.scalar(1 / this.norm(2));
  }
}

const MOUSE_BUTTON = Object.freeze({
  NONE: -1,
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2
});

class Mouse extends Pos2d {
  constructor(target) {
    super(0, 0);
    this.target = target;
    this.press = false;
    this.over = false;
    this.clickNum = 0;
    this.button = MOUSE_BUTTON.NONE;
  }

  /* listen :: DOM -> IO Mouse */
  static listen(target) {
    return new M_IO((world) => {
      let ms = new Mouse(target);

      [['mouseover', e => { ms.over = true; }],
       ['mouseout', e => { ms.over = false; }],
       ['mousemove', e => {
          [ms.x, ms.y] = [e.clientX - ms.target.offsetLeft, e.clientY - ms.target.offsetTop];
        }],
       ['mousedown', e => {
          ms.press = true;
          ms.clickNum = e.detail;
          ms.button = e.button;
       }]].forEach(p => {
        ms.target.addEventListener(p[0], p[1]);
      });
      world.addEventListener('mouseup', e => {
        ms.press = false;
        ms.clickNum = 0;
        ms.button = MOUSE_BUTTON.NONE;
      });
      return new Tuple(ms, world);
    });
  }

  /* on :: Mouse -> (String, Function) -> IO () */
  on(event_name, callback) {
    return new M_IO((world) => {
      this.target.addEventListener('mouse' + event_name, callback);
      return new Tuple(null, world);
    });
  }

  /* isPressed :: Mouse -> () -> IO Bool */
  isPressed() {
    return new M_IO((world) => {
      return new Tuple(this.press, world);
    });
  }

  /* isOverTarget :: Mouse -> () -> IO () */
  isOverTarget() {
    return new M_IO((world) => {
      return new Tuple(this.over, world);
    });
  }

  /* toString :: Mouse -> String */
  toString() {
    return "Mouse(" + this.x + "," + this.y + ")";
  }
}

class Keyboard {
  constructor() {
    this.down = [];
    this.pressed = [];
  }

  /* listen :: () -> IO Keyboard */
  static listen() {
    return new M_IO((world) => {
      let kb = new Keyboard();
      [['keydown', e => {
          if (!kb.down.includes(e.code)) {
            kb.down.push(e.code);
            kb.pressed.push(e.code);
          } else {
            kb.pressed = kb.pressed.filter(k => k !== e.code);
          };
        }],
       ['keyup', e => {
          kb.down = kb.down.filter(k => k !== e.code);
          kb.pressed = kb.pressed.filter(k => k !== e.code);
       }],
       ['blur', e => {
          kb.down = [];
          kb.pressed = [];
       }]].forEach(p => {
        world.addEventListener(p[0], p[1]);
      });
      return new Tuple(kb, world);
    });
  }

  /* on :: (String, Function) -> IO () */
  static on(event_name, callback) {
    return new M_IO((world) => {
      world.addEventListener('key' + event_name, callback);
      return new Tuple(null, world);
    })
  }

  /* isDown :: Keyboard -> String -> IO Bool */
  isDown(code) {
    return new M_IO((world) => {
      return new Tuple(this.down.includes(code), world);
    });
  }

  /* isPressed :: Keyboard -> String -> IO Bool */
  isPressed(code) {
    return new M_IO((world) => {
      if (this.pressed.includes(code)) {
        this.pressed = this.pressed.filter(k => k !== code);
        return new Tuple(true, world);
      } else {
        return new Tuple(false, world);
      }
    });
  }

  /* toString :: Keyboard -> String */
  toString() {
    return "[class Key<" + this.down.length.toString(10) + "," + this.pressed.length.toString(10) + ">]";
  }
}

/*
  Class: Tween

  Usage:
    > x = Tween.ease(Tween.inout(Tween.quad))(counter, 20, 320, 60);
*/
class Tween {
  /*
    Function: ease
    Helps easing animation.

    Parameters:
      f - [0, 1](time) -> [0, 1](progress)
  */
  static ease(f) {
    return (t, b, c, d) => (c * f(t / d) + b);
  }

  static yoyo(f) {
    return (t) => {
      let _t = Math.abs(t % 2);
      return (_t < 1) ? f(_t) : f(2 - _t);
    };
  }

  static in (f) {
    return f;
  }
  static out(f) {
    return (t) => 1 - f(1 - t);
  }
  static inout(f) {
    return (t) => (t < 1 / 2) ? (f(2 * t) / 2) : (1 - f(2 - 2 * t) / 2);
  }

  static linear(t) {
    return t;
  }
  static quad(t) {
    return t * t;
  }
  static cubic(t) {
    return t * t * t;
  }
  static quart(t) {
    return t * t * t * t;
  }
  static quint(t) {
    return t * t * t * t * t;
  }
  static sinusoidal(t) {
    return 1 - Math.cos(t * Math.PI / 2);
  }
  static exp(t) {
    return (t === 0) ? 0 : Math.pow(1024, (t - 1));
  }
  static circular(t) {
    return 1 - Math.sqrt(1 - t * t);
  }
  static elastic(t) {
    return 56 * t * t * t * t * t - 105 * t * t * t * t + 60 * t * t * t - 10 * t * t;
  }
  static softback(t) {
    return t * t * (2 * t - 1);
  }
  static back(t) {
    return t * t * (2.70158 * t - 1.70158);
  }
}

class StdTransFunc {
  static get DIRECTIONS() {
    return {
      UP: -3,
      LEFT: -1,
      RIGHT: 1,
      DOWN: 3
    };
  }

  /* cut :: ([Image], [Int], Painter2d) -> (Bool, IO ()) */
  static cut(images, counters, painterIO) {
    return new Tuple(true, painterIO.bind(painter => painter.image(images[1], 0, 0).bind(_ => painter.show())));
  }

  /* fade :: Int -> ([Image], [Int], Painter2d) -> (Bool, IO ()) */
  static fade(duration) {
    return (images, counters, painterIO) => new Tuple(counters[1] >= duration,
      painterIO.bind(painter => painter.image(images[0], 0, 0)
        .bind(_ => painter.globalAlpha(counters[1] / duration)(painter.image(images[1], 0, 0)))
        .bind(_ => painter.show())));
  }

  /* fadeWithColor :: (Int, String) -> ([Image], [Int], Painter2d) -> (Bool, IO ()) */
  static fadeWithColor(duration, color) {
    return (images, counters, painterIO) => new Tuple(counters[1] >= duration,
      painterIO.bind(painter => painter.image((counters[1] * 2 < duration) ? images[0] : images[1], 0, 0)
        .bind(_ => painter.globalAlpha(1 - Math.abs(counters[1] * 2 / duration - 1))(painter.background(color)))
        .bind(_ => painter.show())));
  }

  /* push :: (Int, StdTransFunc.DIRECTIONS, (Int, Int, Int, Int) -> Int) -> ([Image], [Int], Painter2d) -> (Bool, IO ()) */
  static push(duration, direction, easingFunc) {
    let ease = easingFunc || Tween.ease(Tween.inout(Tween.sinusoidal));
    if (Math.abs(direction) === 3) {
      let sgn = direction / 3;
      return (images, counters, painterIO) => new Tuple(counters[1] >= duration,
        painterIO.bind(painter => painter.image(images[0], 0, ease(counters[1], 0, sgn * images[0].height, duration))
          .bind(_ => painter.image(images[1], 0, ease(counters[1], -sgn * images[0].height, sgn * images[0].height, duration)))
          .bind(_ => painter.show())));
    } else if (Math.abs(direction) === 1) {
      let sgn = direction;
      return (images, counters, painterIO) => new Tuple(counters[1] >= duration,
        painterIO.bind(painter => painter.image(images[0], ease(counters[1], 0, sgn * images[0].width, duration), 0)
          .bind(_ => painter.image(images[1], ease(counters[1], -sgn * images[0].width, sgn * images[0].width, duration), 0))
          .bind(_ => painter.show())));
    } else {
      console.error("Arguments Error: 2nd argument of StdTransFunc#push must be StdTransFunc.DIRECTIONS");
      return (images, counters, painterIO) => new Tuple(counters[1] >= duration, M_IO.unit());
    }
  }

  /* wipe :: (Int, StdTransFunc.DIRECTIONS, (Int, Int, Int, Int) -> Int) -> ([Image], [Int], Painter2d) -> (Bool, IO ()) */
  static wipe(duration, direction, easingFunc) {
    let ease = easingFunc || Tween.ease(Tween.inout(Tween.sinusoidal));
    if (Math.abs(direction) === 3) {
      return (images, counters, painterIO) => {
        let e = ease(counters[1], 0, images[1].height, duration),
          y = (direction < 0) ? images[1].height - e : 0;
        return new Tuple(counters[1] >= duration,
          painterIO.bind(painter => painter.image(images[0], 0, 0)
            .bind(_ => painter.image(images[1], 0, y, images[1].width, e, 0, y, images[1].width, e))
            .bind(_ => painter.show())));
      };
    } else if (Math.abs(direction) === 1) {
      return (images, counters, painterIO) => {
        let e = ease(counters[1], 0, images[1].width, duration),
          x = (direction < 0) ? images[1].width - e : 0;
        return new Tuple(counters[1] >= duration,
          painterIO.bind(painter => painter.image(images[0], 0, 0)
            .bind(_ => painter.image(images[1], x, 0, e, images[1].height, x, 0, e, images[1].height))
            .bind(_ => painter.show())));
      };
    } else {
      console.error("Arguments Error: 2nd argument of StdTransFunc#wipe must be StdTransFunc.DIRECTIONS");
      return (images, counters, painterIO) => new Tuple(counters[1] >= duration, M_IO.unit());
    }
  }
}

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

class SoundMaster {
  constructor(bgm_list, se_list) {
    Object.defineProperty(this, '_bgmList', {
      value: bgm_list,
      writable: false,
      enumerable: true,
      configurable: false
    });
    Object.defineProperty(this, '_seList', {
      value: se_list,
      writable: false,
      enumerable: true,
      configurable: false
    });
    this._option = {
      bgmVolume: 1,
      bgmSpeed: 1,
      seVolume: 1
    };
  }

  /* empty :: () -> SoundMaster */
  static empty() {
    return new SoundMaster(M_List.Nil(), M_List.Nil());
  }

  /* createAudio :: (String, Bool) -> Audio */
  static createAudio(path, loop) {
    let audio = new Audio();
    audio.preload = 'auto';
    audio.src = './resources/' + path;
    audio.loop = loop;
    return audio;
  }

  /* regBGM :: SoundMaster -> (String, String, Bool) -> SoundMaster */
  regBGM(path, keyword, loop) {
    let audio = SoundMaster.createAudio(path, loop),
      newList = M_List.Cons({
        keyword: keyword,
        audio: audio
      })(this._bgmList);
    return new SoundMaster(newList, this._seList);
  }

  /* regSE :: SoundMaster -> (String, String) -> SoundMaster */
  regSE(path, keyword) {
    let audio = SoundMaster.createAudio(path, false),
      newList = M_List.Cons({
        keyword: keyword,
        audio: audio
      })(this._seList);
    return new SoundMaster(this._bgmList, newList);
  }

  /* playBGM :: SoundMaster -> (String, Map) -> IO () */
  playBGM(keyword, option) {
    return this.changeOption(keyword, option).bind(audio => new M_IO((world) => {
      audio.play();
      return new Tuple(null, world);
    }));
  }

  /* changeOption :: SoundMaster -> (String, Map) -> IO Audio */
  changeOption(keyword, option) {
    return new M_IO((world) => {
      let audio = this._bgmList.filter(a => a.keyword === keyword).nth(0).match({
          nothing: () => {
            world.console.error("Sound Error: " + keyword + " is not registered.");
            return new Audio();
          },
          just: (so) => so.audio
        }),
        opt = option || {};
      opt["volume"] = opt.volume || this._option.bgmVolume;
      opt["speed"] = opt.speed || this._option.bgmSpeed;
      opt["currentTime"] = opt.currentTime || audio.currentTime;

      audio.volume = opt.volume;
      audio.playbackRate = opt.speed;
      audio.currentTime = opt.currentTime;

      return new Tuple(audio, world);
    });
  }

  /* pauseBGM :: SoundMaster -> String -> IO () */
  pauseBGM(keyword) {
    return new M_IO((world) => {
      let audio = this._bgmList.filter(a => a.keyword === keyword).nth(0).match({
        nothing: () => {
          world.console.error("Sound Error: " + keyword + " is not registered.");
          return new Audio();
        },
        just: (so) => so.audio
      });
      audio.pause();
      return new Tuple(null, world);
    });
  }

  /* killAllBGM :: SoundMaster -> () -> IO () */
  killAllBGM() {
    return new M_IO((world) => {
      this._bgmList.map(a => {
        a.audio.pause();
        return null;
      });
      return new Tuple(null, world);
    });
  }

  /* playSE :: SoundMaster -> (String, Map) -> IO () */
  playSE(keyword, option) {
    return new M_IO((world) => {
      let audio = this._seList.filter(a => a.keyword === keyword).nth(0).match({
        nothing: () => {
          world.console.error("Sound Error: " + keyword + " is not registered.");
          return new Audio();
        },
        just: (so) => so.audio
      });
      audio.currentTime = 0;
      audio.volume = option.volume || this._option.seVolume;
      audio.play();
      return new Tuple(null, world);
    });
  }

  /* setOption :: SoundMaster -> Map -> IO () */
  setOption(option) {
    return new M_IO((world) => {
      this._option.bgmVolume = option.bgmVolume || this._option.bgmVolume;
      this._option.bgmSpeed = option.bgmSpeed || this._option.bgmSpeed;
      this._option.seVolume = option.seVolume || this._option.seVolume;
      return new Tuple(null, world);
    });
  }

  /* toString :: SoundMaster -> String */
  toString() {
    return '[SoundMaster <' + this._bgmList.length.toString() + ',' + this._seList.length.toString() + '> ]';
  }
}

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

class Scenes {
  constructor(data) {
    this.data = data;
  }

  /* Empty :: Scenes () () () () */
  static Empty() {
    return new Scenes((pattern) => pattern.empty());
  }

  /* Scene :: Scenes String ((IO IMap, [Int]) -> (IO IMap, IO Transition)) ((IO IMap, [Int], IO Painter) -> IO ()) Scenes */
  static Scene(name, action, paint, tail) {
    return new Scenes((pattern) => pattern.scene(name, action, paint, tail));
  }

  match(pattern) {
    return this.data(pattern);
  }

  /* addScene :: Scenes -> (String, (IO IMap, [Int]) -> (IO IMap, IO Transition), (IO IMap, [Int], IO Painter) -> IO ()) -> Scenes */
  addScene(name, action, paint) {
    return Scenes.Scene(name, action, paint, this);
  }

  /* queryScene :: Scenes -> String -> ((IO IMap, [Int]) -> (IO IMap, IO Transition), (IO IMap, [Int], IO Painter) -> IO ()) */
  queryScene(qname) {
    return this.match({
      empty: () => {
        console.error("Scene Name Error: '" + qname + "' is not registered.");
        return new Tuple(() => new Tuple({}, ""), () => M_IO.unit(null));
      },
      scene: (name, action, paint, tail) => (name === qname) ? new Tuple(action, paint) : tail.queryScene(qname)
    });
  }

  /* sceneNum :: Int */
  get sceneNum() {
    return this.match({
      empty: () => 0,
      scene: (_name, _action, _paint, tail) => 1 + tail.sceneNum
    });
  }

  /* hasScene :: Scenes -> String -> Bool */
  hasScene(sceneName) {
    return this.match({
      empty: () => false,
      scene: (name, _action, _paint, tail) => (name === sceneName) ? true : tail.hasScene(sceneName)
    });
  }

  /* toString :: Scenes -> String */
  toString() {
    return '[Scenes <' + this.sceneNum.toString() + '>]';
  }
}

class Transition {
  constructor(data) {
    this.data = data;
  }

  /* Stay */
  static Stay() {
    return new Transition((pattern) => pattern.stay());
  }

  /* Trans String Int (([IO Image], [Int], IO Painter) => (Bool, IO ())) */
  static Trans(sceneName, sceneCounter, transFunc) {
    return new Transition((pattern) => pattern.trans(sceneName, sceneCounter, transFunc));
  }

  /* End */
  static End() {
    return new Transition((pattern) => pattern.end());
  }

  match(pattern) {
    return this.data(pattern);
  }

  /* toString :: Transition -> String */
  toString() {
    return this.match({
      stay: () => '[Transition Stay]',
      trans: (_name, _counter, _func) => '[Transition Trans]',
      end: () => '[Transition End]'
    });
  }
}

class GameMaster {
  constructor(scenes, init, painter) {
    this._scenes = scenes; // :: Scenes
    this._initStates = init; // :: IO IMap
    this._painter = painter; // :: IO Painter
    this._imitators = painter.bind(p => p.imitator().bind(i1 => p.imitator().bind(i2 => M_IO.unit([i1, i2])))); // :: IO [Painter]
  }

  /* empty :: () -> IO GameMaster */
  static empty() {
    return new M_IO((world) => {
      return new Tuple(new GameMaster(Scenes.Empty(), M_IO.unit(IMap.empty()), Painter.create(world.document.getElementById('canvas'))), world);
    });
  }

  /* create :: (Scenes, IO IMap, IO Painter) -> IO GameMaster */
  static create(scenes, init, painter) {
    return new M_IO((world) => {
      return new Tuple(new GameMaster(scenes, init, M_IO.unit(painter.evalIO(world))), world);
    });
  }

  /* regScenes :: GameMaster -> Scenes -> GameMaster */
  regScenes(scenes) {
    return new GameMaster(scenes, this._initStates, this._painter);
  }

  /* regInitStates :: GameMaster -> IO IMap -> GameMaster */
  regInitStates(init) {
    return new GameMaster(this._scenes, init, this._painter);
  }

  /* regPainter :: GameMaster -> IO Painter -> GameMaster */
  regPainter(painter) {
    return new GameMaster(this._scenes, this._initStates, painter);
  }

  /* run :: GameMaster -> String -> IO () */
  run(initialSceneName) {
    /* mainLoop :: (IO IMap, String, [Int]) -> IO () */
    let mainLoop = (state, sceneName, counter) => {
      let tuple = this._scenes.queryScene(sceneName);
      return state.bind(s => M_IO.unit(tuple.nth(0)(M_IO.unit(s), counter))
        .bind(next => next.nth(1)
          .bind(trans => trans.match({
            stay: () => new M_IO((world) => {
              world.requestAnimationFrame(() => mainLoop(next.nth(0), sceneName, counter.map(x => x + 1)).runIO(world));
              return new Tuple(null, world);
            }).bind(_ => tuple.nth(1)(M_IO.unit(s), counter, this._painter)),
            trans: (nextSceneName, nextSceneCounter, f) => M_IO.unit(this._scenes.queryScene(nextSceneName))
              .bind(nextTuple => this._imitators
                .bind(imits => tuple.nth(1)(M_IO.unit(s), counter, M_IO.unit(imits[0])).bind(_ => nextTuple.nth(1)(M_IO.unit(s), [counter[0], nextSceneCounter], M_IO.unit(imits[1])))
                  .bind(_ => new M_IO((world) => {
                    world.requestAnimationFrame(() => transLoop(next.nth(0), nextSceneName, nextSceneCounter, imits.map(imit => imit.canvas), f, [counter[0] + 1, 0]).runIO(world));
                    return new Tuple(null, world);
                  }))))
              .bind(_ => tuple.nth(1)(M_IO.unit(s), counter, this._painter)),
            end: () => tuple.nth(1)(M_IO.unit(s), counter, this._painter)
          }))));
    };

    /* transLoop :: (IO IMap, String, Int, [Image], (([Image], [Int], IO Painter) => (Bool, IO ())), [Int]) -> IO () */
    let transLoop = (state, nextSceneName, nextSceneCounter, images, transFunc, counter) => {
      let transNext = transFunc(images, counter, this._painter); // :: (Bool, IO ())
      if (transNext.nth(0)) {
        return new M_IO((world) => {
          world.requestAnimationFrame(() => mainLoop(state, nextSceneName, [counter[0] + 1, nextSceneCounter]).runIO(world));
          return new Tuple(null, world);
        }).bind(_ => transNext.nth(1));
      } else {
        return new M_IO((world) => {
          world.requestAnimationFrame(() => transLoop(state, nextSceneName, nextSceneCounter, images, transFunc, counter.map(x => x + 1)).runIO(world));
          return new Tuple(null, world);
        }).bind(_ => transNext.nth(1));
      }
    };
    return mainLoop(this._initStates, initialSceneName, [0, 0]);
  }

  /* toString :: GameMaster -> String */
  toString() {
    return '[GameMaster]';
  }
}

