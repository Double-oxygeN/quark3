/*
  Class: Monad
*/
class Monad {
  constructor(data) {
    // this.data = data;
    Object.defineProperty(this, 'data', {
      value: data,
      writable: false,
      enumerable: true,
      configurable: false
    });
  }

  /* unit :: a -> M a */

  /* bind :: M a -> (a -> M b) -> M b */
  bind(f) {
    return this.map(f).join();
  }

  /* map :: M a -> (a -> b) -> M b */

  /* join :: M (M a) -> M a */

  /* ap :: M (a -> b) -> M a -> M b */

  /* lift2 :: (a -> b -> c) -> M a -> M b -> M c */
  static lift2(f) {
    return (monad1) => (monad2) => {
      return monad1.map(f).ap(monad2);
    }
  }

  /* compose :: (a -> M b) -> (b -> M c) -> (a -> M c) */
  static compose(f1) {
    return (f2) => {
      return (value) => f1(value).bind(f2);
    };
  }

  /* toString :: M a -> String */
}

/*
  Monad: M_Id
*/
class M_Id extends Monad {
  constructor(value) {
    super(value);
  }

  /* unit :: a -> Id a */
  static unit(a) {
    return new M_Id(a);
  }

  /* bind :: Id a -> (a -> Id b) -> Id b */

  /* map :: Id a -> (a -> b) -> Id b */
  map(f) {
    return M_Id.unit(f(this.data));
  }

  /* join :: Id (Id a) -> Id a */
  join() {
    return this.data;
  }

  /* ap :: Id (a -> b) -> Id a -> Id b */
  ap(monad) {
    return M_Id.unit(this.data(monad.data));
  }

  /* lift2 :: (a -> b -> c) -> Id a -> Id b -> Id c */

  /* compose :: (a -> Id b) -> (b -> Id c) -> (a -> Id c) */

  /* toString :: Id a -> String */
  toString() {
    return 'Identity ' + this.data.toString();
  }
}

/*
  Monad: M_Maybe
*/
class M_Maybe extends Monad {
  constructor(data) {
    super(data);
  }

  /* Just a :: Maybe a */
  static Just(value) {
    return new M_Maybe((pattern) => pattern.just(value));
  }

  /* Nothing :: Maybe () */
  static Nothing() {
    return new M_Maybe((pattern) => pattern.nothing());
  }

  match(pattern) {
    return this.data(pattern);
  }

  /* unit :: a -> Maybe a */
  static unit(value) {
    return M_Maybe.Just(value);
  }

  /* bind :: Maybe a -> (a -> Maybe b) -> Maybe b */

  /* map :: Maybe a -> (a -> b) -> Maybe b */
  map(f) {
    return this.match({
      just: (value) => M_Maybe.Just(f(value)),
      nothing: () => M_Maybe.Nothing()
    });
  }

  /* join :: Maybe (Maybe a) -> Maybe a */
  join() {
    return this.match({
      just: (monad) => monad,
      nothing: () => M_Maybe.Nothing()
    });
  }

  /* ap :: Maybe (a -> b) -> Maybe a -> Maybe b */
  ap(monad) {
    return this.match({
      just: (f) => monad.map(f),
      nothing: () => M_Maybe.Nothing()
    });
  }

  /* lift2 :: (a -> b -> c) -> Maybe a -> Maybe b -> Maybe c */

  /* compose :: (a -> Maybe b) -> (b -> Maybe c) -> (a -> Maybe c) */

  /* toString :: Maybe a -> String */
  toString() {
    return this.match({
      just: (value) => 'Just ' + value.toString(),
      nothing: () => 'Nothing'
    });
  }
}

/*
  Monad: M_Either
*/
class M_Either extends Monad {
  constructor(data) {
    super(data);
  }

  /* Left a :: Either a () */
  static Left(value) {
    return new M_Either((pattern) => pattern.left(value));
  }

  /* Right a :: Either () a */
  static Right(value) {
    return new M_Either((pattern) => pattern.right(value));
  }

  match(pattern) {
    return this.data(pattern);
  }

  /* unit :: a -> Either () a */
  static unit(value) {
    return M_Either.Right(value);
  }

