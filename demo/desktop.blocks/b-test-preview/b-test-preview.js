modules.define(
    'b-test-preview', ['i-bem__dom', 'b-xxx'], function(provide, BEMDOM, xxx) {

        provide(
            BEMDOM.decl(
                {
                    block : this.name,
                    baseBlock : xxx
                },
                {
                    ui: {
                        name: true,
                        surname: true,
                        age: true
                    },

                    bind: {
                        model: {
                            name: { elem: 'name', type: 'text' },
                            surname: { elem: 'surname', type: 'text' },
                            age: { elem: 'age', type: 'text' }
                        }
                    },

                    setVal: function(value) {
                        this.model.set(value);
                    }
                }));
    });
