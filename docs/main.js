/* pntr :: IO Painter2d */
const pntr = M_IO.getElementById('canvas').bind(canvas =>
  Painter2d.create(canvas).bind(p =>
    p.setScreen()));

/* initStates :: IO IMap */
const initStates = M_IO.unit(new IMap({
  titleCursor: 0,
  stage_p1: Stage.init(Ex.repeatedly(Quark.randomNext, 4)),
  stage_p2: Stage.init(Ex.repeatedly(Quark.randomNext, 4)),
  send_anti_p1: 0,
  send_anti_p2: 0
}));

/* paintField :: Painter2d -> IO () */
function paintField(painter) {
  return painter.background(Color.HSL(160, 70, 60).toHex()).bind(_ =>
    painter.rect(48, 128, 192, 382).fill(Color.HSL(160, 20, 80).toHex())).bind(_ =>
    painter.rect(560, 128, 192, 382).fill(Color.HSL(160, 20, 80).toHex())).bind(_ =>
    painter.text("NEXT", 298, 128, { font: 'Spicy Rice', size: 30, align: 'center', baseline: 'hanging' }).fill(Color.HSL(160, 40, 20).toHex())).bind(_ =>
    painter.text("NEXT", 502, 128).fill(Color.HSL(160, 40, 20).toHex())).bind(_ =>
    painter.roundRect(263, 157, 70, 70, 3).fill(Color.HSL(160, 20, 80).toHex())).bind(_ =>
    painter.roundRect(467, 157, 70, 70, 3).fill(Color.HSL(160, 20, 80).toHex())).bind(_ =>
    painter.text("TIME", 400, 256).fill(Color.HSL(160, 40, 20).toHex())).bind(_ =>
    painter.roundRect(324, 288, 152, 72, 12).fill(Color.HSL(160, 20, 80).toHex())).bind(_ =>
    painter.text("1P", 298, 382).fill(Color.HSL(160, 40, 20).toHex())).bind(_ =>
    painter.text("2P", 502, 446).fill(Color.HSL(160, 40, 20).toHex())).bind(_ =>
    painter.roundRect(263, 410, 213, 36, 8).fill(Color.HSL(160, 20, 80).toHex())).bind(_ =>
    painter.roundRect(324, 474, 213, 36, 8).fill(Color.HSL(160, 20, 80).toHex()));
}

