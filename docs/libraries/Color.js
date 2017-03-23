class Color {
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a || 1.0;
  }

  /* byte :: Int -> Int */
  static byte(num) {
    return Math.min(Math.max(Math.round(num), 0), 0xff);
  }

  /* RGB :: (Int, Int, Int) -> Color */
  static RGB(r, g, b) {
    return new Color(r, g, b);
  }

  /* HSV :: (Int, Int, Int) -> Color */
  static HSV(h, s, v) {
    let max = v * 0xff / 100,
      min = max - s * max / 100;

    if (h < 60) {
      return new Color(max, h * (max - min) / 60 + min, min);
    } else if (h < 120) {
      return new Color((120 - h) * (max - min) / 60 + min, max, min);
    } else if (h < 180) {
      return new Color(min, max, (h - 120) * (max - min) / 60 + min);
    } else if (h < 240) {
      return new Color(min, (240 - h) * (max - min) / 60 + min, max);
    } else if (h < 300) {
      return new Color((h - 240) * (max - min) / 60 + min, min, max);
    } else {
      return new Color(max, min, (360 - h) * (max - min) / 60 + min);
    }
  }

  /* HSL :: (Int, Int, Int) -> Color */
  static HSL(h, s, l) {
    let max = ((l < 50) ? (l + l * s / 100) : (l + (100 - l) * s / 100)) * 0xff / 100,
      min = ((l < 50) ? (l - l * s / 100) : (l - (100 - l) * s / 100)) * 0xff / 100;

    if (h < 60) {
      return new Color(max, h * (max - min) / 60 + min, min);
    } else if (h < 120) {
      return new Color((120 - h) * (max - min) / 60 + min, max, min);
    } else if (h < 180) {
      return new Color(min, max, (h - 120) * (max - min) / 60 + min);
    } else if (h < 240) {
      return new Color(min, (240 - h) * (max - min) / 60 + min, max);
    } else if (h < 300) {
      return new Color((h - 240) * (max - min) / 60 + min, min, max);
    } else {
      return new Color(max, min, (360 - h) * (max - min) / 60 + min);
    }
  }

  /* XYZ :: (Int, Int, Int) -> Color */
  static XYZ(x, y, z) {
    return new Color((3.98876 * x - 2.41599 * y - 0.520211 * z) * 0xff,
      (-1.40053 * x + 2.37729 * y - 0.0329421 * z) * 0xff,
      (-0.0326964 * x - 0.182594 * y + 1.47165 * z) * 0xff);
  }

  /* Name :: String -> Color */
  static Name(name) {
    let g = document.createElement('canvas').getContext('2d'),
      numbers;
    g.fillStyle = name;
    numbers = [1, 3, 5].map(i => parseInt(g.fillStyle.substr(i, 2), 16));
    return new Color(numbers[0], numbers[1], numbers[2]);
  }

  /* toHex :: Color -> String */
  toHex() {
    let hex = (num) => ('0' + Color.byte(num).toString(16)).slice(-2);
    return '#' + hex(this.r) + hex(this.g) + hex(this.b);
  }

  /* toString :: Color -> String */
  toString() {
    return this.rgb.toString();
  }

  get rgb() {
    return {
      r: this.r,
      g: this.g,
      b: this.b,
      toString: () => 'rgb(' + [this.r, this.g, this.b].map(n => Color.byte(n).toString(10)).toString() + ')'
    };
  }

  get hsv() {
    let red = this.r,
      green = this.g,
      blue = this.b,
      max = Math.max(red, green, blue),
      min = Math.min(red, green, blue),
      hue,
      sat = (red === green && green === blue) ? 0 : (max - min) * 100 / max,
      val = max * 100 / 0xff;

    if (red === green && green === blue) {
      hue = 0;
    } else if (red === max) {
      hue = 60 * (green - blue) / (max - min);
    } else if (green === max) {
      hue = 60 * (blue - red) / (max - min) + 120;
    } else {
      hue = 60 * (red - green) / (max - min) + 240;
    }
    return {
      h: hue,
      s: sat,
      v: val,
      toString: () => 'hsv(' + [hue, sat, val].map(n => n.toString(10)).toString() + ')'
    };
  }

  get hsl() {
    let red = this.r,
      green = this.g,
      blue = this.b,
      max = Math.max(red, green, blue),
      min = Math.min(red, green, blue),
      hue,
      lgt = (max + min) * 50 / 0xff,
      sat = (max === min) ? 0 : ((lgt < 50) ? (max - min) * 100 / (max + min) : (max - min) * 100 / (2 * 0xff - max - min));

    if (red === green && green === blue) {
      hue = 0;
    } else if (red === max) {
      hue = 60 * (green - blue) / (max - min);
    } else if (green === max) {
      hue = 60 * (blue - red) / (max - min) + 120;
    } else {
      hue = 60 * (red - green) / (max - min) + 240;
    }
    return {
      h: hue,
      s: sat,
      l: lgt,
      toString: () => 'hsl(' + [hue, sat, lgt].map(n => n.toString(10)).toString() + ')'
    };
  }

  get xyz() {
    let red = this.r / 0xff,
      green = this.g / 0xff,
      blue = this.b / 0xff,
      x = 0.398 * red + 0.416 * green + 0.150 * blue,
      y = 0.235 * red + 0.667 * green + 0.098 * blue,
      z = 0.038 * red + 0.092 * green + 0.695 * blue;
    return {
      x: x,
      y: y,
      z: z,
      toString: () => 'XYZ(' + [x, y, z].map(n => n.toString(10)).toString() + ')'
    };
  }

  static _gradientFunc(type, colors) {
    return (...args) => {
      let c = document.createElement('canvas').getContext('2d'),
        g = ((type === 'line') ? c.createLineatGradient : c.createRadialGradient).apply(c, args);
      Object.keys(colors).forEach(offset => {
        g.addColorStop(parseFloat(offset), colors[offset].toHex());
      });
      return g;
    };
  }

  /* createLinearGrad :: Object -> (Int, Int, Int, Int) -> CanvasGradient */
  static createLinearGrad(colors) {
    return Color._gradientFunc('line', colors);
  }

  /* createRadialGrad :: Object -> (Int, Int, Int, Int, Int, Int) -> CanvasGradient */
  static createRadialGrad(colors) {
    return Color._gradientFunc('rad', colors);
  }

  /* plus :: Color -> ...Color -> Color */
  plus(color, ...args) {
    if (args.length === 0) {
      return Color.RGB(this.r + color.r, this.g + color.g, this.b + color.b);
    } else {
      let plusColor = this.plus(color);
      return plusColor.plus.apply(plusColor, args);
    }
  }

  /* realColor :: Color -> Color */
  realColor() {
    let maxLight = Math.max(0xff, this.r, this.g, this.b);
    return this.rate(0xff / maxLight);
  }

  /* rate :: Color -> Float -> Color */
  rate(r) {
    return Color.RGB(this.r * r, this.g * r, this.b * r);
  }

  /* equals :: Color -> Color -> Bool */
  equals(color) {
    return this.r === color.r && this.g === color.g && this.b === color.b;
  }

  /* complementary :: Color -> Color */
  complementary() {
    return Color.HSL((this.hsl.h + 180) % 360, this.hsl.s, this.hsl.l);
  }
}
