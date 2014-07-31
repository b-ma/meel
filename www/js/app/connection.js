//  Connection
//      a           Neuron  source neuron
//      b           Neuron  destination neuron
//      weight      Float   weight of the connection
//      messages    Array   current messages
//
//      feedForward
//          create a message object `message` containing the output of the message (i.e. weight * inputArgument) and the location of the sender (no need for that ?)
//          add the message to the array
//      update
//          update the position of each message
//          if message is arrived `feedForward` the output neuron
//          and destoy the message
//      display
//          display the connection path and the ongoing messages

var util = require('util')
  , events = require('events')
  , _ = require('underscore')
  , Vector = require('vector')
  , canvasUtils = require('../lib/canvas-utils')
;

var messageTimeStep = 0.008;

function Connection(source, dest) {
    this.source = source;
    this.dest = dest;
    this.weight = Math.random();
    this.messages = [];

    events.EventEmitter.call(this);

    this.controlPoint1 = new Vector();
    this.controlPoint2 = new Vector();
}

util.inherits(Connection, events.EventEmitter);

_.extend(Connection.prototype, {
    feedForward: function(input) {
        var message = {
            value: input * this.weight,
            position: this.source.clone(),
            timer: 0
        };

        this.messages.push(message);
    },

    update: function() {
        this.messages.forEach(function(messsages) {
            message.timer += messageTimeStep;
            message.position = canvasUtils.bezier(
                this.source,
                this.controlPoint(1),
                this.controlPoint(2),
                this.dest,
                message.timer
            )
        }, this);
    },

    display: function(ctx) {
        console.log('draw connection');
    }
});