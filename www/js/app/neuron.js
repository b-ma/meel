//  Neuron
//      position    Vector
//      connections Array
//      sum         Int
//
//      // some display settings
//      addConnection
//          add a connection to the array
//      feedForward
//          trigger `feedForward` on each connections
//          pass `this.sum` as argument
//      update
//          trigger `update` on each connection
//      display
//          draw the neuron
//          draw connections

var util = require('util')
  , events = require('events')
  , _ = require('underscore')
;

var interfaces = {
    // key refers to neuron type
    input: {
        // select randomly into connections
        feedForward: function(value) {
            this.sum += value;

            var randomIndex = Math.floor(Math.random() * this.connections.length);

            // if (this.sum < 1) { return; }
            this.connections[randomIndex].feedForward(this.sum);
            this.sum = 0;
        }
    }
}


function Neuron(position, type) {
    this.position = position;
    this.type = type;
    this.connections = [];
    this.sum = 0;

    if (interfaces[type]) {
        var mixin = interfaces[type];
        for (var method in mixin) { this[method] = mixin[method]; }
    }

    events.EventEmitter.call(this);
}

util.inherits(Neuron, events.EventEmitter);

_.extend(Neuron.prototype, {
    addConnection: function(connection) {
        this.connections.push(connection);
    },

    feedForward: function(value) {
        this.sum += value;
        if (this.sum < 1) { return; }

        this.connections.forEach(function(connection) {
            connection.feedForward(this.sum);
        }, this);

        this.sum = 0;
    },

    update: function() {
        this.connections.forEach(function(connection) {
            connection.update();
        });
    },

    display: function(ctx) {
        // console.log('display neuron');
        // draw connections
        this.connections.forEach(function(connection) {
            connection.display(ctx);
        });

        if (!this.gradient) {
            // this.gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 4);
            // this.gradient.addColorStop(0, 'gray');
            // this.gradient.addColorStop(1, '#ffffff');
            this.gradient = '#ffffff';
        }

        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = this.gradient;
        ctx.globalAlpha = this.sum / 2 + 0.5;
        ctx.translate(this.position.x, this.position.y);
        // ctx.arc(0, 0, 4, 0, Math.PI * 2, true);
        ctx.rect(-4, -1.5, 8, 3);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
});

module.exports = Neuron;