  /* bind :: Either e a -> (a -> Either e b) -> Either e b */

  /* map :: Either e a -> (a -> b) -> Either e b */
  map(f) {
    return this.match({
      left: (value) => M_Either.Left(value),
      right: (value) => M_Either.Right(f(value))
    });
  }

  /* join :: Either (Either e a) -> Either e a */
  join() {
    return this.match({
      left: (value) => M_Either.Left(value),
      right: (monad) => monad
    });
  }

  /* ap :: Either e (a -> b) -> Either e a -> Either e b */
  ap(monad) {
    return this.match({
      left: (value) => M_Either.Left(value),
      right: (f) => monad.map(f)
    });
  }

  /* lift2 :: (a -> b -> c) -> Either e a -> Either e b -> Either e c */

  /* compose :: (a -> Either e b) -> (b -> Either e c) -> (a -> Either e c) */

  /* toString :: Either e a -> String */
  toString() {
    return this.match({
      left: (value) => 'Left ' + value.toString(),
      right: (value) => 'Right ' + value.toString()
    });
  }

  /* either :: (a -> c) -> (b -> c) -> Either a b -> c */
  static either(f1) {
    return (f2) => (monad) => {
      return monad.match({
        left: (value) => f1(value),
        right: (value) => f2(value)
      });
    };
  }
}

/*
  Monad: M_List
*/
class M_List extends Monad {
  constructor(data) {
    super(data);
  }

  /* Nil :: () -> [()] */
  static Nil() {
    return new this.prototype.constructor((pattern) => pattern.nil());
  }

  /* Cons :: a -> [a] -> [a] */
  static Cons(value) {
    return (list) => new this.prototype.constructor((pattern) => pattern.cons(value)(list));
  }

  match(pattern) {
    return this.data(pattern);
  }

  /* unit :: a -> [a] */
  static unit(value) {
    return M_List.Cons(value)(M_List.Nil());
  }

  /* bind :: [a] -> (a -> [b]) -> [b] */

  /* map :: [a] -> (a -> b) -> [b] */
  map(f) {
    return this.match({
      nil: () => M_List.Nil(),
      cons: (head) => (tail) => M_List.Cons(f(head))(tail.map(f))
    });
  }

  /* join :: [[a]] -> [a] */
  join() {
    return this.match({
      nil: () => M_List.Nil(),
      cons: (head) => (tail) => head.concat(tail.join())
    });
  }

  /* ap :: [(a -> b)] -> [a] -> [b] */
  ap(monad) {
    return this.match({
      nil: () => M_List.Nil(),
      cons: (f) => (tail) => monad.map(f).concat(tail.ap(monad))
    });
  }

  /* lift2 :: (a -> b -> c) -> [a] -> [b] -> [c] */

  /* compose :: (a -> [b]) -> (b -> [c]) -> (a -> [c]) */

  /* toString :: [a] -> String */
  toString() {
    return '[' + this.map(v => v.toString()).intersperse(', ').foldl((a) => (b) => a + b)('') + ']';
  }

  /* isNil :: [a] -> Bool */
  isNil() {
    return this.match({
      nil: () => true,
      cons: (_head) => (_tail) => false
    });
  }

  /* concat :: [a] -> [a] -> [a] */
  concat(list) {
    return this.match({
      nil: () => list,
      cons: (head) => (tail) => M_List.Cons(head)(tail.concat(list))
    });
  }

  /* length :: [a] -> Int */
  get length() {
    return this.match({
      nil: () => 0,
      cons: (head) => (tail) => 1 + tail.length
    });
  }

  /* nth :: [a] -> Int -> Maybe a */
  nth(n) {
    if (n < 0) return M_Maybe.Nothing();
    return this.match({
      nil: () => M_Maybe.Nothing(),
      cons: (head) => (tail) => (n === 0) ? M_Maybe.Just(head) : tail.nth(n - 1)
    });
  }

  /* take :: [a] -> Int -> [a] */
  take(n) {
    return this.match({
      nil: () => M_List.Nil(),
      cons: (head) => (tail) => (n === 0) ? M_List.Nil() : M_List.Cons(head)(tail.take(n - 1))
    });
  }

