pre.js
======

Use pre.js to load your JS and CSS files efficiently. Perfect for mobile apps 
and sites where 3G can often fail.

 * __Petite:__ only 2.5kb gzipped.
 * __Resilient:__ Auto-retries downloads when they fail.
 * __Efficient:__ Downloads files in parallel.

[![Status](https://travis-ci.org/rstacruz/pre.js.svg?branch=master)](https://travis-ci.org/rstacruz/pre.js)  

```js
Pre()
  .retries(10)
  .css('/assets/app.css')
  .js('http://www.google.com/jsapi', function() { return window.google; })
  .js('/assets/app.js', function() { return window.App; })
  .then({
    App.start();
  });
```

## Usage

Use [index.min.js].

pre.js is available via [bower] and [npm].

    $ bower install --save pre-js
    $ npm install --save pre-js

[![npm version](https://img.shields.io/npm/v/pre-js.png)](https://npmjs.org/package/pre-js "View this project on npm")
[bower]: http://bower.io/search/?q=pre-js
[npm]: https://www.npmjs.org/package/pre-js

### Recommended use

Create a file like `load.js`, which contains *pre.js* and your loader code.
Use whatever build tool you prefer to do this for you. This gets you a small 
`<4kb` loader you can use as a "gateway" to the rest of your app.

With [Webpack] or [Browserify], it probably will be like this:

```js
/* load.js */
var Pre = require('pre-js');
Pre()
  .css('/assets/app.css')
  .js ('/assets/vendor.js', function() { return window.jQuery; })
  .js ('/assets/app.js',    function() { return window.App; })
  .then({
    App.start();
  });
```

## API reference

See [pre.js]'s inline comments for more info. Here's a quick reference of the 
API:

```js
Pre()
  /*
   * sets the maximum number of retries before giving up.
   */
  .retries(10)

  /*
   * loads JavaScript assets. if the function returns a falsy value, it's
   * assumed that the loading failed, and will try again.
   */
  .js('/assets/jquery.js', function() { return window.jQuery; })
  .js('http://www.google.com/jsapi', function() { return window.google; })
  .js('/vendor.js', function() { return window.jQuery; })
  .js('/app.js', function() { return window.App; })

  /*
   * defines callbacks to execute.
   * these will run after the immediately-preceding `.js` or `.css` file is
   * loaded. you can use as many .then() blocks as you like, inserted at
   * different points.
   */
  .then(function() {
    google.api.load('maps');
    App.start();
  })

  /*
   * loads CSS files.
   */
  .css('http://google.com/fonts?f=Roboto:300')
  .css('/assets/application.css')

  /*
   * preloads assets (like images and fonts).
   */
  .asset('/assets/image.jpg')
  .asset('/assets/font.woff')

  /*
   * reports progress.
   */
  .on('progress', function(e) {
    document.getElementById('progress').style.width = '' + e.percent*100 + '%';
    console.log("Loaded %s (%s of %s files loaded)", e.file, e.loaded, e.total);
  })

  /*
   * reports retries and failures when they happen.
   */
  .on('retry', function (e) {
    console.warn("Failed to fetch %s, retrying", e.uri);
  })
  .on('fail', function (e) {
    console.warn("Failed to load %s", e.uri);
  })

  /*
   * Conditionals: runs the function block if `condition` is true.
   */
  .if(condition, function (pre) {
    pre.js('...');
  })
```

### Conditional loading

Simple:

``` js
Pre()
  .js(window.JSON || 'json2.js',
      function() { return window.JSON; })
  .js(oldie ? 'jquery-1.9.js' : 'jquery-2.1.js',
      function() { return window.jQuery; })
```

For more complicated things:

```js
Pre()
  .if(env === 'development', function (pre) {
    pre
      .js('livereload.js')
      .js('weinre.js')
    })
```

### CoffeeScript

Better with CoffeeScript, if that's your thing:

```coffee
Pre()
  .css 'style.css'
  .js  'jquery.js', -> jQuery?
  .js  'app.js',    -> App?
  .then -> App.start()
```

## Acknowledgements

Implemented on top of [yepnope.js](http://yepnopejs.com/). In fact, it includes 
yepnope.js.

[index.min.js]: index.min.js
[pre.js]: pre.js
[Browserify]: http://browserify.org
[Webpack]: http://webpack.github.io

© 2014, Rico Sta. Cruz. Released under the [MIT License](License.md).

**pre.js** is authored and maintained by [Rico Sta. Cruz][rsc] with help 
from its [contributors][c].

 * [My website](http://ricostacruz.com) (ricostacruz.com)
 * [Github](http://github.com/rstacruz) (@rstacruz)
 * [Twitter](http://twitter.com/rstacruz) (@rstacruz)

[rsc]: http://ricostacruz.com
[c]:   http://github.com/rstacruz/pre.js/contributors
