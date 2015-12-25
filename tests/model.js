var lib = window.lib;

describe('model', function() {

    it('get должен возвращать то же самое, что и set', function() {
        var obj = new lib.model();
        obj.set('name', 'testname');
        expect(obj.get('name')).to.equal('testname');
    });

    describe('можно передавать', function() {
        it('хэш с массовым присвоением полей в set', function() {
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

    it('экземпляры модели не должны влиять друг на друга', function() {
        var obj1 = new lib.model(),
            obj2 = new lib.model();

        obj1.set('a', 123);
        obj2.set('a', 456);
        expect(obj1.get('a')).to.equal(123);
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

        expect(callback.notCalled).to.be.true;
    });

    it('при изменении каждого поля генерируется change:field', function() {
        var callbackA = sinon.spy(),
            callbackB = sinon.spy(),
            obj = new lib.model();

        obj.on('change:a', callbackA);
        obj.on('change:b', callbackB);

        obj.set({ a: 1, b: 2});

        expect(callbackA.calledOnce).to.be.true;
        expect(callbackB.calledOnce).to.be.true;
    });

    it('при массовом изменении change генерируется только один раз', function() {
        var callback = sinon.spy(),
            obj = new lib.model();

        obj.on('change', callback);

        obj.set({ a: 1, b: 2, c: 3});

        expect(callback.calledOnce).to.be.true;
    });

    it.skip('в change:field передается новое значение');

    it.skip('если новое значение объект, то набор ключей и их значений сохранятся');

    describe('если старое значение - объект', function() {
        it.skip('ключи, отсутствующие в новом значении, удалятся (с генерацией событий)');
        it.skip('новые ключи добавятся (с генерацией событий)');
        it.skip('значения в существующих ключах изменятся (с генерацией событий)');
        it.skip('одинаковые значения в существующих ключах не будут генерировать события');
    });
});
