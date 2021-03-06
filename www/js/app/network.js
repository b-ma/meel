//  Network
//      position Vector
//      neurons  Array
//      addNeuron
//          add neuron to `neurons`
//      connect (neuron1, neuron2)
//          create connection between the two neurons
//          add the connection to neuron1
//      feedForward
//          create a message and feed forward it to the network input neuron
//          (act as a particle emitter)
//      update
//          command to update all the neurons
//          is trigerred on each frame
//      display
//          draw the network

var util = require('util')
  , events = require('events')
  , _ = require('underscore')
  , Connection = require('../app/connection')
;

function Network(position, w, h) {
    this.position = position;
    this.w = w;
    this.h = h;
    this.neurons = [];

    events.EventEmitter.call(this);
}

util.inherits(Network, events.EventEmitter);

_.extend(Network.prototype, {
    setInput: function(neuron) {
        this.input = neuron;
        this.addNeuron(neuron);
    },

    addNeuron: function(neuron) {
        this.neurons.push(neuron);
    },

    connect: function(neuron1, neuron2) {
        var connection = new Connection(neuron1, neuron2);
        neuron1.addConnection(connection);
    },

    setOutput: function(neuron, output) {
        neuron.setOutput(output);
    },

    feedForward: function() {
        var message = Math.random();
        this.input.feedForward(message);
    },

    update: function(dt) {
        var length = this.neurons.length;
        for (var i = 0; i < length; i++) {
            this.neurons[i].update(dt);
        };
    },

    display: function(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        var length = this.neurons.length;

        for (var i = 0; i < length; i++) {
            this.neurons[i].displayConnectionsPaths(ctx);
        };

        for (var i = 0; i < length; i++) {
            this.neurons[i].displayConnectionsMessages(ctx);
        };

        for (var i = 0; i < length; i++) {
            this.neurons[i].display(ctx);
        };

        ctx.restore();
    }
});

module.exports = Network;
