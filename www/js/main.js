var Network = require('./app/network')
  , Neuron = require('./app/neuron')
  , Connection = require('./app/connection')
  , Vector = require('vector')
  , UIModel = require('./app/models/ui-model')
;

var w = 600
  , h = 400
  , margin = 25
  , networkWidth = w - (2 * margin)
  , networkHeight = h - (2 * margin)
;

var canvas = document.getElementById('scene');
var ctx = canvas.getContext('2d');

ctx.canvas.width  = w;
ctx.canvas.height = h;

var network = new Network(new Vector(w / 2, h / 2), networkWidth, networkHeight);

// create input neuron
var inputPosition = new Vector(0, networkHeight / 2);
var inputNeuron = new Neuron(inputPosition, 'input');
network.setInput(inputNeuron);

// create first layer
var neuronCount = 40;
var distance = networkWidth / neuronCount;
for (var i = 0; i <= neuronCount; i++) {
    var neuron = new Neuron(new Vector(- (networkWidth / 2) + (distance * i), 0));
    network.addNeuron(neuron);
    network.connect(inputNeuron, neuron);
}

// move inputPosition
UIModel.on('change:inputPosition', function(ratio) {
    inputPosition.x = (networkWidth * ratio) - (networkWidth / 2);
});

var emitterInterval = 5;
var emitterCounter = 0;

(function update() {
    emitterCounter = (emitterCounter + 1) % emitterInterval;
    if (emitterCounter === 0) {
        network.feedForward(Math.random());
    }

    ctx.clearRect(0, 0, w, h);

    network.update();
    network.display(ctx);

    window.requestAnimationFrame(update);
    // setTimeout(draw, 500);
}());

