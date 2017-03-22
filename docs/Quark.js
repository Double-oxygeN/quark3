const QUARK = Object.freeze({
  u: 1,
  d: 2,
  s: 3,
  c: 4,
  b: 5,
  t: 6,
  au: -1,
  ad: -2,
  as: -3,
  ac: -4,
  ab: -5,
  at: -6
});

const COLOR_CHARGE = Object.freeze({
  r: 1,
  g: 4,
  y: 5,
  b: 16,
  m: 17,
  c: 20
});

class Quark {
  constructor(particle, color_charge) {
    this.particle = particle;
    this.colorCharge = color_charge;
  }

  get mass() {
    // unit: [MeV]
    switch (this.particle) {
    case QUARK.u:
    case QUARK.au:
      return 5;
      break;
    case QUARK.d:
    case QUARK.ad:
      return 9;
      break;
    case QUARK.c:
    case QUARK.ac:
      return 1300;
      break;
    case QUARK.s:
    case QUARK.as:
      return 170;
      break;
    case QUARK.t:
    case QUARK.at:
      return 175000;
      break;
    case QUARK.b:
    case QUARK.ab:
      return 4400;
      break;
    }
  }

  /* getRandomQuark :: () -> Quark */
  static getRandomQuark() {
    let randomValue = Math.floor(Math.random() * 6 * 6 * 6 * 6),
      randomColor = 1 << (2 * Math.floor(Math.random() * 3));
    if (randomValue < 1 * 1 * 1 * 1) {
      return new Quark(QUARK.t, randomColor);
    } else if (randomValue < 2 * 2 * 2 * 2) {
      return new Quark(QUARK.b, randomColor);
    } else if (randomValue < 3 * 3 * 3 * 3) {
      return new Quark(QUARK.c, randomColor);
    } else if (randomValue < 4 * 4 * 4 * 4) {
      return new Quark(QUARK.s, randomColor);
    } else if (randomValue < 5 * 5 * 5 * 5) {
      return new Quark(QUARK.d, randomColor);
    } else {
      return new Quark(QUARK.u, randomColor);
    }
  }

  /* getRandomNext :: () -> [Quark] */
  static getRandomNext() {
    return Ex.repeatedly(Quark.getRandomQuark, 4);
  }

  /* antiQuark :: Quark -> Quark */
  antiQuark() {
    return new Quark(-this.particle, 21 - this.colorCharge);
  }

  static getColor(color_charge) {
    switch (color_charge) {
    case COLOR_CHARGE.r:
      return Color.HSL(0, 80, 60);
      break;
    case COLOR_CHARGE.g:
      return Color.HSL(120, 80, 60);
      break;
    case COLOR_CHARGE.b:
      return Color.HSL(240, 80, 60);
      break;
    case COLOR_CHARGE.y:
      return Color.HSL(60, 80, 60);
      break;
    case COLOR_CHARGE.m:
      return Color.HSL(300, 80, 60);
      break;
    case COLOR_CHARGE.c:
      return Color.HSL(180, 80, 60);
      break;
    }
  }

  static getQuarkChar(particle) {
    switch (particle) {
    case QUARK.u:
      return "u";
      break;
    case QUARK.au:
      return "U";
      break;
    case QUARK.d:
      return "d";
      break;
    case QUARK.ad:
      return "D";
      break;
    case QUARK.c:
      return "c";
      break;
    case QUARK.ac:
      return "C";
      break;
    case QUARK.s:
      return "s";
      break;
    case QUARK.as:
      return "S";
      break;
    case QUARK.t:
      return "t";
      break;
    case QUARK.at:
      return "T";
      break;
    case QUARK.b:
      return "b";
      break;
    case QUARK.ab:
      return "B";
      break;
    }
  }

  /* show :: Quark -> (Painter2d, Int, Int) -> IO () */
  show(painter, x, y) {
    let quarkColor = Quark.getColor(this.colorCharge),
      quarkChar = Quark.getQuarkChar(this.particle),
      isAnti = this.particle < 0;
    return painter.roundRect(x + 1, y + 1, 30, 30, 5).fill(isAnti ? Color.HSL(0, 0, 10).toHex() : Color.HSL(0, 0, 90).toHex()).bind(_ =>
      painter.roundRect(x + 2, y + 2, 28, 28, 5).stroke(quarkColor.toHex(), { width: 4 })).bind(_ =>
      painter.text(quarkChar, x + 16, y + 16, { font: 'Fira Sans', size: 28, align: 'center', baseline: 'middle' }).fill(quarkColor.toHex()));
  }

  toString() {
    return "[Quark (" + this.particle.toString(10) + "," + this.colorCharge.toString(10) + ")]";
  }
}
