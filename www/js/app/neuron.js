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
    this.outputs = [];
    this.sum = 0;
    this.color = (this.type !== 'input') ? '#000000' : '#ffffff';

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

    setOutput: function(output) {
        this.outputs.push(output);
    },

    feedForward: function(value) {
        this.sum += value;
        if (this.sum < 1) { return; }

        var connectionsLength = this.connections.length;
        for (var i = 0; i < connectionsLength; i++) {
            this.connections[i].feedForward(this.sum);
        }

        var outputsLength = this.outputs.length;
        for (var i = 0; i < outputsLength; i++) {
            this.outputs[i].feedForward(this.sum);
        }

        this.sum = 0;
    },

    update: function() {
        this.connections.forEach(function(connection) {
            connection.update();
        });
    },

    display: function(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.globalAlpha = this.sum;
        ctx.fillStyle = this.color;
        ctx.translate(this.position.x, this.position.y);
        ctx.rect(-3, -1.5, 6, 3);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    },

    displayConnectionsPaths: function(ctx) {
        var connectionsLength = this.connections.length;
        for (var i = 0; i < connectionsLength; i++) {
            this.connections[i].displayPath(ctx);
        }
    },

    displayConnectionsMessages: function(ctx) {
        var connectionsLength = this.connections.length;
        for (var i = 0; i < connectionsLength; i++) {
            this.connections[i].displayMessages(ctx);
        }
    }
});

module.exports = Neuron;
