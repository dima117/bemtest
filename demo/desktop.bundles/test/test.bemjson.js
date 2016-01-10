({
    block: 'page',
    title: 'Hello, World!',
    styles: [
        { elem: 'css', url: '_test.css' }
    ],
    scripts: [
        { elem: 'js', url: '_test.js' }
    ],
    content: [
        {
            block: 'b-test-page',
            data: {
                name: 'Сергей',
                surname: 'Петров',
                age: 30
            }
        }
    ]
});
