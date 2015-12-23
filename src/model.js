(function(lib){

    var XModel = lib.model = lib.object.extend({
        _data: {},

        _getField: function(name) {
            return this._data[name] || {};
        },

        _prepareValue: function(obj){
            var model, name;

            if (typeof obj === 'object' && obj && !(obj instanceof XModel)) {
                model = new XModel();

                for (name in obj) {
                    model.set(name, obj[name]);
                }
            } else {
                return obj;
            }
        },

        getHashSourceString: function() {
            return this.names().sort().map(function(name) {
                return encodeURIComponent(name) + '=' + this._getField(name).hash;
            }).join('&');
        },

        get: function(name){
            return this._getField(name).value;
        },
        set: function(name, value) {
            var field = this._getField(name),
                obj = this._prepareValue(value),
                hash = lib.hash.getHashCode((obj));

            if (hash !== field.hash) {
                if (obj instanceof XModel && field.value instanceof XModel) {

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

    lib.model = lib.object.extend(lib.events).extend({
        _data: {},

        get: function(name) {
            return this._data[name];
        },
        set: function(name, value) {
            this._data[name] = value;
            this.trigger('change');
        }
    });

})(window.lib);
