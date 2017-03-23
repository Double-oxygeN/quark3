class Phase {
  constructor(data) {
    this.data = data;
  }

  /* Wait Int */
  static Wait(counter) {
    return new Phase((pattern) => pattern.wait(counter));
  }

  /* Move */
  static Move() {
    return new Phase((pattern) => pattern.move());
  }

  /* Turn Direction Int */
  static Turn(direction, counter) {
    return new Phase((pattern) => pattern.turn(direction, counter));
  }

  /* Land Int */
  static Land(counter) {
    return new Phase((pattern) => pattern.land(counter));
  }

  /* Clear [([Int], Maybe Hadron)] Int */
  static Clear(clearQuarks, counter) {
    return new Phase((pattern) => pattern.clear(clearQuarks, counter));
  }

  /* Fall Int Int */
  static Fall(fallDistance, fallSpeed) {
    return new Phase((pattern) => pattern.fall(fallDistance, fallSpeed));
  }

  match(pattern) {
    return this.data(pattern);
  }
}

const STAGE_WIDTH = 6;
const STAGE_HEIGHT = 14;
const DROP_SPEED = 0.02;
const FALL_ACCELERATION = 0.0098;
class Stage {
  /* Stage [[Maybe Quark]] [[Quark]] [Float] Phase Int */
  constructor(board, nexts, handPos, phase, score, chain, anti_quarks_num, send_anti_quarks) {
    this.board = board;
    this.nexts = nexts;
    this.handPos = handPos;
    this.phase = phase;
    this.score = score;
    this.chain = chain;
    this.antiQuarksNum = anti_quarks_num;
    this.sendAntiquarks = send_anti_quarks;
  }

  static get DIRECTIONS() {
    return {
      LEFT: -1,
      NONE: 0,
      RIGHT: 1,
      LEFTDOWN: 2,
      DOWN: 3,
      RIGHTDOWN: 4
    };
  }

  static init(nexts) {
    let blankBoard = Ex.repeatedly(() => Ex.repeatedly(M_Maybe.Nothing, STAGE_HEIGHT), STAGE_WIDTH);
    return new Stage(blankBoard, nexts, [2, 0], Phase.Wait(180), 0, 0, 0, 0);
  }

  /* nextHand :: [[Quark]] -> [[Quark]] */
  static nextHand(old_nexts) {
    return old_nexts.slice(1).concat([Quark.randomNext()]);
  }

  /* move :: [[Maybe Quark]] -> [Float] -> Direction -> [Float] */
  static move(board) {
    return (handPos) => (direction) => {
      let exactYPos = Math.floor(handPos[1]);
      if (direction === Stage.DIRECTIONS.LEFT || direction === Stage.DIRECTIONS.LEFTDOWN) {
        if (handPos[0] === 0) {
          return handPos;
        } else if (Stage.isFill(board)(handPos[0] - 1, exactYPos) || Stage.isFill(board)(handPos[0] - 1, exactYPos + 1)) {
          return handPos;
        } else {
          return [handPos[0] - 1, handPos[1]];
        }
      } else if (direction === Stage.DIRECTIONS.RIGHT || direction === Stage.DIRECTIONS.RIGHTDOWN) {
        if (handPos[0] === 4) {
          return handPos;
        } else if (Stage.isFill(board)(handPos[0] + 1, exactYPos) || Stage.isFill(board)(handPos[0] + 1, exactYPos + 1)) {
          return handPos;
        } else {
          return [handPos[0] + 1, handPos[1]];
        }
      } else {
        return handPos;
      }
    }
  }

  /* turnHand :: [[Quark]] -> Direction -> [[Quark]] */
  static turnHand(nexts) {
    return (direction) => {
      if (direction === Stage.DIRECTIONS.LEFT) {
        let hand = [[nexts[0][1], nexts[0][3], nexts[0][0], nexts[0][2]]];
        return hand.concat(nexts.slice(1));
      } else {
        let hand = [[nexts[0][2], nexts[0][0], nexts[0][3], nexts[0][1]]];
        return hand.concat(nexts.slice(1));
      }
    }
  }

