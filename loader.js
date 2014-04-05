/** loader.js @license MIT */
(function() {
  var yepnope;

  /***
   * load():
   * creates a resource loader.
   *
   *     load()
   *       .js('jquery.js', function() { })
   */

  var load = function() {
    if (!(this instanceof load))
      return new load();

    this.load = [];
    this.checks = {};
    this.callbacks = {};
    this.completed = 0;
    this.last = null;
    this.onprogress = [];
    return this;
  };

  load.prototype = {
    /**
     * asset : asset(uri)
     * registers an asset to preload
     */

    asset: function (uri, fn) {
      return this.add(uri, fn, { prefix: 'preload!' });
    },

    /**
     * js : js(uri, fn)
     * loads a JavaScript resource from `uri`. A check function `fn` may be
     * supplied to check if the thing loaded properly.
     */

    js: function (uri, fn) {
      return this.add(uri, fn);
    },

    /**
     * css : css(uri)
     * loads a CSS file from `uri`.
     */

    css: function (uri, fn) {
      return this.add(uri, fn, { prefix: 'css!' });
    },

    /**
     * add: (internal)
     */

    add: function (uri, fn, options) {
      if (!uri) return this;
      if (options && options.prefix) uri = options.prefix + uri;
      this.load.push(uri);
      if (fn) this.checks[uri] = fn;
      this.last = uri;
      return this;
    },

    /**
     * then : then(fn)
     * registers a success callback function for the previous asset.
     */

    then: function (fn) {
      if (!this.last) return this;
      if (!this.callbacks[this.last]) this.callbacks[this.last] = [];
      this.callbacks[this.last].push(fn);
      return this;
    },

    /**
     * progress : progress(fn)
     * registers a progress callback.
     */

    progress: function (fn) {
      this.onprogress.push(fn);
      return this;
    },

    /**
     * run:
     * runs.
     */

    run: function (yn) {
      var self = this;
      yepnope = yn || getYepnope();
      yepnope({
        load: this.load,
        callback: function (uri) { self.process(uri); }
      });

      return this;
    },

    /**
     * process:
     * (internal) processes a file's completion.
     */

    process: function (fname) {
      // retry if it failed
      var verify = this.checks[fname];
      if (verify) {
        var result = verify();
        if (!result) return this.retry(fname);
      }

      // trigger the progress
      this.completed++;
      this.triggerProgress(fname, true);

      // trigger the `then` callback
      var cb = this.callbacks[fname];
      if (cb) fire(cb);

      return this;
    },

    /** triggerProgress: (internal) */
    triggerProgress: function (fname, loaded) {
      if (!this.onprogress) return;
      fire(this.onprogress, {
        uri: fname,
        completed: this.completed,
        total: this.load.length,
        percent: this.completed / this.load.length,
        loaded: loaded
      });
    },

    /** retry: (internal) */
    retry: function (fname) {
      var self = this;

      this.triggerProgress(fname, false);

      // 'recursive yepnope'
      yepnope({
        load: [fname],
        callback: function (uri) { self.process(uri); }
      });

      return self;
    }
  };

  /**
   * (internal) returns the living instance of yepnope.
   */

  function getYepnope() {
    var yn = window.yepnope || (window.Modernizr && window.Modernizr.load);
    if (!yn) throw new Error("No yepnope");
    return yn;
  }

  /**
   * fires callbacks
   */

  function fire (list) {
    if (!Array.isArray(list)) list = [list];
    var args = [].slice.call(arguments, 1);

    for (var i = 0, len = list.length; i < len; i++) {
      var item = list[i];
      item.apply(window, args || []);
    }
  }

  if (typeof module === 'object')
    module.exports = load;
  else
    this.load = load;
})();
