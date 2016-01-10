modules.define(
    'b-test-page', ['i-bem__dom', 'b-xxx'], function(provide, BEMDOM, xxx) {

        provide(
            BEMDOM.decl(
                {
                    block : this.name,
                    baseBlock : xxx
                },
                {
                    onSetMod: {
                        js: function() {

                            this.__base.apply(this, arguments);

                            this.ui.form.on('change', function(e, data) {
                                this.model.set(data);
                            }, this);
                        }
                    },

                    ui: {
                        form: 'b-test-form',
                        preview: 'b-test-preview'
                    },

                    bind: {
                        model: {
                            '': [
                                { elem: 'form', type: 'setVal' },
                                { elem: 'preview', type: 'setVal' }
                            ]
                        }
                    }
                }));

    });
