#! /usr/bin/env node
'use strict';

const Px = require('px');
const fs = require('fs');
const csvWriter = require('csv-write-stream');
const program = require('commander');

program
  .option('-o, --csv-file <f>', 'CSV target file')
  .option('-i, --px-file <f>', 'PC Axis source file')
  .option('-c, --datum-column <f>', 'Assign custom header name to the datum column')
  .parse(process.argv);


function _arrayOfZeroes(l) {
  var a = [];
  while (l--) {
    a[l] = 0;
  }
  return a;
}

// A generator port of the .entries function of px
function* datums(px, datumFieldName) {
  const counts = px.valCounts();
  const vars = px.variables();
  const valIdx = _arrayOfZeroes(counts.length);
  const last = valIdx.length - 1;
  const multipliers = [];

  for (var i = 0, l = counts.length; i < l - 1; i++) {
      // the multiplier for each variable is the product of the numbers of values
      // for each variable occuring after it in the variables array
      multipliers[i] = counts.slice(i + 1).reduce((a, b) => a * b);
  }

  for (var i = 0; i < px.data.length; i++) {
    const d = px.data[i];
    const datum = {};
    datum[datumFieldName || 'num'] = d;
    for (var di = 0, dl = vars.length; di < dl; di++) {
      datum[vars[di]] = px.values(di)[valIdx[di]];
    }
    yield datum

    // increment indices:
    for (var mi = 0, ml = multipliers.length; mi < ml; mi++) {
      if ( (i + 1) % (multipliers[mi]) === 0 ) {
        valIdx[mi] = valIdx[mi] === counts[mi] - 1 ? 0 : valIdx[mi] + 1;
      }
    }
    valIdx[last] = valIdx[last] === counts[last] - 1 ? 0 : valIdx[last] + 1;
  }
}

if(program.pxFile && program.csvFile) {
  const outputStream = fs.createWriteStream(program.csvFile);
  fs.readFile(program.pxFile, 'utf8', function(err, data) {
    if(err) throw err;
    const px = new Px(data);
    const writer = csvWriter()

    writer.pipe(outputStream);
    for(var datum of datums(px, program.datumColumn)) {
      writer.write(datum)
    }
    writer.end();
  });
} else {
  program.help();
}
