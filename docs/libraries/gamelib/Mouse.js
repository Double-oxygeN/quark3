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
