pre.js
======

Use pre.js to load your JS and CSS files efficiently.

 * __Petite:__ only 2.5kb gzipped.
 * __Resilient:__ Auto-retries downloads when they fail.
 * __Efficient:__ Downloads files in parallel.

```js
Pre()
  .retries(10)
  .css('/assets/app.css')
  .js('http://www.google.com/jsapi', function() { return window.google; })
  .js('/assets/app.js', function() { return window.App; })
  .then({
    App.start();
  })
```

## Usage

pre.js is available via bower and npm as `pre-js`.

It's recommended to get [index.min.js] and paste it as the first line of a small 
script (or use whatever build tool you prefer to do this for you). This way, you 
get a `<4kb` script that manages the loading of other scripts.

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
  .progress(function(e) {
    document.getElementById('progress').style.width = '' + e.percent*100 + '%';
    console.log("Loaded %s (%s of %s files loaded)", e.file, e.loaded, e.total);
  })

  /*
   * reports retries when they happen.
   */
  .retry(function (e) {
    console.warn("Failed to fetch %s, retrying", e.file);
    e.file;
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

### Acknowledgements

Implemented on top of [yepnope.js](http://yepnopejs.com/). In fact, it includes 
yepnope.js.

MIT.

[index.min.js]: index.min.js
[pre.js]: pre.js
