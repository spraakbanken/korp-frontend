(function() {
  var DefaultStringifier, DeprelStringifier, StringifyRegistry;

  DefaultStringifier = (function() {

    function DefaultStringifier() {
      this.type = "deprel";
    }

    DefaultStringifier.prototype.sidebar = function(data) {
      return "sidebar" + JSON.stringify(data);
    };

    DefaultStringifier.prototype.stats = function(data) {
      return "stats" + JSON.stringify(data);
    };

    return DefaultStringifier;

  })();

  DeprelStringifier = (function() {

    function DeprelStringifier() {
      this.type = "deprel";
    }

    DeprelStringifier.prototype.sidebar = function(data) {
      return "sidebar" + JSON.stringify(data);
    };

    return DeprelStringifier;

  })();

  StringifyRegistry = (function() {

    function StringifyRegistry(defaultFactory) {
      this.defaultFactory = defaultFactory;
      this.mapping = {};
    }

    StringifyRegistry.prototype.register = function(stringifier) {
      this.mapping[stringifier.name] = stringifier;
      return this;
    };

    StringifyRegistry.prototype.retrieve = function(type) {
      return this.mapping[type] || this.defaultFactory();
    };

    return StringifyRegistry;

  })();

  window.settings.stringifyRegistry = new StringifyRegistry(DefaultStringifier);

  window.settings.stringifyRegistry.register(DeprelStringifier);

}).call(this);
