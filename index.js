#! /usr/bin/env node
'use strict';

const Px = require('px');
const fs = require('fs');
const csvWriter = require('csv-write-stream');
const program = require('commander');

program
  .option('-o, --csv-file <f>', 'CSV target file')
  .option('-i, --px-file <f>', 'PC Axis source file')
  .parse(process.argv);

function* datumIndizes(valCounts) {
  //NOTE: This seems crazy at first - but by unrolling we avoid the recursion and we have
  //a fixed amount of dimensions anyway
  const dimension = valCounts.length;
  const indizes = [];

  for(var i = 0; i < valCounts[0]; i++) {
    if(dimension === 1) {
      yield [i];
    }

    for(var j = 0; j < valCounts[1]; j++) {
      if(dimension === 2) {
        yield [i, j];
        continue;
      }
      for(var k = 0; k < valCounts[2]; k++) {
        if(dimension === 3) {
          yield [i, j, k];
          continue;
        }
        for(var l = 0; l < valCounts[3]; l++) {
          if(dimension === 4) {
            yield [i, j, k, l];
            continue;
          }
          for(var m = 0; m < valCounts[4]; m++) {
            if(dimension === 5) {
              yield [i, j, k, l, m];
              continue;
            }
            for(var n = 0; n < valCounts[5]; n++) {
              if(dimension === 6) {
                yield [i, j, k , l, m, n];
                continue;
              } else {
                throw "Only at max 6 dimensions supported";
              }
            }
          }
        }
      }
    }
  }

  return indizes;
}

function* allDatums(px) {
  const counts = px.valCounts()
  const indizes = datumIndizes(counts);
  for(var index of indizes) {
    yield index.map((valueIdx, variableIdx) => {
      return px.values(variableIdx)[valueIdx];
    }).concat([px.datum(index)]);
  }
}

if(program.pxFile && program.csvFile) {
  const outputStream = fs.createWriteStream(program.csvFile);
  fs.readFile(program.pxFile, 'utf8', function(err, data) {
    if(err) throw err;

    const px = new Px(data);
    const vars = px.variables();
    const writer = csvWriter({
      headers: vars.concat(['Datum'])
    })
    writer.pipe(outputStream);
    for(var datum of allDatums(px)) {
      writer.write(datum)
    }
    writer.end();
  });
} else {
  program.help();
}
