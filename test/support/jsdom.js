module.exports = function(next) {
  require('jsdom').env({
    html: '<!doctype html><html><head><script></script></head><body></body></html>',
    src: [require('fs').readFileSync(__dirname + '/../../index.js')],
    done: function(errors, window) {
      window.console = console;
      window.history.replaceState(null, '', '/');
      global.window = window;
      global.location = window.location;
      global.document = window.document;
      global.history = window.history;
      window._$jscoverage = global._$jscoverage;
      if (errors) {
        errors.forEach(console.log);
        throw new Error(errors[0].data.error);
      }
      next();
    }
  });
};
