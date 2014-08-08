var events = require('events')
  , util = require('util')
  , _ = require('underscore')
  , Vector = require('vector')
  , helpers = require('../lib/canvas-helpers')
  , Ball = require('./ball')
;

function BallGenerator(position, frequency) {
    this.position = position;
    this.frequency = frequency;
    this.balls = [];

    events.EventEmitter.call(this);
}

util.inherits(BallGenerator, events.EventEmitter);

_.extend(BallGenerator.prototype, {
    feedForward: function(value) {
        var ball = new Ball(new Vector(0, 0), value);
        ball.on('bounce', this.emitBounce.bind(this));
        this.balls.push(ball);
    },

    emitBounce: function(strength, bounceCount) {
        var interval = this.frequency * (1 / 440);
        var frequency = this.frequency + bounceCount * (interval * 2 * Math.random() - interval);
        this.emit('bounce', frequency, strength, this.position);
    },

    update: function() {
        var deadBalls = [];
        // check dead balls
        this.balls.forEach(function(ball, i) {
            if (ball.isDead()) { return deadBalls.push(i); }
            ball.update();
        });

        deadBalls.forEach(function(index) {
            var ball = this.balls.splice(index, 1)[0];
            ball.removeAllListeners('bounce')
        }, this);
    },

    display: function(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        this.balls.forEach(function(ball) {
            ball.display(ctx);
        });
        /*
        ctx.beginPath();
        ctx.fillStyle = 'green';
        ctx.arc(0, 0, 8, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
        */
        ctx.restore();
    }
});

module.exports = BallGenerator;
