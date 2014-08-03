var events = require('events')
  , util = require('util')
  , _ = require('underscore')
  , Vector = require('vector')
  , helpers = require('../lib/canvas-helpers')
;

var Ball = function(position, value) {
    this.position = position;
    this.strength = value;
    this.gravity = new Vector(0, 0.1);

    this.dead = false;
    this.lifeTime = 1;
    this.speed = new Vector(0, this.strength * 3 + 2);
    this.lastSpeed = new Vector(0, 0);
}

_.extend(Ball.prototype, {
    isDead: function() {
        return this.dead;
    },

    update: function() {
        if (this.position.y >= 0) {
            this.speed.multiply(-0.8);
        }

        this.speed.add(this.gravity);
        this.position.add(this.speed);

        if (this.position.y > 0) {
            this.position.y = 0;
        }

        // if (this.lastSpeed && Math.abs(this.lastSpeed.y - this.speed.y) < 0.05) {
        //     this.dead = true;
        // }
        this.lifeTime -= 0.005;
        if (this.lifeTime < 0) {
            this.dead = true;
        }

        this.lastSpeed = this.speed.clone();
    },

    display: function(ctx) {
        if (this.isDead()) { return; }

        ctx.save();
        ctx.beginPath();
        ctx.globalAlpha = this.lifeTime; // this.strength - 1;
        ctx.strokeStyle = '#454545';
        ctx.translate(this.position.x, this.position.y - 5);
        ctx.arc(0, 0, 3, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }
});

function BallGenerator(position) {
    this.position = position;
    this.balls = [];

    events.EventEmitter.call(this);
}

util.inherits(BallGenerator, events.EventEmitter);

_.extend(BallGenerator.prototype, {
    feedForward: function(value) {
        var ball = new Ball(new Vector(0, 0), value);
        this.balls.push(ball);
    },

    update: function() {
        var deadBalls = [];
        // check dead balls
        this.balls.forEach(function(ball, i) {
            if (ball.isDead()) { return deadBalls.push(i); }
            ball.update();
        });

        deadBalls.forEach(function(index) {
            this.balls.splice(index, 1);
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
