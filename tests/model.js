var lib = window.lib;

describe('model', function() {

    it('get должен возвращать то же самое, что и set', function() {
        var obj = new lib.model();
        obj.set('name', 'testname');
        expect(obj.get('name')).to.equal('testname');
    });

    describe('можно передавать', function() {
        it('хэш с массовым присвоением полей в сеттер', function() {
            var obj = new lib.model();

            obj.set({ a: 1, b: 2 });

            expect(obj.get('a')).to.equal(1);
            expect(obj.get('b')).to.equal(2);
        });
        it('хэш с массовым присвоением полей в конструктор', function() {
            var obj = new lib.model({ c: 3, d: 4 });

            expect(obj.get('c')).to.equal(3);
            expect(obj.get('d')).to.equal(4);
        });
    });

    it('при изменении любого поля генерируется change', function() {
        var callback = sinon.spy(),
            obj = new lib.model();

        obj.on('change', callback);

        obj.set('name', 123);

        expect(callback.called).to.be.true;
    });

    it('если не было изменения полей, то событие change не генерируется', function() {
        var callback = sinon.spy(),
            obj = new lib.model({ a: 1 });

        obj.on('change', callback);

        obj.set('a', 1);

        expect(callback.called).to.be.false;
    });

    it.skip('при изменении каждого поля генерируется change:field');
    it.skip('в change:field передается новое значение');
    it.skip('при массовом изменении change генерируется только один раз');
    it.skip('если новое значение объект, то набор ключей и их значений сохранятся');

    describe('если старое значение - объект', function() {
        it.skip('ключи, отсутствующие в новом значении, удалятся (с генерацией событий)');
        it.skip('новые ключи добавятся (с генерацией событий)');
        it.skip('значения в существующих ключах изменятся (с генерацией событий)');
        it.skip('одинаковые значения в существующих ключах не будут генерировать события');
    });
});
