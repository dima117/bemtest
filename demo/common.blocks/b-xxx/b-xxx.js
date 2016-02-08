modules.define(
    'b-xxx', ['i-bem__dom'], function(provide, BEMDOM) {

        provide(
            BEMDOM.decl(
                this.name, {
                    onSetMod: {
                        js: function() {

                            var ui = this.ui,
                                bind = this.bind,
                                events = this.events;

                            // model
                            this.createModel();

                            // ui links
                            Object.keys(ui).forEach(function(elem) {
                                var block = ui[elem];
                                ui[elem] = typeof block === 'string' ? this.findBlockOn(elem, block) : this.elem(elem);
                            }, this);

                            // bindings
                            Object.keys(bind).forEach(function(key) {
                                var model = this[key],
                                    modelBindings = bind[key];

                                Object.keys(modelBindings).forEach(function(field) {
                                    var event = field === '*' ? 'change' : 'change:' + field;

                                    this._ensureArray(modelBindings[field])
                                        .forEach(function(params) {
                                            var binder = this.binders[params.type],
                                                elem = ui[params.elem];

                                            binder && elem && model.on(event, function(e) {
                                                binder(elem, event === 'change' ? model : e.value);
                                            });
                                        }, this);
                                }, this);
                            }, this);

                            // events
                            Object.keys(events).forEach(function(key) {
                                var elem = ui[key];

                                this._ensureArray(events[key])
                                    .forEach(function(params) {
                                        elem.on(params.event, params.fn, this);
                                    }, this);
                            }, this);

                            this.initEvents();
                        }
                    },

                    setVal: function(value, modelFieldName) {
                        this[modelFieldName || 'model'].set(value);
                    },

                    createModel: function() {
                        this.model = new lib.model(this.params.data);
                    },

                    ui: {},

                    bind: {},

                    events: {},

                    initEvents: function() {},

                    binders: {
                        setVal: function(el, value) {
                            el.setVal && el.setVal(value);
                        },
                        text: function(el, value) {
                            el.text && el.text(value);
                        }
                    },

                    _ensureArray: function(arg) {
                        return arg instanceof Array ? arg : [arg];
                    }
                }));

    });
