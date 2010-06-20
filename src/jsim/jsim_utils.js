/**
 * Utils.
 * @module utils
 */


/**
 * Utils namespace.
 * @class Utils
 * @static
 */
jSim.Utils = {};


/**
 * Observer system. Adding listeners to events and dispatching when event
 * occurs.
 * @class Observer
 * @constructor
 */
jSim.Utils.Observer = function() {
   this._items = [];
}

jSim.Utils.Observer.prototype = {
    /**
     * Add new item to the queue.
     * @method subscribe
     * @param  {Object} item
     */
    subscribe: function(item) {
        if(item === null) { // reset the queue
            this._items.length = 0;
            return;
        }
        this._items.push(item);
    },
    /**
     * Remove item from the queue.
     * TODO: Will this be used?
     * @method unsubscribe
     * @param {Object} item
     */
    unsubscribe: function(item) {
        this._items = this._items.filter(
            function(el) {
                if(el !== item) {
                    return el;
                }
            }
        );
    },
    /**
     * Invoke all callbacks from the queue.
     * @method fire
     */
    fire: function() {
        this._items.forEach(
            function(item) {
                item.fn.apply(item.scope, item.args);
            }
        );
    }
};


/**
 * Interface class.
 * @class Interface
 * @constructor
 * @param {String} name
 * @param {Array} methods
 */
jSim.Utils.Interface = function(name, methods) {
    if(arguments.length != 2) {
        throw new Error('Interface constructor called with '
            + arguments.length + 'arguments, but expected exactly 2.');
    }

    this._name = name;
    this._methods = [];

    for(var i = 0, len = methods.length; i < len; i++) {
        if(typeof methods[i] !== 'string') {
            throw new Error('Interface constructor expects method names to be '
                + 'passed in as a string.');
        }
        this._methods.push(methods[i]);
    }
};

/**
 * Check if object implements desired interfaces.
 * @method ensureImplements
 * @static
 * @param {Object} object
 */
jSim.Utils.Interface.ensureImplements = function(object) {
    if(arguments.length < 2) {
        throw new Error('Function Interface.ensureImplements called with '
            + arguments.length + 'arguments, but expected at least 2.');
    }

    for(var i = 1, len = arguments.length; i < len; i++) {
        var interface = arguments[i];
        
        if(interface.constructor !== jSim.Utils.Interface) {
            throw new Error('Function Interface.ensureImplements expects '
                + 'arguments two and above to be instances of Interface.');
        }

        for(var j = 0, mLen = interface._methods.length; j < mLen; j++) {
            var method = interface._methods[j];

            if(!object[method] || typeof object[method] !== 'function') {
                throw new Error('Function Interface.ensureImplements: object '
                  + 'does not implement the ' + interface._name
                  + ' interface. Method ' + method + ' was not found.');
            }
        }
    }
};

jSim.Action = new jSim.Utils.Interface('Action', ['onEnd', 'start', 'stop']);
jSim.LazyAction = new jSim.Utils.Interface('LazyAction',
                                        ['next', 'onEnd', 'start', 'stop']);
