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
