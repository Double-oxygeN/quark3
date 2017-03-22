/**
 * Copyright 2017 Double_oxygeN
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/*
  Class: Ex

  This supplements JavaScript standard functions.
*/
class Ex {
  /*
    About: License
    This file is licensed under the Apache License, Version 2.0.
  */

  /*
    Function: average
    Returns average of all values of an array.

    Parameters:

      arr - Array consisting of only numbers.

    Returns:

      An average value.
  */
  static average(arr) {
    return arr.reduce((a, b) => a + b) / arr.length;
  }

  /*
    Function: cauchyRand
    Returns a random value based on standard Cauchy distribution.
    This distribution have no mean.

    Returns:
      A random value from -Infinity to Infinity.
  */
  static cauchyRand() {
    return Math.tan(Math.PI * (Math.random() - 0.5));
  }

  /*
    Function: clone
    Creates what is same value, but other object.

    Parameters:
      obj - Any object.

    Returns:
      Cloned object.
  */
  static clone(obj) {
    switch (Ex.type(obj)) {
    case 'Object':
      return Object.assign({}, obj);
    case 'Array':
      return obj.concat();
    default:
      return obj;
    }
  }

  /*
    Function: cycle
    Returns an array of repetitions of the elements in pattern.

    Parameters:
      pattern - An array.
      length - Length of returned array.

    Returns:
      An array of repetitions of the elements in pattern.
  */
  static cycle(pattern, length) {
    let l = length || 0xffff,
      p_l = pattern.length,
      arr = [],
      c = 0;

    while (c < l) {
      arr.push(pattern[c % p_l]);
      c = c + 1;
    }
    return arr;
  }

  /*
    Function: expRand
    Returns a random value based on standard exponential distribution.

    Returns:
      A random value from 0 to Infinity.
  */
  static expRand() {
    return -Math.log(Math.random());
  }

  /*
    Function: frequencies
    Returns an object from distinct items in an array to the number of times they appear.

    Parameters:
      arr - An array.

    Returns:
      An object which has keys from the array and values of frequencies.
  */
  static frequencies(arr) {
    let result = {};
    arr.forEach(e => {
      if (e in result) {
        result[e] += 1;
      } else {
        result[e] = 1;
      }
    });
    return result;
  }

  /*
    Function: gaussRand
    Returns a random value based on standard normal distribution.

    Returns:
      A random value from -Infinity to Infinity.
  */
  static gaussRand() {
    return Math.sqrt(2 * Ex.expRand()) * Math.sin(2 * Math.PI * Math.random());
  }

  /*
    Function: groupBy
    Categorises every value of an array by the result of f.

    Parameters:
      f - A function, or a categorizer.
      arr - A categorized array.

    Returns:
      An object which has keys of the result of the function and values of the values of the array.
  */
  static groupBy(f, arr) {
    let result = {};
    arr.forEach(e => {
      if (f(e) in result) {
        result[f(e)].push(e);
      } else {
        result[f(e)] = [e];
      }
    });
    return result;
  }

  /*
    Function: identity
    Returns itself.

    Parameters:
      x - Any.

    Returns:
      The parameter x itself.
  */
  static identity(x) {
    return x;
  }

  /*
    Function: iterate
    Returns the array like [x, f(x), f(f(x)), ...].

    Parameters:
      f - Function which has no side effects.
      first_args - Zeroth value of the returned array.
      length - the length of the array.

    Returns:
      The array of x, f(x), f(f(x)), and so forth.
  */
  static iterate(f, first_args, length) {
    let l = length || 0xffff,
      arr = [],
      c = 0;

    while (c < l) {
      arr.push((c === 0) ? first_args : f(arr[c - 1]));
      c = c + 1;
    }
    return arr;
  }

  /*
    Function: pipe

  */
  static pipe() {
    if (arguments[1]) {
      let args = Ex.toArray(arguments);
      return Ex.pipe.apply(Ex, [args[1][0].apply(Ex, [args[0]].concat(args[1].slice(1)))].concat(args.slice(2)));
    } else {
      return arguments[0];
    }
  }

  /*
    Function: range
    Returns a ranged array.
    This function has 1–3 parameters.

    Parameters:
      st - Start value. (omittable, default value is 0)
      ed - End value.
      sp - Step value. (omittable, default value is 1)

    Returns:
      The array of ranged values.
  */
  static range() {
    let arr = [],
      st, ed, sp;
    switch (arguments.length) {
    case 1:
        [st, ed, sp] = [0, arguments[0], 1];
      break;
    case 2:
        [st, ed, sp] = [arguments[0], arguments[1], 1];
      break;
    case 3:
        [st, ed, sp] = [arguments[0], arguments[1], arguments[2]];
      break;
    default:
        [st, ed, sp] = [0, 0, 1];
    }
    while (st < ed) {
      arr.push(st);
      st = st + sp;
    }
    return arr;
  }

