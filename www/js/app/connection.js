//  Connection
//      a           Neuron  source neuron
//      b           Neuron  destination neuron
//      weight      Float   weight of the connection
//      messages    Array   current messages
//
//      feedForward
//          create a message object `message` containing the output of the message (i.e. weight * inputArgument) and the position of the sender (no need for that ?)
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
  , helpers = require('../lib/canvas-helpers')
  , ui = require('./models/ui-model')
;

function Connection(source, dest) {
    this.source = source;
    this.dest = dest;
    this.weight = Math.random();
    this.messages = [];

    events.EventEmitter.call(this);

    this.messageTimeStep = Math.random() * 0.008 + 0.004 ;
    this.h = this.source.position.y - this.dest.position.y;
}

util.inherits(Connection, events.EventEmitter);

_.extend(Connection.prototype, {
    feedForward: function(input) {
        var message = {
            value: input * this.weight,
            position: this.source.position.clone(),
            timer: 0
        };

        this.messages.push(message);
    },

    update: function() {
        // update control points
        var controlPoint1Y = this.source.position.y - (ui.get('controlPoint1Ratio') * 2 * this.h);
        var controlPoint2Y = this.dest.position.y + (ui.get('controlPoint2Ratio') * 2 * this.h);
        this.controlPoint1 = new Vector(this.source.position.x, controlPoint1Y);
        this.controlPoint2 = new Vector(this.dest.position.x, controlPoint2Y);

        var deadMessages = [];
        this.messages.forEach(function(message) {
            message.timer += this.messageTimeStep;

            if (message.timer >= 1) { return deadMessages.push(message); }

            message.position = helpers.bezier(
                this.source.position,
                this.controlPoint1,
                this.controlPoint2,
                this.dest.position,
                message.timer // Math.sqrt(message.timer)
            )
        }, this);

        deadMessages.forEach(function(message) {
            var index = this.messages.indexOf(message);
            this.messages.splice(index, 1);

            this.dest.feedForward(message.value);
        }, this);
    },

    display: function(ctx) {
        ctx.save();
        ctx.beginPath();

        if (!this.grad) {
            this.grad = ctx.createRadialGradient(
                Math.round(this.source.position.x), Math.round(this.source.position.y), 0,
                Math.round(this.source.position.x), Math.round(this.source.position.y), this.h
            );
            this.grad.addColorStop(0, '#565656');
            this.grad.addColorStop(0.2, '#232323');
            this.grad.addColorStop(1, '#565656');
        }

        ctx.strokeStyle = this.grad;

        ctx.moveTo(this.source.position.x, this.source.position.y);
        ctx.bezierCurveTo(
            this.controlPoint1.x, this.controlPoint1.y,
            this.controlPoint2.x, this.controlPoint2.y,
            this.dest.position.x, this.dest.position.y
        );

        ctx.stroke();
        ctx.closePath();

        ctx.save();
        this.messages.forEach(function(message) {
            ctx.beginPath();

            ctx.fillStyle = '#232323';
            ctx.globalAlpha = message.value;

            ctx.arc(message.position.x, message.position.y, 2, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.closePath();
        });
        ctx.restore();

        /*
        if (this.source.type === 'input') {
            // draw control points
            ctx.beginPath();
            ctx.strokeStyle = 'green';
            ctx.moveTo(this.source.position.x, this.source.position.y);
            ctx.lineTo(this.controlPoint1.x, this.controlPoint1.y);
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.strokeStyle = 'red';
            ctx.moveTo(this.dest.position.x, this.dest.position.y);
            ctx.lineTo(this.controlPoint2.x, this.controlPoint2.y);
            ctx.stroke();
            ctx.closePath();
        }
        // */

        ctx.restore();
    }
});

module.exports = Connection;








