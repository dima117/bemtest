(function(lib) {

    var idCounter = 0,
        helpers = lib.helpers = {
            keys: function(obj) { return Object.keys(obj || false) },
            uniqueId: function() {
                return ++idCounter + '';
            },
            isEmpty: function(obj) {
                return helpers.keys(obj).length === 0;
            },
            size: function(obj) {
                return helpers.keys(obj).length;
            },
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

(function(lib) {

    var helpers = lib.helpers,
        events = lib.events = {},
        eventSplitter = /\s+/;

    var eventsApi = function(iteratee, events, name, callback, opts) {
        var i = 0, names;
        if (name && typeof name === 'object') {

            if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
            for (names = helpers.keys(name); i < names.length; i++) {
                events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
            }
        } else if (name && eventSplitter.test(name)) {


            for (names = name.split(eventSplitter); i < names.length; i++) {
                events = iteratee(events, names[i], callback, opts);
            }
        } else {

            events = iteratee(events, name, callback, opts);
        }
        return events;
    };


    events.on = function(name, callback, context) {
        return internalOn(this, name, callback, context);
    };

    var internalOn = function(obj, name, callback, context, listening) {
        obj._events = eventsApi(
            onApi, obj._events || {}, name, callback, {
                context: context,
                ctx: obj,
                listening: listening
            });

        if (listening) {
            var listeners = obj._listeners || (obj._listeners = {});
            listeners[listening.id] = listening;
        }

        return obj;
    };

    events.listenTo = function(obj, name, callback) {
        if (!obj) return this;
        var id = obj._listenId || (obj._listenId = helpers.uniqueId());
        var listeningTo = this._listeningTo || (this._listeningTo = {});
        var listening = listeningTo[id];

        if (!listening) {
            var thisId = this._listenId || (this._listenId = helpers.uniqueId());
            listening =
                listeningTo[id] =
                {
                    obj: obj,
                    objId: id,
                    id: thisId,
                    listeningTo: listeningTo,
                    count: 0
                };
        }

        internalOn(obj, name, callback, this, listening);
        return this;
    };

    var onApi = function(events, name, callback, options) {
        if (callback) {
            var handlers = events[name] || (events[name] = []);
            var context = options.context, ctx = options.ctx, listening = options.listening;
            if (listening) listening.count++;

            handlers.push(
                {
                    callback: callback,
                    context: context,
                    ctx: context || ctx,
                    listening: listening
                });
        }
        return events;
    };

    events.off = function(name, callback, context) {
        if (!this._events) return this;
        this._events = eventsApi(
            offApi, this._events, name, callback, {
                context: context,
                listeners: this._listeners
            });
        return this;
    };

    events.stopListening = function(obj, name, callback) {
        var listeningTo = this._listeningTo;
        if (!listeningTo) return this;

        var ids = obj ? [obj._listenId] : helpers.keys(listeningTo);

        for (var i = 0; i < ids.length; i++) {
            var listening = listeningTo[ids[i]];

            if (!listening) break;

            listening.obj.off(name, callback, this);
        }
        if (helpers.isEmpty(listeningTo)) this._listeningTo = void 0;

        return this;
    };

    var offApi = function(events, name, callback, options) {
        if (!events) return;

        var i = 0, listening;
        var context = options.context, listeners = options.listeners;

        if (!name && !callback && !context) {
            var ids = helpers.keys(listeners);
            for (; i < ids.length; i++) {
                listening = listeners[ids[i]];
                delete listeners[listening.id];
                delete listening.listeningTo[listening.objId];
            }
            return;
        }

        var names = name ? [name] : helpers.keys(events);
        for (; i < names.length; i++) {
            name = names[i];
            var handlers = events[name];

            if (!handlers) break;

            var remaining = [];
            for (var j = 0; j < handlers.length; j++) {
                var handler = handlers[j];
                if (callback &&
                    callback !==
                    handler.callback &&
                    callback !==
                    handler.callback._callback ||
                    context &&
                    context !==
                    handler.context) {
                    remaining.push(handler);
                } else {
                    listening = handler.listening;
                    if (listening && --listening.count === 0) {
                        delete listeners[listening.id];
                        delete listening.listeningTo[listening.objId];
                    }
                }
            }

            if (remaining.length) {
                events[name] = remaining;
            } else {
                delete events[name];
            }
        }
        if (helpers.size(events)) return events;
    };

    events.trigger = function(name) {
        if (!this._events) return this;

        var length = Math.max(0, arguments.length - 1);
        var args = Array(length);
        for (var i = 0; i < length; i++) args[i] = arguments[i + 1];

        eventsApi(triggerApi, this._events, name, void 0, args);
        return this;
    };

    var triggerApi = function(objEvents, name, cb, args) {
        if (objEvents) {
            var events = objEvents[name];
            var allEvents = objEvents.all;
            if (events && allEvents) allEvents = allEvents.slice();
            if (events) triggerEvents(events, args);
            if (allEvents) triggerEvents(allEvents, [name].concat(args));
        }
        return objEvents;
    };

    var triggerEvents = function(events, args) {
        var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
        switch (args.length) {
            case 0:
                while (++i < l) (ev = events[i]).callback.call(ev.ctx);
                return;
            case 1:
                while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1);
                return;
            case 2:
                while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2);
                return;
            case 3:
                while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
                return;
            default:
                while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
                return;
        }
    };


})(window.lib);

(function(lib){

    var hash = lib.hash = {

        getHashCode: function (obj) {
            var hashSourceString = obj && typeof obj.getHashSourceString === 'function'
                    ? obj.getHashSourceString()
                    : JSON.stringify(obj);

            return hash.getStringHashCode(hashSourceString + '', true);
        },

        getStringHashCode: function(str, asString, seed) {
            var i, l, hval = (seed === undefined) ? 0x811c9dc5 : seed;

            for (i = 0, l = str.length; i < l; i++) {
                hval ^= str.charCodeAt(i);
                hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
            }

            if(asString){
                return ('0000000' + (hval >>> 0).toString(16)).substr(-8);
            }

            return hval >>> 0;
        }
    };

})(window.lib);

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
