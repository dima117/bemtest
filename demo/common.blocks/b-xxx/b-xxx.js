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

                                model.keys().forEach(function(field) {
                                    var params = modelBindings[field],
                                        binder = this.binders[params.type],
                                        elem = ui[params.elem];

                                    binder && elem && model.on('change:' + field, function(e) {
                                        binder(elem, e.value);
                                    });
                                }, this);
                            }, this);
                        }
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
