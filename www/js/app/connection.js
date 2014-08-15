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

    this.color = {
        r: 255,
        g: 255,
        b: 255,
        rMultiplier: (8 + Math.random() * 2),
        gMultiplier: (8 + Math.random() * 2),
        bMultiplier: (8 + Math.random() * 2),
    };
    this.colorLimit = 190;
    this.isResting = false;

    this.updateControlPoints();
}

util.inherits(Connection, events.EventEmitter);

_.extend(Connection.prototype, {
    updateControlPoints: function() {
        var controlPoint1Y = this.source.position.y - (ui.get('controlPoint1Ratio') * 2 * this.h);
        var controlPoint2Y = this.dest.position.y + (ui.get('controlPoint2Ratio') * 2 * this.h);
        this.controlPoint1 = new Vector(this.source.position.x, controlPoint1Y);
        this.controlPoint2 = new Vector(this.dest.position.x, controlPoint2Y);
    },

    feedForward: function(input) {
        var messageValue = input * this.weight;
        var messageColor = 255 - Math.round(helpers.constrain(messageValue, 0, 1) * 255);
        var message = {
            value: messageValue,
            position: this.source.position.clone(),
            timer: 0,
            color: 'rgb(' + messageColor + ', ' + messageColor + ', ' + messageColor + ')',
        };

        if (!this.isResting) {
            this.color.r -= message.value * this.color.rMultiplier;
            this.color.g -= message.value * this.color.gMultiplier;
            this.color.b -= message.value * this.color.bMultiplier;

            if (this.color.r < this.colorLimit || this.color.g < this.colorLimit || this.color.b < this.colorLimit) {
                this.isResting = true;
            }
        }

        this.messages.push(message);
    },

    update: function() {
        // update control points
        this.updateControlPoints();

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

        // update color
        if (this.isResting) {
            this.color.r += 2;
            this.color.g += 2;
            this.color.b += 2;
            var limit = 255;

            if (this.color.r > limit || this.color.g > limit || this.color.b > limit) {
                this.isResting = false;
                this.color.r = 255;
                this.color.g = 255;
                this.color.b = 255;
            }
        } else {
            this.color.r += 0.002;
            this.color.g += 0.002;
            this.color.b += 0.002;
        }
    },

    displayPath: function(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'rgb(' + Math.round(this.color.r) + ', ' + Math.round(this.color.g) + ',' + Math.round(this.color.b) + ')';

        ctx.moveTo(this.source.position.x, this.source.position.y);
        ctx.bezierCurveTo(
            this.controlPoint1.x, this.controlPoint1.y,
            this.controlPoint2.x, this.controlPoint2.y,
            this.dest.position.x, this.dest.position.y
        );

        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    },

    displayMessages: function(ctx) {
        ctx.save();
        this.messages.forEach(function(message) {
            ctx.beginPath();
            ctx.fillStyle = message.color;
            ctx.arc(message.position.x, message.position.y, 2, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.closePath();
        });
        ctx.restore();
    }
});

module.exports = Connection;








