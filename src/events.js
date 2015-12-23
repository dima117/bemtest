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
