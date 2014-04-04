(function() {
  var load = function() {
    if (!(this instanceof load))
      return new load();

    this.load = [];
    this.checks = {};
    this.callbacks = {};
    this.failed = false;
    return this;
  };

  load.prototype = {
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
      if (!this.load.length) return this;
      var last = this.load[this.load.length-1];
      this.callbacks[last] = fn;
      return this;
    },

    run: function (yn) {
      if (!yn) yn = window.yepnope || (window.Modernizr && window.Modernizr.load);
      if (!yn) throw new Error("No yepnope");
      return this;
    }
  };

  if (typeof module === 'object')
    module.exports = load;
  else
    this.load = load;
})();
