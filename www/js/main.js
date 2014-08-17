var Network = require('./app/network')
  , Neuron = require('./app/neuron')
  , Connection = require('./app/connection')
  , Vector = require('vector')
  , UIModel = require('./app/models/ui-model')
  , BallGenerator = require('./app/ball-generator')
  , helpers = require('./lib/canvas-helpers')
  , soundManager = require('./app/sound-manager')
  , Stats = require('./lib/stats');
;

// hide message after 6 seconds
var $message = document.querySelector('p');
setTimeout(function() {
    $message.classList.add('hide');
}, 6000);

// prepare network
var h = window.innerHeight
var w = h * (6/7);
var margin = 50;
var networkWidth = w - (2 * margin);
var networkHeight = h - (2 * margin);

var canvas = document.getElementById('scene');
var ctx = canvas.getContext('2d');

ctx.canvas.width  = w;
ctx.canvas.height = window.innerHeight;

// scene
var network = new Network(new Vector(0, 0), networkWidth, networkHeight);

var neuronCount = 70;
var neuronWidth = (networkWidth / neuronCount) - 1;
Neuron.prototype.width = neuronWidth;

// create input neuron
var inputPosition = new Vector(0, networkHeight / 2);
var inputNeuron = new Neuron(inputPosition, 'input');
network.setInput(inputNeuron);

// create first layer
var firstLayer = [];
var secondLayer = [];
var thirdLayer = [];
var generators = [];

var distance = networkWidth / (neuronCount - 1);

// layer 1 - emitter
for (var i = 0; i < neuronCount; i++) {
    var neuron = new Neuron(new Vector(- (networkWidth / 2) + (distance * i), networkHeight / 6), 'layer-1');
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
    var neuron = new Neuron(new Vector(- (networkWidth / 2) + (distance * i), -networkHeight / 6), 'layer-3');
    network.addNeuron(neuron);

    var index = i < breakpoint ? breakpoint - (i + 1) : neuronCount - (i + 1 - breakpoint);
    network.connect(secondLayer[index], neuron);

    thirdLayer.push(neuron);
}

// ball/sound generators
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

    var location = new Vector(- (networkWidth / 2) + (distance * i), -networkHeight / 6);
    var generator = new BallGenerator(location, frequencies[index]);

    generator.on('bounce', function() {
        soundManager.play.apply(soundManager, arguments);
    });

    network.setOutput(thirdLayer[i], generator);
    generators.push(generator);
}

// move inputPosition
UIModel.on('change:inputPosition', function(ratio) {
    inputPosition.x = (networkWidth * ratio) - (networkWidth / 2);
});

// game loop from: http://codeincomplete.com/posts/2013/12/4/javascript_game_foundations_the_game_loop/
function timestamp() {
  return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

function run(options) {
    var now,
        dt       = 0,
        last     = timestamp(),
        slow     = options.slow || 1, // slow motion scaling factor
        step     = 1/options.fps,
        slowStep = slow * step,
        update   = options.update,
        render   = options.render,
        stats    = new Stats();

        stats.domElement.style.position = 'absolute';
        stats.domElement.style.right = '0px';
        stats.domElement.style.bottom = '0px';
        document.body.appendChild(stats.domElement);

    function frame() {
        stats.begin();
        now = timestamp();
        dt = dt + Math.min(1, (now - last) / 1000);

        while(dt > slowStep) {
            dt = dt - slowStep;
            update(step);
        }

        render(ctx);
        last = now;
        stats.end();
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}


// update - render
var inputInterval = 2;
var inputCounter = 0;
var generatorsLength = generators.length;

var update = function(dt) {
    inputCounter = (inputCounter + 1) % inputInterval;
    if (inputCounter === 0) { network.feedForward(Math.random()); }

    network.update(dt);
    for (var i = 0; i < generatorsLength; i++) {
        generators[i].update(dt);
    }
};

var render = function(ctx) {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);

    network.display(ctx);
    for (var i = 0; i < generatorsLength; i++) {
        generators[i].display(ctx);
    }

    ctx.restore();
};

// launch loop
run({
    fps: 60,
    // slow: 50,
    update: update,
    render: render
});

