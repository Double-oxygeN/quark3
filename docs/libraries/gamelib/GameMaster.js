class Scenes {
  constructor(data) {
    this.data = data;
  }

  /* Empty :: Scenes () () () () */
  static Empty() {
    return new Scenes((pattern) => pattern.empty());
  }

  /* Scene :: Scenes String ((IO IMap, [Int]) -> (IO IMap, IO Transition)) ((IO IMap, [Int], IO Painter) -> IO ()) Scenes */
  static Scene(name, action, paint, tail) {
    return new Scenes((pattern) => pattern.scene(name, action, paint, tail));
  }

  match(pattern) {
    return this.data(pattern);
  }

  /* addScene :: Scenes -> (String, (IO IMap, [Int]) -> (IO IMap, IO Transition), (IO IMap, [Int], IO Painter) -> IO ()) -> Scenes */
  addScene(name, action, paint) {
    return Scenes.Scene(name, action, paint, this);
  }

  /* queryScene :: Scenes -> String -> ((IO IMap, [Int]) -> (IO IMap, IO Transition), (IO IMap, [Int], IO Painter) -> IO ()) */
  queryScene(qname) {
    return this.match({
      empty: () => {
        console.error("Scene Name Error: '" + qname + "' is not registered.");
        return new Tuple(() => new Tuple({}, ""), () => M_IO.unit(null));
      },
      scene: (name, action, paint, tail) => (name === qname) ? new Tuple(action, paint) : tail.queryScene(qname)
    });
  }

  /* sceneNum :: Int */
  get sceneNum() {
    return this.match({
      empty: () => 0,
      scene: (_name, _action, _paint, tail) => 1 + tail.sceneNum
    });
  }

  /* hasScene :: Scenes -> String -> Bool */
  hasScene(sceneName) {
    return this.match({
      empty: () => false,
      scene: (name, _action, _paint, tail) => (name === sceneName) ? true : tail.hasScene(sceneName)
    });
  }

  /* toString :: Scenes -> String */
  toString() {
    return '[Scenes <' + this.sceneNum.toString() + '>]';
  }
}

class Transition {
  constructor(data) {
    this.data = data;
  }

  /* Stay */
  static Stay() {
    return new Transition((pattern) => pattern.stay());
  }

  /* Trans String Int (([IO Image], [Int], IO Painter) => (Bool, IO ())) */
  static Trans(sceneName, sceneCounter, transFunc) {
    return new Transition((pattern) => pattern.trans(sceneName, sceneCounter, transFunc));
  }

  /* End */
  static End() {
    return new Transition((pattern) => pattern.end());
  }

  match(pattern) {
    return this.data(pattern);
  }

  /* toString :: Transition -> String */
  toString() {
    return this.match({
      stay: () => '[Transition Stay]',
      trans: (_name, _counter, _func) => '[Transition Trans]',
      end: () => '[Transition End]'
    });
  }
}

class GameMaster {
  constructor(scenes, init, painter) {
    this._scenes = scenes; // :: Scenes
    this._initStates = init; // :: IO IMap
    this._painter = painter; // :: IO Painter
    this._imitators = painter.bind(p => p.imitator().bind(i1 => p.imitator().bind(i2 => M_IO.unit([i1, i2])))); // :: IO [Painter]
  }

  /* empty :: () -> IO GameMaster */
  static empty() {
    return new M_IO((world) => {
      return new Tuple(new GameMaster(Scenes.Empty(), M_IO.unit(IMap.empty()), Painter.create(world.document.getElementById('canvas'))), world);
    });
  }

  /* create :: (Scenes, IO IMap, IO Painter) -> IO GameMaster */
  static create(scenes, init, painter) {
    return new M_IO((world) => {
      return new Tuple(new GameMaster(scenes, init, M_IO.unit(painter.evalIO(world))), world);
    });
  }

  /* regScenes :: GameMaster -> Scenes -> GameMaster */
  regScenes(scenes) {
    return new GameMaster(scenes, this._initStates, this._painter);
  }

  /* regInitStates :: GameMaster -> IO IMap -> GameMaster */
  regInitStates(init) {
    return new GameMaster(this._scenes, init, this._painter);
  }

  /* regPainter :: GameMaster -> IO Painter -> GameMaster */
  regPainter(painter) {
    return new GameMaster(this._scenes, this._initStates, painter);
  }

  /* run :: GameMaster -> String -> IO () */
  run(initialSceneName) {
    /* mainLoop :: (IO IMap, String, [Int]) -> IO () */
    let mainLoop = (state, sceneName, counter) => {
      let tuple = this._scenes.queryScene(sceneName);
      return state.bind(s => M_IO.unit(tuple.nth(0)(M_IO.unit(s), counter))
        .bind(next => next.nth(1)
          .bind(trans => trans.match({
            stay: () => new M_IO((world) => {
              world.requestAnimationFrame(() => mainLoop(next.nth(0), sceneName, counter.map(x => x + 1)).runIO(world));
              return new Tuple(null, world);
            }).bind(_ => tuple.nth(1)(M_IO.unit(s), counter, this._painter)),
            trans: (nextSceneName, nextSceneCounter, f) => M_IO.unit(this._scenes.queryScene(nextSceneName))
              .bind(nextTuple => this._imitators
                .bind(imits => tuple.nth(1)(M_IO.unit(s), counter, M_IO.unit(imits[0])).bind(_ => nextTuple.nth(1)(M_IO.unit(s), [counter[0], nextSceneCounter], M_IO.unit(imits[1])))
                  .bind(_ => new M_IO((world) => {
                    world.requestAnimationFrame(() => transLoop(next.nth(0), nextSceneName, nextSceneCounter, imits.map(imit => imit.canvas), f, [counter[0] + 1, 0]).runIO(world));
                    return new Tuple(null, world);
                  }))))
              .bind(_ => tuple.nth(1)(M_IO.unit(s), counter, this._painter)),
            end: () => tuple.nth(1)(M_IO.unit(s), counter, this._painter)
          }))));
    };

    /* transLoop :: (IO IMap, String, Int, [Image], (([Image], [Int], IO Painter) => (Bool, IO ())), [Int]) -> IO () */
    let transLoop = (state, nextSceneName, nextSceneCounter, images, transFunc, counter) => {
      let transNext = transFunc(images, counter, this._painter); // :: (Bool, IO ())
      if (transNext.nth(0)) {
        return new M_IO((world) => {
          world.requestAnimationFrame(() => mainLoop(state, nextSceneName, [counter[0] + 1, nextSceneCounter]).runIO(world));
          return new Tuple(null, world);
        }).bind(_ => transNext.nth(1));
      } else {
        return new M_IO((world) => {
          world.requestAnimationFrame(() => transLoop(state, nextSceneName, nextSceneCounter, images, transFunc, counter.map(x => x + 1)).runIO(world));
          return new Tuple(null, world);
        }).bind(_ => transNext.nth(1));
      }
    };
    return mainLoop(this._initStates, initialSceneName, [0, 0]);
  }

  /* toString :: GameMaster -> String */
  toString() {
    return '[GameMaster]';
  }
}
