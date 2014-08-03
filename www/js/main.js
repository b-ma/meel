var Network = require('./app/network')
  , Neuron = require('./app/neuron')
  , Connection = require('./app/connection')
  , Vector = require('vector')
  , UIModel = require('./app/models/ui-model')
  , BallGenerator = require('./app/ball-generator')
  , helpers = require('./lib/canvas-helpers')
;

var w = 600;
var h = 700;
var margin = 50;
var networkWidth = w - (2 * margin);
var networkHeight = h - (2 * margin);

var canvas = document.getElementById('scene');
var ctx = canvas.getContext('2d');

ctx.canvas.width  = w;
ctx.canvas.height = window.innerHeight;

// audio
var frequencies = {
    'a': 55,
    'b': 62,
    'c': 65,
    'd': 73,
    'e': 82,
    'f': 87,
    'g': 98
};
var notes = Object.keys(frequencies);
var notesCount = notes.length;
var noteIndex = 0;
var audio = new AudioContext();
var master = audio.createGain();
master.gain.value = UIModel.get('volume');

var compressor = audio.createDynamicsCompressor();

UIModel.on('change:volume', function(volume) {
    master.gain.value = volume;
})

/*
var processAudio = function(e) {
    var input = e.inputBuffer.getChannelData(0);
    var output = e.outputBuffer.getChannelData(0);

    for (var i = 0; i < input.length; i++) {
        var absValue = Math.abs(input[i]);
        if (absValue > 1) {
            output[i] = 1;
        }
    }
}

var meter = audio.createScriptProcessor(1024, 1, 1);
meter.onaudioprocess = processAudio;

master.connect(meter);
meter.connect(audio.destination);
// */
master.connect(compressor);
compressor.connect(audio.destination);

var playSound =  function(frequency, strength) {
    var now = audio.currentTime;
    var oscillator = audio.createOscillator();
    var gainNode = audio.createGain();

    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(master);

    // gainNode.gain.value = 0;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(strength * 0.05, now  + 0.02);
    gainNode.gain.setTargetAtTime(0.001, now + 0.5, 1);
    gainNode.gain.setTargetAtTime(0, now + 8, 1);

    oscillator.start(now);
    oscillator.stop(now + 12);

    gainNode = null;
    oscillator = null;
}

//  setTimeout(function() {
//      playSound(400, 0.8);
//  }, 1000);
//  return
//
//  var btn = document.querySelector('#test');
//  btn.addEventListener('click', function() {
//    playSound(440);
//  }, false)
//
//  return;

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
// neuronCount = Math.ceil(neuronCount / 2);
// distance = networkWidth / (neuronCount - 1);
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

    var generator = new BallGenerator(new Vector(- (networkWidth / 2) + (distance * i), -h / 6), frequencies[index]);
    generator.on('bounce', function(frequency, strength) {
        playSound.apply(null, arguments);
    });
    // network.addNeuron(generator);
    // var index = (i === 0) ? neuronCount - 1 : i - 1;
    network.setOutput(thirdLayer[i], generator);
    generators.push(generator);
}

// move inputPosition
UIModel.on('change:inputPosition', function(ratio) {
    inputPosition.x = (networkWidth * ratio) - (networkWidth / 2);
});

var emitterInterval = 2;
var emitterCounter = 0;

(function update() {
    helpers.colorPicker.update(ctx);
    emitterCounter = (emitterCounter + 1) % emitterInterval;
    if (emitterCounter === 0) {
        network.feedForward(Math.random());
    }
    // emitterCounter++;

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

