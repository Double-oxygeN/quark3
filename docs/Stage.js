let HADRONS;
const xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    HADRONS = JSON.parse(xhr.responseText);
    console.log(HADRONS);
  }
};
xhr.open("GET", "./resources/hadrons.json");
xhr.send();

class Stage {
  constructor(x, y, w, h, nexts, board, hand, land_counter, fall_distance, fall_speed, clear_counter, score, chain, received_antiquarks, send_antiquarks) {
    this.x = x;
    this.y = y;
    this.width = w; // :: Int
    this.height = h; // :: Int
    this.nexts = nexts; // :: [[Quark]]
    this.board = board; // :: [[Maybe Quark]]
    this.hand = hand; // :: [Float]
    this.landCounter = land_counter; // :: Int
    this.fallDistance = fall_distance; // :: Float
    this.fallSpeed = fall_speed; // :: Maybe Float
    this.clearCounter = clear_counter; // :: Int
    this.score = score; // :: Int
    this.chain = chain; // :: Int
    this.receivedAntiquarks = received_antiquarks; // :: Int
    this.sendAntiquarks = send_antiquarks; // :: Int
  }

  /* init :: [[Quark]] -> Stage */
  static init(x, y, nexts) {
    return new Stage(x, y, 6, 14, nexts, Ex.repeatedly(() => Ex.repeatedly(M_Maybe.Nothing, 14), 6), [2, 0], 0, 0, M_Maybe.Nothing(), 0, 0, 0, 0, 0);
  }

  /* showBoard :: Stage -> Painter2d -> IO () */
  showBoard(painter) {
    let blanks = this.blanks,
      clears = this.clears,
      isAboveBlanks = (col, row) => blanks.some(bl => bl[0] === col) && blanks.filter(bl => bl[0] === col)[0][1] > row,
      getClearGroup = (col, row) => clears.filter(q => q.del.some(pos => pos[0] === col && pos[1] === row));
    return painter.rect(this.x, this.y, this.width * 32, (this.height - 2) * 32)
      .clip(this.board.map((column, colNum) => column.map((q, rowNum) => q.match({
        nothing: () => M_IO.unit(),
        just: (quark) => {
          let clearGroup = getClearGroup(colNum, rowNum);
          if (isAboveBlanks(colNum, rowNum)) {
            return quark.show(painter, this.x + colNum * 32, this.y + (rowNum - 2 + this.fallDistance) * 32);
          } else if (clearGroup.length > 0 && this.clearCounter > 0) {
            let ease2 = Tween.ease(Tween.in(Tween.quad))(this.clearCounter, 1, -1, 30);
            return painter.globalAlpha(ease2)(quark.show(painter, this.x + colNum * 32, this.y + (rowNum - 2) * 32)).bind(_ =>
              (clearGroup[0].del[0][0] === colNum && clearGroup[0].del[0][1] === rowNum) ?
              painter.text(clearGroup[0].name, this.x + colNum * 32 + 16, this.y + (rowNum - 2) * 32 + 16, { font: 'Fira Sans', size: 28, align: 'center', baseline: 'middle' })
              .fill(Color.HSL(0, 0, 0).toHex()) : M_IO.unit());
          } else {
            return quark.show(painter, this.x + colNum * 32, this.y + (rowNum - 2) * 32);
          }
        }
      })).reduce((a, b) => a.bind(_ => b))).reduce((a, b) => a.bind(_ => b)));
  }

  /* showHand :: Stage -> Painter2d -> IO () */
  showHand(painter) {
    return painter.rect(this.x, this.y, this.width * 32, (this.height - 2) * 32)
      .clip(this.nexts[0].map((quark, num) => {
        return quark.show(painter, this.x + 32 * (this.hand[0] + (num % 2)), this.y + 32 * (this.hand[1] + Math.floor(num / 2) - 2));
      }).reduce((a, b) => a.bind(_ => b)));
  }

  /* showNext :: Stage -> (Painter2d, Int, Int) -> IO () */
  showNext(painter, x, y) {
    return this.nexts[1].map((quark, num) => {
      return quark.show(painter, x + 32 * (num % 2), y + 32 * Math.floor(num / 2));
    }).reduce((a, b) => a.bind(_ => b));
  }

  /* turnQuarks :: ([Quark], Int) -> [Quark] */
  static turnQuarks(quarks, turn) {
    if (turn === -1) {
      return [quarks[2], quarks[0], quarks[3], quarks[1]];
    } else if (turn === 1) {
      return [quarks[1], quarks[3], quarks[0], quarks[2]];
    } else {
      return quarks;
    }
  }

