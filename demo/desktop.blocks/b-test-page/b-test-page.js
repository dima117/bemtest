modules.define(
    'b-test-page', ['i-bem__dom', 'b-xxx'], function(provide, BEMDOM, xxx) {

        provide(
            BEMDOM.decl(
                {
                    block : this.name,
                    baseBlock : xxx
                },
                {
                    ui: {
                        form: 'b-test-form',
                        preview: 'b-test-preview'
                    },

                    bind: {
                        model: {
                            // привязываем всю модель к дочерним блокам
                            '*': [
                                { elem: 'form', type: 'setVal' },
                                { elem: 'preview', type: 'setVal' }
                            ]
                        }
                    },

                    events: {
                        form: {
                            event: 'change',
                            fn: function(e, data) {
                                this.model.set(data);
                            }
                        }
                    }
                }));

    });