  /* drop :: [a] -> Int -> [a] */
  drop(n) {
    if (n <= 0) return this;
    return this.match({
      nil: () => M_List.Nil(),
      cons: (head) => (tail) => tail.drop(n - 1)
    });
  }

  /* head :: [a] -> a */
  head() {
    console.assert(!this.isNil(), "*** Exception: M_List.head: empty list");
    return this.nth(0).match({
      just: (value) => value
    });
  }

  /* tail :: [a] -> [a] */
  tail() {
    console.assert(!this.isNil(), "*** Exception: M_List.tail: empty list");
    return this.match({
      cons: (head) => (tail) => tail
    });
  }

  /* last :: [a] -> a */
  last() {
    console.assert(!this.isNil(), "*** Exception: M_List.last: empty list");
    return this.reverse().head();
  }

  /* init :: [a] -> [a] */
  init() {
    console.assert(!this.isNil(), "*** Exception: M_List.init: empty list");
    return this.reverse().tail().reverse();
  }

  /* foldr :: [a] -> (a -> b -> b) -> b -> b */
  foldr(f) {
    return (acc) => {
      return this.match({
        nil: () => acc,
        cons: (head) => (tail) => f(head)(tail.foldr(f)(acc))
      });
    };
  }

  /* foldl :: [a] -> (b -> a -> b) -> b -> b */
  foldl(f) {
    return (acc) => {
      return this.match({
        nil: () => acc,
        cons: (head) => (tail) => tail.foldl(f)(f(acc)(head))
      })
    }
  }

  /* all :: [a] -> (a -> Bool) -> Bool */
  all(p) {
    return this.foldl((a) => (b) => a && p(b))(true);
  }

  /* any :: [a] -> (a -> Bool) -> Bool */
  any(p) {
    return this.foldl((a) => (b) => a || p(b))(false);
  }

  /* reverse :: [a] -> [a] */
  reverse() {
    return this.foldl((a) => (b) => M_List.Cons(b)(a))(M_List.Nil());
  }

  /* filter :: [a] -> (a -> Bool) -> [a] */
  filter(p) {
    return this.match({
      nil: () => M_List.Nil(),
      cons: (head) => (tail) => p(head) ? M_List.Cons(head)(tail.filter(p)) : tail.filter(p)
    });
  }

  /* remove :: [a] -> (a -> Bool) -> [a] */
  remove(p) {
    return this.filter((val) => !p(val));
  }

  /* intersperse :: [a] -> a -> [a] */
  intersperse(value) {
    return this.match({
      nil: () => M_List.Nil(),
      cons: (head) => (tail) => (tail.isNil()) ? M_List.unit(head) : M_List.Cons(head)(M_List.Cons(value)(tail.intersperse(value)))
    });
  }

  /* range :: Int -> Int -> Int -> [Int] */
  static range(st) {
    return (ed) => (step) => {
      return (st >= ed) ? M_List.Nil() : M_List.Cons(st)(M_List.range(st + step)(ed)(step))
    }
  }

  /* maximum :: Ord a => [a] -> a */
  maximum() {
    console.assert(!this.isNil(), "*** Exception: M_List.maximum: empty list");
    return this.match({
      cons: (head) => (tail) => {
        if (tail.isNil()) {
          return head;
        } else {
          let _max = tail.maximum();
          return (head > _max) ? head : _max;
        }
      }
    });
  }

  /* minimum :: Ord a => [a] -> a */
  minimum() {
    console.assert(!this.isNil(), "*** Exception: M_List.minimum: empty list");
    return this.match({
      cons: (head) => (tail) => {
        if (tail.isNil()) {
          return head;
        } else {
          let _max = tail.minimum();
          return (head < _max) ? head : _max;
        }
      }
    });
  }

  /* zipWith :: (a -> b -> c) -> [a] -> [b] -> [c] */
  static zipWith(f) {
    return (list1) => (list2) => {
      return list1.match({
        nil: () => M_List.Nil(),
        cons: (head1) => (tail1) => list2.match({
          nil: () => M_List.Nil(),
          cons: (head2) => (tail2) => M_List.Cons(f(head1)(head2))(M_List.zipWith(f)(tail1)(tail2))
        })
      });
    };
  }