  /* isFill :: [[Maybe Quark]] -> (Int, Int) -> Bool */
  static isFill(board) {
    return (x, y) => {
      return board[x][y].match({
        nothing: () => false,
        just: (_) => true
      });
    };
  }

  /* isLand :: [[Maybe Quark]] -> [Float] -> Bool */
  static isLand(board) {
    return (handPos) => {
      if (handPos[1] >= STAGE_HEIGHT - 2) {
        return true;
      } else if (Stage.isFill(board)(handPos[0], Math.floor(handPos[1]) + 2) || Stage.isFill(board)(handPos[0] + 1, Math.floor(handPos[1]) + 2)) {
        return true;
      } else {
        return false;
      }
    }
  }

  /* put :: [[Maybe Quark]] -> [Quark] -> [Float] -> [[Maybe Quark]] */
  static put(board) {
    return (hand) => (handPos) => {
      let nextBoard = Ex.clone(board),
        exactYPos = Math.floor(handPos[1]);
      nextBoard[handPos[0]][exactYPos] = M_Maybe.Just(hand[0]);
      nextBoard[handPos[0] + 1][exactYPos] = M_Maybe.Just(hand[1]);
      nextBoard[handPos[0]][exactYPos + 1] = M_Maybe.Just(hand[2]);
      nextBoard[handPos[0] + 1][exactYPos + 1] = M_Maybe.Just(hand[3]);
      return nextBoard;
    }
  }

