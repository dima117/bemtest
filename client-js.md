```
define('b-my-form', ['b-base-block'], function(baseBlock) {

  return baseBlock.extend({
  
    // ссылки на блоки по именам элемента
    elems: {
        name: 'input',
        surname: 'input',
        age: 'input'
    },

    // автообновление представления при изменении модели
    bind: {
        name: { type: 'val', field: 'name' },
        surname: { type: 'val', field: 'surname' },
        age: { type: 'val', field: 'age' },
    },
    
    // обработчики событий элементов
    events: {
      'change:name': function(e) {
          // ... какая-то логика
          this.model.set('name', e.value);
      },
      'change:surname': function(e) {
          // ... какая-то логика
          this.model.set('surname', e.value);
      },
      'change:age': function(e) {
          // ... какая-то логика
          this.model.set('age', e.value);
      }
    },

    initialize: function() {
      this.model = new Model(this.params); // можно делать автоматически в базовом блоке
      
      // альтернативная подписка на события при инициализации
      // this.listenTo(this.elems.name, 'change', );
    }
  });
});

```
