// avoid console crash when logging inside requestAnimationFrame
console.logOnce = (function() {
    var logged = false;

    return function() {
        if (logged) return;
        console.log.apply(console, arguments);
        logged = true;
    }
}());