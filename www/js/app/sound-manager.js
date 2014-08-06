var UIModel = require('./models/ui-model')

// main audio graph
var frequencies = {
    'a': 55,
    'b': 62,
    'c': 65,
    'd': 73,
    'e': 82,
    'f': 87,
    'g': 98
};

var audio = new AudioContext();
var master = audio.createGain();
var volume = audio.createGain();
var compressor = audio.createDynamicsCompressor();
var lowFilter = audio.createBiquadFilter();

lowFilter.frequency.value = 22000.0;
lowFilter.Q.value = 5.0;

// build graph
master.connect(compressor);
lowFilter.connect(compressor);
compressor.connect(volume);
volume.connect(audio.destination);

var playSound = function(frequency, strength, position) {
    if (frequency > 22000 || frequency < 100) { return; }
    var now = audio.currentTime;
    var oscillator = audio.createOscillator();
    var gainNode = audio.createGain();
    var panner = audio.createPanner();

    oscillator.frequency.value = frequency;
    var spatialize = UIModel.get('spatialize') + (Math.random() * 0.1);
    panner.setPosition(position.x * spatialize, position.y * spatialize, strength * -100 * spatialize);

    // ADSR
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(strength * 0.25, now + 0.03);
    gainNode.gain.setTargetAtTime(0.05, now + 0.5, 0.5);
    gainNode.gain.setTargetAtTime(0, now + 5, 1);

    oscillator.connect(panner);
    panner.connect(gainNode);
    gainNode.connect(master);

    oscillator.start(now);
    oscillator.stop(now + 10);

    gainNode = null;
    oscillator = null;
};

// gui
volume.gain.value = UIModel.get('volume');
UIModel.on('change:volume', function(value) { volume.gain.value = value; });

compressor.attack.value = 0.003; // UIModel.get('compressorAttack');
compressor.knee.value = 15; // UIModel.get('compressorKnee');
compressor.ratio.value = 5; // UIModel.get('compressorRatio');
compressor.release.value = 0.25; // UIModel.get('compressorRelease');
compressor.threshold.value = -38; // UIModel.get('compressorThreshold');

// UIModel.on('change:compressorAttack', function(value) { compressor.attack.value = value; });
// UIModel.on('change:compressorKnee', function(value) { compressor.knee.value = value; });
// UIModel.on('change:compressorRatio', function(value) { compressor.ratio.value = value; });
// UIModel.on('change:compressorRelease', function(value) { compressor.release.value = value; });
// UIModel.on('change:compressorThreshold', function(value) { compressor.threshold.value = value; });

module.exports = {
    play: playSound,
    frequencies: frequencies
};