  /* transpose :: [[a]] -> [[a]] */
  transpose() {
    return this.match({
      nil: () => M_List.Nil(),
      cons: (head) => (tail) => {
        return tail.foldl((a) => (b) => M_List.zipWith((p) => (q) => p.concat(M_List.unit(q)))(a)(b))(head.map(v => M_List.unit(v)));
      }
    })
  }

  /* subsequences :: [a] -> [[a]] */
  subsequences() {
    return this.match({
      nil: () => M_List.unit(M_List.Nil()),
      cons: (head) => (tail) => M_List.Cons(M_List.Nil())(M_List.unit(M_List.unit(head))).map((x) => (y) => x.concat(y)).ap(tail.subsequences())
    });
  }

  /* permutations :: [a] -> [[a]] */
  permutations() {
    let select = (list) => {
      return list.match({
        cons: (head) => (tail) => tail.match({
          nil: () => M_List.unit(M_List.unit(head)),
          cons: (_head) => (_tail) => M_List.Cons(list)(select(tail).map(l => l.match({
            cons: (first) => (rest) => M_List.Cons(first)(M_List.Cons(head)(rest))
          })))
        })
      });
    };
    return this.match({
      nil: () => M_List.unit(M_List.Nil()),
      cons: (head) => (tail) => select(this).bind(l => l.match({
        cons: (first) => (rest) => rest.permutations().map(x => M_List.Cons(first)(x))
      }))
    });
  }

  /* elem :: [a] -> a -> Bool */
  elem(e) {
    return this.match({
      nil: () => false,
      cons: (head) => (tail) => (head === e) ? true : tail.elem(e)
    });
  }

  /* elemIndex :: [a] -> a -> Maybe Int */
  elemIndex(e) {
    return this.match({
      nil: () => M_Maybe.Nothing(),
      cons: (head) => (tail) => (head === e) ? M_Maybe.Just(0) : tail.elemIndex(e).map(x => x + 1)
    });
  }

  /* elemIndices :: [a] -> [a] -> [Int] */
  elemIndices(e) {
    return this.match({
      nil: () => M_List.Nil(),
      cons: (head) => (tail) => (head === e) ? M_List.Cons(0)(tail.elemIndices(e).map(x => x + 1)) : tail.elemIndices(e).map(x => x + 1)
    });
  }

  /* findIndex :: [a] -> (a -> Bool) -> Maybe Int */
  findIndex(p) {
    return this.match({
      nil: () => M_Maybe.Nothing(),
      cons: (head) => (tail) => p(head) ? M_Maybe.Just(0) : tail.findIndex(p).map(x => x + 1)
    });
  }

  /* findIndices :: [a] -> (a -> Bool) -> [Int] */
  findIndices(p) {
    return this.match({
      nil: () => M_List.Nil(),
      cons: (head) => (tail) => p(head) ? M_List.Cons(0)(tail.findIndices(p).map(x => x + 1)) : tail.findIndices(p).map(x => x + 1)
    });
  }

  /* lines :: String -> [String] */
  static lines(str) {
    return M_List.fromArray(str.split('\n'));
  }

  /* words :: String -> [String] */
  static words(str) {
    return M_List.fromArray(str.split(' '));
  }

  /* nub :: Eq a => [a] -> [a] */
  nub() {
    return this.match({
      nil: () => M_List.Nil(),
      cons: (head) => (tail) => M_List.Cons(head)(tail.remove(x => x === head).nub())
    });
  }

  /* sort :: Ord a => [a] -> [a] */
  sort() {
    return this.match({
      nil: () => M_List.Nil(),
      cons: (head) => (tail) => tail.filter(x => x < head).sort().concat(M_List.unit(head)).concat(tail.filter(x => x >= head).sort())
    });
  }

  /* fromArray :: Array a -> [a] */
  static fromArray(arr) {
    return (arr.length === 0) ? M_List.Nil() : M_List.Cons(arr[0])(M_List.fromArray(arr.slice(1)));
  }

  /* toArray :: [a] -> Array a */
  toArray() {
    return this.match({
      nil: () => [],
      cons: (head) => (tail) => [head].concat(tail.toArray())
    });
  }
}

