/**
 * Core functionality.
 * @module core
 */


/**
 * Global namespace.
 * @class jSim
 * @static
 */
jSim = {};


/**
 * Manage list of actions.
 * @class Scene
 * @constructor
 * @param {Object} cfg
 */
jSim.Scene = function(cfg) {
    if(this === window) return new jSim.Scene(cfg);

    this._name = cfg.name;
    this._components = [];
   
    // remember each action. 
    for(var i = 0, len = cfg.actions.length; i < len; i++) {
        var item = cfg.actions[i];
        // each action must implement LazyAction interface.
        jSim.Utils.Interface.ensureImplements(item, jSim.LazyAction);
        this._components.push(item);
    }

    this._onEnd = new jSim.Utils.Observer;
};

jSim.Scene.prototype = {
    /**
     * Subscribe for the end action event.
     * @method onEnd.
     * @param {Object} callback
     */
    onEnd: function(callback) {
        this._onEnd.subscribe(callback);
    },
    /**
     * Run actions from the particular index or 0 by default.
     * @method start
     * param {Number} index (optional)
     */
    start: function(index) {
        if(this._stop) { // resume action if it was stopped before.
            this._stop = false;
            this._curAction.start();
            return;
        }

        if(index === undefined) index=0;

        if(index > this._components.length-1 || index < 0)
            throw new Error('Scene.start: index must be greater than 0 and '
                + 'not greater than index of the last item in scene');

        this._components[index].onEnd(null); // remove all previous callbacks.
        if(index < this._components.length-1) {
            this._components[index].onEnd({
                fn: this.start,
                scope: this,
                args: [index+1]
            });
        }

        if(index === this._components.length - 1) { // last action
            var that = this;
            this._components[index].onEnd({
                fn: that._onEnd.fire,
                scope: that._onEnd
            });
         }

        this._curAction = this._components[index];
        this._components[index].next();
    },
    /**
     * Stop all actions for the scene.
     * @method stop
     */
    stop: function() {
        this._stop = true;
        this._curAction.stop();
    }
};


/**
 * Mouse manager.
 * @class Mouse
 * @constructor
 */
jSim.Mouse = function(cfg) { // implements Action.
    // create and position mouse cursor.
    this._x = 0;
    this._y = 0;
    this._el = document.createElement('div');
    this._el.className = 'jsim-mouse';
    this._el.style.top = this._y + 'px'
    this._el.style.left = this._x + 'px';
    document.body.appendChild(this._el);
    this._onEnd = new jSim.Utils.Observer;
};

