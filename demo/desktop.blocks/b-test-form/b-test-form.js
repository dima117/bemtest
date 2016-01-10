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

                            this.model = new lib.model(this.params);

                            this.model
                                .on('change:name', function(e) { console.log('change form name'); self.ui.name.setVal(e.value); })
                                .on('change:surname', function(e) { console.log('change form surname'); self.ui.surname.setVal(e.value); })
                                .on('change:age', function(e) { console.log('change form age'); self.ui.age.setVal(e.value); })
                                .on('change', function() { self.emit('change', self.model); });

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
                    }
                }));

    });
