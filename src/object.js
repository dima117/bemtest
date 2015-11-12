var helpers = {
    copy: function(obj) {

        if (obj != null) {
            [].slice.call(arguments, 1)
                .filter(function(item) { return !!item })
                .forEach(function(source) {
                    Object.keys(source).forEach(
                        function(key) {
                            obj[key] = source[key];
                        });
                });
        }

        return obj;
    },
    extend: function(protoProps, staticProps) {
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
    }
};

var XObject = function(options) {
};

XObject.extend = helpers.extend;


var myObjType =  XObject.extend({
    text: 'moo',
    say: function() { console.log(this.text); }
});

var myObjType2 =  myObjType.extend({
    say2: function() { console.log(222); }
});

var instance = new myObjType2();
instance.say();
instance.say2();
