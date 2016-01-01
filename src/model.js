(function(lib){

    var helpers = lib.helpers;

    var Model = lib.model = lib.object.extend(lib.events).extend({
        constructor: function(attrs) {
            this._data = {};
            this.set(attrs);
        },

        getHashSourceString: function() {
            return this.keys().sort().map(function(key) {
                return encodeURIComponent(key) + '=' + this._getData(key).hash;
            }, this).join('&');
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

        get: function(key) {
            return this._getData(key).value;
        },

        set: function(key, value) {
            var self = this,
                isChanged = false,
                attrs;

            if (key != null) {

                if (key instanceof Model) {

                    isChanged = this.keys().reduce(function(prev, name) {
                        return (!key.hasKey(name) && self._deleteKey(name)) || prev;
                    }, false);

                    isChanged = key.keys().reduce(function(prev, name) {
                        return self._setField(name, key.get(name)) || prev;
                    }, isChanged);

                } else {
                    attrs = this._normalizeValue(key, value);

                    isChanged |= helpers.keys(attrs).reduce(function(prev, key) {
                        return self._setField(key, attrs[key]) || prev;
                    }, false);
                }

                isChanged && this.trigger('change');
            }

            return isChanged;
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

        _setData: function(key, value, hash) {
            return this._data[key] = { value: value, hash: hash };
        },

        _setField: function(key, originalValue) {
            var value = this._prepareValue(originalValue),
                data = this._getData(key),
                hash = lib.hash.getHashCode(value),
                isChanged = hash !== data.hash,
                model;

            if (isChanged) {
                if (value instanceof Model) {
                    model = data.value instanceof Model ? data.value : new Model();
                    model.set(value);

                    this._setData(key, model, hash);
                    this._triggerChangeField(key, model);
                } else {
                    this._setData(key, value, hash);
                    this._triggerChangeField(key, value);
                }
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
