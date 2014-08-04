var events = require('events')
  , util = require('util')
  , dat = require('dat-gui')
  , _ = require('underscore')
;

var settings = {
    inputPosition: {
        default: 0.5,
        range: [0, 1]
    },
    controlPoint1Ratio: {
        default: 0.5,
        range: [0, 1]
    },
    controlPoint2Ratio: {
        default: 0.5,
        range: [0, 1]
    },
    volume: {
        default: 0.7,
        range: [0, 1]
    },
    compressorAttack: {
        default: 0.003,
        range: [0, 1]
    },
    compressorKnee: {
        default: 15,
        range: [0, 40]
    },
    compressorRatio: {
        default: 5,
        range: [0, 20]
    },
    compressorRelease: {
        default: 0.25,
        range: [0, 1]
    },
    compressorThreshold: {
        default: -38,
        range: [-100, 0]
    }
}

var UIModel = function() {
    _.each(settings, function(setting, attr) {
        this[attr] = setting.default;
    }, this);

    events.EventEmitter.call(this);
};

util.inherits(UIModel, events.EventEmitter);

UIModel.prototype.set = function(attr, value) {
    var oldValue = this[attr];
    this[attr] = value;
    this.emit('change', attr, value, oldValue);
    this.emit('change:' + attr, value, oldValue);
}

UIModel.prototype.get = function(attr) {
    return this[attr];
}

var uiModel = new UIModel();

// GUI
var gui = f1 = new dat.GUI();
var controllers = {};
// display settings
// var f1 = gui.addFolder('display settings');
_.each(settings, function(setting, attr) {
    controllers[attr] = f1.add(uiModel, attr, setting.range[0], setting.range[1]);
    controllers[attr].onChange(function(value) { uiModel.set(attr, value); })
});

gui.close();

module.exports = uiModel;
