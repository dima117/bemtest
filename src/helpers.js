(function(lib) {

    var idCounter = 0;

    lib.helpers = {
        keys: function(obj) { return Object.keys(obj || false)},
        uniqueId: function() {
            return ++idCounter + '';
        },
        isEmpty: function(obj) {},
        size: function(obj) {},
        copy: function(obj) {
            if (obj != null) {
                [].slice.call(arguments, 1).filter(function(item) { return !!item }).forEach(
                    function(source) {
                        Object.keys(source).forEach(
                            function(key) {
                                obj[key] = source[key];
                            });
                    });
            }

            return obj;
        }
    };

})(window.lib = {});
