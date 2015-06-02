var events = require('events')
  , util = require('util')
  , dat = require('dat-gui')
  , _ = require('underscore')
;

var settings = {
    messageAcceleration: {
        default: 0.1,
        range: [-0.5, 0.5],
        folder: 'display'
    },
    gravity: {
        default: 9.81,
        range: [5, 16],
        folder: 'display'
    },
    inputPosition: {
        default: 0.5,
        range: [0, 1],
        folder: 'display'
    },
    controlPoint1Ratio: {
        default: 0.5,
        range: [0, 1],
        folder: 'display'
    },
    controlPoint2Ratio: {
        default: 0.5,
        range: [0, 1],
        folder: 'display'
    },
    volume: {
        default: 0.9,
        range: [0, 1],
        folder: 'sound'
    },
    phasing: {
        default: 4,
        range: [0, 10],
        folder: 'sound'
    },
    spatialize: {
        default: 0.8,
        range: [0, 4],
        folder: 'sound'
    },
    compressorAttack: {
        default: 0.0001,
        // default: 0.003,
        range: [0, 1],
        folder: 'sound'
    },
    compressorKnee: {
        default: 8,
        // default: 30,
        range: [0, 40],
        folder: 'sound'
    },
    compressorRatio: {
        // default: 5,
        default: 12,
        range: [0, 20],
        folder: 'sound'
    },
    compressorRelease: {
        default: 0.25,
        range: [0, 1],
        folder: 'sound'
    },
    compressorThreshold: {
        default: -50,
        // default: -24,
        range: [-100, 0],
        folder: 'sound'
    }
}

var UIModel = function() {
    _.each(settings, function(setting, attr) {
        this[attr] = setting.default;
    }, this);

    events.EventEmitter.call(this);
    this.setMaxListeners(1000);
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
// var gui = f1 = new dat.GUI();
// var controllers = {};
// // display settings
// var folders = {};
// folders['display'] = gui.addFolder('display settings');
// folders['sound'] = gui.addFolder('sound settings');

// _.each(settings, function(setting, attr) {
//     controllers[attr] = folders[setting.folder].add(uiModel, attr, setting.range[0], setting.range[1]);
//     controllers[attr].onChange(function(value) { uiModel.set(attr, value); })
// });

// gui.close();

module.exports = uiModel;
