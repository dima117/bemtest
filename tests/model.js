var lib = window.lib;

describe('model', function() {

    it('get должен возвращать то же самое, что и set', function() {
        var obj = new lib.model();
        obj.set('name', 'testname');
        expect(obj.get('name')).to.equal('testname');
    });

    it('при изменении данных должно генерироваться событие change', function() {
        var obj = new lib.model(),
            called = false;

        obj.on('change', function() {
            called = true;
        });

        expect(called).to.be.true;
    });
});
