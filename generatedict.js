const fs = require('fs');

let prefix = {};
let dict = {};

let banned = {
  'wcyl': true,
};

let names = {};
let newnames = {};

fs.readFileSync('names.txt').toString().split(/\s+/gi).forEach(name => {
  names[name] = name;
});

Object.keys(names).forEach(name => {
  let matches = name.split(/^((?:(?:m_)?(?:a|ar|arn|arr|b|bc|dw|e|f|fl|gbid|h|i|id|rgba|is|inv|wcyl|m|n|p|pn|pt|pgbid|q|s|ser|sz|t|tag|u|v|vec|pwv|sno|pdw|vw|wd|wvp|rgbaval|wp|wr|ws|wv|bone|cell|end|game|local|max|parent|path|plane|sample|start|twin|vertex|count|l))(?=[0-9A-Z_]))/g).filter(Boolean);

  matches.forEach(subname => {
    if (/^[^a-zA-Z]+$/.test(subname)) {
      return;
    }

    if (/^((?:m_)?(?:a|ar|arn|arr|b|bc|dw|e|f|fl|gbid|h|i|id|rgba|is|inv|wcyl|m|n|p|pn|pt|pgbid|q|s|ser|sz|t|tag|u|v|vec|pwv|sno|pdw|vw|wd|wvp|rgbaval|wp|wr|ws|wv|bone|cell|end|game|local|max|parent|path|plane|sample|start|twin|vertex|count|l))$/g.test(subname)) {
      if (!prefix[subname]) {
        prefix[subname] = names[name];
      }
    } else {
      newnames[subname] = names[name];
    }
  });
});

names = newnames;
newnames = {};

Object.keys(names).forEach(name => {
  let matches = name.split(/(3x3|4x4|BCVEC2I|IDs(?![a-z])|By(?![a-z])|To(?![a-z])|In(?![a-z])|Is(?![a-z])|On(?![a-z])|No(?![a-z])|(?<![0-9])2D|(?<![0-9])3D|(?<![0-9])4D)/g).filter(Boolean);

  matches.forEach(subname => {
    if (/^([^a-zA-Z]+)$/.test(subname) || subname.length < 3) {
      return;
    }

    if (/^(3x3|4x4|BCVEC2I|IDs(?![a-z])|By(?![a-z])|To(?![a-z])|In(?![a-z])|Is(?![a-z])|On(?![a-z])|No(?![a-z])|(?<![0-9])2D|(?<![0-9])3D|(?<![0-9])4D)$/g.test(subname) || /^[a-z]{3,}$/g.test(subname)) {
      if (!dict[subname]) {
        dict[subname] = names[name];
      }
    } else {
      newnames[subname] = names[name];
    }
  });
});

names = newnames;
newnames = {};

Object.keys(names).forEach(name => {
  let matches = name.split(/([A-Z][a-z]{2,})/g).filter(Boolean);

  matches.forEach(subname => {
    if (/^[^a-zA-Z]+$/.test(subname)) {
      return;
    }

    if (/^([A-Z][a-z]+)$/g.test(subname) || /^[a-z]{3,}$/g.test(subname)) {
      if (!dict[subname]) {
        dict[subname] = names[name];
      }
    } else {
      newnames[subname] = names[name];
    }
  });
});

names = newnames;
newnames = {};

Object.keys(names).forEach(name => {
  let matches = name.split(/([A-Z]{2,})/g).filter(Boolean);

  matches.forEach(subname => {
    if (/^[^a-zA-Z]+$/.test(subname)) {
      return;
    }

    if (/^([A-Z]{2,})$/g.test(subname) || /^[a-z]{3,}$/g.test(subname)) {
      if (!dict[subname]) {
        dict[subname] = names[name];
      }
    } else {
      newnames[subname] = names[name];
    }
  });
});

names = newnames;
newnames = {};

Object.keys(names).forEach(name => {
  let matches = name.split(/_+/g).filter(Boolean);

  matches.forEach(subname => {
    if (subname.length > 1 && !/^[^a-z]+$/gi.test(subname)) {
      newnames[subname] = names[name];
    }
  });
});

names = newnames;
newnames = {};

Object.keys(names).forEach(name => {
  let matches = name.split(/([a-z]+[0-9]*)/g).filter(Boolean);
  
  matches.forEach(subname => {
    if (subname.toLowerCase() == '') {
      debugger;
    }

    if (subname.length > 2 && !/^[^a-z]+$/gi.test(subname) && !banned[subname.toLowerCase()]) {
      if (!dict[subname]) {
        dict[subname] = names[name];
      }
    }
  });
});

names = newnames;
newnames = {};

fs.writeFileSync('dict.txt', Object.keys(dict).sort().join('\n'));

dict = Object.assign({}, JSON.parse(fs.readFileSync('dict_expanded.json').toString()), dict);

fs.writeFileSync('dict_expanded.json', JSON.stringify(dict, null, ' '));
fs.writeFileSync('dict_expanded.txt', Object.keys(dict).sort().join('\n'));
