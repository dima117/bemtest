modules.define(
    'b-test-form', ['i-bem__dom'], function(provide, BEMDOM) {

        provide(
            BEMDOM.decl(
                this.name, {
                    onSetMod: {
                        js: function() {

                            var self = this;

                            this.ui = {
                                name: this.findBlockOn('name', 'input'),
                                surname: this.findBlockOn('surname', 'input'),
                                age: this.findBlockOn('age', 'input')
                            };

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
                    }
                }));

    });
