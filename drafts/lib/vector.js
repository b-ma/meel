// 2d vectors
var Vector = function(x, y) {
    this.x = !isNaN(x) ? x : 0;
    this.y = !isNaN(y) ? y : 0;
};

// static
Vector.add = function(v1, v2) {
    return new this(v1.x + v2.x, v1.y + v2.y);
};

Vector.substract = function(v1, v2) {
    return new this(v1.x - v2.x, v1.y - v2.y);
};

Vector.multiply = function(v1, v2) {
    return new this(v1.x * v2.x, v1.y * v2.y);
};

Vector.distance = function(v1, v2) {
    var v = this.substract(v2, v1);
    // console.log(v);
    return v.magnitude();
};

Vector.clone = function(v) {
    return new this(v.x, v.y);
};

extend(Vector.prototype, {
    add: function(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    },

    substract: function(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    },

    multiply: function(value) {
        this.x *= value;
        this.y *= value;
        return this;
    },

    divide: function(value) {
        return this.multiply(1/value);
    },

    truncate: function(value) {
        if (this.magnitude() > value) {
            this.normalize(value);
        }
        return this;
    },

    normalize: function(multiplier) {
        var multiplier = multiplier ? multiplier : 1;
        var mag = this.magnitude();
        if (mag === 0) { return this; }

        this.x = (this.x / mag);
        this.y = (this.y / mag);
        this.multiply(multiplier);
        return this;
    },

    rotate: function(theta) {
        var finalTheta = this.direction() + theta;
        this.setAngle(finalTheta);
    },

    setAngle: function(theta) {
        var magnitude = this.magnitude();
        this.normalize();
        this.x = Math.cos(theta);
        this.y = Math.sin(theta);
        this.multiply(magnitude);
        return this;
    },

    magnitude: function() {
        var hyp = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        return Math.abs(hyp);
    },

    direction: function() {
        // cf. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
        return Math.atan2(this.y, this.x);
    },

    clone: function() {
        return new this.constructor(this.x, this.y);
    }
});







