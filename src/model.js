var model = XObject.extend({
    _data: {},

    _getField: function(name) {
        return this._data[name] || {};
    },

    _prepareValue: function(obj){

    },

    _calculateObjectHash: function(obj) {

    },

    get: function(name){
        return _getField(name).value;
    },
    set: function(name, value) {
        var field = this._getField(name),
            obj = this._prepareValue(value),
            hash = this._calculateObjectHash(obj);

        if (hash !== field.hash) {
            if (obj instanceof model && field.value instanceof model) {

                field.value.names().forEach(function(name) {
                    if (!obj.hasField(name)) {
                        field.value.delete(name);
                    }
                });

                obj.names().forEach(function(name) {
                    field.value.set(name, obj.get(name));
                }, this);

                field.hash = hash;
            } else {
                this._data[name] = {
                    value: obj,
                    hash: hash
                };
            }
        }
    },
    delete: function(name) {
        delete this._data[name];
    },
    names: function() {
        return Object.keys(this._data);
    },
    hasField: function(name) {
        return this._data.hasOwnProperty(name);
    }
});
