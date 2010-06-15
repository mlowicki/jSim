YAHOO.env.classMap = {"MoveAnim": "core", "jSim": "core", "Observer": "utils", "Utils": "utils", "Scene": "core", "LazyDecorator": "core", "Interface": "utils", "Mouse": "core", "Click": "core", "Typewriter": "core"};

YAHOO.env.resolveClass = function(className) {
    var a=className.split('.'), ns=YAHOO.env.classMap;

    for (var i=0; i<a.length; i=i+1) {
        if (ns[a[i]]) {
            ns = ns[a[i]];
        } else {
            return null;
        }
    }

    return ns;
};
