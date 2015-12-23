var lib = window.lib;

describe('helpers', function() {

    describe('keys', function() {
        var keys = lib.helpers.keys;

        it('возвращает ключи объекта', function() {
            expect(keys({ a: 1, b: 2 })).to.eql(['a', 'b']);
        });

        it('возвращает ключи массива', function() {
            expect(keys(['q', 'w', 'e'])).to.eql(['0', '1', '2']);
        });

        it('возвращает номера индексов для символов строки', function() {
            expect(keys('qwert')).to.eql(['0', '1', '2', '3', '4']);
        });

        [2332, true, false, null, undefined].forEach(function(value) {
            it('возвращает пустой массив для ' + typeof value + '(' + value + ')', function() {
                expect(keys(value)).to.eql([]);
            });
        });
    });

    describe('uniqueId', function() {
        var uniqueId = lib.helpers.uniqueId;

        it('результат имеет тип string', function() {
            expect(uniqueId()).to.be.a('string');
        });

        it('результат двух вызовов отличается на 1', function() {
            expect(+uniqueId() + 1).to.eql(+uniqueId());
        });
    });
});
