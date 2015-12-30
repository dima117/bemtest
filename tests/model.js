var lib = window.lib;

describe('model', function() {

    describe('установка и получение значений', function() {

        it('get возвращает undefined для несуществующего ключа', function() {
            var obj = new lib.model();
            expect(obj.get('name')).to.equal(undefined);
        });

        it('get должен возвращать то же самое, что и set', function() {
            var obj = new lib.model();
            obj.set('name', 'testname');
            expect(obj.get('name')).to.equal('testname');
        });

        it('можно передавать хэш с массовым присвоением полей в set', function() {
            var obj = new lib.model();

            obj.set({ a: 1, b: 2 });

            expect(obj.get('a')).to.equal(1);
            expect(obj.get('b')).to.equal(2);
        });

        it('можно передавать хэш с массовым присвоением полей в конструктор', function() {
            var obj = new lib.model({ c: 3, d: 4 });

            expect(obj.get('c')).to.equal(3);
            expect(obj.get('d')).to.equal(4);
        });

        it('экземпляры модели не должны влиять друг на друга', function() {
            var obj1 = new lib.model(),
                obj2 = new lib.model();

            obj1.set('a', 123);
            obj2.set('a', 456);
            expect(obj1.get('a')).to.equal(123);
        });

    });

    describe('вспомогательные методы', function() {
        it('метод keys возвращает пустой массив для пустой модели', function() {
            var obj = new lib.model();

            expect(obj.keys()).to.eql([]);
        });

        it('метод keys возвращает список полей', function() {
            var obj = new lib.model({ a: 1, b: 2});

            expect(obj.keys()).to.eql(['a', 'b']);
        });

        it('метод deleteKey удаляет ключ', function() {
            var obj = new lib.model({ a: 1, b: 2 });
            obj.deleteKey('b')

            expect(obj.keys()).to.eql(['a']);
        });

        it('при удалении поля генерируется событие change:field', function() {
            var obj = new lib.model({ a: 1, b: 2 }),
                callback = sinon.spy();

            obj.on('change:b', callback);

            obj.deleteKey('b')
            expect(callback.calledOnce).to.be.true;
        });

        it('при удалении поля генерируется событие change', function() {
            var obj = new lib.model({ a: 1, b: 2 }),
                callback = sinon.spy();

            obj.on('change', callback);

            obj.deleteKey('b')
            expect(callback.calledOnce).to.be.true;
        });

        it('метод hasKey возвращает true для существующего ключа', function() {
            var obj = new lib.model({ a: 1 });

            expect(obj.hasKey('a')).to.be.true;
        });

        it('метод hasKey возвращает false для несуществующего ключа', function() {
            var obj = new lib.model({ a: 1 });

            expect(obj.hasKey('b')).to.be.false;
        });

        it('метод hasKey возвращает false для удаленного ключа', function() {
            var obj = new lib.model({ a: 1, b: 2 });

            obj.deleteKey('b')

            expect(obj.hasKey('b')).to.be.false;
        });
    });

    describe('события', function() {

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

        it('если значение поля не изменилось, то событие change:field не генерируется', function() {
            var callback = sinon.spy(),
                obj = new lib.model({ a: 1 });

            obj.on('change:a', callback);

            obj.set('a', 1 );

            expect(callback.called).to.be.false;
        });

        it('в change:field передается новое значение', function() {
            var callback = sinon.spy(),
                obj = new lib.model(),
                arg;

                obj.on('change:a', callback);

                obj.set('a', 21 );

                arg = callback.getCall(0).args[0]
                expect(arg.name).to.equal('a');
                expect(arg.value).to.equal(21);
        });

        it('при изменении любого поля генерируется change', function() {
            var callback = sinon.spy(),
                obj = new lib.model();

            obj.on('change', callback);

            obj.set('name', 123);

            expect(callback.called).to.be.true;
        });

        it('при массовом изменении change генерируется только один раз', function() {
            var callback = sinon.spy(),
                obj = new lib.model();

            obj.on('change', callback);

            obj.set({ a: 1, b: 2, c: 3});

            expect(callback.calledOnce).to.be.true;
        });

        it('если не было изменения полей, то событие change не генерируется', function() {
            var callback = sinon.spy(),
                obj = new lib.model({ a: 1 });

            obj.on('change', callback);

            obj.set('a', 1);

            expect(callback.notCalled).to.be.true;
        });
    });

    describe('вложенные модели (присваиваем объект)', function() {

        describe('если в поле хранилось простое значение или ничего не было', function() {
            it('если новое значение - объект, то в поле сохраняется модель', function() {
                var obj = new lib.model();

                obj.set('a', {});

                expect(obj.get('a')).to.be.an.instanceof(lib.model);
            });

            it('корректный набор полей у вложенной модели', function() {
                var obj = new lib.model();

                obj.set('a', { x: 1, y: 2 });

                expect(obj.get('a').keys()).to.eql(['x', 'y']);
            });

            it('корректно сохраняются поля объекта во вложенной модели', function() {
                var obj = new lib.model();

                obj.set('a', { x: 1, y: 2 });

                expect(obj.get('a').get('x')).to.equal(1);
                expect(obj.get('a').get('y')).to.equal(2);
            });
        });

        describe('если в поле хранилась модель', function() {
            it('после вызова set там хранится она же', function() {
                var obj = new lib.model({ a: { x: 1, y: 2 }}),
                    original = obj.get('a');

                obj.set('a', { z: 3 });
                expect(obj.get('a')).to.equal(original);
            });

            it('набор ключей соответствует присвоенному объекту', function() {
                var obj = new lib.model({ a: { x: 1, y: 2 }});

                obj.set('a', { y: 4, z: 3 });
                expect(obj.get('a').keys()).to.eql(['y', 'z']);
            });

            it('сохраняются значения полей присвоенного объекта', function() {
                var obj = new lib.model({ a: { x: 1, y: 2 }});

                obj.set('a', { y: 4, z: 3 });
                expect(obj.get('a').get('y')).to.equal(4);
                expect(obj.get('a').get('z')).to.equal(3);
            });

            it('у вложенной модели генерируется change:field для каждого поля', function() {
                var callbackX = sinon.spy(),
                    callbackY = sinon.spy(),
                    callbackZ = sinon.spy(),
                    obj = new lib.model({ a: { x: 1, y: 2 }}),
                    inner = obj.get('a');

                inner.on('change:x', callbackX);
                inner.on('change:y', callbackY);
                inner.on('change:z', callbackZ);

                obj.set('a', { y: 4, z: 3 });

                expect(callbackX.calledOnce, 'x').to.be.true;
                expect(callbackY.calledOnce, 'y').to.be.true;
                expect(callbackZ.calledOnce, 'z').to.be.true;
            });
        });
    });

    describe('если старое значение - объект', function() {
        it.skip('ключи, отсутствующие в новом значении, удалятся (с генерацией событий)');
        it.skip('новые ключи добавятся (с генерацией событий)');
        it.skip('значения в существующих ключах изменятся (с генерацией событий)');
        it.skip('одинаковые значения в существующих ключах не будут генерировать события');
    });
});
