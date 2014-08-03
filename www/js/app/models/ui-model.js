var events = require('events')
  , util = require('util')
  , dat = require('dat-gui');

var UIModel = function() {
    this.inputPosition = 0.5;
    // presets [0.57, 0.07] - [1, 0.7] - [0.8, 0.2]
    this.controlPoint1Ratio = 0.5;
    this.controlPoint2Ratio = 0.5;

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
['inputPosition', 'controlPoint1Ratio', 'controlPoint2Ratio'].forEach(function(setting) {
    controllers[setting] = f1.add(uiModel, setting, 0, 1);
    controllers[setting].onChange(function(value) { uiModel.set(setting, value) })
});

gui.close();

module.exports = uiModel;
