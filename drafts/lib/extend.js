var extend = function extend() {
    var args = Array.prototype.slice.call(arguments);
    var host = args.shift();
    var copy = args.shift();

    for (var i in copy) { host[i] = copy[i]; }
    args.unshift(host);

    if (args.length > 1) { return extend.apply(null, args) }
    return host;
}