jSim.Mouse.prototype = {
    /**
     * Default width of the cursor.
     * @property WIDTH
     * @type number
     * @default 16
     */
    WIDTH: 16,
    /**
     * Default height of the cursor.
     * @property HEIGHT
     * @type number
     * @default 16
     */
    HEIGHT: 16,
    /**
     * Default step (in pixels) during dragging.
     * @property DRAG_STEP
     * @type number
     * @default 10
     */
    DRAG_STEP: 10,
    /**
     * Default interval time during dragging.
     * @property DRAG_INTERVAL
     * @type number
     * @default 40
     */
    DRAG_INTERVAL: 40,
    /**
     * Return mouse node.
     * @method el
     * @return {HtmlElement}
     */
    el: function() {
        return this._el;
    },
    /**
     * Center the mouse cursor.
     * @method center
     */
    center: function() {
        this._el.style.left = Math.round(window.innerWidth/2 - this.WIDTH/2)
                                + 'px';
        this._el.style.top = Math.round(window.innerHeight/2 - this.HEIGHT/2)
                                + 'px';
        this._onEnd.fire();
        return this;
    },
    /**
     * Click on element.
     * @method click
     * @param {Object} cfg
     * @return {jSim.Mouse}
     */
    click: function(cfg) {
        if(typeof cfg.el === 'string') 
            cfg.el  = document.getElementById(cfg.el);

        var pos = cfg.el.pos();
        pos.x += cfg.el.offsetWidth / 2;
        pos.y += cfg.el.offsetHeight / 2;

        var move = new jSim.MoveAnim({
            el: this.el(),
            to: pos
        });

        var that = this;
        move.onEnd({
            fn: function() {
                var c = new jSim.Click({el: cfg.el});
                c.start();
                that._onEnd.fire();
            }
        });
        move.start();
        return this;
    },
    /**
     * Set/get position of the mouse cursor.
     * @method pos
     * @param {Object} o (optional)
     * @return {Object}
     */
    pos: function(o) {
        if(o) {
            this._el.style.top = o.y + 'px'
            this._el.style.left = o.x + 'px';
        }

        return {
            x: this._el.style.left.toInt(),
            y:  this._el.style.top.toInt()
        };
    },
    /**
     * Dispatch mouseup event.
     * TODO: screenX & screenY properties.
     * @method mouseup
     * @param {Object} cfg
     */
    mouseup: function(cfg) {
        // check required arguments.
        if(!(cfg.el instanceof Node)
            || typeof cfg.x !== 'number'
            || typeof cfg.y != 'number') {
            throw new Error('Mouse.mouseup: Three arguments are required - '
                +'Node and two coordinates');
        }

        var eventObject = document.createEvent('MouseEvents');
        eventObject.initMouseEvent('mouseup', true, true, window, 1, cfg.x,
                    cfg.y, cfg.x, cfg.y, false, false, false, false, 0, null);
        cfg.el.dispatchEvent(eventObject);
    },
    /**
     * Dispatch mousedown event.
     * TODO: screenX & screenY properties.
     * @method mousedown
     * @param {Object} cfg
     */
    mousedown: function(cfg) {
        // check required arguments.
        if(!(cfg.el instanceof Node)
            || typeof cfg.x !== 'number'
            || typeof cfg.y != 'number') {
            throw new Error('Mouse.mousedown: Three arguments are required - '
                + 'Node and two coordinates');
        }

        var eventObject = document.createEvent('MouseEvents');
        eventObject.initMouseEvent('mousedown', true, true, window, 1, cfg.x,
                    cfg.y, cfg.x, cfg.y, false, false, false, false, 0, null);
        cfg.el.dispatchEvent(eventObject);
    },
    /**
     * Dispatch mousemove event.
     * TODO: screenX & screenY properties.
     * @method mousemove
     * @param {Object} cfg
     */
    mousemove: function(cfg) {
        // check required arguments.
        if(!(cfg.el instanceof Node)
            || typeof cfg.x !== 'number'
            || typeof cfg.y != 'number') {
            throw new Error('Mouse.mousemove: Three arguments are required - '
                + 'Node and two coordinates');
        }

        var eventObject = document.createEvent('MouseEvents');
        eventObject.initMouseEvent('mousemove', true, true, window, 1, cfg.x,
                    cfg.y, cfg.x, cfg.y, false, false, false, false, 0, null);
        this.pos({ // move mouse pointer.
            x: cfg.x,
            y: cfg.y
        });

        cfg.el.dispatchEvent(eventObject);
    },
    /**
     * Resume the current action.
     * @method start
     */
    start: function() {
        this._curAction.start();
    },
    /**
     * Stop the current action.
     * @method stop
     */
    stop: function() {
        this._curAction.stop();
    },
    /**
     * Drag element to a specified coordinates.
     * TODO: handling stop not only in move animation.
     * @method drag
     * @param {Object} cfg
     */
    drag: function(cfg) {
        if(!cfg.el || !cfg.to)
            throw new Error('Mouse.drag: element and destination coordinates '
                + 'are required');

        if(typeof cfg.el === 'string')
            cfg.el  = document.getElementById(cfg.el);

        // move cursor to the center of the draggable element.
        var pos = cfg.el.pos();
        pos.x += cfg.el.offsetWidth / 2;
        pos.y += cfg.el.offsetHeight / 2;

        var moveAnim = new jSim.MoveAnim({
            el: this.el(),
            to: pos
        });
        this._curAction = moveAnim;

        var that = this,
            xDir = (pos.x < cfg.to.x) ? 1: -1,
            yDir = (pos.y < cfg.to.y) ? 1: -1,
            xDelta = Math.abs(pos.x - cfg.to.x),
            yDelta = Math.abs(pos.y - cfg.to.y);

        moveAnim.onEnd({
            fn: function() {
                that.mousedown({
                    el: cfg.el,
                    x: that.pos().x,
                    y: that.pos().y
                });

                var x = that.pos().x,
                    y = that.pos().y;

                that._moveInterval = setInterval(function() {
                    x += xDir * that.DRAG_STEP;
                    y += yDir * (that.DRAG_STEP / xDelta) * yDelta;

                    if((xDir == 1 && x > cfg.to.x)
                        || (xDir == -1 && x < cfg.to.x)) x = cfg.to.x;
                    if((yDir == 1 && y > cfg.to.y)
                        || (yDir == -1 && y < cfg.to.y)) y = cfg.to.y;

                    if(x == cfg.to.x && y == cfg.to.y) {
                        clearInterval(that._moveInterval);
                        that.mouseup({
                            el: cfg.el,
                            x: that.pos().x,
                            y: that.pos().y
                        });

                        that._onEnd.fire();
                        return;
                    }

                    that.mousemove({
                        el: cfg.el,
                        x: x,
                        y: y
                    });
                }, that.DRAG_INTERVAL);
            }
        });
        moveAnim.start();

        return this;
    },
    /**
     * Subscribe for the end action event.
     * @method onEnd.
     * @param {Object} callback
     */
    onEnd: function(callback) {
        this._onEnd.subscribe(callback);
    }
};


