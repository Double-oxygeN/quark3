class SoundMaster {
  constructor(bgm_list, se_list) {
    Object.defineProperty(this, '_bgmList', {
      value: bgm_list,
      writable: false,
      enumerable: true,
      configurable: false
    });
    Object.defineProperty(this, '_seList', {
      value: se_list,
      writable: false,
      enumerable: true,
      configurable: false
    });
    this._option = {
      bgmVolume: 1,
      bgmSpeed: 1,
      seVolume: 1
    };
  }

  /* empty :: () -> SoundMaster */
  static empty() {
    return new SoundMaster(M_List.Nil(), M_List.Nil());
  }

  /* createAudio :: (String, Bool) -> Audio */
  static createAudio(path, loop) {
    let audio = new Audio();
    audio.preload = 'auto';
    audio.src = './resources/' + path;
    audio.loop = loop;
    return audio;
  }

  /* regBGM :: SoundMaster -> (String, String, Bool) -> SoundMaster */
  regBGM(path, keyword, loop) {
    let audio = SoundMaster.createAudio(path, loop),
      newList = M_List.Cons({
        keyword: keyword,
        audio: audio
      })(this._bgmList);
    return new SoundMaster(newList, this._seList);
  }

  /* regSE :: SoundMaster -> (String, String) -> SoundMaster */
  regSE(path, keyword) {
    let audio = SoundMaster.createAudio(path, false),
      newList = M_List.Cons({
        keyword: keyword,
        audio: audio
      })(this._seList);
    return new SoundMaster(this._bgmList, newList);
  }

  /* playBGM :: SoundMaster -> (String, Map) -> IO () */
  playBGM(keyword, option) {
    return this.changeOption(keyword, option).bind(audio => new M_IO((world) => {
      audio.play();
      return new Tuple(null, world);
    }));
  }

  /* changeOption :: SoundMaster -> (String, Map) -> IO Audio */
  changeOption(keyword, option) {
    return new M_IO((world) => {
      let audio = this._bgmList.filter(a => a.keyword === keyword).nth(0).match({
          nothing: () => {
            world.console.error("Sound Error: " + keyword + " is not registered.");
            return new Audio();
          },
          just: (so) => so.audio
        }),
        opt = option || {};
      opt["volume"] = opt.volume || this._option.bgmVolume;
      opt["speed"] = opt.speed || this._option.bgmSpeed;
      opt["currentTime"] = opt.currentTime || audio.currentTime;

      audio.volume = opt.volume;
      audio.playbackRate = opt.speed;
      audio.currentTime = opt.currentTime;

      return new Tuple(audio, world);
    });
  }

  /* pauseBGM :: SoundMaster -> String -> IO () */
  pauseBGM(keyword) {
    return new M_IO((world) => {
      let audio = this._bgmList.filter(a => a.keyword === keyword).nth(0).match({
        nothing: () => {
          world.console.error("Sound Error: " + keyword + " is not registered.");
          return new Audio();
        },
        just: (so) => so.audio
      });
      audio.pause();
      return new Tuple(null, world);
    });
  }

  /* killAllBGM :: SoundMaster -> () -> IO () */
  killAllBGM() {
    return new M_IO((world) => {
      this._bgmList.map(a => {
        a.audio.pause();
        return null;
      });
      return new Tuple(null, world);
    });
  }

  /* playSE :: SoundMaster -> (String, Map) -> IO () */
  playSE(keyword, option) {
    return new M_IO((world) => {
      let audio = this._seList.filter(a => a.keyword === keyword).nth(0).match({
        nothing: () => {
          world.console.error("Sound Error: " + keyword + " is not registered.");
          return new Audio();
        },
        just: (so) => so.audio
      });
      audio.currentTime = 0;
      audio.volume = option.volume || this._option.seVolume;
      audio.play();
      return new Tuple(null, world);
    });
  }

  /* setOption :: SoundMaster -> Map -> IO () */
  setOption(option) {
    return new M_IO((world) => {
      this._option.bgmVolume = option.bgmVolume || this._option.bgmVolume;
      this._option.bgmSpeed = option.bgmSpeed || this._option.bgmSpeed;
      this._option.seVolume = option.seVolume || this._option.seVolume;
      return new Tuple(null, world);
    });
  }

  /* toString :: SoundMaster -> String */
  toString() {
    return '[SoundMaster <' + this._bgmList.length.toString() + ',' + this._seList.length.toString() + '> ]';
  }
}
