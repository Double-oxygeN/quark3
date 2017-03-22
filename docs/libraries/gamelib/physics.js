class Pos2d {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // 点が矩形の上に乗っているかどうかを判定
  isOverRect(x, y, w, h) {
    return x < this.x && this.x < x + w && y < this.y && this.y < y + h;
  }

  // 点が円形の上に乗っているかどうかを判定
  isOverCircle(x, y, r) {
    return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) < r * r;
  }

  // 別の点との距離
  distanceTo(another) {
    return Math.hypot(another.x - this.x, another.y - this.y);
  }

  static distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  // 別の点への向き
  directionTo(another) {
    return Math.atan2(another.y - this.y, another.x - this.x);
  }

  static direction(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  // 別の点へのベクトル
  toVec2d(another) {
    return new Vec2d(another.x - this.x, another.y - this.y);
  }

  // 文字列化
  toString() {
    return "(" + this.x + "," + this.y + ")";
  }
}

class Vec2d extends Pos2d {
  constructor(x, y) {
    super(x, y);
  }

  // 内積を出力
  static innerProd(a, b) {
    return a.x * b.x + a.y * b.y;
  }

  // 外積のzの値を出力
  static crossProd(a, b) {
    return a.x * b.y - a.y * b.x;
  }

  scalar(k) {
    return new Vec2d(k * this.x, k * this.y);
  }

  norm(n) {
    let _n = n || 2;
    return Math.pow(Math.pow(this.x, _n) + Math.pow(this.y, _n), 1 / _n);
  }

  normalize() {
    return this.scalar(1 / this.norm(2));
  }
}

class Pos3d {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // 点が球内部にあるかどうかを判定
  isInSphere(x, y, z, r) {
    return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) + (z - this.z) * (z - this.z) < r * r;
  }

  // 別の点との距離
  distanceTo(another) {
    return Math.hypot(another.x - this.x, another.y - this.y, another.z - this.z);
  }

  static distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
  }

  // 別の点へのベクトル
  toVec3d(another) {
    return new Vec3d(another.x - this.x, another.y - this.y, another.z - this.z);
  }

  // 文字列化
  toString() {
    return "(" + this.x + "," + this.y + "," + this.z + ")";
  }
}

class Vec3d extends Pos3d {
  constructor(x, y, z) {
    super(x, y, z);
  }

  // 内積を出力
  static innerProd(a, b) {
    return a.x * b.x + a.y + b.y + a.z * b.z;
  }

  // 外積を出力
  static crossProd(a, b) {
    return new Vec3d(a.y * b.z - b.y * a.z, a.z * b.x - b.z * a.x, a.x * b.y - b.x * a.y);
  }

  scalar(k) {
    return new Vec3d(k * this.x, k * this.y, k * this.z);
  }

  norm(n) {
    let _n = n || 2;
    return Math.pow(Math.pow(this.x, _n) + Math.pow(this.y, _n) + Math.pow(this.z, _n), 1 / _n);
  }

  normalize() {
    return this.scalar(1 / this.norm(2));
  }
}
