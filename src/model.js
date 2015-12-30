(function(lib){

    var helpers = lib.helpers;

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

    var Model = lib.model = lib.object.extend(lib.events).extend({
        constructor: function(attrs) {
            this._data = {};
            this.set(attrs);
        },

        get: function(key) {
            return this._getData(key).value;
        },
        set: function(key, value) {

            if (key == null) return;

            var self = this,
                attrs = this._normalizeValue(key, value);

            var isChanged = helpers.keys(attrs).reduce(function(prev, key) {
                return self._setField(key, attrs[key]) || prev;
            }, false);

            isChanged && this.trigger('change');
        },

        keys: function() {
            return helpers.keys(this._data);
        },

        hasKey: function(key) {
            return this._data.hasOwnProperty(key);
        },

        deleteKey: function(key) {
            this._deleteKey(key) && this.trigger('change');
        },

        _deleteKey: function(key) {
            if (this.hasKey(key)) {
                delete this._data[key];
                this._triggerChangeField(key, undefined);
                return true;
            }
            return false;
        },

        _normalizeValue: function(key, value) {
            var attrs = {};

            if (typeof key === 'object') {
                attrs = key;
            } else {
                attrs[key] = value;
            }

            return attrs;
        },

        _getData: function(key) {
            return this._data[key] || {};
        },

        _setData: function(key, value) {
            return this._data[key] = { value: value };
        },

        _setField: function(key, originalValue) {
            var value = this._prepareValue(originalValue),
                data = this._getData(key),
                isChanged = data.value !== value;

            if (isChanged) {

                if (value instanceof Model && data.value instanceof Model) {
                    // todo: вынести в отдельнйы метод
                    data.value.keys().forEach(function(name) {
                        !value.hasKey(name) && data.value._deleteKey(name);
                    });

                    value.keys().forEach(function(name) {
                        data.value.set(name, value.get(name));
                    }, this);

                } else {
                    this._setData(key, value);
                }

                this._triggerChangeField(key, value);
            }

            return isChanged;
        },

        _triggerChangeField: function(key, newValue) {
            this.trigger('change:' + key, { name: key, value: newValue });
        },

        _prepareValue: function(value){
            if (typeof value === 'object' && value && !(value instanceof Model)) {
               return new Model(value);
            } else {
                return value;
            }
        }
    });

})(window.lib);
