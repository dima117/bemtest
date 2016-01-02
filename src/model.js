(function(lib){

    var helpers = lib.helpers;

    var Model = lib.model = lib.object.extend(lib.events).extend({
        constructor: function(attrs) {
            this._data = {};
            this._cid = helpers.uniqueId();
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

        set: function(arg0) {
            var self = this,
                isChanged = false,
                args, chain;

            if (arg0 != null) {
                args = this._normalizeArgs(arguments)
                chain = this._extendChain(args.chain);

                if (args.value instanceof Model) {
                    isChanged = this.keys().reduce(function(prev, name) {
                        return (!args.value.hasKey(name) && self._deleteKey(name)) || prev;
                    }, false);

                    isChanged = args.value.keys().reduce(function(prev, name) {
                        return self._setField(name, args.value.get(name), chain) || prev;
                    }, isChanged);

                } else {
                    isChanged |= helpers.keys(args.value).reduce(function(prev, name) {
                        return self._setField(name, args.value[name], chain) || prev;
                    }, false);
                }

                isChanged && this._triggerChange(chain);
            }

            return isChanged;
        },

        toJSON: function() {
            var self = this;
            return this.keys().reduce(function(prev, key) {
                var value = self.get(key);
                prev[key] = value && typeof value.toJSON === 'function' ? value.toJSON() : value;
                return prev;
            }, {});
        },

        _stopListeningValue: function(key) {
            var currentValue = this._getData(key).value;
            currentValue instanceof Model && this.stopListening(currentValue);
        },

        _deleteKey: function(key) {
            if (this.hasKey(key)) {
                this._stopListeningValue(key);
                delete this._data[key];
                this._triggerChangeField(key, undefined);
                return true;
            }
            return false;
        },

        _normalizeArgs: function(args) {
            var result = { value: {}},
                arg0 = args[0],
                arg1 = args[1];

            if (typeof arg0 === 'object') {
                result.value = arg0;
                result.chain = arg1;
            } else {
                result.value[arg0] = arg1;
                result.chain = args[2];
            }

            return result;
        },

        _getData: function(key) {
            return this._data[key] || {};
        },

        _setData: function(key, value, hash) {
            this._stopListeningValue(key);

            value instanceof Model && this.listenTo(value, 'change', function(e) {
                if (e.chain[this._cid]) return;

                this._getData(key).hash = lib.hash.getHashCode(value);
                this._triggerChangeField(key, value);
                this._triggerChange(e.chain);
            });

            return this._data[key] = { value: value, hash: hash };
        },

        _setField: function(key, originalValue, chain) {
            var value = this._prepareValue(originalValue),
                data = this._getData(key),
                hash = lib.hash.getHashCode(value),
                isChanged = hash !== data.hash,
                model;

            if (isChanged) {
                if (value instanceof Model) {
                    model = data.value instanceof Model ? data.value : new Model();
                    model.set(value, chain);

                    this._setData(key, model, hash);
                    this._triggerChangeField(key, model);
                } else {
                    this._setData(key, value, hash);
                    this._triggerChangeField(key, value);
                }
            }

            return isChanged;
        },

        _extendChain: function(prev) {
            var fn = function(cid) {
                this[cid] = true;
            };

            fn.prototype = prev;

            return new fn(this._cid);
        },

        _triggerChangeField: function(key, newValue) {
            this.trigger('change:' + key, { name: key, value: newValue });
        },

        _triggerChange: function(chain) {
            this.trigger('change', { chain: chain });
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