/*
  Monad: M_Stream
*/
class M_Stream extends M_List {
  constructor(data) {
    super(data);
  }

  /* Nil :: () -> [()] */

  /* Cons :: a -> [a] -> [a] */

  /* unit :: a -> [a] */
  static unit(value) {
    return M_Stream.Cons(value)(() => M_Stream.Nil());
  }

  /* bind :: [a] -> (a -> [b]) -> [b] */

  /* map :: [a] -> (a -> b) -> [b] */
  map(f) {
    return this.match({
      nil: () => M_Stream.Nil(),
      cons: (head) => (tailThunk) => M_Stream.Cons(f(head))(() => tailThunk().map(f))
    });
  }

  /* join :: [[a]] -> [a] */
  join() {
    return this.match({
      nil: () => M_Stream.Nil(),
      cons: (head) => (tailThunk) => head.concat(tailThunk().join())
    });
  }

  /* ap :: [(a -> b)] -> [a] -> [b] */
  ap(monad) {
    return this.match({
      nil: () => M_Stream.Nil(),
      cons: (f) => (tailThunk) => monad.map(f).concat(tailThunk().ap(monad))
    });
  }

  /* list2 :: (a -> b -> c) -> [a] -> [b] -> [c] */

  /* compose :: (a -> [b]) -> (b -> [c]) -> (a -> [c]) */

  /* toString :: [a] -> String */

  /* isNil :: [a] -> Bool */

  /* concat :: [a] -> [a] -> [a] */
  concat(stream) {
    return this.match({
      nil: () => stream,
      cons: (head) => (tailThunk) => M_Stream.Cons(head)(() => tailThunk().concat(stream))
    });
  }

  /* length :: [a] -> Int */
  get length() {
    return this.match({
      nil: () => 0,
      cons: (head) => (tailThunk) => 1 + tailThunk().length
    });
  }

  /* nth :: [a] -> Int -> Maybe a */
  nth(n) {
    if (n < 0) return M_Maybe.Nothing();
    return this.match({
      nil: () => M_Maybe.Nothing(),
      cons: (head) => (tailThunk) => (n === 0) ? M_Maybe.Just(head) : tailThunk().nth(n - 1)
    });
  }

  /* take :: [a] -> Int -> [a] */
  take(n) {
    return this.match({
      nil: () => M_Stream.Nil(),
      cons: (head) => (tailThunk) => (n === 0) ? M_Stream.Nil() : M_Stream.Cons(head)(() => tailThunk().take(n - 1))
    });
  }

  /* drop :: [a] -> Int -> [a] */
  drop(n) {
    if (n <= 0) return this;
    return this.match({
      nil: () => M_Stream.Nil(),
      cons: (head) => (tailThunk) => tailThunk().drop(n - 1)
    });
  }

  /* head :: [a] -> a */
  head() {
    console.assert(!this.isNil(), "*** Exception: M_Stream.head: empty list");
    return this.nth(0).match({
      just: (value) => value
    });
  }

  /* tail :: [a] -> [a] */
  tail() {
    console.assert(!this.isNil(), "*** Exception: M_Stream.tail: empty list");
    return this.match({
      cons: (head) => (tailThunk) => tailThunk()
    });
  }

  /* last :: [a] -> a */
  last() {
    console.assert(!this.isNil(), "*** Exception: M_Stream.last: empty list");
    return this.reverse().head();
  }

  /* init :: [a] -> [a] */
  init() {
    console.assert(!this.isNil(), "*** Exception: M_Stream.init: empty list");
    return this.reverse().tail().reverse();
  }

  /* foldr :: [a] -> (a -> b -> b) -> b -> b */
  foldr(f) {
    return (acc) => {
      return this.match({
        nil: () => acc,
        cons: (head) => (tailThunk) => f(head)(tailThunk().foldr(f)(acc))
      });
    };
  }

  /* foldl :: [a] -> (b -> a -> b) -> b -> b */
  foldl(f) {
    return (acc) => {
      return this.match({
        nil: () => acc,
        cons: (head) => (tailThunk) => tailThunk().foldl(f)(f(acc)(head))
      })
    }
  }

