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
