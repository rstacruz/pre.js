Pre.js
======

Resilient efficient resource loader. Loads JS and CSS files in parallel, retries 
when it fails, and executes callbacks when they've loaded.

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

```
$ npm install --save pre-js
```

## API reference

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

### Acknowledgements

Implemented on top of yepnope.

MIT.