  /* unfoldr :: (b -> Maybe (a, b)) -> b -> [a] */
  static unfoldr(f) {
    return (acc) => {
      return f(acc).match({
        just: (tpl) => M_Stream.Cons(tpl.nth(0))(() => M_Stream.unfoldr(f)(tpl.nth(1))),
        nothing: () => M_Stream.Nil()
      });
    };
  }

  /* all :: [a] -> (a -> Bool) -> Bool */
  all(p) {
    return this.match({
      nil: () => true,
      cons: (head) => (tailThunk) => p(head) ? tailThunk().all(p) : false
    });
  }

  /* any :: [a] -> (a -> Bool) -> Bool */
  any(p) {
    return this.match({
      nil: () => false,
      cons: (head) => (tailThunk) => p(head) ? true : tailThunk().any(p)
    });
  }

  /* reverse :: [a] -> [a] */
  reverse() {
    return this.foldl((a) => (b) => M_Stream.Cons(b)(() => a))(M_Stream.Nil());
  }

  /* filter :: [a] -> (a -> Bool) -> [a] */
  filter(p) {
    return this.match({
      nil: () => M_Stream.Nil(),
      cons: (head) => (tailThunk) => p(head) ? M_Stream.Cons(head)(() => tailThunk().filter(p)) : tailThunk().filter(p)
    });
  }

  /* remove :: [a] -> (a -> Bool) -> [a] */

  /* intersperse :: [a] -> a -> [a] */
  intersperse(value) {
    return this.match({
      nil: () => M_Stream.Nil(),
      cons: (head) => (tailThunk) => (tailThunk().isNil()) ? M_Stream.unit(head) : M_Stream.Cons(head)(() => M_Stream.Cons(value)(() => tailThunk().intersperse(value)))
    });
  }

  /* range :: Int -> Int -> Int -> [Int] */
  static range(st) {
    return (ed) => (step) => {
      return (st >= ed) ? M_Stream.Nil() : M_Stream.Cons(st)(() => M_Stream.range(st + step)(ed)(step))
    }
  }

  /* maximum :: Ord a => [a] -> a */
  maximum() {
    console.assert(!this.isNil(), "*** Exception: M_Stream.maximum: empty list");
    return this.match({
      cons: (head) => (tailThunk) => {
        if (tailThunk().isNil()) {
          return head;
        } else {
          let _max = tailThunk().maximum();
          return (head > _max) ? head : _max;
        }
      }
    });
  }

  /* minimum :: Ord a => [a] -> a */
  minimum() {
    console.assert(!this.isNil(), "*** Exception: M_Stream.minimum: empty list");
    return this.match({
      cons: (head) => (tailThunk) => {
        if (tailThunk().isNil()) {
          return head;
        } else {
          let _max = tailThunk().minimum();
          return (head < _max) ? head : _max;
        }
      }
    });
  }

  /* zipWith :: (a -> b -> c) -> [a] -> [b] -> [c] */
  static zipWith(f) {
    return (stream1) => (stream2) => {
      return stream1.match({
        nil: () => M_Stream.Nil(),
        cons: (head1) => (tailThunk1) => stream2.match({
          nil: () => M_Stream.Nil(),
          cons: (head2) => (tailThunk2) => M_Stream.Cons(f(head1)(head2))(() => M_Stream.zipWith(f)(tailThunk1())(tailThunk2()))
        })
      });
    };
  }

  /* transpose :: [[a]] -> [[a]] */
  transpose() {
    return this.match({
      nil: () => M_Stream.Nil(),
      cons: (head) => (tailThunk) => {
        return tailThunk().foldl((a) => (b) => M_Stream.zipWith((p) => (q) => p.concat(M_Stream.unit(q)))(a)(b))(head.map(v => M_Stream.unit(v)));
      }
    })
  }

  /* subsequences :: [a] -> [[a]] */
  subsequences() {
    return M_List.Cons(M_List.Nil())(this.nonEmptySubsequences());
  }

  /* nonEmptySubsequences :: [a] -> [[a]] */
  nonEmptySubsequences() {
    return this.match({
      nil: () => M_List.Nil(),
      cons: (head) => (tail) => {
        let f = (list) => (rest) => M_List.Cons(list)(M_List.Cons(M_List.Cons(head)(list))(rest));
        return M_List.Cons(M_List.unit(head))(tail.nonEmptySubsequences().foldr(f)(M_List.Nil()));
      }
    });
  }