/**
 * Move animation.
 * @class MoveAnim
 * @constructor
 * @param {Object} cfg
 */
jSim.MoveAnim = function(cfg) { // implements Action.
    if(!cfg.el) throw new Error('jSim.MoveAnim: node is required');
    if(!cfg.to) throw new Error(
                        'jSim.MoveAnim: destination coordinates are required');
    
    this._el = cfg.el;
    this._startX = this._el.style.left.toInt();
    this._startY = this._el.style.top.toInt();
    this._endX = cfg.to.x;
    this._endY = cfg.to.y;

    this._signX = 1;
    this._signY = 1;

    this._deltaX = this._endX - this._startX;
    if(this._deltaX < 0) {
        this._deltaX *= -1;
        this._signX = -1;
    }

    this._deltaY = this._endY - this._startY;
    if(this._deltaY < 0) {
        this._deltaY *= -1;
        this._signY = -1;
    }

    this._onEnd = new jSim.Utils.Observer;
};

jSim.MoveAnim.prototype = {
    /**
     * Default step (px).
     * @property STEP
     * @type number
     */
    STEP: 4,
    /**
     * Default interval time (millisecond).
     * @property INTERVAL_TIME
     * @type number
     */
    INTERVAL_TIME: 20,
    /**
     * Start the animation.
     * @method start
     */
    start: function() {
        var ratio = this.STEP / this._deltaX,
            that = this;

        this._interval = setInterval(function() {
            var newX = that._el.style.left.toFloat() + that.STEP * that._signX,
                newY = that._el.style.top.toFloat()
                                + (that._deltaY * ratio) * that._signY;

            if(that._signX == 1 && newX > that._endX) newX = that._endX;
            else if(that._signX == -1 && newX < that._endX) newX = that._endX;

            if(that._signY == 1 && newY > that._endY) newY = that._endY;
            else if(that._signY == -1 && newY < that._endY) newY = that._endY;

            that._el.style.left = newX + 'px';
            that._el.style.top = newY + 'px';

            if(newX == that._endX && newY == that._endY) {
                clearInterval(that._interval);
                that._onEnd.fire()
            }
        }, this.INTERVAL_TIME);
    },
    /**
     * Stop the animation.
     * @method stop
     */
    stop: function() {
        clearInterval(this._interval);
    },
    /**
     * Subscribe for the end event.
     * @method onEnd.
     * @param {Object} callback
     */
    onEnd: function(callback) {
        this._onEnd.subscribe(callback);
    }
};


/**
 * Class for handling mouse clicks.
 * @class Click
 * @constructor
 * @param {Object} cfg
 */
jSim.Click = function(cfg) {
    if(!cfg.el) throw new Error('el node is required');

    if(typeof cfg.el === 'string') cfg.el = document.getElementById(cfg.el);

    this._el = cfg.el;
    this._onEnd = new jSim.Utils.Observer;
};