  /*
    Function: repeat
    Returns a repeated array.

    Parameters:
      element - A returned element.
      length - The length of the array.

    Returns:
      The array whose elements are all the same.
  */
  static repeat(element, length) {
    let l = length || 0xffff,
      arr = [],
      c = 0;
    while (c < l) {
      arr.push(Ex.clone(element));
      c = c + 1;
    }
    return arr;
  }

  /*
    Function: repeatedly
    Returns an array of the results of a function.

    Parameters:
      f - Any function which has no parameters.
      length - The length of the array.

    Returns:
      The array of the results of the function.
  */
  static repeatedly(f, length) {
    let l = length || 0xffff,
      arr = [],
      c = 0;
    while (c < l) {
      arr.push(f());
      c = c + 1;
    }
    return arr;
  }

  /*
    Function: rest
    Returns an array without the first element.

    Parameters:
      arr - An array.

    Returns:
      An array without the first element.
  */
  static rest(arr) {
    return arr.slice(1);
  }

  /*
    Function: shuffle
    Returns a randomly-shuffled array.

    Parameters:
      arr - An array.

    Returns:
      A shuffled array.
  */
  static shuffle(arr) {
    let sarr = Ex.clone(arr),
      l = arr.length,
      c = l - 1;

    while (c > 0) {
      let r = (Math.random() * (c + 1)) | 0;
      [sarr[c], sarr[r]] = [sarr[r], sarr[c]];
      c = c - 1;
    }

    return sarr;
  }

  /*
    Function: sq
    Squares the value.

    Parameters:
      x - Any number.

    Returns:
      Squared value.
  */
  static sq(x) {
    return x * x;
  }

  /*
    Function: std_dev
    Returns standard deviation of all values of an array.

    Parameters:
      arr - Array consisting of only numbers.

    Returns:
      A value of standard deviation.
  */
  static std_dev(arr) {
    let av = Ex.average(arr);
    return Math.sqrt(Ex.average(arr.map(e => Ex.sq(av - e))));
  }

  /*
    Function: time
    Measures the execution time.
    The result is on a console.

    Parameters:
      rep_times - A number of repeating.
      f - Any executed function.
      _that - A value of . (omittable)
      _args - Arguments of the function.

    Returns:
      Null.
  */
  static time(rep_times, f, _that, _args) {
    let stat = new Array(rep_times),
      results = new Array(rep_times),
      c = rep_times - 1,
      st, et, avg, sdv,
      that = _that || Ex,
      args = _args || [];

    try {
      while (-1 < c) {
        st = new Date();
        results[c] = f.apply(that, args);
        et = new Date();
        stat[c] = (et - st) | 0;
        c = (c - 1) | 0;
      }

      avg = Ex.average(stat);
      sdv = Ex.std_dev(stat);
      console.log("executed function for " + rep_times.toString(10) + " times.");
      console.groupCollapsed("STATISTICS");
      console.log("average: " + avg.toString(10) + " [ms]");
      console.log("standard deviation: " + sdv.toString(10) + " [ms]");
      console.log(results);
      console.groupEnd();
    } catch (e) {
      console.error("ERROR: " + e.message);
    }

    return null;
  }

  /*
    Function: toArray
    Converts any object to an array.

    Parameters:
      obj - Any object.

    Returns:
      An array.
  */
  static toArray(obj) {
    switch (Ex.type(obj)) {
    case 'Array':
      return obj;
    case 'Arguments':
      return Array.prototype.slice.call(obj);
    case 'Object':
      return Object.keys(obj).map(e => [e, obj[e]]);
    case 'String':
      return obj.split('');
    default:
      return Array.prototype.slice.call(arguments);
    }
  }

  /*
    Function: type
    Reveal the type of an object.

    Parameters:
      obj - Any object.

    Returns:
      The string of the object type.
  */
  static type(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
  }

  /*
    Functioin: unique
    Creates an array without duplication.

    Parameters:
      arr - An array.

    Returns:
      An array without duplication.
  */
  static unique(arr) {
    return arr.map(e => JSON.stringify(e)).filter((e, i, self) => self.indexOf(e) === i).map(e => JSON.parse(e));
  }
}