  /* blanks :: [[Int]] */
  get blanks() {
    return this.board.map((column, x) => {
      let flag = false;
      return column.map((q, y) => {
        return q.match({
          nothing: () => flag ? [[x, y]] : [],
          just: (_) => {
            flag = true;
            return [];
          }
        });
      }).reduce((a, b) => a.concat(b));
    }).reduce((a, b) => a.concat(b));
  }

  static getName(particles, defaultName) {
    let sorted = particles.sort((a, b) => (a * b < 0) ? b - a : a - b),
      hadron = HADRONS[sorted.map(v => Quark.getQuarkChar(v)).reduce((a, b) => a + b)] || {};
    return ('name' in hadron) ? hadron.name : defaultName;
  }

  static getScore(particles, defaultScore) {
    let sorted = particles.sort((a, b) => (a * b < 0) ? b - a : a - b),
      hadron = HADRONS[sorted.map(v => Quark.getQuarkChar(v)).reduce((a, b) => a + b)] || {};
    return ('mass' in hadron) ? hadron.mass : defaultScore;
  }

  /* clears :: [Object] */
  get clears() {
    return this.board.map((column, x) => column.map((q, y) => {
      let clrs = [];
      if (y < 2 || !this.isFill(x, y)) {
        return clrs;
      }
      if (x < this.width - 1) {
        if (0 < x) {
          this.board[x - 1][y].map(a => q.map(b => this.board[x + 1][y].map(c => {
            if ((a.colorCharge + b.colorCharge + c.colorCharge) % 21 === 0) {
              clrs.push({
                del: [[x, y], [x - 1, y], [x + 1, y]],
                name: Stage.getName([a, b, c].map(n => n.particle), "?"),
                point: Stage.getScore([a, b, c].map(n => n.particle), [a, b, c].map(n => n.mass).reduce((m, n) => m + n))
              });
            }
          })));
        }
        q.map(a => this.board[x + 1][y].map(b => {
          if ((a.colorCharge + b.colorCharge) % 21 === 0) {
            clrs.push({
              del: [[x, y], [x + 1, y]],
              name: Stage.getName([a, b].map(n => n.particle), "?"),
              point: Stage.getScore([a, b].map(n => n.particle), [a, b].map(n => n.mass).reduce((m, n) => m + n))
            });
          }
        }));
      }
      if (y < this.height - 1) {
        if (2 < y) {
          this.board[x][y - 1].map(a => q.map(b => this.board[x][y + 1].map(c => {
            if ((a.colorCharge + b.colorCharge + c.colorCharge) % 21 === 0) {
              clrs.push({
                del: [[x, y], [x, y - 1], [x, y + 1]],
                name: Stage.getName([a, b, c].map(n => n.particle), "?"),
                point: Stage.getScore([a, b, c].map(n => n.particle), [a, b, c].map(n => n.mass).reduce((m, n) => m + n))
              });
            }
          })));
        }
        q.map(a => this.board[x][y + 1].map(b => {
          if ((a.colorCharge + b.colorCharge) % 21 === 0) {
            clrs.push({
              del: [[x, y], [x, y + 1]],
              name: Stage.getName([a, b].map(n => n.particle), "?"),
              point: Stage.getScore([a, b].map(n => n.particle), [a, b].map(n => n.mass).reduce((m, n) => m + n))
            });
          }
        }));
      }
      return clrs;
    }).reduce((a, b) => a.concat(b))).reduce((a, b) => a.concat(b));
  }