jSim.Click.prototype = {
    /**
     * Invoke mouse click event.
     * @method start
     */
    start: function() {
        // https://developer.mozilla.org/en/DOM/event.initMouseEvent
        var eventObject = document.createEvent('MouseEvents');
        eventObject.initMouseEvent('click',
            true,
            true,
            window,
            1,
            0,
            0,
            0,
            0,
            false,
            false,
            false,
            false,
            0,
            null
        );
        this._el.dispatchEvent(eventObject);
        this._el.focus(); // TODO
    },
    /**
     * Stop mouse click event. Method does nothing but is necessary for Action
     * interface. 
     * @method stop
     */
    stop: function() {
        // do nothing.
    },
    /**
     * Add callback for end event.
     * @method onEnd
     * @param {Object} item
     */
    onEnd: function(item) {
        this._onEnd.subscribe(item);
    }
};


/**
 * Typewriter.
 * @class Typewriter
 * @constructor
 */
jSim.Typewriter = function() {
    this._onEnd = new jSim.Utils.Observer;
};

jSim.Typewriter.prototype = {
    /**
     * Stop typing.
     * @method stop
     */
    stop: function() {
        clearInterval(this._interval);
        this._onEnd.fire();
    },
    /**
     * Start typing.
     * @method type
     * @param {Object} cfg
     */
    type: function(cfg) {
        if(!cfg.el) throw new Error('Node el is required');
        if(!cfg.text) throw new Error('Text is required');

        if(typeof cfg.el === 'string')
            cfg.el = document.getElementById(cfg.el);

        var el = cfg.el,
            text = cfg.text,
            typeInterval = cfg.typeInterval || 300,
            i = 0,
            that = this;

        el.focus();

        this._interval = setInterval(function() {

            if(i > text.length-1) {
                that.stop();
                return;
            }
            var eventObject = document.createEvent('KeyboardEvent');
            eventObject.initKeyEvent('keydown',
                true,
                true,
                window,
                false,
                false,
                false,
                false,
                0,
                text[i].charCodeAt(0)
            );
            el.dispatchEvent(eventObject);

            eventObject = document.createEvent('KeyboardEvent');
            eventObject.initKeyEvent('keypress',
                true,
                true,
                window,
                false,
                false,
                false,
                false,
                0,
                text[i].charCodeAt(0)
            );
            el.dispatchEvent(eventObject);

            eventObject = document.createEvent('KeyboardEvent');
            eventObject.initKeyEvent('keyup',
                true,
                true,
                window,
                false,
                false,
                false,
                false,
                0,
                text[i++].charCodeAt(0)
            );
            el.dispatchEvent(eventObject);
        }, typeInterval);
    },
    /**
     * Add callback for end event.
     * @method onEnd
     * @param {Object} item
     */
    onEnd: function(callback) {
        this._onEnd.subscribe(callback);
    }
};


/**
 * Save all method calls in queue and run next one from the queue in the next
 * method. It's used to modify object implementing Action interface to
 * object implementing LazyAction interface. It's used in scene objects.
 * @class LazyDecorator
 * @constructor
 * @param {Object} cfg;
 */
jSim.LazyDecorator = function(cfg) {
    this._item = cfg.o;
    this._methods = cfg.methods;
    this._queue = [];

    var item = this._item;
    for(var key in item) {
        if(typeof item[key] === 'function') {
            var that = this;

            if(this._methods.exists(key)) {
                (function(key) {
                    that[key] = function() {
                        that._queue.push({
                            fn: item[key],
                            scope: item,
                            args: arguments
                        });
                        return that; // fix chaining.
                    };
                }(key));
            } else {
                (function(key) {
                    that[key] = function() {
                        item[key].apply(item, arguments);
                        return that; // fix chaining
                    };
                }(key));
            }
        }
    }
};

jSim.LazyDecorator.prototype = {
    /**
     * Run next method from the queue.
     * @method next
     */
    next: function() {
        var o = this._queue.shift();
        
        if(o === undefined)
            throw new Error('No more calls in the queue');

        o.fn.apply(o.scope, o.args);
    }
};
