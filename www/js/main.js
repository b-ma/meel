var Network = require('./app/network')
  , Neuron = require('./app/neuron')
  , Vector = require('vector')
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
var inputNeuron = new Neuron(new Vector(0, networkHeight / 2));
network.setInput(inputNeuron);

// create first layer
var neuronCount = 40;
var distance = networkWidth / neuronCount;
for (var i = 0; i <= neuronCount; i++) {
    var neuron = new Neuron(new Vector(- (networkWidth / 2) + (distance * i), 0));
    network.addNeuron(neuron);
}

(function draw() {
    ctx.clearRect(0, 0, w, h);

    network.update();
    network.display(ctx);

    // window.requestAnimationFrame(draw);
    setTimeout(draw, 500);
}());

