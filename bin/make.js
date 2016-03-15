/*

Copyright (c) 2010-16 Nexogen Kft.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

Author: Mark Farkas <farkas.mark@nexogen.hu>

*/

//
// Custom build script for MySuperAudio
// Inspired by: http://kjbekkelund.github.io/presentations/js-build/#28
//              http://www.ctomczyk.pl/why-i-switched-to-only-nodejs-npm-and-stopped-using-grunt/767/
//

'use strict';

require('shelljs/make')
require('colors')

var fs = require('fs'),
 path = require('path'),
 glob = require('glob'),
 cli = require('shelljs-nodecli')

/*** CONFIG ********/

const component = 'nexogen-audio.html'
const source = 'src'
const build = 'dist'

/*** TARGETS *******/

target.all = () => {
  console.log('all')
  
  target.clean()
  target.test()
  target.build()  
}

target.clean = () => {
  console.log('clean')
  
  if(test('-e', build)) {
    rm('-rf', build)
  }
  
  mkdir('-p', build)
}

target.test = () => {
  console.log('test')
  
  // run tests
}

target.build = () => {
  console.log('build')
  
  const src = path.join(source, component)
  const html = path.join(build, component)
  const js = html.replace('.html', '.js')
  
  vulcanize(src, html)
  crisper(html, js)
  babel(js)
  minifyJs(js)
}

var vulcanize = (src, dst) => {
  if(test('-e', src)) {
    const settings = '--inline-scripts --inline-css --strip-comments'
    cli.exec('vulcanize', settings, src, '-o', dst)
  } else {
    errorFileNotFound(src);
  }
}

var crisper = (html, js) => {
  if(test('-e', html)) {
    cli.exec('crisper', '-s', html, '-h', html, '-j', js)
  } else {
    errorFileNotFound(html);
  }
}

var babel = (js) => {
  if(test('-e', js)) {
    // hack is needed since babel command name is not the same as npm package name
    const BABEL = 'node_modules/babel-cli/bin/babel.js'
    exec('node ' + BABEL + ' --presets es2015 ' + js + ' --out-file ' + js)
  } else {
    errorFileNotFound(js)
  }  
}

var minifyJs = (js) => {
  if(test('-e', js)) {
    var minjs = js.replace('.js', '.min.js')
    cli.exec('uglifyjs', js, '-o', minjs, '--source-map', minjs + '.map')
  } else {
    errorFileNotFound(js);
  }      
}

var errorFileNotFound = (path) => {
  console.error(path + ' does not exists.')
  process.exit(1)      
}