var Network = require('./app/network')
  , Neuron = require('./app/neuron')
  , Connection = require('./app/connection')
  , Vector = require('vector')
  , UIModel = require('./app/models/ui-model')
  , BallGenerator = require('./app/ball-generator')
  , helpers = require('./lib/canvas-helpers')
  , soundManager = require('./app/sound-manager')
;

// prepare network
var w = 600;
var h = 700;
var margin = 50;
var networkWidth = w - (2 * margin);
var networkHeight = h - (2 * margin);

var canvas = document.getElementById('scene');
var ctx = canvas.getContext('2d');

ctx.canvas.width  = w;
ctx.canvas.height = window.innerHeight;

// scene
var network = new Network(new Vector(0, 0), networkWidth, networkHeight);

// create input neuron
var inputPosition = new Vector(0, networkHeight / 2);
var inputNeuron = new Neuron(inputPosition, 'input');
network.setInput(inputNeuron);

// create first layer
var firstLayer = [];
var secondLayer = [];
var thirdLayer = [];
var generators = [];
var neuronCount = 70;

var distance = networkWidth / (neuronCount - 1);

// layer 1
for (var i = 0; i < neuronCount; i++) {
    var neuron = new Neuron(new Vector(- (networkWidth / 2) + (distance * i), h / 6), 'layer-1');
    network.addNeuron(neuron);
    network.connect(inputNeuron, neuron);
    firstLayer.push(neuron);
}

// layer 2
for (var i = 0; i < neuronCount; i++) {
    var neuron = new Neuron(new Vector(- (networkWidth / 2) + (distance * i), 0), 'layer-2');
    network.addNeuron(neuron);
    // var index = (i === 0) ? neuronCount - 1 : i - 1;
    var index = neuronCount - (i + 1);
    network.connect(firstLayer[index], neuron);
    secondLayer.push(neuron);
}

// layer 3
var breakpoint = Math.floor(neuronCount / 2);

for (var i = 0; i < neuronCount; i++) {
    var neuron = new Neuron(new Vector(- (networkWidth / 2) + (distance * i), -h / 6), 'layer-3');
    network.addNeuron(neuron);

    var index = i < breakpoint ? breakpoint - (i + 1) : neuronCount - (i + 1 - breakpoint);
    network.connect(secondLayer[index], neuron);

    thirdLayer.push(neuron);
}

// ball generator
var lastOctave;
var frequencies = soundManager.frequencies;
var notes = Object.keys(frequencies);
var notesCount = notes.length;
var noteIndex = 0;

for (var i = 0; i < neuronCount; i++) {
    var index = notes[noteIndex % notesCount];

    // ugly - refactor
    if (lastOctave !== Math.floor(noteIndex / notesCount)) {
        for (var note in frequencies) {
            frequencies[note] = frequencies[note] * 2;
        }

        lastOctave = Math.floor(noteIndex / notesCount)
    }
    noteIndex += 1;

    var location = new Vector(- (networkWidth / 2) + (distance * i), -h / 6);
    var generator = new BallGenerator(location, frequencies[index]);

    generator.on('bounce', function(frequency, strength, position) {
        soundManager.play(frequency, strength, position);
    });

    network.setOutput(thirdLayer[i], generator);
    generators.push(generator);
}

// move inputPosition
UIModel.on('change:inputPosition', function(ratio) {
    inputPosition.x = (networkWidth * ratio) - (networkWidth / 2);
});

// main loop
var emitterInterval = 2;
var emitterCounter = 0;

(function update() {
    helpers.colorPicker.update(ctx);
    emitterCounter = (emitterCounter + 1) % emitterInterval;
    if (emitterCounter === 0) {
        network.feedForward(Math.random());
    }

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2, h / 2);

    network.update();
    network.display(ctx);

    generators.forEach(function(generator) {
        generator.update();
        generator.display(ctx);
    });

    ctx.restore();

    window.requestAnimationFrame(update);
}());

