function runDemoScene() {
    // aliases
    var scene = jSim.Scene,
        mouse = new jSim.LazyDecorator({
            o: new jSim.Mouse,
            methods: ['center', 'click', 'drag']
        }),
        text = new jSim.LazyDecorator({
            o: new jSim.Typewriter,
            methods: ['type']
        });

    /*
    var demo = scene({
        name: 'demo scene',
        actions: [
            mouse.center(),
            mouse.click({el: 'search'}),
            text.type({el: 'search', text: 'Poland'}),
            mouse.click({el: 'button1'})
        ]
    });*/

    ddDemo = scene({
        name: 'drag&drop demo',
        actions: [
            mouse.center(),
            mouse.drag({el: 'dd', to: {x: 300, y: 200}}),
            mouse.drag({el: 'dd2', to: {x: 10, y: 10}})
        ]
    });
    ddDemo.onEnd({
        fn: function() {
            console.debug('drag&drop scene end.');
        }
    });
    ddDemo.start();

    //demo.start();
}