  /* permutations :: [a] -> [[a]] */
  permutations() {
    let select = (stream) => {
      return stream.match({
        cons: (head) => (tailThunk) => tailThunk().match({
          nil: () => M_Stream.unit(M_Stream.unit(head)),
          cons: (_head) => (_tailThunk) => M_Stream.Cons(stream)(() => select(tailThunk()).map(s => s.match({
            cons: (first) => (restThunk) => M_Stream.Cons(first)(() => M_Stream.Cons(head)(() => restThunk()))
          })))
        })
      });
    };
    return this.match({
      nil: () => M_Stream.unit(M_Stream.Nil()),
      cons: (head) => (tailThunk) => select(this).bind(s => s.match({
        cons: (first) => (restThunk) => restThunk().permutations().map(x => M_Stream.Cons(first)(() => x))
      }))
    });
  }

  /* elem :: [a] -> a -> Bool */
  elem(e) {
    return this.match({
      nil: () => false,
      cons: (head) => (tailThunk) => (head === e) ? true : tailThunk().elem(e)
    });
  }

  /* elemIndex :: [a] -> a -> Maybe Int */
  elemIndex(e) {
    return this.match({
      nil: () => M_Maybe.Nothing(),
      cons: (head) => (tailThunk) => (head === e) ? M_Maybe.Just(0) : tailThunk().elemIndex(e).map(x => x + 1)
    });
  }

  /* elemIndices :: [a] -> [a] -> [Int] */
  elemIndices(e) {
    return this.match({
      nil: () => M_Stream.Nil(),
      cons: (head) => (tailThunk) => (head === e) ? M_Stream.Cons(0)(() => tailThunk().elemIndices(e).map(x => x + 1)) : tailThunk().elemIndices(e).map(x => x + 1)
    });
  }

  /* findIndex :: [a] -> (a -> Bool) -> Maybe Int */
  findIndex(p) {
    return this.match({
      nil: () => M_Maybe.Nothing(),
      cons: (head) => (tailThunk) => p(head) ? M_Maybe.Just(0) : tailThunk().findIndex(p).map(x => x + 1)
    });
  }

  /* findIndices :: [a] -> (a -> Bool) -> [Int] */
  findIndices(p) {
    return this.match({
      nil: () => M_Stream.Nil(),
      cons: (head) => (tailThunk) => p(head) ? M_Stream.Cons(0)(() => tailThunk().findIndices(p).map(x => x + 1)) : tailThunk().findIndices(p).map(x => x + 1)
    });
  }

  /* nub :: Eq a => [a] -> [a] */
  nub() {
    return this.match({
      nil: () => M_Stream.Nil(),
      cons: (head) => (tailThunk) => M_Stream.Cons(head)(() => tailThunk().remove(x => x === head).nub())
    });
  }

  /* sort :: Ord a => [a] -> [a] */
  sort() {
    return this.match({
      nil: () => M_Stream.Nil(),
      cons: (head) => (tailThunk) => tailThunk().filter(x => x < head).sort().concat(M_Stream.unit(head)).concat(tailThunk().filter(x => x >= head).sort())
    });
  }

  /* fromArray :: Array a -> [a] */
  static fromArray(arr) {
    return (arr.length === 0) ? M_Stream.Nil() : M_Stream.Cons(arr[0])(() => M_Stream.fromArray(arr.slice(1)));
  }

  /* toArray :: [a] -> Array a */
  toArray() {
    return this.match({
      nil: () => [],
      cons: (head) => (tailThunk) => [head].concat(tailThunk().toArray())
    });
  }

  /* iterate :: (a -> a) -> a -> [a] */
  static iterate(f) {
    return (acc) => M_Stream.Cons(acc)(() => M_Stream.iterate(f)(f(acc)));
  }

  /* repeat :: a -> [a] */
  static repeat(value) {
    return M_Stream.Cons(value)(() => M_Stream.repeat(value));
  }

