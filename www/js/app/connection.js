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
  , canvasHelpers = require('../lib/canvas-helpers')
;

var messageTimeStep = 0.008;

function Connection(source, dest) {
    this.source = source;
    this.dest = dest;
    this.weight = Math.random();
    this.messages = [];

    events.EventEmitter.call(this);

    var h = this.source.location.y - this.dest.location.y;
    this.controlPoint1 = new Vector(this.source.location.x, h - (15/8) * h);
    this.controlPoint2 = new Vector(this.dest.location.x, (11/8) * h);
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
            message.position = canvasHelpers.bezier(
                this.source,
                this.controlPoint1,
                this.controlPoint2,
                this.dest,
                message.timer
            )
        }, this);
    },

    display: function(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';

        ctx.moveTo(this.source.location.x, this.source.location.y);
        ctx.bezierCurveTo(
            this.controlPoint1.x, this.controlPoint1.y,
            this.controlPoint2.x, this.controlPoint2.y,
            this.dest.location.x, this.dest.location.y
        );

        ctx.stroke();
        ctx.closePath();

        /*
        // draw control points
        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.moveTo(this.dest.location.x, this.dest.location.y);
        ctx.lineTo(this.controlPoint2.x, this.controlPoint2.y);
        ctx.stroke();
        ctx.closePath();
        //
        ctx.beginPath();
        ctx.strokeStyle = 'green';
        ctx.moveTo(this.source.location.x, this.source.location.y);
        ctx.lineTo(this.controlPoint1.x, this.controlPoint1.y);
        ctx.stroke();
        ctx.closePath();
        // */
        ctx.restore();
    }
});

module.exports = Connection;








