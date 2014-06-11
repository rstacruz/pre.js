/** pre.js @license MIT */
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

    this.load = [];
    this.checks = {};
    this.callbacks = {};
    this.completed = 0;
    this.last = null;
    this.onfail = [];
    this.onprogress = [];
    this.onretry = [];
    this.maxretries = 3;
    this.retryCount = {};
    this.ran = false;
    return this;
  };

  Pre.prototype = {
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
     * if : if(condition, fn)
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
     * retries : retries(n)
     * Sets the maximum number of retries to `n`.
     */

    retries: function (n) {
      if (arguments.length === 0) return this.maxretries;
      this.maxretries = n;
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
     * on : on(event, fn)
     * registers a callback. event can either be 'progress' or 'retry'.
     */

    on: function (event, fn) {
      if (!this['on'+event]) throw new Error("on(): unknown event '"+event+"'");
      this['on'+event].push(fn);
      return this;
    },

    /**
     * run:
     * runs.
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
     * process:
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

    /** triggerProgress: (internal) */
    triggerProgress: function (fname) {
      fire(this.onprogress, {
        uri: fname,
        completed: this.completed,
        total: this.load.length,
        percent: this.completed / this.load.length
      });
    },

    /** trigger: (internal) */
    trigger: function (event, obj) {
      fire(this["on"+event], obj);
    },

    /** retryResource: (internal) */
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
        yepnope({
          load: [fname],
          callback: function (uri) { self.process(uri); }
        });
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

  Pre.version = "0.0.2";

  if (typeof module === 'object')
    module.exports = Pre;
  else
    window.Pre = Pre;
})(this);
