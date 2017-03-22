class COM {
  static receiveCommand(y) {
    if (y > 5) {
      return 5;
    }
    switch (Math.floor(y * 100)) {
    case 100:
    case 200:
    case 300:
      return Math.floor(Math.random() * 4) + 1;
      break;
    default:
      return 0;
    }
  }
}
