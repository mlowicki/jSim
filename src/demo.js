function runDemoScene() {
    // aliases
    var scene = jSim.Scene,
        mouse = new jSim.LazyDecorator({
            o: new jSim.Mouse,
            methods: ['center', 'click']
        }),
        text = new jSim.LazyDecorator({
            o: new jSim.Typewriter,
            methods: ['type']
        });

    var demo = scene({
        name: 'demo scene',
        actions: [
            mouse.center(),
            mouse.click({el: 'search'}),
            text.type({el: 'search', text: 'Poland'}),
            mouse.click({el: 'button1'})
        ]
    });
    demo.start();
}
