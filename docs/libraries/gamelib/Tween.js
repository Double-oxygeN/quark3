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
