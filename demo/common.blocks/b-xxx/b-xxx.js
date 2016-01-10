modules.define(
    'b-xxx', ['i-bem__dom'], function(provide, BEMDOM) {

        provide(
            BEMDOM.decl(
                this.name, {
                    onSetMod: {
                        js: function() {

                            var ui = this.ui;

                            this.createModel();

                            Object.keys(this.ui).forEach(function(elem) {
                                var block = ui[elem];
                                ui[elem] = typeof block === 'string' ? this.findBlockOn(elem, block) : this.elem(elem);
                            }, this);

                        }
                    },

                    createModel: function() {
                        this.model = new lib.model(this.params.data);
                    },

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
