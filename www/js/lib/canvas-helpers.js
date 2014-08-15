module.exports = {
    constrain: function(value, min, max) {
        if (value > max) { value = max; }
        if (value < min) { value = min; }
        return value;
    },

    // return a position on a bezier curve according to `t`
    // @param p0    Vector start point
    // @param p1    Vector control point 1
    // @param p2    Vector control point 2
    // @param p3    Vector end point
    // @param t     float between 0 and 1
    bezier: function(p0, p1, p2, p3, t) {
        var u = 1 - t;
        var tt = t * t;
        var uu = u * u;
        var ttt = tt * t;
        var uuu = uu * u;

        var p = p0.clone().multiply(uuu); //
        p.add(p1.clone().multiply(3 * uu * t));
        p.add(p2.clone().multiply(3 * u * tt));
        p.add(p3.clone().multiply(ttt));

        return p;
    }
}
