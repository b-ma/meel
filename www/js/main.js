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
var volume = audio.createGain();
var compressor = audio.createDynamicsCompressor();
var lowFilter = audio.createBiquadFilter();

lowFilter.frequency.value = 22000.0;
lowFilter.Q.value = 5.0;

volume.gain.value = UIModel.get('volume');
UIModel.on('change:volume', function(value) { volume.gain.value = value; });

compressor.attack.value = UIModel.get('compressorAttack');
compressor.knee.value = UIModel.get('compressorKnee');
compressor.ratio.value = UIModel.get('compressorRatio');
compressor.release.value = UIModel.get('compressorRelease');
compressor.threshold.value = UIModel.get('compressorThreshold');

UIModel.on('change:compressorAttack', function(value) { console.log(value); compressor.attack.value = value; });
UIModel.on('change:compressorKnee', function(value) { compressor.knee.value = value; });
UIModel.on('change:compressorRatio', function(value) { compressor.ratio.value = value; });
UIModel.on('change:compressorRelease', function(value) { compressor.release.value = value; });
UIModel.on('change:compressorThreshold', function(value) { compressor.threshold.value = value; });

// final audio chain
master.connect(compressor);
lowFilter.connect(compressor);
compressor.connect(volume);
volume.connect(audio.destination);

var playSound =  function(frequency, strength, position) {
    if (frequency > 24000 || frequency < 100) { return; }

    var now = audio.currentTime;
    var oscillator = audio.createOscillator();
    var gainNode = audio.createGain();
    var compressor = audio.createDynamicsCompressor();
    var panner = audio.createPanner();

    oscillator.frequency.value = frequency;
    panner.setPosition(position.x, position.y, strength * -100);

    // ADSR
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(strength * 0.5, now  + 0.02);
    gainNode.gain.setTargetAtTime(0.1, now + 0.5, 1);
    gainNode.gain.setTargetAtTime(0, now + 8, 1);

    oscillator.connect(compressor);
    compressor.connect(panner);
    panner.connect(gainNode);
    gainNode.connect(master);

    oscillator.start(now);
    oscillator.stop(now + 12);

    gainNode = null;
    oscillator = null;
}

// setTimeout(function() {
//     playSound(55, 0.8);
// }, 1000);
// return;
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

    var location = new Vector(- (networkWidth / 2) + (distance * i), -h / 6);
    var generator = new BallGenerator(location, frequencies[index]);
    generator.on('bounce', function(frequency, strength) {
        playSound(frequency, strength, location);
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

