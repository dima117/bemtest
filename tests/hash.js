var lib = window.lib;

describe('hash', function() {
    describe('getHashCode', function() {
        it('у одного объекта хэш одинаковый', function() {
            var obj = { a: 1, b: 2 };
            expect(lib.hash.getHashCode(obj)).to.equal(lib.hash.getHashCode(obj));
        });

        it('у числа и строки разный хэш', function() {
            expect(lib.hash.getHashCode(10)).to.not.equal(lib.hash.getHashCode('10'));
        });

        it('у bool и строки разный хэш', function() {
            expect(lib.hash.getHashCode(true)).to.not.equal(lib.hash.getHashCode('true'));
        });
    });
});
