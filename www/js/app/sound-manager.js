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

var AudioContext = window.AudioContext || window.webkitAudioContext;

var audio = new AudioContext();
var master = audio.createGain();
var volume = audio.createGain();
var compressor = audio.createDynamicsCompressor();
var lowFilter = audio.createBiquadFilter();

lowFilter.frequency.value = 22000.0;
lowFilter.Q.value = 5.0;

// initalize audio
var sin = audio.createOscillator();
sin.frequency.value = 300;
var gain = audio.createGain();
gain.gain.value = 0;
sin.connect(gain);
gain.connect(audio.destination);

sin.start(0);
sin.stop(audio.currentTime + 0.01);

// build graph
// master.connect(compressor);
// lowFilter.connect(compressor);
// compressor.connect(volume);
master.connect(volume);
volume.connect(audio.destination);

var playSound = function(frequency, bounceCount, strength, position) {
    if (frequency > 22000 || frequency < 100) { return; }
    // phasing
    var interval = frequency * (2 / 440);
    var frequency = frequency + bounceCount * (interval * UIModel.get('phasing') * Math.random() - interval);

    var oscillator = audio.createOscillator();
    var gainNode = audio.createGain();
    var panner = audio.createPanner();

    oscillator.frequency.value = frequency;
    var spatialize = UIModel.get('spatialize');
    panner.setPosition(position.x * spatialize / 5, position.y * spatialize / 5, strength * -1 * spatialize);

    var ratio = 1 - ((frequency / 22000) * 0.6); // what's that ?
    // ADSR
    var now = audio.currentTime;
    // console.log(strength * 0.25 * ratio, 0.05 * ratio);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(strength * 0.25 * ratio, now + 0.02);
    gainNode.gain.setTargetAtTime(0.05 * ratio, now + 0.5, 0.5);
    gainNode.gain.setTargetAtTime(0.0001, now + 6, 0.8);

    oscillator.connect(panner);
    panner.connect(gainNode);
    gainNode.connect(master);

    oscillator.start(now);
    oscillator.stop(now + 10);

    // clean graph
    (function(oscillator, panner, gainNode) {
      setTimeout(function() {
        oscillator.disconnect();
        panner.disconnect();
        gainNode.disconnect();
        oscillator = panner = gainNode = null;
      }, 10 * 1000);
    } (oscillator, panner, gainNode));
};

// gui
volume.gain.value = UIModel.get('volume');
UIModel.on('change:volume', function(value) { volume.gain.value = value; });

compressor.attack.value = 0.003; // UIModel.get('compressorAttack');
compressor.knee.value = 15; // UIModel.get('compressorKnee');
compressor.ratio.value = 5; // UIModel.get('compressorRatio');
compressor.release.value = 0.25; // UIModel.get('compressorRelease');
compressor.threshold.value = -38; // UIModel.get('compressorThreshold');

UIModel.on('change:compressorAttack', function(value) { compressor.attack.value = value; });
UIModel.on('change:compressorKnee', function(value) { compressor.knee.value = value; });
UIModel.on('change:compressorRatio', function(value) { compressor.ratio.value = value; });
UIModel.on('change:compressorRelease', function(value) { compressor.release.value = value; });
UIModel.on('change:compressorThreshold', function(value) { compressor.threshold.value = value; });

module.exports = {
    play: playSound,
    frequencies: frequencies
};
