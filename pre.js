/* pre.js @license MIT */
(function(window) {
  var yepnope;

  /***
   * Pre():
   * creates a resource loader.
   *
   *     Pre()
   *       .js('jquery.js', function() { })
   */

  var Pre = function() {
    if (!(this instanceof Pre))
      return new Pre();

    var self = this;
    self.load = [];
    self.checks = {};
    self.callbacks = {};
    self.completed = 0;
    self.last = null;
    self.onfail = [];
    self.onprogress = [];
    self.onretry = [];
    self.maxretries = 3;
    self.retryCount = {};
    self._retryDelay = 5000;
    self.ran = false;
    Pre.timeout = self.timeout = setTimeout(function() { self.run(); }, 0);
    return self;
  };

  Pre.prototype = {
    /**
     * asset() : asset(uri)
     * registers an asset to preload. This usually refers to an image or a font.
     *
     *     pre()
     *       .asset('/images/logo.jpg')
     */

    asset: function (uri, fn) {
      return this.add(uri, fn, { prefix: 'preload!' });
    },

    /**
     * js() : js(uri, fn)
     * loads a JavaScript resource from `uri`. A check function `fn` may be
     * supplied to check if the thing loaded properly.
     *
     *     pre()
     *       .js('jquery.js', function () { return jQuery; })
     */

    js: function (uri, fn) {
      return this.add(uri, fn);
    },

    /**
     * if() : if(condition, fn)
     * runs `fn` if `condition` is met.
     *
     * Pre()
     *   .if(navigator.userAgent.match(/iOS/), function (Pre) {
     *     Pre.js('...');
     *   })
     */

    if: function (condition, fn, elsefn) {
      if (condition) fn(this);
      else if (elsefn) elsefn(this);
      return this;
    },

    /**
     * css() : css(uri)
     * loads a CSS file from `uri`.
     *
     *     pre()
     *       .asset('/css/style.css')
     */

    css: function (uri, fn) {
      return this.add(uri, fn, { prefix: 'css!' });
    },

    /**
     * add():
     * (internal)
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
     * retries() : retries(n)
     * Sets the maximum number of retries to `n`.
     *
     *     pre()
     *       .retries(4)
     *       .retryDelay(5000)
     *       .js('/app.js')
     */

    retries: function (n) {
      if (arguments.length === 0) return this.maxretries;
      this.maxretries = n;
      return this;
    },

    /**
     * retryDelay() : retryDelay(ms)
     * Sets the retry delay to `ms` milliseconds. When a resource fails to
     * load, pre.js will wait for this much time before retrying.
     *
     * Defaults to `5000` miliseconds. See [retry()](#retry) for an example.
     */

    retryDelay: function (ms) {
      if (arguments.length === 0) return this._retryDelay;
      this._retryDelay = ms;
      return this;
    },

    /**
     * then() : then(fn)
     * registers a success callback function for the previous asset.
     *
     *     pre()
     *       .js('/app.js')
     *       .then(function() { ... })
     */

    then: function (fn) {
      if (!this.last) return this;
      if (!this.callbacks[this.last]) this.callbacks[this.last] = [];
      this.callbacks[this.last].push(fn);
      return this;
    },

    /**
     * on() : on(event, fn)
     * registers a callback. event can either be `progress` or `retry`.
     *
     *     pre()
     *       .js('/app.js')
     *       .on('retry', function (e) {
     *         console.warn("Failed to fetch %s, retrying", e.uri);
     *       })
     *       .on('fail', function (e) {
     *         console.warn("Failed to load %s", e.uri);
     *       })
     */

    on: function (event, fn) {
      if (!this['on'+event]) throw new Error("on(): unknown event '"+event+"'");
      this['on'+event].push(fn);
      return this;
    },

    /**
     * run():
     * (internal) runs. this is called automatically after `setTimeout(fn,0)`,
     * but you can invoke it manually if you wish it to run sooner.
     */

    run: function (yn) {
      var self = this;
      if (self.ran) return self;

      self.ran = true;
      yepnope = yn || getYepnope();
      yepnope({
        load: self.load,
        callback: function (uri) { self.process(uri); }
      });

      return self;
    },

    /**
     * process():
     * (internal) processes a file's completion.
     */

    process: function (fname) {
      // retry if it failed
      var verify = this.checks[fname];
      if (verify) {
        var result = verify();
        if (!result) return this.retryResource(fname);
      }

      // trigger the progress
      this.completed++;
      this.triggerProgress(fname);

      // trigger the `then` callback
      var cb = this.callbacks[fname];
      if (cb) fire(cb);

      return this;
    },

    /** triggerProgress(): (internal) triggers a progress event. */
    triggerProgress: function (fname) {
      fire(this.onprogress, {
        uri: fname,
        completed: this.completed,
        total: this.load.length,
        percent: this.completed / this.load.length
      });
    },

    /** trigger(): (internal) triggers a given event. */
    trigger: function (event, obj) {
      fire(this["on"+event], obj);
    },

    /** retryResource(): (internal) retries a given resource. */
    retryResource: function (fname) {
      var self = this;

      if (!this.retryCount[fname]) this.retryCount[fname] = 0;
      this.retryCount[fname]++;

      if (this.retryCount[fname] > this.maxretries) {
        // fail and give up, no more retries for this resource
        this.trigger('fail', { uri: fname, retries: this.retryCount[fname] });
      } else {
        // try again
        this.trigger('retry', { uri: fname, retries: this.retryCount[fname] });

        // 'recursive yepnope'
        setTimeout(function () {
          yepnope({
            load: [fname],
            callback: function (uri) { self.process(uri); }
          });
        }, self._retryDelay);
      }

      return self;
    }
  };

  /**
   * (internal) returns the living instance of yepnope.
   */

  function getYepnope() {
    var yn = window.yepnope || (window.Modernizr && window.Modernizr.load);
    if (!yn) throw new Error("pre.js: yepnope not found");
    return yn;
  }

  /**
   * (internal) fires callbacks
   */

  function fire (list) {
    if (!Array.isArray(list)) list = [list];
    var args = [].slice.call(arguments, 1);

    for (var i = 0, len = list.length; i < len; i++) {
      var item = list[i];
      item.apply(window, args || []);
    }
  }

  Pre.version = "0.1.2";

  if (typeof module === 'object')
    module.exports = Pre;
  else
    window.Pre = Pre;
})(this);
