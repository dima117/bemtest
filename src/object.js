(function(lib) {

    var helpers = lib.helpers;

    lib.object = function(options) {

    };

    lib.object.extend = function(protoProps, staticProps) {
        var parent = this, child;

        protoProps = protoProps || {};

        if (protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function() { return parent.apply(this, arguments); };
        }

        helpers.copy(child, parent, staticProps);

        var Surrogate = function() { this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;

        if (protoProps) helpers.copy(child.prototype, protoProps);
        child.__super__ = parent.prototype;

        return child;
    };

})(window.lib);