  /* cycle :: [a] -> [a] */
  static cycle(stream) {
    return M_Stream.Cons(stream.head())(() => M_Stream.cycle(stream.tail().concat(M_Stream.unit(stream.head()))));
  }
}

/*
  Monad: M_State
*/
class M_State extends Monad {
  constructor(data) {
    super(data);
  }

  /* runState :: State s a -> s -> (a, s) */
  runState(state) {
    return this.data(state);
  }

  /* evalState :: State s a -> s -> a */
  evalState(state) {
    return this.runState(state).nth(0);
  }

  /* execState :: State s a -> s -> s */
  execState(state) {
    return this.runState(state).nth(1);
  }

  /* unit :: a -> State s a */
  static unit(value) {
    return new this.prototype.constructor((state) => new Tuple(value, state));
  }

  /* bind :: State s a -> (a -> State s' b) -> State s' b */

  /* map :: State s a -> (a -> b) -> State s b */
  map(f) {
    return new this.__proto__.constructor((state) => {
      let tuple = this.runState(state);
      return new Tuple(f(tuple.nth(0)), tuple.nth(1));
    });
  }

  /* join :: State s (state s' a) -> State s' a */
  join() {
    return new this.__proto__.constructor((state) => {
      let tuple = this.runState(state);
      return tuple.nth(0).runState(tuple.nth(1));
    });
  }

  /* ap :: State s (a -> b) -> State s' a -> State s' b */
  ap(monad) {
    return new this.__proto__.constructor((state) => {
      let tuple1 = this.runState(state),
        tuple2 = monad.runState(tuple1.nth(1));
      return new Tuple(tuple1.nth(0)(tuple2.nth(0)), tuple2.nth(1));
    });
  }

  /* lift2 :: (a -> b -> c) -> State s a -> State s' b -> State s' c */

  /* compose :: (a -> State s b) -> (b -> State s' c) -> (a -> State s' c) */

  /* toString :: State s a -> String */
  toString(state) {
    let tuple = this.runState(state);
    return "State " + tuple.toString();
  }

  /* get :: State s s */
  static get() {
    return new this.prototype.constructor((state) => new Tuple(state, state));
  }

  /* put :: s -> State s () */
  static put(s) {
    return new this.prototype.constructor((state) => new Tuple(null, s));
  }

  /* modify :: (s -> s) -> State s () */
  static modify(f) {
    return new this.prototype.constructor((state) => new Tuple(null, f(state)));
  }

  /* equals :: (State s a) -> (State t a) -> Bool */
  equals(monad) {
    return this.data.toString() === monad.data.toString();
  }
}

/*
  Monad: M_IO
*/
class M_IO extends M_State {
  constructor(data) {
    super(data);
  }

  /* unit :: a -> IO a */

  /* runIO :: IO a -> a */
  runIO(world) {
    return this.data(world);
  }

  /* evalIO :: IO a -> a */
  evalIO(world) {
    return this.data(world).nth(0);
  }

  /* bind :: IO a -> (a -> IO b) -> IO b */

  /* map :: IO a -> (a -> b) -> IO b */

  /* join :: IO (IO a) -> IO a */

  /* ap :: IO (a -> b) -> IO a -> IO b */

  /* lift2 :: (a -> b -> c) -> IO a -> IO b -> IO c */

  /* compose :: (a -> IO b) -> (b -> IO c) -> (a -> IO c) */

  /* toString :: IO a -> String */
  toString() {
    return 'IO ' + this.runIO({}).toString();
  }

  /* equals :: IO a -> IO a -> Bool */

  /* log :: String -> IO () */
  static log(msg) {
    return new M_IO((world) => {
      if ('console' in world && 'log' in world.console) {
        world.console.log(msg);
      }
      return new Tuple(null, world);
    });
  }

  /* getElementById :: String -> IO DOM */
  static getElementById(id) {
    return new M_IO((world) => new Tuple(world.document.getElementById(id), world));
  }

  /* getTime :: () -> IO Int */
  static getTime() {
    return new M_IO((world) => new Tuple(new Date().getTime(), world));
  }
}

let __MAIN = M_IO.unit();
window.addEventListener('load', () => {
  __MAIN.runIO(window);
});
