pre.js
======

Resilient, efficient, small (2.5kb) resource loader.

Use pre.js to load your JS and CSS files efficiently.

 * Downloads files in parallel
 * Auto-retries downloads when they fail
 * Allows running of callbacks once certain scripts are loaded

```js
Pre()
  .retries(10)
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
  // set the number of retries.
  .retries(10)

  // loads JavaScripts. if the function returns a non-null, it's assumed that
  // the loading failed, and will try again.
  .js('/assets/jquery.js', function() { return window.jQuery; })
  .js('http://www.google.com/jsapi', function() { return window.google; })
  .js('/vendor.js', function() { return window.jQuery; })
  .js('/app.js', function() { return window.App; })

  // define callbacks to execute.
  // these will run after the last `.js` or `.css` file is loaded.
  .then(function() {
    google.api.load('maps');
    App.start();
  })

  // loads CSS files.
  .css('http://google.com/fonts?f=Roboto:300')

  // preload assets like images.
  .asset('/assets/image.jpg')
  .asset('/assets/font.woff')

  // Reports progress.
  .progress(function(e) {
    document.getElementById('progress').style.width = '' + e.percent*100 + '%';
    console.log("Loaded %s (%s of %s files loaded)", e.file, e.loaded, e.total);
  })

  // Reports retries.
  .retry(function (e) {
    console.warn("Failed to fetch %s, retrying", e.file);
    e.file;
  })

  // Conditionals: runs the function block if `condition` is true.
  .if(condition, function (pre) {
    pre.js('...');
  })

```

### Conditional loading

Simple

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
