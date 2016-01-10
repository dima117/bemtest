modules.define(
    'b-test-form', ['i-bem__dom', 'b-xxx'], function(provide, BEMDOM, xxx) {

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

                            var self = this;

                            this.model.on('change', function() { self.emit('change', self.model); });

                            this.ui.name.on('change', function() {
                                self.model.set('name', this.getVal());
                            });

                            this.ui.surname.on('change', function() {
                                self.model.set('surname', this.getVal());
                            });

                            this.ui.age.on('change', function() {
                                self.model.set('age', this.getVal());
                            });
                        }
                    },

                    setVal: function(value) {
                        this.model.set(value);
                    },

                    ui: {
                        name: 'input',
                        surname: 'input',
                        age: 'input'
                    },

                    bind: {
                        model: {
                            name: { elem: 'name', type: 'setVal' },
                            surname: { elem: 'surname', type: 'setVal' },
                            age: { elem: 'age', type: 'setVal' }
                        }
                    }
                }));

    });
