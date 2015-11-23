var lib = window.lib;

describe('object', function() {
    it('extended instance is instanceof XObject', function() {
        var myObj = lib.object.extend(),
            obj = new myObj();
        expect(obj).to.be.an.instanceof(lib.object);
    });

    it('при расширении добавляются свойства', function() {
        var myObj = lib.object.extend({ a: 1 }),
            obj = new myObj();
        expect(obj.a).to.equal(1);
    });

    it('при расширении остаются свойства родителя', function() {
        var myObj = lib.object.extend({ a: 2 }),
            myObj2 = myObj.extend(),
            obj = new myObj2();
        expect(obj.a).to.equal(2);
    });

    it('при расширении переопределяются свойства родителя', function() {
        var myObj = lib.object.extend({ a: 2 }),
            myObj2 = myObj.extend({ a: 3 }),
            obj = new myObj2();
        expect(obj.a).to.equal(3);
    });
});
