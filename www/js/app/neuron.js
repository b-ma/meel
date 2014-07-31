//  Neuron
//      location    Vector
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

function Neuron(location) {
    this.location = location;
    this.connections = [];
    this.sum = 0;

    events.EventEmitter.call(this);
}

util.inherits(Neuron, events.EventEmitter);

_.extend(Neuron.prototype, {
    addConnection: function(connection) {
        this.connections.push(connection);
    },

    feedForward: function() {
        this.connections.forEach(function(connection) {
            if (this.sum < 1) { return; }
            connection.feedForward(this.sum);
            this.sum(0);
        }, this);
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
        ctx.translate(this.location.x, this.location.y);
        // ctx.arc(0, 0, 4, 0, Math.PI * 2, true);
        ctx.rect(-4, -1.5, 8, 3);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
});

module.exports = Neuron;
