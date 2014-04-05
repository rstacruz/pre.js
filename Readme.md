Resilient efficient resource loader.

Implemented on top of yepnope.

```js
load()
  .asset('/assets/image.jpg')
  .asset('/assets/font.woff')
  .css('http://google.com/fonts?f=Roboto:300')

  .js('/assets/jquery.js', function() { return window.jQuery; })
  .js('http://www.google.com/jsapi', function() { return window.google; })
  .js('/vendor.js', function() { return window.jQuery; })
  .js('/app.js', function() { return window.App; })

  .progress(function(e) {
    document.getElementById('progress').style.width = '' + e.percent*100 + '%';
    e.percent;
    e.loaded;
    e.total;
    e.file;
  })

  .retry(function (e) {
    console.log("Failed to fetch %s, retrying", e.file);
    e.file;
  })

  .then(function() {
    google.api.load('maps');
    App.start();
  })
```

### Conditional loading

``` js
load()
  .js(window.JSON || 'json2.js',
      function() { return window.JSON; })
  .js(oldie ? 'jquery-1.9.js' : 'jquery-2.1.js',
      function() { return window.jQuery; })
```
