modules.define(
    'b-test-preview', ['i-bem__dom', 'b-xxx'], function(provide, BEMDOM, xxx) {

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
                                .on('change:name', function(e) { console.log('change preview name'); self.ui.name.text(e.value); })
                                .on('change:surname', function(e) { console.log('change preview surname'); self.ui.surname.text(e.value); })
                                .on('change:age', function(e) { console.log('change preview age'); self.ui.age.text(e.value); });
                        }
                    },

                    setVal: function(value) {
                        this.model.set(value);
                    },

                    ui: {
                        name: true,
                        surname: true,
                        age: true
                    }
                }));

    });