/* createScenes :: IO Scenes */
const createScenes = Keyboard.listen().bind(key =>
  M_IO.unit(Scenes.Empty()

    .addScene('title', (states, counters) => {
      let nextStates = states.bind(s =>
        key.isPressed('ArrowUp').bind(keyUp =>
          key.isPressed('ArrowDown').bind(keyDown =>
            key.isDown('Space').bind(spaceKey => {
              if (keyUp) {
                return M_IO.unit(s.set({ titleCursor: (s.get('titleCursor') === 0) ? 2 : s.get('titleCursor') - 1 }));
              } else if (keyDown) {
                return M_IO.unit(s.set({ titleCursor: (s.get('titleCursor') === 2) ? 0 : s.get('titleCursor') + 1 }));
              } else if (spaceKey) {
                let random_nexts = Ex.repeatedly(Quark.randomNext, 4);
                return M_IO.unit(s.set({
                  stage_p1: Stage.init(random_nexts),
                  stage_p2: Stage.init(random_nexts),
                  send_anti_p1: 0,
                  send_anti_p2: 0
                }));
              } else {
                return M_IO.unit(s)
              }
            }))));
      let nextScene = key.isPressed('Space').bind(spaceKey =>
        spaceKey ? states.bind(s =>
          (s.get('titleCursor') === 0) ? M_IO.unit(Transition.Trans('tutorial', 0, StdTransFunc.fadeWithColor(60, Color.Name('darkgray').toHex()))) :
          ((s.get('titleCursor') === 1) ? M_IO.unit(Transition.Trans('play', 0, StdTransFunc.fadeWithColor(60, Color.Name('darkgray').toHex()))) :
            M_IO.unit(Transition.Trans('settings', 0, StdTransFunc.push(90, StdTransFunc.DIRECTIONS.UP, Tween.ease(Tween.inout(Tween.back))))))) :
        M_IO.unit(Transition.Stay()));
      return new Tuple(nextStates, nextScene);

    }, (states, counters, painterIO) => {
      let ease1 = Tween.ease(Tween.yoyo(Tween.inout(Tween.sinusoidal)))(counters[1], 120, 60, 60);
      return painterIO.bind(painter =>
        painter.background(Color.HSL(40, 70, 60).toHex()).bind(_ =>
          painter.text("Quark,", 320, ease1, { font: 'Spicy Rice', size: 120, align: 'center', baseline: 'alphabetic' })
          .outlined(Color.HSL(0, 80, 60).toHex(), "#ffffff", 4)).bind(_ =>
          painter.text("Quark,", 480, ease1 + 70)
          .outlined(Color.HSL(120, 80, 60).toHex(), "#ffffff", 4)).bind(_ =>
          painter.text("Quark!", 400, ease1 + 140)
          .outlined(Color.HSL(240, 80, 60).toHex(), "#ffffff", 4)).bind(_ =>
          painter.text("Tutorial", 400, 380, { font: 'Norican', size: 36 }).fill(Color.HSL(40, 40, 40).toHex())).bind(_ =>
          painter.text("VS. COM", 400, 440).fill(Color.HSL(40, 40, 40).toHex())).bind(_ =>
          painter.text("Settings", 400, 560).fill(Color.HSL(40, 40, 40).toHex())).bind(_ =>
          states.bind(s => {
            let diff = 3
            if (s.get('titleCursor') === 0) {
              return painter.text("Tutorial", 400 - diff, 380 - diff).fill(Color.HSL(40, 30, 20).toHex());
            } else if (s.get('titleCursor') === 1) {
              return painter.text("VS. COM", 400 - diff, 440 - diff).fill(Color.HSL(40, 30, 20).toHex());
            } else if (s.get('titleCursor') === 2) {
              return painter.text("Settings", 400 - diff, 560 - diff).fill(Color.HSL(40, 30, 20).toHex());
            } else {
              return M_IO.unit();
            }
          })).bind(_ =>
          painter.show()));
    })

    .addScene('tutorial', (states, counters) => {
      let nextStates = states.bind(s => {
        if (counters[1] === 0) {
          let nexts = [
            [Quark.Up(Color.RGB(0xff, 0, 0)), Quark.Up(Color.RGB(0, 0xff, 0)), Quark.Down(Color.RGB(0, 0, 0xff)), Quark.Strange(Color.RGB(0xff, 0, 0))],
            [Quark.Up(Color.RGB(0xff, 0, 0)), Quark.Up(Color.RGB(0, 0xff, 0)), Quark.Down(Color.RGB(0, 0, 0xff)), Quark.Strange(Color.RGB(0xff, 0, 0))],
            [Quark.Down(Color.RGB(0xff, 0, 0)), Quark.Up(Color.RGB(0, 0xff, 0)), Quark.Up(Color.RGB(0, 0xff, 0)), Quark.Up(Color.RGB(0, 0xff, 0))],
            [Quark.Bottom(Color.RGB(0, 0xff, 0)), Quark.Charm(Color.RGB(0, 0, 0xff)), Quark.Up(Color.RGB(0, 0xff, 0)), Quark.Up(Color.RGB(0xff, 0, 0))],
            [Quark.Strange(Color.RGB(0xff, 0, 0)), Quark.Up(Color.RGB(0xff, 0, 0)), Quark.Up(Color.RGB(0xff, 0, 0)), Quark.Up(Color.RGB(0xff, 0, 0))]
          ];
          return M_IO.unit(s.set({ stage_p1: Stage.init(nexts) }));
        } else if (counters[1] < 360 || (1640 <= counters[1] && counters[1] < 1880) || (2040 < counters[1] && counters[1] < 2120)) {
          return M_IO.unit(s.get('stage_p1').nextStageState(Stage.DIRECTIONS.NONE, Stage.DIRECTIONS.NONE, 0)).bind(nextStage =>
            M_IO.unit(s.set({ stage_p1: nextStage })));
        } else if (720 < counters[1] && counters[1] < 960) {
          return M_IO.unit(s.get('stage_p1').nextStageState(
            (counters[1] === 760 || counters[1] === 800) ? Stage.DIRECTIONS.LEFT : (
              (counters[1] === 840 || counters[1] === 880) ? Stage.DIRECTIONS.RIGHT : (
                (936 < counters[1]) ? Stage.DIRECTIONS.DOWN : Stage.DIRECTIONS.NONE
              )
            ), Stage.DIRECTIONS.NONE, 0)).bind(nextStage =>
            M_IO.unit(s.set({ stage_p1: nextStage })));
        } else if (960 <= counters[1] && counters[1] < 1400) {
          return M_IO.unit(s.get('stage_p1').nextStageState((counters[1] > 1380) ? Stage.DIRECTIONS.DOWN : Stage.DIRECTIONS.NONE, (
            ([1160, 1180, 1200, 1220].includes(counters[1])) ? Stage.DIRECTIONS.LEFT : (
              ([1260, 1280, 1300, 1320].includes(counters[1])) ? Stage.DIRECTIONS.RIGHT : Stage.DIRECTIONS.NONE
            )
          ), 0)).bind(nextStage =>
            M_IO.unit(s.set({ stage_p1: nextStage })));
        } else if (1880 <= counters[1] && counters[1] < 2040) {
          return M_IO.unit(s.get('stage_p1').nextStageState((counters[1] > 2000) ? Stage.DIRECTIONS.DOWN : (
            (counters[1] === 1920) ? Stage.DIRECTIONS.LEFTDOWN : Stage.DIRECTIONS.NONE
          ), (counters[1] === 1960) ? Stage.DIRECTIONS.RIGHT : Stage.DIRECTIONS.NONE, 0)).bind(nextStage =>
            M_IO.unit(s.set({ stage_p1: nextStage })));
        } else {
          return M_IO.unit(s);
        }
      });
      let nextScene = (counters[1] > 2700) ? M_IO.unit(Transition.Trans('title', 0, StdTransFunc.fadeWithColor(90, Color.Name('darkgray').toHex()))) : M_IO.unit(Transition.Stay());
      return new Tuple(nextStates, nextScene);
    }, (states, counters, painterIO) => {
      let explanation = (painter) => {
        let textOption = { font: 'Fira Sans', size: 26, align: "center", baseline: "alphabetic" };
        if (counters[1] < 240) {
          return painter.text("- Tutorial -\n\nThis game is\nbased on\nQuantum\nChromodynamics.", 656, 256, textOption).fill(Color.HSL(160, 40, 20).toHex());
        } else if (counters[1] < 480) {
          return painter.text("These are 'Quarks'.", 656, 256, textOption).fill(Color.HSL(160, 40, 20).toHex());
        } else if (counters[1] < 720) {
          return painter.text("Each quarks has\nown colors and\nown characters.", 656, 256, textOption).fill(Color.HSL(160, 40, 20).toHex());
        } else if (counters[1] < 960) {
          return painter.text("Arrow keys\nenable to move\nfloating quarks.\n\n← ↓ →", 656, 256, textOption).fill(Color.HSL(160, 40, 20).toHex());
        } else if (1080 < counters[1] && counters[1] < 1360) {
          return painter.text("Z key makes\nthem turn\ncounterclockwise,\n\nX key makes\nthem turn \nclockwise.", 656, 256, textOption).fill(Color.HSL(160, 40, 20).toHex());
        } else if (1400 < counters[1] && counters[1] < 1640) {
          return painter.text("When red, green and\nblue quarks are \nconnected vertically\nor horizontally,", 656, 256, textOption).fill(Color.HSL(160, 40, 20).toHex());
        } else if (1640 < counters[1] && counters[1] < 1880) {
          return painter.text("they become\n'Hadron' and\nyou score\nas much as\nthe mass of\nthe hadron.", 656, 256, textOption).fill(Color.HSL(160, 40, 20).toHex());
        } else if (1880 < counters[1] && counters[1] < 2040) {
          return painter.text("When you score\nmore than\n5000 MeV\nin one attack,", 656, 256, textOption).fill(Color.HSL(160, 40, 20).toHex());
        } else if (2040 < counters[1] && counters[1] < 2320) {
          let ease = Tween.ease(Tween.in(Tween.quad))(Math.min(counters[1] - 2040, 100), 96, 12 * 32, 100)
          return painter.text("'anti-quarks' fall into\nopponent's field.", 656, 256, textOption).fill(Color.HSL(160, 40, 20).toHex()).bind(_ =>
            painter.rect(560, 128, 192, 382).clip(Quark.Charm(Color.RGB(0, 0xff, 0)).antiQuark().show(painter, 592, ease)));
        } else if (2340 < counters[1] && counters[1] < 2700) {
          return painter.text("Now you can\nplay the game!", 656, 256, textOption).fill(Color.HSL(160, 40, 20).toHex());
        } else {
          return M_IO.unit();
        }
      };
      return painterIO.bind(painter =>
        paintField(painter).bind(_ =>
          explanation(painter)).bind(_ =>
          states.bind(s =>
            s.get('stage_p1').showBoard(painter)(48, 128).bind(_ =>
              s.get('stage_p1').showHand(painter)(48, 128)).bind(_ =>
              s.get('stage_p1').showNext(painter)(266, 160)).bind(_ =>
              painter.text(s.get('stage_p1').score.toString(10) + " MeV", 464, 428, { font: 'Spicy Rice', size: 32, align: 'right', baseline: 'middle' })
              .fill(Color.HSL(160, 40, 20).toHex())).bind(_ =>
              painter.show()))));
    })

    .addScene('play', (states, counters) => {
      if (counters[1] >= 180 + 60 * 123) {
        return new Tuple(states, M_IO.unit(Transition.Trans('result', 0, StdTransFunc.push(90, StdTransFunc.DIRECTIONS.UP, Tween.ease(Tween.inout(Tween.back))))));
      } else if (counters[1] < 180 + 60 * 120) {
        let nextStates = states.bind(s =>
          M_IO.unit(COM.receiveCommand(s.get('stage_p2').handPos[1])).bind(command =>
            key.isPressed('ArrowLeft').bind(keyLeft =>
              key.isPressed('ArrowRight').bind(keyRight =>
                key.isDown('ArrowDown').bind(keyDown =>
                  key.isPressed('KeyZ').bind(keyZ =>
                    key.isPressed('KeyX').bind(keyX =>
                      M_IO.unit([
                        s.get('stage_p1').nextStageState((keyLeft ? Stage.DIRECTIONS.LEFT : (keyRight ? Stage.DIRECTIONS.RIGHT : Stage.DIRECTIONS.NONE)) + (keyDown ? Stage.DIRECTIONS.DOWN : Stage.DIRECTIONS.NONE), keyZ ? Stage.DIRECTIONS.LEFT : (keyX ? Stage.DIRECTIONS.RIGHT : Stage.DIRECTIONS.NONE), s.get('send_anti_p2')),
                        s.get('stage_p2').nextStageState(((command === 1) ? Stage.DIRECTIONS.LEFT : ((command === 2) ? Stage.DIRECTIONS.RIGHT : Stage.DIRECTIONS.NONE)) + ((command === 5) ? Stage.DIRECTIONS.DOWN : Stage.DIRECTIONS.NONE), (command === 3) ? Stage.DIRECTIONS.LEFT : ((command === 4) ? Stage.DIRECTIONS.RIGHT : Stage.DIRECTIONS.NONE), s.get('send_anti_p1'))
                      ]).bind(nextStages =>
                        M_IO.unit(s.set({
                          stage_p1: nextStages[0],
                          stage_p2: nextStages[1],
                          send_anti_p1: s.get('stage_p1').sendAntiquarks,
                          send_anti_p2: s.get('stage_p2').sendAntiquarks
                        }))))))))));
        return new Tuple(nextStates, M_IO.unit(Transition.Stay()));
      } else {
        return new Tuple(states, M_IO.unit(Transition.Stay()));
      }
    }, (states, counters, painterIO) => {
      let ease;
      return states.bind(s =>
        painterIO.bind(painter =>
          // field
          paintField(painter).bind(_ => {

            if (counters[1] < 120) {
              ease = Tween.ease(Tween.in(Tween.quart))(counters[1], 1, -1, 120);
              return painter.globalAlpha(ease)(painter.text("Ready?", 400, 324, { size: 30 + ease * 6, baseline: 'middle' }).fill(Color.HSL(160, 40, 20).toHex()));
            } else if (counters[1] < 180) {
              ease = Tween.ease(Tween.in(Tween.quart))(counters[1] - 120, 1, -1, 60);
              return painter.globalAlpha(ease)(painter.text("GO!", 400, 324, { size: 30 + ease * 6, baseline: 'middle' }).fill(Color.HSL(160, 40, 20).toHex()));
            } else if (counters[1] >= 180 + 60 * 120) {
              return painter.text("TIME UP!", 400, 324, { size: 36, baseline: 'middle' }).fill(Color.HSL(160, 40, 20).toHex());
            } else {
              let restTime = 120 - Math.floor((counters[1] - 180) / 60),
                min = Math.floor(restTime / 60),
                sec = restTime - 60 * min;
              return painter.text(min.toString(10) + ":" + ("0" + sec.toString(10)).slice(-2), 400, 324, { size: 36, baseline: 'middle' }).fill(Color.HSL(160, 40, 20).toHex());
            }
          }).bind(_ =>
            s.get('stage_p1').showBoard(painter)(48, 128)).bind(_ =>
            s.get('stage_p1').showHand(painter)(48, 128)).bind(_ =>
            s.get('stage_p1').showNext(painter)(266, 160)).bind(_ =>
            painter.text(s.get('stage_p1').score.toString(10) + " MeV", 464, 428, { font: 'Spicy Rice', size: 32, align: 'right', baseline: 'middle' })
            .fill(Color.HSL(160, 40, 20).toHex())).bind(_ =>
            s.get('stage_p2').showBoard(painter)(560, 128)).bind(_ =>
            s.get('stage_p2').showHand(painter)(560, 128)).bind(_ =>
            s.get('stage_p2').showNext(painter)(470, 160)).bind(_ =>
            painter.text(s.get('stage_p2').score.toString(10) + " MeV", 529, 492, { font: 'Spicy Rice', size: 32, align: 'right', baseline: 'middle' })
            .fill(Color.HSL(160, 40, 20).toHex())).bind(_ =>
            painter.text(s.get('stage_p1').antiQuarksNum.toString(10), 144, 108, { font: 'Spicy Rice', size: 32, align: 'center', baseline: 'alphabetic' })
            .outlined(Color.HSL(160, 40, 20).toHex(), Color.HSL(160, 20, 100).toHex(), 2)).bind(_ =>
            painter.text(s.get('stage_p2').antiQuarksNum.toString(10), 656, 108, { font: 'Spicy Rice', size: 32, align: 'center', baseline: 'alphabetic' })
            .outlined(Color.HSL(160, 40, 20).toHex(), Color.HSL(0, 0, 100).toHex(), 2)).bind(_ =>
            painter.show())));
    })

    .addScene('settings', (states, counters) => {
      return new Tuple(states, key.isPressed('Space').bind(spaceKey =>
        spaceKey ? M_IO.unit(Transition.Trans('title', 0, StdTransFunc.push(60, StdTransFunc.DIRECTIONS.DOWN, Tween.ease(Tween.in(Tween.quad))))) :
        M_IO.unit(Transition.Stay())));
    }, (states, counters, painterIO) => {
      return painterIO.bind(painter =>
        painter.background(Color.HSL(280, 70, 60).toHex()).bind(_ =>
          painter.text("Settings", 400, 64, { font: 'Norican', size: 48, align: 'center', baseline: 'alphabetic' }).fill(Color.HSL(280, 40, 20).toHex())).bind(_ =>
          painter.text("Press space key to return", 400, 500, { size: 32 }).fill(Color.HSL(280, 40, 30).toHex())).bind(_ =>
          painter.show()));
    })

    .addScene('result', (states, counters) => {
      if (counters[1] < 240) {
        return new Tuple(states, M_IO.unit(Transition.Stay()));
      } else {
        return new Tuple(states, key.isPressed('Space').bind(spaceKey =>
          spaceKey ? M_IO.unit(Transition.Trans('title', 0, StdTransFunc.push(60, StdTransFunc.DIRECTIONS.DOWN, Tween.ease(Tween.in(Tween.quad))))) :
          M_IO.unit(Transition.Stay())));
      }
    }, (states, counters, painterIO) => {
      let ease1 = Tween.ease(Tween.in(Tween.linear))(Math.min(Math.max(counters[1], 60), 120) - 60, 0, 1, 60),
        ease2 = Tween.ease(Tween.in(Tween.linear))(Math.min(Math.max(counters[1], 120), 180) - 120, 0, 1, 60),
        winner = (p1, p2) => (p1.score > p2.score) ? "1P WON!" : ((p1.score < p2.score) ? "2P WON!" : "DRAW!");
      return states.bind(s =>
        painterIO.bind(painter =>
          painter.background(Color.HSL(280, 70, 60).toHex()).bind(_ =>
            painter.text("RESULT", 400, 50, { font: 'Spicy Rice', size: 64, align: 'center', baseline: 'middle' }).fill(Color.HSL(280, 40, 20).toHex())).bind(_ =>
            painter.globalAlpha(ease1)(painter.text("1P", 200, 150, { size: 52 }).fill(Color.HSL(280, 40, 30).toHex()).bind(_ =>
              painter.text("2P", 600, 150).fill(Color.HSL(280, 40, 30).toHex())))).bind(_ =>
            painter.globalAlpha(ease2)(painter.text(s.get('stage_p1').score.toString(10) + " MeV", 200, 250, { size: 52 }).fill(Color.HSL(280, 40, 30).toHex()).bind(_ =>
              painter.text(s.get('stage_p2').score.toString(10) + " MeV", 600, 250).fill(Color.HSL(280, 40, 30).toHex())))).bind(_ =>
            (counters[1] > 240) ? painter.text(winner(s.get('stage_p1'), s.get('stage_p2')), 400, 400).fill(Color.HSL(280, 40, 20).toHex()) : M_IO.unit()).bind(_ =>
            painter.show())));
    })
  ));

__MAIN = createScenes.bind(scenes =>
  GameMaster.create(scenes, initStates, pntr)).bind(game =>
  game.run('title'));