  /* hasBlank :: [[Maybe Quark]] -> [[Int]] */
  static getBlanks(board) {
    return board.map((column, x) => {
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

  /* getHadrons :: [[Maybe Quark]] -> [([Int], Maybe Hadron)] */
  static getHadrons(board) {
    return board.map((column, x) => {
      return column.map((q, y) => {
        let hadrons = [];
        if (y < 2) return [];
        if (x < STAGE_WIDTH - 1) {
          if (x > 0) {
            board[x - 1][y].bind(a =>
              board[x][y].bind(b =>
                board[x + 1][y].bind(c =>
                  Quark.compound([a, b, c], HADRON_TABLE)))).match({
              nothing: () => null,
              just: (hadron) => {
                hadrons = hadrons.concat([[[x, y], M_Maybe.Just(hadron)], [[x - 1, y], M_Maybe.Nothing()], [[x + 1, y], M_Maybe.Nothing()]]);
                return null;
              }
            });
          }
          board[x][y].bind(a =>
            board[x + 1][y].bind(b =>
              Quark.compound([a, b], HADRON_TABLE))).match({
            nothing: () => null,
            just: (hadron) => {
              hadrons = hadrons.concat([[[x, y], M_Maybe.Just(hadron)], [[x + 1, y], M_Maybe.Nothing()]]);
              return null;
            }
          });
        }
        if (y < STAGE_HEIGHT - 1) {
          if (y > 2) {
            board[x][y - 1].bind(a =>
              board[x][y].bind(b =>
                board[x][y + 1].bind(c =>
                  Quark.compound([a, b, c], HADRON_TABLE)))).match({
              nothing: () => null,
              just: (hadron) => {
                hadrons = hadrons.concat([[[x, y], M_Maybe.Just(hadron)], [[x, y - 1], M_Maybe.Nothing()], [[x, y + 1], M_Maybe.Nothing()]]);
                return null;
              }
            });
          }
          board[x][y].bind(a =>
            board[x][y + 1].bind(b =>
              Quark.compound([a, b], HADRON_TABLE))).match({
            nothing: () => null,
            just: (hadron) => {
              hadrons = hadrons.concat([[[x, y], M_Maybe.Just(hadron)], [[x, y + 1], M_Maybe.Nothing()]]);
              return null;
            }
          });
        }
        return hadrons;
      }).reduce((a, b) => a.concat(b));
    }).reduce((a, b) => a.concat(b));
  }

  /* fall :: [[Quarks]] -> [[Int]] -> [[Quarks]] */
  static fall(board) {
    return (blanks) => {
      return board.map((column, x) => {
        let columnBlanks = blanks.filter(bl => bl[0] === x);
        if (columnBlanks.length === 0) {
          return column;
        } else {
          return [M_Maybe.Nothing()].concat(column.filter((_, y) => y !== columnBlanks[0][1]));
        }
      });
    };
  }

  /* nextStageState :: Stage -> (Direction, Int, Int) -> Stage */
  nextStageState(move_direction, turn_direction, anti_quarks_num) {
    return this.phase.match({
      wait: (counter) => {
        if (counter === 0) {
          return new Stage(this.board, Stage.nextHand(this.nexts), this.handPos, Phase.Move(), this.score, 0, 0, 0);
        } else {
          return new Stage(this.board, this.nexts, this.handPos, Phase.Wait(counter - 1), this.score, 0, 0, 0);
        }
      },
      move: () => {
        let nextHandPos = Stage.move(this.board)(this.handPos)(move_direction);
        nextHandPos[1] += (([Stage.DIRECTIONS.LEFTDOWN, Stage.DIRECTIONS.DOWN, Stage.DIRECTIONS.RIGHTDOWN].includes(move_direction)) ? 11 : 1) * DROP_SPEED;
        if (turn_direction === 0) {
          if (Stage.isLand(this.board)(nextHandPos)) {
            return new Stage(this.board, this.nexts, nextHandPos, Phase.Land(30), this.score, 0, this.antiQuarksNum + anti_quarks_num, 0);
          } else {
            return new Stage(this.board, this.nexts, nextHandPos, Phase.Move(), this.score, 0, this.antiQuarksNum + anti_quarks_num, 0);
          }
        } else {
          return new Stage(this.board, this.nexts, nextHandPos, Phase.Turn(turn_direction, 5), this.score, 0, this.antiQuarksNum + anti_quarks_num, 0);
        }
      },
      turn: (direction, counter) => {
        let nextHandPos = Stage.move(this.board)(this.handPos)(move_direction);
        if (counter === 0) {
          if (Stage.isLand(this.board)(this.handPos)) {
            return new Stage(this.board, Stage.turnHand(this.nexts)(direction), nextHandPos, Phase.Land(20), this.score, 0, this.antiQuarksNum + anti_quarks_num, 0);
          } else {
            return new Stage(this.board, Stage.turnHand(this.nexts)(direction), nextHandPos, Phase.Move(), this.score, 0, this.antiQuarksNum + anti_quarks_num, 0);
          }
        } else {
          return new Stage(this.board, this.nexts, nextHandPos, Phase.Turn(direction, counter - 1), this.score, 0, this.antiQuarksNum + anti_quarks_num, 0);
        }
      },
      land: (counter) => {
        let nextHandPos = Stage.move(this.board)(this.handPos)(move_direction);
        if (counter === 0) {
          return new Stage(Stage.put(this.board)(this.nexts[0])(this.handPos), this.nexts, nextHandPos, Phase.Fall(0, 0), this.score, 0, this.antiQuarksNum + anti_quarks_num, 0);
        } else {
          if (turn_direction === 0) {
            if ([Stage.DIRECTIONS.LEFTDOWN, Stage.DIRECTIONS.DOWN, Stage.DIRECTIONS.RIGHTDOWN].includes(move_direction)) {
              return new Stage(this.board, this.nexts, nextHandPos, Phase.Land(turn_direction, counter - 3), this.score, 0, this.antiQuarksNum + anti_quarks_num, 0);
            } else {
              return new Stage(this.board, this.nexts, nextHandPos, Phase.Land(turn_direction, counter - 1), this.score, 0, this.antiQuarksNum + anti_quarks_num, 0);
            }
          } else {
            return new Stage(this.board, this.nexts, nextHandPos, Phase.Turn(turn_direction, 5), this.score, 0, this.antiQuarksNum + anti_quarks_num, 0);
          }
        }
      },
      clear: (clearQuarks, counter) => {
        let nextBoard = Ex.clone(this.board),
          plusScore = 0;
        if (counter === 0) {
          clearQuarks.forEach(q => {
            nextBoard[q[0][0]][q[0][1]] = M_Maybe.Nothing();
            q[1].match({
              nothing: () => null,
              just: (hadron) => {
                plusScore += hadron.mass;
                return null;
              }
            });
          });
          plusScore *= Math.ceil(clearQuarks.length / 3) * (this.chain + 1);
          return new Stage(nextBoard, this.nexts, [2, 0], Phase.Fall(0, 0), this.score + plusScore, this.chain + 1, this.antiQuarksNum + anti_quarks_num, Math.floor(plusScore / 5000));
        } else {
          return new Stage(this.board, this.nexts, [2, 0], Phase.Clear(clearQuarks, counter - 1), this.score, this.chain, this.antiQuarksNum + anti_quarks_num, 0);
        }
      },
      fall: (fallDistance, fallSpeed) => {
        let nextFallSpeed = fallSpeed + FALL_ACCELERATION,
          nextFallDistance = fallDistance + nextFallSpeed,
          nextBoard,
          blanks = Stage.getBlanks(this.board);
        if (nextFallDistance >= 1) {
          nextFallDistance--;
          nextBoard = Stage.fall(this.board)(blanks);
        } else {
          nextBoard = this.board;
        }
        if (blanks.length === 0) {
          let hadrons = Stage.getHadrons(nextBoard);
          if (hadrons.length === 0) {
            if (this.antiQuarksNum > 0) {
              let fallAntiquarksNum = (this.antiQuarksNum > 12) ? 12 : this.antiQuarksNum,
                fallAntiquarks = Ex.shuffle(Ex.repeatedly(() => M_Maybe.Just(Quark.randomQuark().antiQuark()), fallAntiquarksNum)
                  .concat(Ex.repeatedly(M_Maybe.Nothing, 12)).slice(0, 12)),
                nextAntiquarks = this.antiQuarksNum - fallAntiquarksNum;
              fallAntiquarks.forEach((aq, num) => {
                nextBoard[num % 6][Math.floor(num / 6)] = aq;
              });
              return new Stage(nextBoard, this.nexts, [2, 0], Phase.Fall(0, 0), this.score, 0, nextAntiquarks + anti_quarks_num, 0);
            } else {
              return new Stage(nextBoard, Stage.nextHand(this.nexts), [2, 0], Phase.Move(), this.score, 0, this.antiQuarksNum + anti_quarks_num, 0);
            }
          } else {
            return new Stage(nextBoard, this.nexts, [2, 0], Phase.Clear(hadrons, 20), this.score, this.chain, this.antiQuarksNum + anti_quarks_num, 0);
          }
        } else {
          return new Stage(nextBoard, this.nexts, [2, 0], Phase.Fall(nextFallDistance, nextFallSpeed), this.score, this.chain, this.antiQuarksNum + anti_quarks_num, 0);
        }
      }
    });
  }

  /* showBoard :: Stage -> Painter2d -> (Int, Int) -> IO () */
  showBoard(painter) {
    let blanks = Stage.getBlanks(this.board),
      isAboveBlanks = (col, row) => blanks.some(bl => bl[0] === col) && blanks.filter(bl => bl[0] === col)[0][1] > row;
    return (x, y) => {
      return painter.rect(x, y, STAGE_WIDTH * 32, (STAGE_HEIGHT - 2) * 32)
        .clip(this.board.map((column, colNum) => column.map((q, rowNum) => q.match({
          nothing: () => M_IO.unit(),
          just: (quark) => {
            return this.phase.match({
              wait: (_) => {
                return quark.show(painter, x + colNum * 32, y + (rowNum - 2) * 32);
              },
              move: () => {
                return quark.show(painter, x + colNum * 32, y + (rowNum - 2) * 32);
              },
              turn: (_) => {
                return quark.show(painter, x + colNum * 32, y + (rowNum - 2) * 32);
              },
              land: (_) => {
                return quark.show(painter, x + colNum * 32, y + (rowNum - 2) * 32);
              },
              clear: (clearQuarks, counter) => {
                let filteredClearQuark = clearQuarks.filter(h => h[0][0] === colNum && h[0][1] === rowNum);
                if (filteredClearQuark.length === 0) {
                  return quark.show(painter, x + colNum * 32, y + (rowNum - 2) * 32);
                } else {
                  let ease2 = Tween.ease(Tween.in(Tween.quad))(20 - counter, 1, -1, 20);
                  return painter.globalAlpha(ease2)(quark.show(painter, x + colNum * 32, y + (rowNum - 2) * 32)).bind(_ =>
                    filteredClearQuark.map(h => h[1].match({
                      nothing: () => M_IO.unit(),
                      just: (hadron) => painter.text(hadron.name, x + colNum * 32 + 16, y + (rowNum - 2) * 32 + 16, { font: 'Fira Sans', size: 28, align: 'center', baseline: 'middle' })
                        .fill(Color.HSL(0, 0, 0).toHex())
                    })).reduce((a, b) => a.bind(_ => b)));
                }
              },
              fall: (fallDistance, _) => {
                if (isAboveBlanks(colNum, rowNum)) {
                  return quark.show(painter, x + colNum * 32, y + (rowNum - 2 + fallDistance) * 32);
                } else {
                  return quark.show(painter, x + colNum * 32, y + (rowNum - 2) * 32);
                }
              }
            });
          }
        })).reduce((a, b) => a.bind(_ => b))).reduce((a, b) => a.bind(_ => b)));
    }
  }

  /* showHand :: Stage -> Painter2d -> (Int, Int) -> IO () */
  showHand(painter) {
    return (x, y) => {
      let defaultShow = () => painter.rect(x, y, STAGE_WIDTH * 32, (STAGE_HEIGHT - 2) * 32)
        .clip(this.nexts[0].map((quark, num) => {
          return quark.show(painter, x + 32 * (this.handPos[0] + (num % 2)), y + 32 * (this.handPos[1] + Math.floor(num / 2) - 2));
        }).reduce((a, b) => a.bind(_ => b)));
      return this.phase.match({
        wait: (_) => M_IO.unit(),
        move: defaultShow,
        turn: (direction, counter) => {
          let ease = Tween.ease(Tween.in(Tween.sinusoidal))(5 - counter, 0, Math.PI / 2, 5),
            vectors = [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]];
          return painter.rect(x, y, STAGE_WIDTH * 32, (STAGE_HEIGHT - 2) * 32)
            .clip(this.nexts[0].map((quark, num) => {
              return quark.show(painter, x + 32 * (this.handPos[0] + 0.5 + vectors[num][0] * Math.cos(ease) - direction * vectors[num][1] * Math.sin(ease)), y + 32 * (this.handPos[1] - 2 + 0.5 + direction * vectors[num][0] * Math.sin(ease) + vectors[num][1] * Math.cos(ease)));
            }).reduce((a, b) => a.bind(_ => b)));
        },
        land: defaultShow,
        clear: (_) => M_IO.unit(),
        fall: (_) => M_IO.unit()
      });
    };
  }

  /* showNext :: Stage -> Painter2d -> (Int, Int) -> IO () */
  showNext(painter) {
    return (x, y) => {
      return this.nexts[1].map((quark, num) => {
        return quark.show(painter, x + 32 * (num % 2), y + 32 * Math.floor(num / 2));
      }).reduce((a, b) => a.bind(_ => b));
    }
  }
}
