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

        set: function() {
            var self = this,
                isChanged = false,
                args = this._normalizeArgs.apply(this, arguments),
                chain;

            if (args.value) {
                chain = this._extendChain(args.chain);

                if (!args.merge) {

                    // передавать chain в удаление??
                    // удаляем неиспользуемые поля
                    isChanged = this.keys().reduce(function(prev, name) {
                        return (!args.value.hasOwnProperty(name) && self._deleteKey(name)) || prev;
                    }, false);
                }

                isChanged |= helpers.keys(args.value).reduce(function(prev, name) {
                    return self._setField(name, args.value[name], chain) || prev;
                }, false);
            }

            isChanged && this._triggerChange(chain);

            return isChanged;
        },

        toJSON: function(recursive) {
            var self = this;

            recursive |= !arguments.length;

            return this.keys().reduce(function(prev, key) {
                var value = self.get(key);
                prev[key] = (recursive && value && typeof value.toJSON === 'function') ? value.toJSON() : value;
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

        /**
         * Преобразует аргументы к одному виду.
         * Варианты вызова:
         *  - set(data, [options])
         *  - set(field, data, [options])
         * @param {Array} args - массив аргументов метода set
         * @returns {Object}
         * @private
         */
        _normalizeArgs: function(arg0, arg1, arg2) {
            var options = {},
                result = {};

            switch (typeof arg0) {
                case 'object':
                    // вариант set(data, options)
                    result.value = arg0 instanceof lib.model ? arg0.toJSON(false) : arg0;
                    options = arg1 || {}
                    break;
                case 'string':
                    // вариант set(field, data, options)
                    result.value = {};
                    result.value[arg0] = arg1;
                    options = arg2 || {}
                    break;
            }

            result.chain = options.chain;
            result.merge = !!options.merge;

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
                    model.set(value, { chain: chain });

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