  /* nextStageState :: Stage -> (Int, Int, Int, Int) -> Stage */
  nextStageState(horizontalMove, verticalMove, turn, r_anti) {
    return this.fallSpeed.match({
      nothing: () => {
        let speed = 0.02,
          nextHand = Ex.clone(this.hand),
          l_counter,
          nextNexts = [Stage.turnQuarks(this.nexts[0], turn)].concat(this.nexts.slice(1)),
          nextBoard = Ex.clone(this.board),
          fallSpeed = this.fallSpeed;

        if (horizontalMove === -1) {
          if (this.hand[0] === 0) {
            nextHand[0] = 0;
          } else if (this.isFill(this.hand[0] - 1, Math.floor(this.hand[1])) || this.isFill(this.hand[0] + -1, Math.floor(this.hand[1]) + 1)) {
            nextHand[0] = this.hand[0];
          } else {
            nextHand[0] = this.hand[0] - 1;
          }
        } else if (horizontalMove === 1) {
          if (this.hand[0] === 4) {
            nextHand[0] = 4;
          } else if (this.isFill(this.hand[0] + 2, Math.ceil(this.hand[1])) || this.isFill(this.hand[0] + 2, Math.ceil(this.hand[1]) + 1)) {
            nextHand[0] = this.hand[0];
          } else {
            nextHand[0] = this.hand[0] + 1;
          }
        } else {
          nextHand[0] = this.hand[0];
        }

        if (this.isLand()) {
          nextHand[1] = this.hand[1];
          l_counter = this.landCounter + 1 + verticalMove * 2;
          if (l_counter >= 30) {
            l_counter = 0;
            nextBoard[nextHand[0]][Math.floor(nextHand[1])] = M_Maybe.unit(nextNexts[0][0]);
            nextBoard[nextHand[0] + 1][Math.floor(nextHand[1])] = M_Maybe.unit(nextNexts[0][1]);
            nextBoard[nextHand[0]][Math.floor(nextHand[1] + 1)] = M_Maybe.unit(nextNexts[0][2]);
            nextBoard[nextHand[0] + 1][Math.floor(nextHand[1] + 1)] = M_Maybe.unit(nextNexts[0][3]);

            fallSpeed = M_Maybe.Just(0);
          }
        } else {
          nextHand[1] = this.hand[1] + speed * (11 * verticalMove + 1);
          l_counter = this.landCounter;
        }
        return new Stage(this.x, this.y, this.width, this.height, nextNexts, nextBoard, nextHand, l_counter, 0, fallSpeed, 0, this.score, 0, this.receivedAntiquarks + r_anti, 0);
      },
      just: (speed) => {
        let nextFallDistance,
          nextFallSpeed,
          nextNexts = Ex.clone(this.nexts),
          nextBoard = Ex.clone(this.board),
          blanks = this.blanks,
          clears = this.clears,
          clearCounter = this.clearCounter,
          score = this.score,
          chain = this.chain,
          receivedAntiquarks = this.receivedAntiquarks,
          sendAntiquarks = 0;
        const acceleration = 0.0098;

        if (blanks.length > 0) {
          nextFallSpeed = this.fallSpeed.map(x => x + acceleration);
          nextFallDistance = this.fallDistance + speed;
          while (nextFallDistance >= 1) {
            nextFallDistance--;
            nextBoard = this.board.map((column, x) =>
              blanks.some(bl => bl[0] === x) ? [M_Maybe.Nothing()].concat(column.filter((_, idx) => idx !== blanks.filter(bl => bl[0] === x)[0][1])) : column);
          }
        } else {
          if (clears.length > 0) {
            clearCounter++;
            if (clearCounter >= 30) {
              let clearQuarks = clears.map(clrs => clrs.del).reduce((a, b) => a.concat(b)),
                plusScore = clears.map(clrs => clrs.point).reduce((a, b) => a + b, 0) * clears.length * (chain + 1);
              clearQuarks.forEach(qPos => {
                nextBoard[qPos[0]][qPos[1]] = M_Maybe.Nothing();
              });
              score += plusScore;
              sendAntiquarks = Math.floor(plusScore / 5000);
              chain++;
              clearCounter = 0;
            }
            nextFallSpeed = M_Maybe.Just(0);
            nextFallDistance = 0;
          } else if (receivedAntiquarks > 0) {
            let fallAntiquarksNum = (receivedAntiquarks > 12) ? 12 : receivedAntiquarks,
              fallAntiquarks = Ex.shuffle(Ex.repeatedly(() => M_Maybe.Just(Quark.getRandomQuark().antiQuark()), fallAntiquarksNum)
                .concat(Ex.repeatedly(M_Maybe.Nothing, 12)).slice(0, 12));
            receivedAntiquarks -= fallAntiquarksNum;
            fallAntiquarks.forEach((aq, num) => {
              this.board[num % 6][Math.floor(num / 6)] = aq;
            });
            nextFallSpeed = M_Maybe.Just(0);
            nextFallDistance = 0;
          } else {
            nextFallSpeed = M_Maybe.Nothing();
            nextFallDistance = 0;
            nextNexts = this.nexts.slice(1).concat([Quark.getRandomNext()]);
            chain = 0;
          }
        }
        return new Stage(this.x, this.y, this.width, this.height, nextNexts, nextBoard, [2, 0], 0, nextFallDistance, nextFallSpeed, clearCounter, score, chain, receivedAntiquarks + r_anti, sendAntiquarks);
      }
    })
  }

  /* isFill :: Stage -> (Int, Int) -> Bool */
  isFill(x, y) {
    return this.board[x][y].match({
      nothing: () => false,
      just: (_quark) => true
    });
  }

  /* isLand :: Stage -> Bool */
  isLand() {
    return (this.hand[1] >= this.height - 2) || this.isFill(this.hand[0], Math.floor(this.hand[1] + 2)) || this.isFill(this.hand[0] + 1, Math.floor(this.hand[1] + 2));
  }
}
