// instead of Function because we want to have method also for Node.
Object.prototype.method = function(name, fn) {
    this.prototype[name] = fn;
    return this;
}


if(!Array.prototype.exists) {
    Array.method('exists', function(val) {
        for(var i=0, len=this.length; i < len; i++) {
            if(this[i] === val) return true;
        }
        return false;
    });
}

if(!Array.prototype.forEach) {
    Array.method('forEach', function(fn, thisObj) {
        var scope = thisObj || window;

        for(var i=0, len=this.length; i < len; i++) {
            fn.call(scope, this[i], i, this);
        }
    });
}

if(!Array.prototype.filter) {
    Array.method('filter', function(fn, thisObj) {
        var scope = thisObj || window;
        var a = [];

        for(var i=0, len=this.length; i < len; i++) {
            if(!fn.call(scope, this[i], i, this)) {
                continue;
            }
            a.push(this[i]);
        }

        return a;
    });
}

if(!String.prototype.toInt) {
    String.method('toInt', function() {
        return parseInt(this, 10);
    });
}

if(!String.prototype.toFloat) {
    String.method('toFloat', function() {
        return parseFloat(this);
    });
}

if(!Node.prototype.pos) {
    Node.method('pos', function() {
        var x = y = 0,
            el = this;

        if(el.offsetParent) {
            do {
                x += el.offsetLeft;
                y += el.offsetTop;
            } while(el = el.offsetParent)
        }

        return {x: x, y: y};
    });
}
