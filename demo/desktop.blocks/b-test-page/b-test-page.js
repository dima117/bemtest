modules.define(
    'b-test-page', ['i-bem__dom'], function(provide, BEMDOM) {

        provide(
            BEMDOM.decl(
                this.name, {
                    onSetMod: {
                        js: function() {

                            var self = this;

                            this.ui = {
                                form: this.findBlockOn('form', 'b-test-form'),
                                preview: this.findBlockOn('preview', 'b-test-preview')
                            };

                            this.model = new lib.model(this.params);

                            this.model.on('change', function() {
                                self.ui.form.setVal(self.model);
                                self.ui.preview.setVal(self.model);
                            });

                            this.ui.form.on('change', function(e, data) {
                                self.model.set(data);
                            });
                        }
                    }
                }));

    });
