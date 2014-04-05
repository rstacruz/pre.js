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
    return this;
  };

  load.prototype = {
    /**
     * asset : asset(uri)
     * registers an asset to preload
     */

    asset: function (uri) {
      if (!uri) return this;
      this.load.push('preload!'+uri);
      return this;
    },

    /**
     * js : js(uri, fn)
     * loads a JavaScript resource from `uri`. A check function `fn` may be
     * supplied to check if the thing loaded properly.
     */

    js: function (uri, fn) {
      if (!uri) return this;
      this.load.push(uri);
      if (fn) this.checks[uri] = fn;
      return this;
    },

    /**
     * css : css(uri)
     * loads a CSS file from `uri`.
     */

    css: function (uri) {
      if (!uri) return this;
      this.load.push('css!'+uri);
      return this;
    },

    /**
     * then : then(fn)
     * registers a success callback function for the previous asset.
     */

    then: function (fn) {
      if (!this.load.length)
        throw new Error("then(): nothing to attach to");

      var last = this.load[this.load.length-1];
      this.callbacks[last] = fn;
      return this;
    },

    /**
     * progress : progress(fn)
     * registers a progress callback.
     */

    progress: function (fn) {
      this.onprogress = fn;
    },

    /**
     * run:
     * runs.
     */

    run: function (yn) {
      yepnope = yn || getYepnope();
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
      if (cb) cb();

      return this;
    },

    /** triggerProgress: (internal) */
    triggerProgress: function (fname, loaded) {
      if (this.onprogress) return;
      this.onprogress({
        filename: fname,
        completed: this.completed,
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
        callback: function (lol, wat, fname) {
          self.process(fname);
        }
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

  if (typeof module === 'object')
    module.exports = load;
  else
    this.load = load;
})();
