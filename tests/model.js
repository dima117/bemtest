var lib = window.lib;

describe.skip('model', function() {

    describe('установка и получение значений', function() {

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

            obj.deleteKey('b');
            expect(callback.calledOnce).to.be.true;
        });

        it('при удалении поля в обработчик change:field передается новое значение undefined', function() {
            var obj = new lib.model({ a: 1, b: 2 }),
                callback = sinon.spy();

            obj.on('change:b', callback);

            obj.deleteKey('b');

            arg = callback.getCall(0).args[0]
            expect(arg.name).to.equal('b');
            expect(arg.value).to.equal(undefined);
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



        it('метод hasKey возвращает false для удаленного ключа', function() {
            var obj = new lib.model({ a: 1, b: 2 });

            obj.deleteKey('b')

            expect(obj.hasKey('b')).to.be.false;
        });

        it ('результат метода getHashSourceString не зависит от порядка присваивания полей', function() {
            var obj = new lib.model({ a: 1, b: 2, c: 3}),
                obj2 = new lib.model({ c: 3, a: 1 });

            obj2.set('b', 2);

            expect(obj.getHashSourceString()).to.equal(obj2.getHashSourceString());
        });

        it ('getHashSourceString экранирует названия', function() {
            var obj = new lib.model();

            obj.set('Фыв"as d\'!', 2);

            expect(obj.getHashSourceString()).to.equal('%D0%A4%D1%8B%D0%B2%22as%20d\'!=370cabd5');
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

        it('если значение поля не изменилось (присвоили то же самое), то событие change:field не генерируется', function() {
            var callback = sinon.spy(),
                obj = new lib.model({ a: 1 });

            obj.on('change:a', callback);

            obj.set('a', 1 );

            expect(callback.called).to.be.false;
        });

        it('если значение поля не изменилось (не присваивали значение поля), то событие change:field не генерируется', function() {
            var callback = sinon.spy(),
                obj = new lib.model({ a: 1 });

            obj.on('change:a', callback);

            obj.set('b', 1 );

            expect(callback.called).to.be.false;
        });

        it('в change:field передается новое значение', function() {
            var callback = sinon.spy(),
                obj = new lib.model();

            obj.on('change:a', callback);

            obj.set('a', 21 );

            expect(callback.getCall(0).args[0]).to.eql({ name: 'a', value: 21 });
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

    describe('мерж моделей (присваиваем модель)', function() {

        it('набор ключей соответствует присвоенному объекту', function() {
            var obj = new lib.model({ x: 1, y: 2 }),
                obj2 = new lib.model({ y: 4, z: 3 });

            obj.set(obj2);
            expect(obj.keys()).to.eql(['y', 'z']);
        });

        it('сохраняются значения полей присвоенного объекта', function() {
            var obj = new lib.model({ x: 1, y: 2 }),
                obj2 = new lib.model({ y: 4, z: 3 });

            obj.set(obj2);
            expect(obj.get('y')).to.equal(4);
            expect(obj.get('z')).to.equal(3);
        });

        it('генерируется change:field для каждого удаленного поля', function() {
            var obj = new lib.model({ x: 1, y: 2 }),
                obj2 = new lib.model({ y: 5 }),
                callback = sinon.spy();

            obj.on('change:x', callback);

            obj.set(obj2);

            expect(callback.calledOnce).to.be.true;
            expect(callback.getCall(0).args[0]).to.eql({ name: 'x', value: undefined });
        });

        it('генерируется change:field для каждого добавленного поля', function() {
            var obj = new lib.model(),
                obj2 = new lib.model({ a: 5 }),
                callback = sinon.spy();

            obj.on('change:a', callback);

            obj.set(obj2);

            expect(callback.calledOnce).to.be.true;
            expect(callback.getCall(0).args[0]).to.eql({ name: 'a', value: 5 });
        });

        it('генерируется change:field для каждого измененного поля', function() {
            var obj = new lib.model({ a: 1 }),
                obj2 = new lib.model({ a: 7 }),
                callback = sinon.spy();

            obj.on('change:a', callback);

            obj.set(obj2);

            expect(callback.calledOnce).to.be.true;
            expect(callback.getCall(0).args[0]).to.eql({ name: 'a', value: 7 });
        });

        it('если нет изменений, то change:field не генерируется', function() {
            var obj = new lib.model({ a: 1 }),
                obj2 = new lib.model({ a: 1 }),
                callback = sinon.spy();

            obj.on('change:a', callback);

            obj.set(obj2);

            expect(callback.called).to.be.false;
        });

        it ('при изменении нескольких полей событие change генерируется только один раз', function() {
            var obj = new lib.model({ a: 1, b: 2 }),
                obj2 = new lib.model({ b: 3, c: 4 }),
                callback = sinon.spy();

            obj.on('change', callback);

            obj.set(obj2);

            expect(callback.calledOnce).to.be.true;
        });

        it ('если данные не изменились, то событие change не генерируется', function() {
            var obj = new lib.model({ a: 1, b: 2 }),
                obj2 = new lib.model({ a: 1, b: 2 }),
                callback = sinon.spy();

            obj.on('change', callback);

            obj.set(obj2);

            expect(callback.called).to.be.false;
        });
    });

    describe('вложенные модели (присваиваем объект)', function() {

        describe('если в поле хранилось простое значение или ничего не было', function() {
            it('если новое значение - объект, то в поле сохраняется модель', function() {
                var obj = new lib.model();

                obj.set('a', {});

                expect(obj.get('a')).to.be.an.instanceof(lib.model);
            });

            it('если новое значение - модель, то в поле сохраняется новая модель', function() {
                var obj = new lib.model(),
                    obj2 = new lib.model({ x: 2 });

                obj.set('a', obj2);

                expect(obj.get('a')).to.not.equal(obj2);
                expect(obj.get('a').get('x')).to.equal(2);
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

            it('у хранящейся в поле модели вызывается set с моделью присваемового объекта', function() {
                var obj = new lib.model({ a: {}}),
                    inner = obj.get('a'),
                    spy = sinon.spy(inner, 'set'),
                    arg;

                obj.set('a', { x: 1, y: 2});

                expect(spy.calledOnce).to.be.true;

                arg = spy.getCall(0).args[0];
                expect(arg.get('x')).to.equal(1);
                expect(arg.get('y')).to.equal(2);
            });

            it('если вложенная модель изменилась, то генерируется change:field', function() {
                var obj = new lib.model({ a: { x: 1 }}),
                    inner = obj.get('a'),
                    callback = sinon.spy(),
                    arg;

                obj.on('change:a', callback);

                obj.set('a', { x: 2 });
                expect(callback.calledOnce).to.be.true;

                arg = callback.getCall(0).args[0];
                expect(arg.name).to.equal('a');
                expect(arg.value).to.equal(inner);
            });

            it('если вложенная модель изменилась, то генерируется change', function() {
                var obj = new lib.model({ a: { x: 1 }}),
                    callback = sinon.spy();

                obj.on('change', callback);

                obj.set('a', { x: 2 });
                expect(callback.calledOnce).to.be.true;
            });

            it('если вложенная модель не изменилась, то не генерируется change:field', function() {
                var obj = new lib.model({ a: { x: 1 }})
                    callback = sinon.spy();

                obj.on('change:a', callback);

                obj.set('a', { x: 1 });
                expect(callback.calledOnce).to.be.false;
            });

            it('если вложенная модель не изменилась, то не генерируется change', function() {
                var obj = new lib.model({ a: { x: 1 }})
                    callback = sinon.spy();

                obj.on('change', callback);

                obj.set('a', { x: 1 });
                expect(callback.calledOnce).to.be.false;
            });
        });

        describe('изменение вложенных моделей', function() {

            describe('если вложенная модель изменилась', function() {

                it('генерируется change:field', function() {
                    var obj = new lib.model( { a: { x: 1 }}),
                        callback = sinon.spy();

                    obj.on('change:a', callback);

                    obj.get('a').set({ x: 2 });

                    expect(callback.calledOnce).to.be.true;
                    expect(callback.getCall(0).args[0].value).to.equal(obj.get('a'));
                });

                it('генерируется change', function() {
                    var obj = new lib.model( { a: { x: 1 }}),
                        callback = sinon.spy();

                    obj.on('change', callback);

                    obj.get('a').set({ x: 2 });

                    expect(callback.calledOnce).to.be.true;
                });
            });

            describe('если модель больше не является вложенной (присвоили в поле другое значение)', function() {

                it('изменения не генерируют событие change:field в родительской модели', function() {
                    var obj = new lib.model({ a: { x: 1}}),
                        inner = obj.get('a'),
                        callback = sinon.spy();

                    obj.set('a', 21);

                    obj.on('change:a', callback);
                    inner.set('x', 3);
                    expect(callback.called).to.be.false;
                });

                it('изменения не генерируют событие change в родительской модели', function() {
                    var obj = new lib.model({ a: { x: 1}}),
                        inner = obj.get('a'),
                        callback = sinon.spy();

                    obj.set('a', 21);

                    obj.on('change', callback);
                    inner.set('x', 3);
                    expect(callback.called).to.be.false;
                });
            });

            describe('если модель больше не является вложенной (удалили поле)', function() {

                it('изменения не генерируют событие change:field в родительской модели', function() {
                    var obj = new lib.model({ a: { x: 1}}),
                        inner = obj.get('a'),
                        callback = sinon.spy();

                    obj.deleteKey('a');

                    obj.on('change:a', callback);
                    inner.set('x', 3);
                    expect(callback.called).to.be.false;
                });

                it('изменения не генерируют событие change в родительской модели', function() {
                    var obj = new lib.model({ a: { x: 1}}),
                        inner = obj.get('a'),
                        callback = sinon.spy();

                    obj.deleteKey('a');

                    obj.on('change', callback);
                    inner.set('x', 3);
                    expect(callback.called).to.be.false;
                });
            });
        });
    });

    describe('toJSON', function() {
        it('поля и значения объекта соответствуют полям модели', function() {
            var obj = new lib.model({ a: 1, b: '2', c: null, d: undefined });

            expect(obj.toJSON()).to.eql({ a: 1, b: '2', c: null, d: undefined });
        });

        it('вложенная модель становится объектом', function() {
            var obj = new lib.model({ a: { b: 1, c: 2 }});

            expect(obj.toJSON()).to.eql({ a: { b: 1, c: 2 }});
        });
    });
});

describe('model2', function() {

    describe('состояние модели', function() {

        describe('начальное состояние', function() {
            it('get возвращает undefined для несуществующего ключа', function() {
                var obj = new lib.model();
                expect(obj.get('xxx')).to.equal(undefined);
            });

            it('метод keys должен возвращать пустой массив для пустой модели', function() {
                var obj = new lib.model();
                expect(obj.keys()).to.eql([]);
            });

            it('метод hasKey возвращает false для несуществующего ключа', function() {
                var obj = new lib.model();
                expect(obj.hasKey('weghr')).to.be.false;
            });

            it('метод toJSON возвращает пустой объект, если нет данных', function() {
                var obj = new lib.model();
                expect(obj.toJSON()).to.eql({});
            });
        });

        describe('инициализация в конструкторе', function() {
            describe('передаем объект', function() {
                it('get возвращает переданное значение для существующего ключа', function() {
                    var obj = new lib.model({ a: 12 });
                    expect(obj.get('a')).to.equal(12);
                });

                it('get возвращает undefined для несуществующего ключа', function() {
                    var obj = new lib.model({ b: 22 });
                    expect(obj.get('c')).to.equal(undefined);
                });

                it('метод keys должен возвращать массив ключей', function() {
                    var obj = new lib.model({ e: 24, d: 'test' });
                    expect(obj.keys()).to.eql(['e', 'd']);
                });

                it('метод hasKey возвращает true для существующего ключа', function() {
                    var obj = new lib.model({ f: 23 });
                    expect(obj.hasKey('f')).to.be.true;
                });

                it('метод hasKey возвращает false для несуществующего ключа', function() {
                    var obj = new lib.model({ g: 25 });
                    expect(obj.hasKey('h')).to.be.false;
                });

                it('метод toJSON возвращает объект с переданными данными', function() {
                    var obj = new lib.model({ h: 32, j: 'dog' });
                    expect(obj.toJSON()).to.eql({ h: 32, j: 'dog' });
                });
            });

            describe('передаем модель', function() {
                it('get возвращает переданное значение для существующего ключа', function() {
                    var data = new lib.model({ b: 13 }),
                        obj = new lib.model(data);
                    expect(obj.get('b')).to.equal(13);
                });

                it('get возвращает undefined для несуществующего ключа', function() {
                    var data = new lib.model({ b: 26 }),
                        obj = new lib.model(data);
                    expect(obj.get('c')).to.equal(undefined);
                });

                it('метод keys должен возвращать массив ключей', function() {
                    var data = new lib.model({ e: 24, d: 'test' }),
                        obj = new lib.model(data);

                    expect(obj.keys()).to.eql(['e', 'd']);
                });

                it('метод hasKey возвращает true для существующего ключа', function() {
                    var data = new lib.model({ f: 23 }),
                        obj = new lib.model(data);

                    expect(obj.hasKey('f')).to.be.true;
                });

                it('метод hasKey возвращает false для несуществующего ключа', function() {
                    var data = new lib.model({ g: 25 }),
                        obj = new lib.model(data);

                    expect(obj.hasKey('h')).to.be.false;
                });

                it('метод toJSON возвращает объект с переданными данными', function() {
                    var data = new lib.model({ h: 32, j: 'dog' }),
                        obj = new lib.model(data);

                    expect(obj.toJSON()).to.eql({ h: 32, j: 'dog' });
                });
            });
        });

        describe('присваивание (замена)', function() {
            describe('передаем модель', function() {
                describe('состав полей', function() {
                    it('новые поля добавляются', function() {
                        var model = new lib.model();
                        model.set({ k: 123 });
                        expect(model.hasKey('k')).to.be.true;
                    });

                    it('существующие поля остаются', function() {
                        var model = new lib.model({ l: 324 });
                        model.set({ l: 123 });
                        expect(model.hasKey('l')).to.be.true;
                    });

                    it('отсутствующие поля удаляются', function() {
                        var model = new lib.model({ m: 78 });
                        model.set({ n: 'aaa' });
                        expect(model.hasKey('m')).to.be.false;
                    });
                });
            });

        });
        //- проверка состава полей, проверка значений полей



        // empty/set(obj)/set(model/set(field/value)/set(field/obj)/set(field/model))
        // get/keys/hasKey/toJson

        // рекурсивный toJSON
        // проверить, что объект/модель раскладываются по полям, а при установке поля объект превращается в модель
        // проверить, что при объект превращается в новую модель или присваивается в существующую
        // модели не влияют друг на друга
        // сортировка массива ключей в порядке присвоения

    });

    describe('генерация событий', function() {

    });
});
