modules.define(
    'b-xxx', ['i-bem__dom'], function(provide, BEMDOM) {

        provide(
            BEMDOM.decl(
                this.name, {
                    onSetMod: {
                        js: function() {

                            var ui = this.ui,
                                bind = this.bind;

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
                                    var event = field ? 'change:' + field : 'change',
                                        fieldBindings = modelBindings[field];

                                    !(fieldBindings instanceof Array) && (fieldBindings = [fieldBindings]);

                                    fieldBindings.forEach(function(params) {
                                        var binder = this.binders[params.type],
                                            elem = ui[params.elem];

                                        binder && elem && model.on(event, function(e) {
                                            binder(elem, event === 'change' ? model : e.value);
                                        });
                                    }, this);
                                }, this);
                            }, this);
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

                    binders: {
                        setVal: function(el, value) {
                            el.setVal && el.setVal(value);
                        },
                        text: function(el, value) {
                            el.text && el.text(value);
                        }
                    }
                }));

    });
