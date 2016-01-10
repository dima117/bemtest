modules.define(
    'b-test-form', ['i-bem__dom', 'b-xxx'], function(provide, BEMDOM, xxx) {

        provide(
            BEMDOM.decl(
                {
                    block : this.name,
                    baseBlock : xxx
                },
                {
                    ui: {
                        name: 'input',
                        surname: 'input',
                        age: 'input',
                        submit: 'button'
                    },

                    bind: {
                        model: {
                            name: { elem: 'name', type: 'setVal' },
                            surname: { elem: 'surname', type: 'setVal' },
                            age: { elem: 'age', type: 'setVal' }
                        }
                    },

                    events: {
                        name: {
                            event: 'change',
                            fn: function(e) {
                                this.model.set('name', e.target.getVal());
                            }
                        },
                        surname: {
                            event: 'change',
                            fn: function(e) {
                                this.model.set('surname', e.target.getVal());
                            }
                        },
                        age: {
                            event: 'change',
                            fn: function(e) {
                                this.model.set('age', e.target.getVal());
                            }
                        },
                        submit: {
                            event: 'click',
                            fn: function(e) {
                                e.preventDefault();
                                e.stopPropagation();

                                alert(JSON.stringify(this.model.toJSON()));
                            }
                        }
                    },

                    initEvents: function() {
                        var self = this;

                        this.model.on('change', function() { self.emit('change', self.model); });
                    }
                }));

    });
