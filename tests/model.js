var lib = window.lib;

describe('model', function() {
    it('должна корректно сохранять данные', function() {
        var obj = new lib.model();
        obj.set('name', 'testname');
        expect(obj.get('name')).to.equal('testname');
    });
});
