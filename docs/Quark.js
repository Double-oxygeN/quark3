class Quark {
  constructor(data, color) {
    Object.defineProperty(this, 'data', {
      value: data,
      writable: false,
      enumerable: true,
      configurable: false
    });
    Object.defineProperty(this, 'color', {
      value: color,
      writable: false,
      enumerable: true,
      configurable: false
    });
  }

  static Up(color) {
    return new Quark((pattern) => pattern.up(color), color);
  }

  static AntiUp(color) {
    return new Quark((pattern) => pattern.antiup(color), color);
  }

  static Down(color) {
    return new Quark((pattern) => pattern.down(color), color);
  }

  static AntiDown(color) {
    return new Quark((pattern) => pattern.antidown(color), color);
  }

  static Charm(color) {
    return new Quark((pattern) => pattern.charm(color), color);
  }

  static AntiCharm(color) {
    return new Quark((pattern) => pattern.anticharm(color), color);
  }

  static Strange(color) {
    return new Quark((pattern) => pattern.strange(color), color);
  }

  static AntiStrange(color) {
    return new Quark((pattern) => pattern.antistrange(color), color);
  }

  static Top(color) {
    return new Quark((pattern) => pattern.top(color), color);
  }

  static AntiTop(color) {
    return new Quark((pattern) => pattern.antitop(color), color);
  }

  static Bottom(color) {
    return new Quark((pattern) => pattern.bottom(color), color);
  }

  static AntiBottom(color) {
    return new Quark((pattern) => pattern.antibottom(color), color);
  }

  match(pattern) {
    return this.data(pattern);
  }

  /* antiQuark :: Quark -> Quark */
  antiQuark() {
    return this.match({
      up: (color) => Quark.AntiUp(color.complementary()),
      antiup: (color) => Quark.Up(color.complementary()),
      down: (color) => Quark.AntiDown(color.complementary()),
      antidown: (color) => Quark.Down(color.complementary()),
      charm: (color) => Quark.AntiCharm(color.complementary()),
      anticharm: (color) => Quark.Charm(color.complementary()),
      strange: (color) => Quark.AntiStrange(color.complementary()),
      antistrange: (color) => Quark.Strange(color.complementary()),
      top: (color) => Quark.AntiTop(color.complementary()),
      antitop: (color) => Quark.Top(color.complementary()),
      bottom: (color) => Quark.AntiBottom(color.complementary()),
      antibottom: (color) => Quark.Bottom(color.complementary())
    });
  }

  /* mass :: Int */
  get mass() {
    return this.match({
      up: (_) => 5,
      antiup: (_) => 5,
      down: (_) => 9,
      antidown: (_) => 9,
      charm: (_) => 1300,
      anticharm: (_) => 1300,
      strange: (_) => 170,
      antistrange: (_) => 170,
      top: (_) => 175000,
      antitop: (_) => 175000,
      bottom: (_) => 4400,
      antibottom: (_) => 4400
    });
  }

  /* toQuarkChar :: Quark -> Char */
  toQuarkChar() {
    return this.match({
      up: (_) => 'u',
      antiup: (_) => 'U',
      down: (_) => 'd',
      antidown: (_) => 'D',
      charm: (_) => 'c',
      anticharm: (_) => 'C',
      strange: (_) => 's',
      antistrange: (_) => 'S',
      top: (_) => 't',
      antitop: (_) => 'T',
      bottom: (_) => 'b',
      antibottom: (_) => 'B'
    });
  }

  /* toInt :: Quark -> Int */
  toInt() {
    return this.match({
      up: (_) => 1,
      antiup: (_) => 7,
      down: (_) => 2,
      antidown: (_) => 8,
      charm: (_) => 4,
      anticharm: (_) => 10,
      strange: (_) => 3,
      antistrange: (_) => 9,
      top: (_) => 6,
      antitop: (_) => 12,
      bottom: (_) => 5,
      antibottom: (_) => 11
    });
  }

  /* toString :: Quark -> String */
  toString() {
    return '[Quark <' + this.toQuarkChar() + ',' + this.color.toString() + '>]';
  }

  /* randomQuark :: Quark */
  static randomQuark() {
    let randomNum = Math.floor(Math.random() * 6 * 6 * 6 * 6),
      randomColorNum = Math.floor(Math.random() * 3),
      randomColor = (randomColorNum === 0) ? Color.RGB(0xff, 0, 0) : ((randomColorNum === 1) ? Color.RGB(0, 0xff, 0) : Color.RGB(0, 0, 0xff)),
      q;
    if (randomNum < 1 * 1 * 1 * 1) {
      q = Quark.Top(randomColor);
    } else if (randomNum < 2 * 2 * 2 * 2) {
      q = Quark.Bottom(randomColor);
    } else if (randomNum < 3 * 3 * 3 * 3) {
      q = Quark.Charm(randomColor);
    } else if (randomNum < 4 * 4 * 4 * 4) {
      q = Quark.Strange(randomColor);
    } else if (randomNum < 5 * 5 * 5 * 5) {
      q = Quark.Down(randomColor);
    } else {
      q = Quark.Up(randomColor);
    }
    return q;
  }

  /* randomNext :: [Quark] */
  static randomNext() {
    return Ex.repeatedly(Quark.randomQuark, 4);
  }

  /* compound :: ([Quark], Object) -> Maybe Hadron */
  static compound(quarks, table) {
    if (quarks.length === 2 || quarks.length === 3) {
      let collider = (qs, color, contents) => {
        if (qs.length === 0) {
          if (color.realColor().toHex() === Color.RGB(0xff, 0xff, 0xff).toHex()) {
            return M_Maybe.Just(Quark.quarksToHadron(contents, table));
          } else {
            return M_Maybe.Nothing();
          }
        } else {
          return collider(qs.slice(1), color.plus(qs[0].color), contents.concat(qs[0]));
        }
      };
      return collider(quarks, Color.RGB(0, 0, 0), []);
    } else {
      return M_Maybe.Nothing();
    }
  }

  /* quarksToHadron :: ([Quark], Object) -> Hadron */
  static quarksToHadron(quarks, table) {
    let quarksString = quarks.sort((a, b) => a.toInt() - b.toInt()).map(q => q.toQuarkChar()).join(''),
      hadronProperty = (quarksString in table) ? table[quarksString] : {
        name: "?",
        mass: quarks.map(q => q.mass).reduce((a, b) => a + b)
      };
    return new Hadron(hadronProperty.name, hadronProperty.mass);
  }

  /* isAnti :: Quark -> Bool */
  isAnti() {
    return this.match({
      up: (_) => false,
      antiup: (_) => true,
      down: (_) => false,
      antidown: (_) => true,
      charm: (_) => false,
      anticharm: (_) => true,
      strange: (_) => false,
      antistrange: (_) => true,
      top: (_) => false,
      antitop: (_) => true,
      bottom: (_) => false,
      antibottom: (_) => true
    });
  }

  /* show :: Quark -> Painter2d -> IO () */
  show(painter, x, y) {
    return painter.roundRect(x + 1, y + 1, 30, 30, 5).fill(this.isAnti() ? Color.HSL(0, 0, 10).toHex() : Color.HSL(0, 0, 90).toHex()).bind(_ =>
      painter.roundRect(x + 2, y + 2, 28, 28, 5).stroke(this.color.toHex(), { width: 4 })).bind(_ =>
      painter.text(this.toQuarkChar(), x + 16, y + 16, { font: 'Fira Sans', size: 28, align: 'center', baseline: 'middle' }).fill(this.color.toHex()));
  }
}
