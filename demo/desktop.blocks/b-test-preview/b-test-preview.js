modules.define(
    'b-test-preview', ['i-bem__dom'], function(provide, BEMDOM) {

        provide(
            BEMDOM.decl(
                this.name, {
                    onSetMod: {
                        js: function() {

                            var self = this;

                            this.ui = {
                                name: this.elem('name'),
                                surname: this.elem('surname'),
                                age: this.elem('age')
                            };

                            this.model = new lib.model(this.params);

                            this.model
                                .on('change:name', function(e) { console.log('change preview name'); self.ui.name.text(e.value); })
                                .on('change:surname', function(e) { console.log('change preview surname'); self.ui.surname.text(e.value); })
                                .on('change:age', function(e) { console.log('change preview age'); self.ui.age.text(e.value); });
                        }
                    },

                    setVal: function(value) {
                        this.model.set(value);
                    }
                }));

    });
