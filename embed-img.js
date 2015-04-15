#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var pack = require('./package.json');
var cheerio = require('cheerio');
var program = require('commander');

program
  .version(pack.version, '-v, --version')
  .description('embed image to html')
  .option('-o, --outfile <filename>', 'write html to this file')
  .usage('[options] <html file>');

program.parse(process.argv);

function embedImage(filename) {
  var dirname, html;

  dirname = path.dirname(filename);

  try {
    html = fs.readFileSync(path.resolve(filename));
  } catch (e) {
    if (e.code == 'ENOENT') {
      console.error('File not found');
      process.exit(1);
    } else {
      throw e;
    }
  }
  $ = cheerio.load(html);

  $('img').each(function(i, elem) {
    var src, ext, file, base64;

    src = $(this).attr('src');
    ext = path.extname(src).slice(1);
    try {
      file = fs.readFileSync(path.resolve(dirname,src));
    } catch (e) {
      if (e.code == 'ENOENT') {
        console.error(src+' not found');
        process.exit(1);
      } else {
        throw e;
      }
    }
    base64 = new Buffer(file).toString('base64');
    $(this).attr('src', 'data:image/'+ext+';base64,'+base64);
  });

  return $.html({decodeEntities: false});
}

if(!program.args.length) { // No filename found
  program.help();
} else { // filename found
  var html = embedImage(program.args[0]);

  if(program.outfile) {
    fs.writeFileSync(program.outfile,html);
  } else {
    console.log(html);
  }
}
