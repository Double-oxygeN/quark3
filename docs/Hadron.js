let HADRON_TABLE = {};
const xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    HADRON_TABLE = JSON.parse(xhr.responseText);
    console.log(HADRON_TABLE);
  }
};
xhr.open("GET", "./resources/hadrons.json");
xhr.send();

class Hadron {
  constructor(name, mass) {
    Object.defineProperty(this, 'name', {
      value: name,
      writable: false,
      enumerable: true,
      configurable: false
    });
    Object.defineProperty(this, 'mass', {
      value: mass,
      writable: false,
      enumerable: true,
      configurable: false
    });
  }

  /* getName :: Hadron -> String */
  getName() {
    return this.name;
  }

  /* toString :: Hadron -> String */
  toString() {
    return '[Hadron <' + this.name + ',' + this.mass + ' MeV>]';
  }
}
