(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

require("../../modules/00_settings/script.js");
require("../../modules/01_scripts/script.js");

},{"../../modules/00_settings/script.js":4,"../../modules/01_scripts/script.js":11}],2:[function(require,module,exports){
module.exports={
    "audio": {
        "src": "assets/audio/ambient.mp3",
        "peaks": [
            {
                "name": "bass",
                "range": [0, 4],
                "threshold": 121
            },
            {
                "name": "snare",
                "range": [95, 98],
                "threshold": 110
            },
            {
                "name": "shakes",
                "range": [21, 24],
                "threshold": 110
            }
        ]
    },
    "videos": {
        "reel": {
            "src": "assets/video/reel.mp4",
            "fallback": "assets/images/fallback/reel.jpg"
        },
        "work": {
            "src": "assets/video/work.mp4",
            "fallback": "assets/images/fallback/work.jpg"
        },
        "praise": {
            "src": "assets/video/praise.mp4",
            "fallback": "assets/images/fallback/praise.jpg"
        },
        "partners": {
            "src": "assets/video/partners.mp4",
            "fallback": "assets/images/fallback/partners.jpg"
        },
        "brandbeats": {
            "src": "assets/video/brand.mp4",
            "fallback": "assets/images/fallback/brand.jpg"
        },
        "onward": {
            "src": "assets/video/onward.mp4",
            "fallback": "assets/images/fallback/onward.jpg"
        }
    }
}

},{}],3:[function(require,module,exports){
'use strict';

{
    (function () {

        var last = 0,
            vendors = ['webkit', 'moz'];
        for (var i = 0, l = vendors.length; i < l && !window.requestAnimationFrame; ++i) {
            window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame'] || window[vendors[i] + 'CancelRequestAnimationFrame'];
        }
        if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
            var current = Date.now(),
                time = Math.max(0, 16 - (current - last)),
                id = window.setTimeout(function () {
                callback(current + time);
            }, time);
            last = current + time;
            return id;
        };
        if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };

        window.URL = window.URL || window.webkitURL;

        window.AudioContext = window.AudioContext || window.webkitAudioContext;

        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
    })();
}

},{}],4:[function(require,module,exports){
'use strict';

require('./polyfill.js');

},{"./polyfill.js":3}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AudioVisualization = function () {
    function AudioVisualization() {
        _classCallCheck(this, AudioVisualization);

        this._src;
        this._volume = 1;
        this._peaks;

        this.audio;

        this.context;
        this.source;
        this.analyser;
        this.data;
        this.gain;

        this.inertval;

        this.volumeInterval;

        this.listener = {};

        this.addCustomEasing();
    }

    _createClass(AudioVisualization, [{
        key: 'addComponents',


        // TODO import filters
        value: function addComponents() {
            this.peak1 = this.context.createBiquadFilter();
            this.peak2 = this.context.createBiquadFilter();

            this.peak1.frequency.value = 1000;
            this.peak1.type = 'peaking';
            this.peak1.gain.value = 24;
            this.peak1.Q.value = 3;

            this.peak2.frequency.value = 4200;
            this.peak2.type = 'peaking';
            this.peak2.gain.value = 24;
            this.peak2.Q.value = 4.8;

            this.analyser = this.context.createAnalyser();
            this.analyser.fftSize = 1024;
            this.analyser.minDecibels = -90;
            this.analyser.mmaxDecibels = -10;
            this.analyser.smoothingTimeConstant = .85;
            this.gain = this.context.createGain();
            this.gain.gain.value = this.volume && this.volume !== 0 ? this.volume : 1;
        }
    }, {
        key: 'patchComponents',
        value: function patchComponents() {
            this.source = this.context.createMediaElementSource(this.audio);
            this.source.connect(this.peak1);
            this.source.connect(this.peak2);
            this.peak1.connect(this.analyser);
            this.peak2.connect(this.analyser);
            this.source.connect(this.gain);
            this.gain.connect(this.context.destination);
        }
    }, {
        key: 'play',
        value: function play() {
            if (this.audio) this.audio.play();
            this.capture();
        }
    }, {
        key: 'pause',
        value: function pause() {
            if (this.audio) this.audio.pause();
            this.stop();
        }
    }, {
        key: 'seek',
        value: function seek(time) {
            this.audio.currentTime = time;
        }
    }, {
        key: 'fadeVolume',
        value: function fadeVolume(volume, duration) {
            var _this = this;

            var interval = 10,
                time = 0;
            var start = this.volume;
            this.volumeInterval = setInterval(function () {
                if (start > volume) {
                    _this.volume = start - _this.easing.easeInQuad(time, volume, start, duration);
                } else {
                    _this.volume = _this.easing.easeInQuad(time, start, volume, duration);
                }
                if ((time += interval) > duration) clearInterval(_this.volumeInterval);
            }, interval);
        }
    }, {
        key: 'mute',
        value: function mute(duration) {
            if (this.volumeInterval) clearInterval(this.volumeInterval);
            duration ? this.fadeVolume(0, duration) : this.volume = 0;
        }
    }, {
        key: 'unmute',
        value: function unmute(duration) {
            if (this.volumeInterval) clearInterval(this.volumeInterval);
            duration ? this.fadeVolume(1, duration) : this.volume = 1;
        }
    }, {
        key: 'capture',
        value: function capture() {
            var _this2 = this;

            this.interval = setInterval(function () {
                if (_this2.analyser) {
                    _this2.analyser.getFloatFrequencyData(_this2.data);
                    _this2.analyse();
                    _this2.trigger('analyse', {
                        data: _this2.data
                    });
                }
            }, 1000 / 60);
        }
    }, {
        key: 'stop',
        value: function stop() {
            clearInterval(this.interval);
        }
    }, {
        key: 'analyse',
        value: function analyse() {
            if (this.data.length) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.peaks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var a = _step.value;

                        var total = 0;
                        for (var i = a.range[0]; i < a.range[1]; ++i) {
                            total += this.data[i] + 140;
                        }var average = total / (a.range[1] - a.range[0]);
                        if (average > a.threshold) {
                            this.trigger('peak', {
                                name: a.name,
                                value: average - a.threshold
                            });
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        }

        // custom event listeners

    }, {
        key: 'on',
        value: function on(key, fn) {
            if (!this.listener[key]) this.listener[key] = [];
            this.listener[key].push(fn);
        }
    }, {
        key: 'off',
        value: function off(key) {
            delete this.listener[key];
        }
    }, {
        key: 'trigger',
        value: function trigger(key, data) {
            if (this.listener[key]) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.listener[key][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _fnc = _step2.value;
                        _fnc(data);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }
        }

        // visualization
        // TODO clean up!
        // addCanvas() {
        //     this.canvas = document.createElement('canvas');
        //     this.canvasContext = this.canvas.getContext('2d');
        //     this.canvas.width = window.innerWidth;
        //     this.canvas.height = window.innerHeight;
        //     $('body').append($(this.canvas).css({
        //         'width': '100%',
        //         'height': '100%',
        //         'position': 'fixed',
        //         'left': 0,
        //         'top': 0
        //     }));
        // }
        //
        // clear() {
        //     this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // }
        //
        // render() {
        //     let threshold = 115;
        //
        //     this.canvasContext.fillStyle = 'rgb(0, 0, 0)';
        //     this.canvasContext.font = 'normal 8px verdana';
        //
        //     for (let i = 0; i < 50; ++i) {
        //         this.canvasContext.fillText(Math.round(this.length / 50 * i), this.canvas.width / 50 * i, this.canvas.height - threshold * 5);
        //     }
        //
        //     this.canvasContext.fillRect(0, this.canvas.height - threshold * 5, this.canvas.width, 1);
        //
        //     this.canvasContext.lineWidth = barWidth;
        //     this.canvasContext.fillStyle = 'rgb(255, 51, 0)';
        //
        //     let barWidth = this.canvas.width / this.length,
        //         barHeight,
        //         x = 0;
        //
        //     for (let i = 0; i < this.length; ++i) {
        //         barHeight = (this.data[i] + 140) * 5;
        //         this.canvasContext.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
        //         x += barWidth;
        //     }
        // }

    }, {
        key: 'addCustomEasing',
        value: function addCustomEasing() {
            this.easing = {
                easeInQuad: function easeInQuad(t, b, c, d) {
                    return c * (t /= d) * t + b;
                }
            };
        }
    }, {
        key: 'src',
        set: function set(src) {
            var _this3 = this;

            if (src != this._src) {
                this._src = src;
                this.audio = document.createElement('audio');
                this.audio.addEventListener('canplay', function () {
                    try {
                        if (!_this3.context) {
                            _this3.context = new AudioContext();
                            _this3.addComponents();
                            _this3.patchComponents();
                            _this3.data = new Float32Array(_this3.analyser.frequencyBinCount);
                        }
                    } catch (e) {
                        // audio fallback
                    }
                });
                this.audio.src = src;
                this.audio.loop = true;
            }
        },
        get: function get() {
            return this._src;
        }
    }, {
        key: 'volume',
        set: function set(volume) {
            this._volume = volume;
            if (this.gain) this.gain.gain.value = volume;
        },
        get: function get() {
            return this._volume;
        }
    }, {
        key: 'peaks',
        set: function set(peaks) {
            this._peaks = peaks;
        },
        get: function get() {
            return this._peaks;
        }
    }]);

    return AudioVisualization;
}();

module.exports = AudioVisualization;

},{}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DistortionChunk = function DistortionChunk(x, y, width, height) {
    _classCallCheck(this, DistortionChunk);

    this.original = { x: x, y: y, width: width, height: height };
    this.distorted = { x: x, y: y, width: width, height: height };
    this.alpha = 1;
};

var DistortionWave = function DistortionWave(from, to) {
    _classCallCheck(this, DistortionWave);

    this.from = from;
    this.to = to;
    this.direction = Math.random() > .5 ? 1 : -1;
};

var DistortionInterference = function DistortionInterference(from, to, intensity) {
    _classCallCheck(this, DistortionInterference);

    this.from = from;
    this.to = to;
    this.intensity = intensity;
    this.direction = Math.random() > .5 ? 1 : -1;
};

var DistortionFragment = function DistortionFragment(x, y, width, height) {
    _classCallCheck(this, DistortionFragment);

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
};

var Distortion = function () {
    function Distortion() {
        _classCallCheck(this, Distortion);

        // private
        this._$el;
        this._padding = 0;
        this._overlay = false;

        this.settings = {
            fragmentColor: '#000'
        };

        this.easing = {};

        // elements
        this.$window = $(window);

        var canvas = this.createCanvas();
        this.canvas = canvas.canvas;
        this.context = canvas.context;

        this.split = this.createCanvas();

        this.$canvas = $(this.canvas);
        this.$canvas.css({ 'position': 'absolute' });

        this.image;

        this.dimension = {
            width: 0,
            height: 0,
            outerWidth: 0,
            outerheight: 0
        };

        this.chunks = [];
        this.layout = [0, 0];

        this.waves = [];

        this.interference = [];

        this.translate = [0, 0];

        this.blur;
        this.RGBSplit;

        this.fragments = [];

        this.loaded = false;
        this.changed = false;
        this.frame = 0;

        this.addCustomEasing();
        this.addEventListener();
    }

    _createClass(Distortion, [{
        key: 'createCanvas',
        value: function createCanvas() {
            var canvas = document.createElement('canvas');
            return {
                canvas: canvas,
                context: canvas.getContext('2d')
            };
        }
    }, {
        key: 'collectData',
        value: function collectData() {
            for (var s in this.settings) {
                for (var i in this.settings[s]) {
                    var data = this.$el.data('distortion-' + s + '-' + i);
                    if (data) this.settings[s][i] = data;
                }
            }
        }
    }, {
        key: 'measure',
        value: function measure() {
            var width = this.$el.width(),
                height = this.$el.height(),
                outerWidth = width + this.padding * 2,
                outerHeight = height + this.padding * 2;

            this.dimension = { width: width, height: height, outerWidth: outerWidth, outerHeight: outerHeight };
        }
    }, {
        key: 'wrapCanvas',
        value: function wrapCanvas() {
            var classes = this.$el.attr('class'),
                div = $('<div />');
            if (classes) div.addClass(classes);
            this.$el.removeAttr('class').wrap(div);
            this.$el.before(this.canvas);
        }
    }, {
        key: 'appendCanvas',
        value: function appendCanvas() {
            this.$el.append(this.canvas);
        }
    }, {
        key: 'afterCanvas',
        value: function afterCanvas() {
            this.$el.after(this.canvas);
        }
    }, {
        key: 'renderStyles',
        value: function renderStyles() {
            $(this.canvas).css({
                'width': 'calc(100% + ' + this.padding * 2 + 'px)',
                'height': 'calc(100% + ' + this.padding * 2 + 'px)',
                'left': -this.padding,
                'top': -this.padding
            });
        }
    }, {
        key: 'resize',
        value: function resize() {
            this.canvas.width = this.split.canvas.width = this.dimension.outerWidth;
            this.canvas.height = this.split.canvas.height = this.dimension.outerHeight;
            this.renderStyles();

            if (this.image) {
                this.resizeImage();
                if (this.image.raw) this.prerenderImage();
            }

            this.changed = true;
        }
    }, {
        key: 'resizeImage',
        value: function resizeImage() {
            this.image.canvas.width = this.dimension.width ? this.dimension.width : this.image.raw ? this.image.raw.naturalWidth : 0;
            this.image.canvas.height = this.dimension.height ? this.dimension.height : this.image.raw ? this.image.raw.naturalHeight : 0;
        }
    }, {
        key: 'prerenderImage',
        value: function prerenderImage() {
            this.image.context.drawImage(this.image.raw, 0, 0, this.image.canvas.width, this.image.canvas.height);
            if (this.overlay) this.colorOverlay();
        }
    }, {
        key: 'colorOverlay',
        value: function colorOverlay() {
            var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.overlay;

            this.image.context.fillStyle = color;
            this.image.context.globalCompositeOperation = 'source-in';
            this.image.context.fillRect(0, 0, this.dimension.width, this.dimension.height);
            this.image.context.globalCompositeOperation = 'source-over';
        }
    }, {
        key: 'loadSVG',
        value: function loadSVG() {
            var _this = this;

            var img = new Image(),
                svg = new Blob([this.$el[0].outerHTML], { type: 'image/svg+xml' }),
                url = URL.createObjectURL(svg);

            return new Promise(function (resolve, reject) {
                img.onload = function () {
                    URL.revokeObjectURL(url);
                    var canvas = document.createElement('canvas'),
                        context = canvas.getContext('2d');
                    _this.image = { raw: img, canvas: canvas, context: context };
                    _this.resizeImage();
                    _this.prerenderImage();
                    _this.render();
                    _this.loaded = true;
                    _this.changed = true;
                    resolve(img);
                };
                img.src = url;
            });
        }
    }, {
        key: 'loadIMG',
        value: function loadIMG(src) {
            var _this2 = this;

            var img = new Image();

            return new Promise(function (resolve, reject) {
                img.onload = function () {
                    var canvas = document.createElement('canvas'),
                        context = canvas.getContext('2d');
                    _this2.image = { raw: img, canvas: canvas, context: context };
                    _this2.resizeImage();
                    _this2.prerenderImage();
                    _this2.render();
                    _this2.loaded = true;
                    _this2.changed = true;
                    resolve(img);
                };
                img.src = src ? src : _this2.$el[0].src;
            });
        }
    }, {
        key: 'generateEvenChunks',
        value: function generateEvenChunks(layout) {
            this.chunks = [];
            this.layout = layout;
            var width = this.dimension.width / layout[0],
                height = this.dimension.height / layout[1];
            for (var row = 0; row < layout[1]; ++row) {
                for (var col = 0; col < layout[0]; ++col) {
                    this.chunks.push(new DistortionChunk(width * col, height * row, width, height));
                }
            }
        }
    }, {
        key: 'generateRandomChunks',
        value: function generateRandomChunks(size) {
            var _this3 = this;

            this.chunks = [];
            this.layout = [1, 1];
            var divideChunk = function divideChunk(x, y, width, height) {
                if (width * height / (_this3.dimension.width * _this3.dimension.height) > size) {
                    if (width >= height) {
                        var split = Math.random() * width;
                        divideChunk(x, y, split, height);
                        divideChunk(x + split, y, width - split, height);
                        ++_this3.layout[0];
                    } else {
                        var _split = Math.random() * height;
                        divideChunk(x, y, width, _split);
                        divideChunk(x, y + _split, width, height - _split);
                        ++_this3.layout[1];
                    }
                } else {
                    _this3.chunks.push(new DistortionChunk(x, y, width, height));
                }
            };
            divideChunk(0, 0, this.dimension.width, this.dimension.height);
        }
    }, {
        key: 'generateLines',
        value: function generateLines(size) {
            this.generateEvenChunks([1, Math.floor(this.dimension.height / size)]);
        }
    }, {
        key: 'generateWaves',
        value: function generateWaves(size) {
            var _this4 = this;

            this.waves = [];
            var divideRows = function divideRows(from, to) {
                var rows = Math.floor(to - from);
                if (rows > _this4.layout[1] * size) {
                    var split = Math.floor(Math.random() * rows);
                    divideRows(from, split);
                    divideRows(split, to);
                } else {
                    _this4.waves.push(new DistortionWave(from, to));
                }
            };
            divideRows(0, this.layout[1]);
        }
    }, {
        key: 'addWaves',
        value: function addWaves(intensity) {
            if (this.waves.length) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.waves[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var w = _step.value;

                        var offset = 0;
                        for (var i = w.from; i < w.to; ++i) {
                            offset += Math.PI * 2 / (w.to - w.from);
                            this.chunks[i].distorted.x += Math.sin(offset) * (intensity * w.direction);
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        }
    }, {
        key: 'generateInterference',
        value: function generateInterference(size) {
            var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            this.interference = [];
            for (var i = 0; i < amount; ++i) {
                var from = size < this.layout[1] ? Math.floor(Math.random() * (this.layout[1] - size)) : 0,
                    to = from + size < this.layout[1] ? from + size : this.layout[1];
                this.interference.push(new DistortionInterference(from, to));
            }
        }
    }, {
        key: 'addInterference',
        value: function addInterference(intensity) {
            if (this.interference.length) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.interference[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var f = _step2.value;

                        for (var i = 0, l = f.to - f.from; i < l; ++i) {
                            var random = Math.random() * 5;
                            this.chunks[f.from + i].distorted.x += (intensity - this.easing.easeOutQuart(i, 0, intensity, l)) * f.direction + (random - this.easing.easeOutQuart(i, 0, random, l));
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }
        }
    }, {
        key: 'moveInterference',
        value: function moveInterference() {
            var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            for (var i = 0, l = this.interference.length; i < l; ++i) {
                if (this.interference[i].from < this.interference[i].to) this.interference[i].from += speed;
            }
        }
    }, {
        key: 'addRandomBlur',
        value: function addRandomBlur(min, max) {
            var random = Math.random() * (max - min) + min;
            this.blur = [random, random / 2];
        }
    }, {
        key: 'addRandomRGBSplit',
        value: function addRandomRGBSplit(min, max) {
            var random = Math.random() * (max - min) + min;
            this.RGBSplit = [random, random / 2];
        }
    }, {
        key: 'addRandomTranslate',
        value: function addRandomTranslate(translate) {
            this.translate = [Math.random() * translate - translate / 2, Math.random() * translate - translate / 2];
        }
    }, {
        key: 'transformChunksRandom',
        value: function transformChunksRandom(probability, translate, scale) {
            for (var i = 0, l = this.chunks.length; i < l; ++i) {
                if (Math.random() < probability) {
                    var width = this.chunks[i].distorted.width * scale[0],
                        height = this.chunks[i].distorted.height * scale[1],
                        x = this.chunks[i].distorted.x + (Math.random() * (translate[0] * 2) - translate[0]),
                        y = this.chunks[i].distorted.y + (Math.random() * (translate[1] * 2) - translate[1]);
                    this.chunks[i].distorted.x = x - (width - this.chunks[i].distorted.width) / 2;
                    this.chunks[i].distorted.y = y - (height - this.chunks[i].distorted.height) / 2;
                    this.chunks[i].distorted.width = width;
                    this.chunks[i].distorted.height = height;
                }
            }
        }
    }, {
        key: 'addRandomFragment',
        value: function addRandomFragment(size) {
            var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            this.fragments = [];
            for (var i = 0; i < amount; ++i) {
                var width = Math.random() * (this.dimension.width * size[0]) + 1,
                    height = Math.random() * (this.dimension.height * size[1]) + 1;
                this.fragments.push(new DistortionFragment(Math.random() * (this.dimension.width - width) + this.padding, Math.random() * (this.dimension.height - height) + this.padding, width, height));
            }
        }

        // liquify() {
        //     this.drops = [];
        //     for (let i = 1; i <= this.settings.drops.amount; ++i) {
        //         let size = this.dimension.width * this.settings.drops.size;
        //         this.drops.push({
        //             size: ~~(Math.random() * size + size * .5),
        //             x: ~~(Math.random() * this.dimension.width + this.padding),
        //             y: ~~(Math.random() * (this.dimension.height / 3) + this.padding)
        //         });
        //     }
        //     let canvas = document.createElement('canvas');
        //     this.liquid = {
        //         canvas,
        //         context: canvas.getContext('2d')
        //     };
        //     this.liquid.canvas.width = this.dimension.outerWidth;
        //     this.liquid.canvas.height = this.dimension.outerHeight;
        //     this.liquid.context.drawImage(this.canvas, 0, 0);
        // }
        //
        // melt(i) {
        //     let x = this.drops[i].x,
        //         y = this.drops[i].y + this.drops[i].size * .04;
        //
        //     let dx = x - this.drops[i].x,
        //         dy = y - this.drops[i].y;
        //
        //     this.drops[i].x = x;
        //     this.drops[i].y = y;
        //
        //     x = x - this.drops[i].size / 2;
        //     y = y - this.drops[i].size / 2;
        //
        //     let bitmap = this.liquid.context.getImageData(x, y, this.drops[i].size, this.drops[i].size);
        //
        //     dx = (dx > 0) ? ~~Math.min(bitmap.width / 2, dx) : ~~Math.max(-bitmap.width / 2, dx);
        //     dy = (dy > 0) ? ~~Math.min(bitmap.height / 2, dy) : ~~Math.max(-bitmap.height / 2, dy);
        //
        //     let buffer = this.liquid.context.createImageData(bitmap.width, bitmap.height),
        //         d = bitmap.data,
        //         _d = buffer.data,
        //         bit = 0;
        //
        //     for (let row = 0; row < bitmap.height; ++row) {
        //         for (let col = 0; col < bitmap.width; ++col) {
        //             let xd = bitmap.width / 2 - col,
        //                 yd = bitmap.height / 2 - row,
        //                 dist = Math.sqrt(xd * xd + yd * yd),
        //
        //                 x_liquify = (bitmap.width - dist) / bitmap.width,
        //                 y_liquify = (bitmap.height - dist) / bitmap.height;
        //
        //             let skewX = dist > 0 ? -dx * x_liquify * x_liquify : -dx,
        //                 skewY = dist > 0 ? -dy * y_liquify * y_liquify : -dy;
        //
        //             let fromX = col + skewX + (dx > 0 ? 1 : 0),
        //                 fromY = row + skewY + (dy > 0 ? 1 : 0);
        //
        //             if (fromX < 0 || fromX > bitmap.width) fromX = col;
        //
        //             if (fromY < 0 || fromY > bitmap.height) fromY = row;
        //
        //             let o_bit = ~~fromX * 4 + ~~fromY * bitmap.width * 4;
        //
        //             let contrast = .9;
        //
        //             _d[bit] = ~~((1 - contrast) * d[bit] + contrast * d[o_bit]);
        //             _d[bit + 1] = ~~((1 - contrast) * d[bit + 1] + contrast * d[o_bit + 1]);
        //             _d[bit + 2] = ~~((1 - contrast) * d[bit + 2] + contrast * d[o_bit + 2]);
        //             _d[bit + 3] = ~~((1 - contrast) * d[bit + 3] + contrast * d[o_bit + 3]);
        //
        //             bit += 4;
        //         }
        //     }
        //
        //     if (this.drops[i].size > 1) this.drops[i].size = this.drops[i].size - this.drops[i].size * .01;
        //
        //     this.liquid.context.putImageData(buffer, x, y);
        // }

    }, {
        key: 'reset',
        value: function reset() {
            this.chunks = [];
            this.layout = [0, 0];
            this.waves = [];
            this.interference = [];
            this.translate = [0, 0];
            this.blur = false;
            this.RGBSplit = false;
            this.fragments = [];
            this.changed = true;
            this.frame = false;
        }
    }, {
        key: 'update',
        value: function update() {
            if (this.frame > 0) --this.frame;

            this.translate = [0, 0];
            this.blur = false;
            this.RGBSplit = false;
            this.fragments = [];
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.split.context.clearRect(0, 0, this.split.canvas.width, this.split.canvas.height);
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.chunks.length) {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = this.chunks[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var chunk = _step3.value;

                        var o = chunk.original,
                            d = chunk.distorted;
                        this.context.globalAlpha = chunk.alpha;
                        this.context.drawImage(this.image.canvas, o.x, o.y, o.width, o.height, d.x + this.padding + this.translate[0], d.y + this.padding + this.translate[1], d.width, d.height);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            } else {
                this.context.drawImage(this.image.canvas, this.padding, this.padding);
            }
            if (this.fragments.length) {
                this.context.fillStyle = this.settings.fragmentColor;
                this.context.globalCompositeOperation = 'difference';
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = this.fragments[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var f = _step4.value;
                        this.context.fillRect(f.x, f.y, f.width, f.height);
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }

                this.context.globalCompositeOperation = 'source-over';
            }
            if (this.blur) {
                this.split.context.drawImage(this.canvas, 0, 0);
                this.context.globalAlpha = .15;
                this.context.drawImage(this.split.canvas, -this.blur[0], 0);
                this.context.drawImage(this.split.canvas, this.blur[0], 0);
                this.context.drawImage(this.split.canvas, -this.blur[1], 0);
                this.context.drawImage(this.split.canvas, this.blur[1], 0);
                this.context.globalAlpha = 1;
            }
            if (this.RGBSplit) {
                this.split.context.drawImage(this.canvas, 0, 0);
                this.split.context.globalCompositeOperation = 'source-in';
                this.split.context.fillStyle = 'rgba(0,255,255,1)';
                this.split.context.fillRect(0, 0, this.dimension.outerWidth, this.dimension.outerHeight);
                this.context.drawImage(this.split.canvas, -this.RGBSplit[0], 0);
                this.split.context.fillStyle = 'rgba(255,0,255,1)';
                this.split.context.fillRect(0, 0, this.dimension.outerWidth, this.dimension.outerHeight);
                this.context.drawImage(this.split.canvas, this.RGBSplit[0], 0);
                this.split.context.fillStyle = this.overlay;
                this.split.context.fillRect(0, 0, this.dimension.outerWidth, this.dimension.outerHeight);
                this.split.context.globalCompositeOperation = 'source-over';
                this.context.drawImage(this.split.canvas, 0, 0);
            }
        }
    }, {
        key: 'windowOnResize',
        value: function windowOnResize() {
            this.measure();
            this.resize();
            this.reset();
        }
    }, {
        key: 'addEventListener',
        value: function addEventListener() {
            this.$window.on('resize', this.windowOnResize.bind(this));
        }
    }, {
        key: 'addCustomEasing',
        value: function addCustomEasing() {
            this.easing = {
                easeOutQuart: function easeOutQuart(t, b, c, d) {
                    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
                }
            };
        }
    }, {
        key: '$el',
        set: function set(el) {
            this._$el = el;
            this.collectData();
            this.measure();
            this.resize();
        },
        get: function get() {
            return this._$el;
        }
    }, {
        key: 'padding',
        set: function set(padding) {
            if (this._padding != padding) {
                this._padding = padding;
                this.dimension.outerWidth = this.dimension.width + padding * 2;
                this.dimension.outerHeight = this.dimension.height + padding * 2;
                this.renderStyles();
                this.resize();
                this.changed = true;
            }
        },
        get: function get() {
            return this._padding;
        }
    }, {
        key: 'overlay',
        set: function set(color) {
            if (this._overlay != color) {
                this._overlay = color;
                if (this.image) {
                    this.colorOverlay();
                    this.changed = true;
                }
            }
        },
        get: function get() {
            return this._overlay;
        }
    }]);

    return Distortion;
}();

module.exports = Distortion;

},{}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Distortion = require('./distortion');

var ImageDistortion = function (_Distortion) {
    _inherits(ImageDistortion, _Distortion);

    function ImageDistortion(image) {
        _classCallCheck(this, ImageDistortion);

        var _this = _possibleConstructorReturn(this, (ImageDistortion.__proto__ || Object.getPrototypeOf(ImageDistortion)).call(this));

        _this.padding = 150;

        _this.$el = image;

        _this.wrapCanvas();
        _this.loadIMG();
        return _this;
    }

    _createClass(ImageDistortion, [{
        key: 'windowOnResize',
        value: function windowOnResize() {
            _get(ImageDistortion.prototype.__proto__ || Object.getPrototypeOf(ImageDistortion.prototype), 'windowOnResize', this).call(this);
        }
    }]);

    return ImageDistortion;
}(Distortion);

module.exports = ImageDistortion;

},{"./distortion":6}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Distortion = require('./distortion');

var SVGDistortion = function (_Distortion) {
    _inherits(SVGDistortion, _Distortion);

    function SVGDistortion(svg) {
        _classCallCheck(this, SVGDistortion);

        var _this = _possibleConstructorReturn(this, (SVGDistortion.__proto__ || Object.getPrototypeOf(SVGDistortion)).call(this));

        _this.$el = svg;

        _this.wrapCanvas();
        _this.loadSVG();
        _this.updateColor();
        return _this;
    }

    _createClass(SVGDistortion, [{
        key: 'updateColor',
        value: function updateColor() {
            var color = window.getComputedStyle(document.querySelector('body'), ':before').getPropertyValue('color');
            if (this.overlay != color) {
                this.overlay = color;
                this.settings.fragmentColor = color;
                this.changed = true;
            }
        }
    }, {
        key: 'update',
        value: function update() {
            _get(SVGDistortion.prototype.__proto__ || Object.getPrototypeOf(SVGDistortion.prototype), 'update', this).call(this);
            this.updateColor();
        }
    }, {
        key: 'resize',
        value: function resize() {
            _get(SVGDistortion.prototype.__proto__ || Object.getPrototypeOf(SVGDistortion.prototype), 'resize', this).call(this);
        }
    }]);

    return SVGDistortion;
}(Distortion);

module.exports = SVGDistortion;

},{"./distortion":6}],9:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Distortion = require('./distortion');

var VideoDistortion = function (_Distortion) {
    _inherits(VideoDistortion, _Distortion);

    function VideoDistortion() {
        _classCallCheck(this, VideoDistortion);

        var _this = _possibleConstructorReturn(this, (VideoDistortion.__proto__ || Object.getPrototypeOf(VideoDistortion)).call(this));

        _this._src;
        _this._fallback;

        _this.image = _this.createCanvas();

        _this.cache = {};

        _this.data = {};

        _this.framerate = 24;

        _this.playing = false;

        _this.interval;
        return _this;
    }

    _createClass(VideoDistortion, [{
        key: 'createVideo',
        value: function createVideo(src) {
            var _this2 = this;

            var video = document.createElement('video');
            video.addEventListener('playing', function (e) {
                _this2.playing = true;
                _this2.loaded = true;
                _this2.data = {
                    naturalWidth: video.videoWidth,
                    naturalHeight: video.videoHeight
                };
                _this2.coverImage();
            });
            video.autoplay = true;
            video.loop = true;
            video.src = src;
            return video;
        }
    }, {
        key: 'addCanvas',
        value: function addCanvas(el) {
            this.$el = el;
            this.appendCanvas();
            this.resizeImage();
        }
    }, {
        key: 'coverImage',
        value: function coverImage() {
            var ratio = this.dimension.width / this.data.naturalWidth,
                width = this.dimension.width,
                height = this.data.naturalHeight * ratio;

            if (height < this.dimension.height) {
                ratio = this.dimension.height / this.data.naturalHeight;
                width = this.data.naturalWidth * ratio;
                height = this.dimension.height;
            }

            var x = (this.dimension.width - width) / 2,
                y = (this.dimension.height - height) / 2;

            this.data.width = width;
            this.data.height = height;
            this.data.x = x;
            this.data.y = y;
        }
    }, {
        key: 'prerenderImage',
        value: function prerenderImage() {
            this.image.context.drawImage(this.playing ? this.video : this.image.raw, this.data.x, this.data.y, this.data.width, this.data.height);
        }
    }, {
        key: 'play',
        value: function play() {
            this.capture();
        }
    }, {
        key: 'capture',
        value: function capture() {
            var _this3 = this;

            this.interval = setInterval(function () {
                if ((_this3.video || _this3.image.raw) && _this3.data) {
                    _this3.image.context.drawImage(_this3.playing ? _this3.video : _this3.image.raw, _this3.data.x, _this3.data.y, _this3.data.width, _this3.data.height);
                    _this3.changed = true;
                }
            }, 1000 / this.framerate);
        }
    }, {
        key: 'stop',
        value: function stop() {
            clearInterval(this.interval);
        }
    }, {
        key: 'windowOnResize',
        value: function windowOnResize() {
            _get(VideoDistortion.prototype.__proto__ || Object.getPrototypeOf(VideoDistortion.prototype), 'windowOnResize', this).call(this);
            this.coverImage();
        }
    }, {
        key: 'src',
        set: function set(src) {
            if (src != this._src) {
                this._src = src;
                if (this.cache[src]) {
                    this.video = this.cache[src];
                } else {
                    this.video = this.createVideo(src);
                    this.cache[src] = this.video;
                }
            }
        },
        get: function get() {
            return this._src;
        }
    }, {
        key: 'fallback',
        set: function set(src) {
            var _this4 = this;

            this._fallback = src;
            this.loadIMG(src).then(function () {
                _this4.data = {
                    naturalWidth: _this4.image.raw.naturalWidth,
                    naturalHeight: _this4.image.raw.naturalHeight
                };
                _this4.coverImage();
            });
        },
        get: function get() {
            return this._fallback;
        }
    }]);

    return VideoDistortion;
}(Distortion);

module.exports = VideoDistortion;

},{"./distortion":6}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RenderEngine = function () {
    function RenderEngine() {
        _classCallCheck(this, RenderEngine);

        this.$html = $('html');

        this.animations = [];

        this.animationFrame;
        this.interval;

        this.badfps = 0;
        this.last = 0;
        this.badfpsreset;

        this.performance = true;
    }

    _createClass(RenderEngine, [{
        key: 'update',
        value: function update() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.animations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var a = _step.value;

                    if (a.update) a.update();
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }, {
        key: 'heartbeat',
        value: function heartbeat() {
            var _this = this;

            this.interval = setInterval(function () {
                _this.update();
            }, 1000 / 60);
        }
    }, {
        key: 'loop',
        value: function loop() {
            var _this2 = this;

            this.animationFrame = requestAnimationFrame(function (time) {
                if (time - _this2.last > 1000 / 24) {
                    if (++_this2.badfps > 50) {
                        _this2.performance = false;
                        _this2.$html.addClass('save-performance');
                    }
                    if (_this2.badfpsreset) clearTimeout(_this2.badfpsreset);
                    _this2.badfpsreset = setTimeout(function () {
                        _this2.badfps = 0;
                    }, 1000);
                }
                _this2.last = time;
                _this2.loop();
            });
            this.frame();
        }
    }, {
        key: 'frame',
        value: function frame() {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.animations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var a = _step2.value;

                    if (a.loaded && a.changed && (this.performance || !this.performance && !a.ignore)) {
                        if (a.clear) a.clear();
                        if (a.render) a.render();
                        a.changed = false;
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    }, {
        key: 'start',
        value: function start() {
            this.heartbeat();
            this.loop();
        }
    }, {
        key: 'pause',
        value: function pause() {
            cancelAnimationFrame(this.animationFrame);
            clearInterval(this.interval);
        }
    }]);

    return RenderEngine;
}();

module.exports = RenderEngine;

},{}],11:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DATA = require('./../00_settings/data.json'),
    RenderEngine = require('./render-engine/render-engine'),
    ScrollControl = require('./scroll/scroll-control'),
    SVGDistortion = require('./distortions/svg-distortion'),
    ImageDistortion = require('./distortions/image-distortion'),
    VideoDistortion = require('./distortions/video-distortion'),
    AudioVisualization = require('./audio-visualization/audio-visualization');

var PIXIBackground = function () {
    function PIXIBackground() {
        _classCallCheck(this, PIXIBackground);

        this.$window = $(window);

        this.width = 1280;
        this.height = 720;

        this.dimension = {
            width: 0,
            height: 0
        };

        this.measure();

        var renderer = new PIXI.autoDetectRenderer(this.width, this.height, { transparent: true }),
            stage = new PIXI.Container();

        var displacementmap = new PIXI.Sprite.fromImage('assets/images/displacement-map.png');
        displacementmap.width = this.width;
        displacementmap.height = this.height;

        this.$canvas = $(renderer.view);

        this.pixi = {
            renderer: renderer,
            stage: stage,
            displacementmap: displacementmap
        };

        this.pixi.stage.addChild(this.pixi.displacementmap);
        this.pixi.filter = new PIXI.filters.DisplacementFilter(this.pixi.displacementmap);
        this.pixi.stage.filters = [this.pixi.filter];

        this.loaded = true;

        this.ignore = true;
    }

    _createClass(PIXIBackground, [{
        key: 'addCanvas',
        value: function addCanvas(el) {
            el.append(this.pixi.renderer.view);
        }
    }, {
        key: 'measure',
        value: function measure() {
            this.dimension = {
                width: this.$window.width(),
                height: this.$window.height()
            };
        }
    }, {
        key: 'resize',
        value: function resize() {
            this.$canvas.css({
                width: this.width,
                height: this.height
            });
            this.pixi.displacementmap.width = this.width;
            this.pixi.displacementmap.height = this.height;
            this.pixi.sprite.width = this.width;
            this.pixi.sprite.height = this.height;
        }
    }, {
        key: 'update',
        value: function update() {
            function easeOutExpo(t, b, c, d) {
                return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
            }
            this.changed = true;
            if (this.frame > 0) {
                --this.frame;
                this.pixi.filter.scale.x = 25000 - easeOutExpo(60 - this.frame, 0, 25000, 60);
                this.pixi.filter.scale.y = 25000 - easeOutExpo(60 - this.frame, 0, 25000, 60);
            }
        }
    }, {
        key: 'clear',
        value: function clear() {}
    }, {
        key: 'render',
        value: function render() {
            this.pixi.renderer.render(this.pixi.stage);
        }
    }, {
        key: 'audioOnPeak',
        value: function audioOnPeak(name, value) {
            var _this = this;

            var action = {
                'bass': function bass(value) {
                    if (_this.frame < 15) {
                        _this.frame = 15;
                        if (_this.pixi.texture.baseTexture.source.duration) _this.pixi.texture.baseTexture.source.currentTime = Math.random() * _this.pixi.texture.baseTexture.source.duration;
                    }
                }
            };
            if (action[name]) action[name](value);
        }
    }, {
        key: 'src',
        set: function set(src) {
            this._src = src;
            if (this.pixi.texture) {
                this.pixi.texture.baseTexture.source.pause();
            }
            this.pixi.texture = new PIXI.Texture.fromVideo(src);
            this.pixi.texture.baseTexture.source.loop = true;
            this.pixi.sprite = new PIXI.Sprite(this.pixi.texture);
            this.pixi.sprite.width = this.width;
            this.pixi.sprite.height = this.height;
            this.pixi.stage.addChild(this.pixi.sprite);
            this.frame = 60;
        },
        get: function get() {
            return this._src;
        }
    }]);

    return PIXIBackground;
}();

var HeroTitleDistortion = function (_SVGDistortion) {
    _inherits(HeroTitleDistortion, _SVGDistortion);

    function HeroTitleDistortion(svg) {
        _classCallCheck(this, HeroTitleDistortion);

        var _this2 = _possibleConstructorReturn(this, (HeroTitleDistortion.__proto__ || Object.getPrototypeOf(HeroTitleDistortion)).call(this, svg));

        _this2.padding = 25;
        return _this2;
    }

    _createClass(HeroTitleDistortion, [{
        key: 'update',
        value: function update() {
            _get(HeroTitleDistortion.prototype.__proto__ || Object.getPrototypeOf(HeroTitleDistortion.prototype), 'update', this).call(this);

            if (this.frame > 0 && !(this.frame % 2)) {
                if (this.frame > 24) {
                    this.generateRandomChunks(.2);
                    this.transformChunksRandom(.75, [0, 0], [1.25, 1]);
                    this.addRandomTranslate(8);
                    this.addRandomFragment([.1, .01], 3);
                    this.addRandomRGBSplit(0, 5);
                } else {
                    this.generateLines(1);
                    this.generateWaves(.8);
                    this.addRandomTranslate(2);
                    this.addWaves(2);
                    this.addRandomFragment([.05, .005]);
                }
                this.changed = true;
            } else if (this.frame === 0) {
                this.reset();
            }
        }
    }, {
        key: 'audioOnPeak',
        value: function audioOnPeak(name, value) {
            var _this3 = this;

            var action = {
                'shakes': function shakes(value) {
                    _this3.frame = 35;
                }
            };
            if (action[name]) action[name](value);
        }
    }]);

    return HeroTitleDistortion;
}(SVGDistortion);

var HeroHeadlineDistortion = function (_SVGDistortion2) {
    _inherits(HeroHeadlineDistortion, _SVGDistortion2);

    function HeroHeadlineDistortion(svg) {
        _classCallCheck(this, HeroHeadlineDistortion);

        var _this4 = _possibleConstructorReturn(this, (HeroHeadlineDistortion.__proto__ || Object.getPrototypeOf(HeroHeadlineDistortion)).call(this, svg));

        _this4.padding = 100;
        return _this4;
    }

    _createClass(HeroHeadlineDistortion, [{
        key: 'update',
        value: function update() {
            _get(HeroHeadlineDistortion.prototype.__proto__ || Object.getPrototypeOf(HeroHeadlineDistortion.prototype), 'update', this).call(this);

            if (this.frame > 0 && !(this.frame % 2)) {
                if (this.frame > 24) {
                    this.generateRandomChunks(.05);
                    this.transformChunksRandom(.25, [25, 10], [1.5, 1]);
                    this.addRandomFragment([.1, .025]);
                    Math.random() > .5 ? this.addRandomBlur(0, 7.5) : this.addRandomRGBSplit(0, 7.5);
                    this.addRandomTranslate(10);
                } else {
                    this.generateLines(1);
                    if (this.frame == 24 && Math.random() > .75) {
                        this.generateInterference(35);
                    }
                    this.generateWaves(.8);
                    this.addWaves(this.frame / 2);
                    this.addInterference(this.frame * 6);
                    if (this.frame) this.moveInterference(1);
                    this.addRandomFragment([.05, .005], 2);
                    Math.random() > .5 ? this.addRandomBlur(0, 7.5) : this.addRandomRGBSplit(0, 7.5);
                    this.addRandomTranslate(2.5);
                }
                this.changed = true;
            } else if (this.frame === 0) {
                this.reset();
            }
        }
    }, {
        key: 'audioOnPeak',
        value: function audioOnPeak(name, value) {
            var _this5 = this;

            var action = {
                'bass': function bass(value) {
                    _this5.frame = 45;
                }
            };
            if (action[name]) action[name](value);
        }
    }]);

    return HeroHeadlineDistortion;
}(SVGDistortion);

var HeadlineDistortion = function (_SVGDistortion3) {
    _inherits(HeadlineDistortion, _SVGDistortion3);

    function HeadlineDistortion(svg) {
        _classCallCheck(this, HeadlineDistortion);

        var _this6 = _possibleConstructorReturn(this, (HeadlineDistortion.__proto__ || Object.getPrototypeOf(HeadlineDistortion)).call(this, svg));

        _this6.padding = 25;
        return _this6;
    }

    _createClass(HeadlineDistortion, [{
        key: 'update',
        value: function update() {
            _get(HeadlineDistortion.prototype.__proto__ || Object.getPrototypeOf(HeadlineDistortion.prototype), 'update', this).call(this);

            if (this.frame > 0 && !(this.frame % 2)) {
                if (this.frame > 24) {
                    this.generateRandomChunks(.05);
                    this.transformChunksRandom(.1, [100, 0], [2, 1.25]);
                    this.addRandomTranslate(25);
                    this.addRandomFragment([.1, .01], 3);
                    this.addRandomBlur(0, 10);
                } else {
                    this.generateLines(1);
                    this.generateWaves(.9);
                    this.addWaves(this.frame / 3);
                    this.addRandomBlur(0, 10);
                    this.addRandomFragment([.05, .005]);
                }
                this.changed = true;
            } else if (this.frame === 0) {
                this.reset();
            }
        }
    }, {
        key: 'audioOnPeak',
        value: function audioOnPeak(name, value) {
            var _this7 = this;

            var action = {
                'snare': function snare(value) {
                    _this7.frame = 35;
                }
            };
            if (action[name]) action[name](value);
        }
    }]);

    return HeadlineDistortion;
}(SVGDistortion);

var ReelPosterDistortion = function (_VideoDistortion) {
    _inherits(ReelPosterDistortion, _VideoDistortion);

    function ReelPosterDistortion() {
        _classCallCheck(this, ReelPosterDistortion);

        var _this8 = _possibleConstructorReturn(this, (ReelPosterDistortion.__proto__ || Object.getPrototypeOf(ReelPosterDistortion)).call(this));

        _this8.padding = 150;
        _this8.settings.fragmentColor = '#fff';

        _this8.poster = _this8.createCanvas();
        _this8.posterDimension = {};
        return _this8;
    }

    _createClass(ReelPosterDistortion, [{
        key: 'addCanvas',
        value: function addCanvas(el) {
            _get(ReelPosterDistortion.prototype.__proto__ || Object.getPrototypeOf(ReelPosterDistortion.prototype), 'addCanvas', this).call(this, el);

            this.$el.next().prepend(this.poster.canvas);
        }
    }, {
        key: 'measure',
        value: function measure() {
            _get(ReelPosterDistortion.prototype.__proto__ || Object.getPrototypeOf(ReelPosterDistortion.prototype), 'measure', this).call(this);

            if (this.posterDimension) {
                var breakpoint = this.$window.width() <= 1024;
                this.posterDimension.width = this.dimension.width * (breakpoint ? .1 : .2);
                this.posterDimension.height = this.posterDimension.width;
            }
        }
    }, {
        key: 'resize',
        value: function resize() {
            _get(ReelPosterDistortion.prototype.__proto__ || Object.getPrototypeOf(ReelPosterDistortion.prototype), 'resize', this).call(this);

            if (this.poster) {
                this.poster.canvas.width = this.posterDimension.width;
                this.poster.canvas.height = this.posterDimension.height;
            }
        }
    }, {
        key: 'update',
        value: function update() {
            _get(ReelPosterDistortion.prototype.__proto__ || Object.getPrototypeOf(ReelPosterDistortion.prototype), 'update', this).call(this);

            if (this.frame > 0 && !(this.frame % 2)) {
                if (this.frame > 30) {
                    this.generateLines(2);
                    this.generateWaves(.9);
                    this.addWaves(this.frame / 3);
                    this.transformChunksRandom(.9, [5, 0], [1, 1]);
                    this.addRandomTranslate(5);
                    this.addRandomBlur(5, 15);
                } else {
                    this.generateLines(2);
                    if (this.frame == 30 && Math.random() > .25) {
                        this.generateInterference(35);
                    }
                    this.generateWaves(.9);
                    this.addWaves(this.frame / 2);
                    this.addInterference(this.frame * 10);
                    this.moveInterference(2);
                    this.addRandomBlur(5, 10);
                }
                this.changed = true;
            } else if (this.frame === 0) {
                this.reset();
            }
        }
    }, {
        key: 'clear',
        value: function clear() {
            _get(ReelPosterDistortion.prototype.__proto__ || Object.getPrototypeOf(ReelPosterDistortion.prototype), 'clear', this).call(this);

            this.poster.context.clearRect(0, 0, this.poster.canvas.width, this.poster.canvas.height);
        }
    }, {
        key: 'render',
        value: function render() {
            _get(ReelPosterDistortion.prototype.__proto__ || Object.getPrototypeOf(ReelPosterDistortion.prototype), 'render', this).call(this);

            this.context.save();
            this.context.fillStyle = 'rgba(0,0,0,.25)';
            this.context.fillRect(this.padding, this.padding, this.dimension.width, this.dimension.height);
            this.context.restore();

            var x = (this.dimension.width - this.poster.canvas.width) / 2,
                y = (this.dimension.height - this.poster.canvas.height) / 2;
            this.poster.context.drawImage(this.image.canvas, x, y, this.poster.canvas.width, this.poster.canvas.height, 0, 0, this.poster.canvas.width, this.poster.canvas.height);
        }
    }, {
        key: 'audioOnPeak',
        value: function audioOnPeak(name, value) {
            var _this9 = this;

            var action = {
                'bass': function bass(value) {
                    _this9.frame = 35;
                }
            };
            if (action[name]) action[name](value);
        }
    }]);

    return ReelPosterDistortion;
}(VideoDistortion);

var WorkHeadlineDistortion = function (_SVGDistortion4) {
    _inherits(WorkHeadlineDistortion, _SVGDistortion4);

    function WorkHeadlineDistortion(svg) {
        _classCallCheck(this, WorkHeadlineDistortion);

        var _this10 = _possibleConstructorReturn(this, (WorkHeadlineDistortion.__proto__ || Object.getPrototypeOf(WorkHeadlineDistortion)).call(this, svg));

        _this10.padding = 50;
        return _this10;
    }

    _createClass(WorkHeadlineDistortion, [{
        key: 'update',
        value: function update() {
            _get(WorkHeadlineDistortion.prototype.__proto__ || Object.getPrototypeOf(WorkHeadlineDistortion.prototype), 'update', this).call(this);

            if (this.frame > 0 && !(this.frame % 2)) {
                if (this.frame > 24) {
                    this.generateRandomChunks(.05);
                    this.transformChunksRandom(.25, [100, 0], [1.75, 1.25]);
                    this.addRandomTranslate(25);
                    this.addRandomFragment([.1, .01], 3);
                    Math.random() > .5 ? this.addRandomBlur(0, 10) : this.addRandomRGBSplit(0, 10);
                } else {
                    this.generateLines(2);
                    this.generateWaves(.9);
                    this.addWaves(this.frame / 3);
                    Math.random() > .5 ? this.addRandomBlur(0, 8) : this.addRandomRGBSplit(0, 8);
                    this.addRandomFragment([.05, .005]);
                }
                this.changed = true;
            } else if (this.frame === 0) {
                this.reset();
            }
        }
    }, {
        key: 'audioOnPeak',
        value: function audioOnPeak(name, value) {
            var _this11 = this;

            var action = {
                'snare': function snare(value) {
                    _this11.frame = 35;
                }
            };
            if (action[name]) action[name](value);
        }
    }]);

    return WorkHeadlineDistortion;
}(SVGDistortion);

var WorkCoverDistortion = function (_VideoDistortion2) {
    _inherits(WorkCoverDistortion, _VideoDistortion2);

    function WorkCoverDistortion() {
        _classCallCheck(this, WorkCoverDistortion);

        var _this12 = _possibleConstructorReturn(this, (WorkCoverDistortion.__proto__ || Object.getPrototypeOf(WorkCoverDistortion)).call(this));

        _this12.padding = 150;
        _this12.settings.fragmentColor = '#fff';
        return _this12;
    }

    _createClass(WorkCoverDistortion, [{
        key: 'update',
        value: function update() {
            _get(WorkCoverDistortion.prototype.__proto__ || Object.getPrototypeOf(WorkCoverDistortion.prototype), 'update', this).call(this);

            if (this.frame > 0 && !(this.frame % 2)) {
                if (this.frame > 30) {
                    this.generateLines(2);
                    this.generateWaves(.9);
                    this.addWaves(this.frame / 3);
                    this.transformChunksRandom(.9, [5, 0], [1, 1]);
                    this.addRandomTranslate(5);
                    this.addRandomBlur(5, 15);
                } else {
                    this.generateLines(2);
                    if (this.frame == 30 && Math.random() > .25) {
                        this.generateInterference(35);
                    }
                    this.generateWaves(.9);
                    this.addWaves(this.frame / 2);
                    this.addInterference(this.frame * 10);
                    this.moveInterference(2);
                    this.addRandomBlur(5, 10);
                }
                this.changed = true;
            } else if (this.frame === 0) {
                this.reset();
            }
        }
    }, {
        key: 'audioOnPeak',
        value: function audioOnPeak(name, value) {
            var _this13 = this;

            var action = {
                'bass': function bass(value) {
                    _this13.frame = 35;
                }
            };
            if (action[name]) action[name](value);
        }
    }]);

    return WorkCoverDistortion;
}(VideoDistortion);

var LogoDistortion = function (_SVGDistortion5) {
    _inherits(LogoDistortion, _SVGDistortion5);

    function LogoDistortion(svg) {
        _classCallCheck(this, LogoDistortion);

        var _this14 = _possibleConstructorReturn(this, (LogoDistortion.__proto__ || Object.getPrototypeOf(LogoDistortion)).call(this, svg));

        _this14.padding = 50;
        return _this14;
    }

    _createClass(LogoDistortion, [{
        key: 'update',
        value: function update() {
            _get(LogoDistortion.prototype.__proto__ || Object.getPrototypeOf(LogoDistortion.prototype), 'update', this).call(this);

            if (this.frame > 0 && !(this.frame % 2)) {
                if (this.frame > 14) {
                    this.generateRandomChunks(.05);
                    this.transformChunksRandom(.25, [10, 0], [1.25, 1.1]);
                    this.addRandomTranslate(5);
                    this.addRandomFragment([.05, .005]);
                } else {
                    this.generateLines(2);
                    this.generateWaves(1);
                    this.addWaves(this.frame / 5);
                    this.addRandomFragment([.05, .005]);
                }
                this.changed = true;
            } else if (this.frame === 0) {
                this.reset();
            }
        }
    }, {
        key: 'audioOnPeak',
        value: function audioOnPeak(name, value) {
            var _this15 = this;

            var action = {
                'snare': function snare(value) {
                    _this15.frame = 35;
                }
            };
            if (action[name]) action[name](value);
        }
    }]);

    return LogoDistortion;
}(SVGDistortion);

var LightLogoDistortion = function (_SVGDistortion6) {
    _inherits(LightLogoDistortion, _SVGDistortion6);

    function LightLogoDistortion(svg, sync) {
        _classCallCheck(this, LightLogoDistortion);

        var _this16 = _possibleConstructorReturn(this, (LightLogoDistortion.__proto__ || Object.getPrototypeOf(LightLogoDistortion)).call(this, svg));

        _this16.padding = 50;

        _this16.sync = sync;
        return _this16;
    }

    _createClass(LightLogoDistortion, [{
        key: 'update',
        value: function update() {
            _get(LightLogoDistortion.prototype.__proto__ || Object.getPrototypeOf(LightLogoDistortion.prototype), 'update', this).call(this);

            if (this.frame > 0 && !(this.frame % 2)) {
                if (this.frame > 14) {
                    this.generateRandomChunks(.25);
                    this.transformChunksRandom(.25, [15, 0], [1.75, 1.25]);
                    this.addRandomTranslate(8);
                    this.addRandomFragment([.05, .005]);
                    this.addRandomRGBSplit(0, 5);
                } else {
                    this.generateLines(2);
                    this.generateWaves(1);
                    this.addWaves(this.frame / 5);
                    this.addRandomFragment([.05, .005]);
                }
                this.changed = true;
            } else if (this.frame === 0) {
                this.reset();
            }
        }
    }, {
        key: 'audioOnPeak',
        value: function audioOnPeak(name, value) {
            var _this17 = this;

            var action = {
                'snare': function snare(value) {
                    if (_this17.sync || !_this17.sync && Math.random() < .1) _this17.frame = 35;
                }
            };
            if (action[name]) action[name](value);
        }
    }]);

    return LightLogoDistortion;
}(SVGDistortion);

var YearInReview = function () {
    function YearInReview() {
        _classCallCheck(this, YearInReview);

        this.$window = $(window);
        this.$document = $(document);
        this.$html = $('html');
        this.$body = $('body');
        this.$main = $('main');
        this.$navToggle = $('.nav-toggle');
        this.$shareToggle = $('.share-toggle');
        this.$shareOverlay = $('.share-overlay');
        this.$mainNav = $('#nav');
        this.$workNav = $('.work-nav');
        this.$toggleMute = $('.toggle-mute');
        this.$scrollIndicator = $('.scroll-indicator');
        this.$introTakover = $('.intro-takeover');
        this.$reelVideo = $('.reel-video');
        this.$workExample = $('.work-example');
        this.$workModal = $('.work-modal');
        this.$contact = $('.contact');

        this.engine = new RenderEngine();
        this.scroll = new ScrollControl(this.$main.find('section[data-section-id]'));
        this.audio = new AudioVisualization();

        this.background = {};
        this.background = new PIXIBackground();
        this.background.addCanvas(this.$body.find('> .background'));
        this.background.src = DATA.videos['reel'].src;

        this.audio.src = DATA.audio.src;
        this.audio.peaks = DATA.audio.peaks;
        this.audio.volume = 0;

        this.mute = false;

        this.autoplay = false;

        this.animation = {
            globals: [],
            section: {}
        };

        this.coverSlideTimeout;

        this.reelOpen = false;
        this.reelCursorTimeout;

        this.wrapLetters();
        this.setReelSize();
        this.setJoinUsSectionHeight();
        this.gatherAnimations();
        this.addEventListener();

        this.scroll.start();
        this.engine.start();
        this.audio.play();
        this.audio.seek(4.5);
        this.audio.unmute(1000);

        this.fetchSoundcloudData();

        this.initialSequence();
    }

    _createClass(YearInReview, [{
        key: 'wrapLetters',
        value: function wrapLetters() {
            var el = $('[data-wrap-letters]'),
                delay = parseInt(el.data('delay')) || 1;
            el.each(function (k, v) {
                var $el = $(v),
                    text = $el.text().split('').join('</span><span>');
                $el.html('<span>' + text + '</span>');
                $el.find('span').each(function (k, v) {
                    var d = Math.random() * .5 + delay;
                    $(v).css({ 'transition-delay': d + 's' });
                });
            });
            $('.intro-takeover svg *').each(function (k, v) {
                var d = Math.random() * .5 + .5;
                $(v).css({ 'transition-delay': d + 's' });
            });
        }
    }, {
        key: 'setReelSize',
        value: function setReelSize() {
            $('.reel-video .player').css({
                'width': window.innerWidth < 768 ? window.innerHeight / 60.85 * 100 : ''
            });
        }
    }, {
        key: 'setJoinUsSectionHeight',
        value: function setJoinUsSectionHeight() {
            var $el = $('section.join-us'),
                $grid = $el.find('.social-grid'),
                $last = $grid.find('li').last();
            var height = $grid.position().top * 2 + $last.position().top + $last.height();
            $el.css({ 'height': height });
        }
    }, {
        key: 'gatherAnimations',
        value: function gatherAnimations() {

            var animation = {
                'hero': function hero() {
                    return [new HeroTitleDistortion(this.find('.year-in-review svg')), new HeroHeadlineDistortion(this.find('.mmxvi svg')), new HeroHeadlineDistortion(this.find('.mmxvi-vertical svg'))];
                },
                'reel': function reel() {
                    return [new HeadlineDistortion(this.find('.headline svg'))];
                },
                'reel-video': function reelVideo() {
                    var video = new ReelPosterDistortion();
                    video.src = 'assets/video/reel-teaser.mp4';
                    video.fallback = 'assets/images/fallback/reel-teaser.jpg';
                    video.addCanvas(this.find('.poster'));
                    return [video];
                },
                'work': function work() {
                    return [new HeadlineDistortion(this.find('.headline svg'))];
                },
                'bb-dakota': function bbDakota() {
                    var video = new WorkCoverDistortion();
                    video.src = 'assets/video/bb-dakota.mp4';
                    video.fallback = 'assets/images/fallback/bb-dakota.jpg';
                    video.addCanvas(this.find('.video'));
                    $(video.video).prependTo('.work-modal[data-work-modal-id="bb-dakota"] .video');
                    return [new WorkHeadlineDistortion(this.find('svg.headline')), video];
                },
                'beats': function beats() {
                    var video = new WorkCoverDistortion();
                    video.src = 'assets/video/beats.mp4';
                    video.fallback = 'assets/images/fallback/beats.jpg';
                    video.addCanvas(this.find('.video'));
                    $(video.video).prependTo('.work-modal[data-work-modal-id="beats"] .video');
                    return [new WorkHeadlineDistortion(this.find('svg.headline')), video];
                },
                'chrome': function chrome() {
                    var video = new WorkCoverDistortion();
                    video.src = 'assets/video/chrome.mp4';
                    video.fallback = 'assets/images/fallback/chrome.jpg';
                    video.addCanvas(this.find('.video'));
                    $(video.video).prependTo('.work-modal[data-work-modal-id="chrome"] .video');
                    return [new WorkHeadlineDistortion(this.find('svg.headline')), video];
                },
                'fender': function fender() {
                    var video = new WorkCoverDistortion();
                    video.src = 'assets/video/fender.mp4';
                    video.fallback = 'assets/images/fallback/fender.jpg';
                    video.addCanvas(this.find('.video'));
                    $(video.video).prependTo('.work-modal[data-work-modal-id="fender"] .video');
                    return [new WorkHeadlineDistortion(this.find('svg.headline')), video];
                },
                'keen': function keen() {
                    var video = new WorkCoverDistortion();
                    video.src = 'assets/video/keen.mp4';
                    video.fallback = 'assets/images/fallback/keen.jpg';
                    video.addCanvas(this.find('.video'));
                    $(video.video).prependTo('.work-modal[data-work-modal-id="keen"] .video');
                    return [new WorkHeadlineDistortion(this.find('svg.headline')), video];
                },
                'billabong': function billabong() {
                    var video = new WorkCoverDistortion();
                    video.src = 'assets/video/billabong.mp4';
                    video.fallback = 'assets/images/fallback/billabong.jpg';
                    video.addCanvas(this.find('.video'));
                    $(video.video).prependTo('.work-modal[data-work-modal-id="billabong"] .video');
                    return [new WorkHeadlineDistortion(this.find('svg.headline')), video];
                },
                'praise': function praise() {
                    return [new HeadlineDistortion(this.find('.headline svg'))];
                },
                'praise-list': function praiseList() {
                    var cl = [];
                    this.find('.headline svg').each(function (k, v) {
                        cl.push(new HeroTitleDistortion($(v)));
                    });
                    return cl;
                },
                'adweek-quote': function adweekQuote() {
                    return [
                    // new LightLogoDistortion(this.find('.icon-quote svg'), true),
                    new LightLogoDistortion(this.find('.adweek svg'), true)];
                },
                'partners': function partners() {
                    return [new HeadlineDistortion(this.find('.headline svg'))];
                },
                'partner-tiles': function partnerTiles() {
                    var cl = [];
                    this.find('svg').each(function (k, v) {
                        cl.push(new LightLogoDistortion($(v), false));
                    });
                    return cl;
                },
                'brandbeats': function brandbeats() {
                    return [new HeadlineDistortion(this.find('.headline svg'))];
                },
                'onward': function onward() {
                    return [new HeadlineDistortion(this.find('.headline svg'))];
                },
                'join-us': function joinUs() {
                    return [new WorkHeadlineDistortion(this.find('.headline svg'))];
                },
                'contact': function contact() {
                    return [new WorkHeadlineDistortion(this.find('.headline svg'))];
                },
                'footer': function footer() {
                    return [new LogoDistortion(this.find('.basic-logo svg'))];
                }
            };

            this.animation.section = {};
            for (var id in animation) {
                this.animation.section[id] = animation[id].call(this.$main.find('section[data-section-id="' + id + '"]'));
            }
        }

        // TODO!!!

    }, {
        key: 'fetchSoundcloudData',
        value: function fetchSoundcloudData() {
            var clientId = 'c7359510f1c011faac238460f0a694ee';
            $.get('https://api.soundcloud.com/users/basicagency/tracks.json?client_id=' + clientId, function (data) {

                // console.log(data);

                var tracks = [];

                for (var i = 0, l = data.length; i < l; ++i) {
                    var li = $('<li />'),
                        index = l - 1 - i < 10 ? '0' + (l - 1 - i) : l - 1 - i,
                        artwork = data[i].artwork_url.replace('-large', '-original'),
                        audio = $('<audio />');
                    audio.attr({ 'src': data[i].stream_url + '?client_id=' + clientId });
                    li.html('\n                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 12" fill="none" stroke="#fff" stroke-width="2" class="curly-line">\n                        <path d="M32,5.6L26.667,2,21.334,5.6,16,2,10.667,5.6,5.333,2,0,6"/>\n                        <path d="M32,11.6L26.667,8l-5.332,3.6L16,8l-5.333,3.6L5.333,8,0,12"/>\n                    </svg>\n                    <span class="tagline">Episode ' + index + '</span>\n                    <div class="cover">\n                        <img src="' + artwork + '">\n                        <a href="' + data[i].permalink_url + '" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41.999 41.999"><path d="M36.068,20.176l-29-20C6.761-0.035,6.363-0.057,6.035,0.114C5.706,0.287,5.5,0.627,5.5,0.999v40c0,0.372,0.206,0.713,0.535,0.886c0.146,0.076,0.306,0.114,0.465,0.114c0.199,0,0.397-0.06,0.568-0.177l29-20c0.271-0.187,0.432-0.494,0.432-0.823S36.338,20.363,36.068,20.176z"/></svg></a>\n                    </div>\n                    <h4>' + data[i].title + '<br><a href="' + data[i].permalink_url + '" target="_blank" class="permalink">Launch on Soundcloud</a></h4>\n                ');
                    $('.soundcloud-playlist ul').append(li);
                    tracks.push(audio);
                }

                function showTrack(i) {
                    var li = $('.soundcloud-playlist li');
                    if (i >= 0 && i < li.length) {
                        var previous = i - 1,
                            next = i + 1;
                        li.removeClass('previous is-active next');
                        li.eq(i).addClass('is-active');
                        if (previous >= 0) {
                            li.eq(previous).addClass('previous');
                            $('.soundcloud-playlist .previous').removeClass('disabled');
                        } else {
                            $('.soundcloud-playlist .previous').addClass('disabled');
                        }
                        if (next < li.length) {
                            li.eq(next).addClass('next');
                            $('.soundcloud-playlist .next').removeClass('disabled');
                        } else {
                            $('.soundcloud-playlist .next').addClass('disabled');
                        }
                    }
                }

                showTrack(0);

                $('.soundcloud-playlist .previous').on('click', function (e) {
                    var index = $('.soundcloud-playlist li.is-active').index() - 1;
                    showTrack(index);
                });
                $('.soundcloud-playlist .next').on('click', function (e) {
                    var index = $('.soundcloud-playlist li.is-active').index() + 1;
                    showTrack(index);
                });

                // TODO!
                $('.soundcloud-playlist .cover a').on('click', function (e) {});
            });
        }
    }, {
        key: 'initialSequence',
        value: function initialSequence() {
            var _this18 = this;

            this.$introTakover.addClass('initialize');
            setTimeout(function () {
                _this18.engine.animations.push(new HeroTitleDistortion($('.intro-takeover .year-in-review svg')));
            }, 2500);
            setTimeout(function () {
                if (_this18.autoplay) {
                    _this18.$introTakover.removeClass('initialize');
                    setTimeout(function () {
                        $('html, body').scrollTop(0);
                        _this18.$body.addClass('initialized');
                    }, 750);
                } else {
                    var explore = _this18.$introTakover.find('.explore');
                    explore.addClass('is-showing');
                    explore.on('click', function () {
                        _this18.audio.stop();
                        _this18.audio.play();
                        _this18.$introTakover.removeClass('initialize');
                        setTimeout(function () {
                            $('html, body').scrollTop(0);
                            _this18.$body.addClass('initialized');
                        }, 750);
                    });
                }
            }, 5250);
        }
    }, {
        key: 'overflowHidden',
        value: function overflowHidden() {
            this.scroll.disable();
            this.$html.addClass('overflow-hidden');
        }
    }, {
        key: 'overflowVisible',
        value: function overflowVisible() {
            this.scroll.enable();
            this.$html.removeClass('overflow-hidden');
        }
    }, {
        key: 'updateTheme',
        value: function updateTheme(id, data) {
            this.$html.removeClass('dark bright show-progress').addClass(data.theme).attr({ 'data-active-section': id });
            if (data.showProgress) this.$html.addClass('show-progress');
        }
    }, {
        key: 'updateEnging',
        value: function updateEnging(id) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.engine.animations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var a = _step.value;
                    if (a.stop) a.stop();
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            this.engine.animations = [];
            if (this.animation.section[id]) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.animation.section[id][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _a = _step2.value;
                        this.engine.animations.push(_a);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }if (DATA.videos[id]) {
                this.engine.animations.push(this.background);
                this.background.src = DATA.videos[id].src;
                this.background.$canvas.addClass('is-active');
            } else {
                this.background.$canvas.removeClass('is-active');
            }
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.engine.animations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var _a2 = _step3.value;
                    if (_a2.play) _a2.play();
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }
    }, {
        key: 'updateNav',
        value: function updateNav(mainNav, workNav) {
            this.$mainNav.find('a').removeClass('is-active').filter('[data-section*="' + mainNav + '"]').addClass('is-active');
            if (workNav) {
                this.$workNav.addClass('is-active');
                this.$workNav.find('a').removeClass('is-active').filter('[data-section*="' + workNav + '"]').addClass('is-active');
            } else {
                this.$workNav.removeClass('is-active');
            }
        }
    }, {
        key: 'startCoverSlideTimeout',
        value: function startCoverSlideTimeout() {
            var _this19 = this;

            var duration = 7500;
            this.coverSlideTimeout = setTimeout(function () {
                _this19.$scrollIndicator.addClass('fill');
                _this19.$scrollIndicator.css({ 'transition-duration': duration + 'ms' });
                _this19.coverSlideTimeout = setTimeout(function () {
                    _this19.$scrollIndicator.removeClass('fill');
                    _this19.scroll.switchSection(1);
                }, duration);
            }, 10);
        }
    }, {
        key: 'stopCoverSlideTimeout',
        value: function stopCoverSlideTimeout() {
            clearTimeout(this.coverSlideTimeout);
            this.$scrollIndicator.removeClass('fill');
        }
    }, {
        key: 'openReel',
        value: function openReel() {
            this.audio.mute(750);
            this.engine.animations = [];
            this.scroll.disable();
            this.$html.addClass('overflow-hidden');
            this.$reelVideo.removeClass('is-active');
            this.$reelVideo.find('.fullscreen-layer').addClass('is-visible');
            this.$reelVideo.find('iframe').attr({ 'src': '//player.vimeo.com/video/200068196?autoplay=1&loop=1&title=0&byline=0&portrait=0' });
            this.reelOpen = true;
        }
    }, {
        key: 'closeReel',
        value: function closeReel() {
            var _this20 = this;

            this.audio.unmute(1000);
            this.updateEnging(this.scroll.activeSection);
            this.scroll.enable();
            this.$html.removeClass('overflow-hidden');
            this.$reelVideo.addClass('is-active');
            this.$reelVideo.find('.fullscreen-layer').removeClass('is-visible');
            this.$reelVideo.find('.close').css({ 'opacity': 0 });
            setTimeout(function () {
                _this20.$reelVideo.find('iframe').attr({ 'src': '' });
            }, 750);
            this.reelOpen = false;
        }
    }, {
        key: 'openWorkModal',
        value: function openWorkModal(id) {
            var modal = this.$workModal.filter('[data-work-modal-id="' + id + '"]');
            this.overflowHidden();
            this.setWorkModalContentOffset(id);
            modal.find('.scroll-container').scrollTop(0);
            modal.addClass('is-open');
            modal.find('img').each(function (k, v) {
                var el = $(v),
                    src = el.attr('data-src');
                if (src) {
                    el.attr({ 'src': src });
                    el.removeAttr('data-src');
                }
            });
        }
    }, {
        key: 'closeWorkModal',
        value: function closeWorkModal(id) {
            var modal = this.$workModal.filter('[data-work-modal-id="' + id + '"]');
            this.overflowVisible();
            modal.removeClass('is-open');
        }
    }, {
        key: 'setWorkModalContentOffset',
        value: function setWorkModalContentOffset(id) {
            var section = this.$workExample.filter('[data-section-id="' + id + '"]'),
                modal = this.$workModal.filter('[data-work-modal-id="' + id + '"]'),
                offset = modal.find('.close').height();
            if (window.innerWidth > 1024) {
                modal.find('.content').css({ 'top': section.find('.description').position().top - offset });
                modal.find('.sticky-content').css({
                    'width': modal.find('.content').width(),
                    'padding-left': section.find('.description').css('padding-left'),
                    'padding-right': section.find('.description').css('padding-right'),
                    'top': section.find('.description').position().top
                });
                modal.find('.media').css({ 'top': section.find('.cover').position().top - offset });
                modal.find('.modal-content').css({ 'padding-bottom': section.find('.cover').position().top - offset });
            } else {
                modal.find('.content').css({ 'top': '' });
                modal.find('.sticky-content').css({
                    'width': '',
                    'padding-left': '',
                    'padding-right': '',
                    'top': ''
                });
                modal.find('.media').css({ 'top': '' });
                modal.find('.modal-content').css({ 'padding-bottom': '' });
            }
        }
    }, {
        key: 'windowOnResize',
        value: function windowOnResize() {
            this.setReelSize();
            this.setJoinUsSectionHeight();

            var openModal = this.$workModal.filter('.is-open');
            if (openModal.length) this.setWorkModalContentOffset(openModal.data('work-modal-id'));
        }
    }, {
        key: 'windowOnFocus',
        value: function windowOnFocus() {
            if (!this.mute) this.audio.unmute(1000);
        }
    }, {
        key: 'windowOnBlur',
        value: function windowOnBlur() {
            if (!this.mute) this.audio.mute();
        }
    }, {
        key: 'documentOnKeydown',
        value: function documentOnKeydown(e) {
            switch (e.keyCode) {
                // esc
                case 27:
                    break;
                // up
                case 38:
                    break;
                // down
                case 40:
                    break;
            }
        }
    }, {
        key: 'documentOnTouchstart',
        value: function documentOnTouchstart() {
            this.$html.addClass('touch');
            this.scroll.touch = true;
            this.scroll.measure();
            this.$document.trigger('resize');
        }
    }, {
        key: 'scrollOnStart',
        value: function scrollOnStart(section) {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.engine.animations[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var a = _step4.value;
                    if (a.stop) a.stop();
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            if (this.reelOpen) this.closeReel();
        }
    }, {
        key: 'scrollOnChange',
        value: function scrollOnChange(section) {
            this.updateTheme(section.id, section.data);
            this.updateEnging(section.id);
            this.updateNav(section.data.mainNavId, section.data.workNavId);

            this.stopCoverSlideTimeout();
            if (section.data.timeout) this.startCoverSlideTimeout();
        }
    }, {
        key: 'scrollOnEnd',
        value: function scrollOnEnd(section) {}
    }, {
        key: 'audioOnAnaylse',
        value: function audioOnAnaylse(data) {}
    }, {
        key: 'audioOnPeak',
        value: function audioOnPeak(data) {
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.engine.animations[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var a = _step5.value;

                    if (a.audioOnPeak) a.audioOnPeak(data.name, data.value);
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }
        }
    }, {
        key: 'navToggleOnClick',
        value: function navToggleOnClick() {
            this.$html.toggleClass('nav-visible');
        }
    }, {
        key: 'scrollIndicatorOnClick',
        value: function scrollIndicatorOnClick() {
            this.scroll.switchSection(1);
        }
    }, {
        key: 'toggleMuteOnClick',
        value: function toggleMuteOnClick() {
            if (!this.mute) {
                this.audio.mute(750);
                this.mute = true;
                this.$toggleMute.addClass('muted');
            } else {
                this.audio.unmute(1000);
                this.mute = false;
                this.$toggleMute.removeClass('muted');
            }
        }
    }, {
        key: 'shareToggleOnClick',
        value: function shareToggleOnClick() {
            this.$body.toggleClass('share-is-open');
        }
    }, {
        key: 'shareOverlayOnClick',
        value: function shareOverlayOnClick(e) {
            if ($(e.target)[0] == $(e.currentTarget).find('ul')[0]) {
                this.$body.removeClass('share-is-open');
            }
        }
    }, {
        key: 'mainNavOnClick',
        value: function mainNavOnClick(e) {
            e.preventDefault();
            this.scroll.scrollToSection($(e.currentTarget).data('section'), true);
            this.$html.removeClass('nav-visible');
        }
    }, {
        key: 'workNavOnClick',
        value: function workNavOnClick(e) {
            e.preventDefault();
            this.scroll.scrollToSection($(e.currentTarget).data('section'));
        }
    }, {
        key: 'reelVideoOnClick',
        value: function reelVideoOnClick() {
            this.reelOpen ? this.closeReel() : this.openReel();
        }
    }, {
        key: 'reelVideoOnMousemove',
        value: function reelVideoOnMousemove(e) {
            var _this21 = this;

            if (this.reelOpen) {
                (function () {
                    var close = _this21.$reelVideo.find('.close');
                    var x = e.pageX - close.width() / 2,
                        y = e.pageY - _this21.$window.scrollTop() - close.height() / 2;
                    close.css({
                        'opacity': 1,
                        'transform': 'translate3d(' + x + 'px, ' + y + 'px, 0)'
                    });
                    if (_this21.reelCursorTimeout) clearTimeout(_this21.reelCursorTimeout);
                    _this21.reelCursorTimeout = setTimeout(function () {
                        close.css({ 'opacity': 0 });
                    }, 250);
                })();
            }
        }
    }, {
        key: 'workExampleOnClick',
        value: function workExampleOnClick(e) {
            var id = $(e.currentTarget).data('work-modal-id');
            this.openWorkModal(id);
        }
    }, {
        key: 'workModalCloseOnClick',
        value: function workModalCloseOnClick(e) {
            var id = $(e.currentTarget).parents('.work-modal').data('work-modal-id');
            this.closeWorkModal(id);
        }
    }, {
        key: 'workModalOnScroll',
        value: function workModalOnScroll(e) {
            var el = $(e.currentTarget),
                top = el.scrollTop();

            var content = el.find('.content'),
                stickyContent = el.find('.sticky-content'),
                padding = el.parent('.work-modal').find('.close').height();

            var difference = content.offset().top + top - this.$window.scrollTop() + stickyContent.height() - el.height();
            if (difference > 0) {
                var oversize = difference + padding,
                    correction = oversize > top ? oversize - top - oversize : -oversize;
                stickyContent.css({ 'transform': 'translate3d(0,' + correction + 'px,0)' });
            } else {
                stickyContent.css({ 'transform': '' });
            }
        }
    }, {
        key: 'workModalOnClick',
        value: function workModalOnClick(e) {
            if (e.target == e.currentTarget) {
                var id = $(e.currentTarget).parents('.work-modal').data('work-modal-id');
                this.closeWorkModal(id);
            }
        }
    }, {
        key: 'addEventListener',
        value: function addEventListener() {
            var _this22 = this;

            this.$window.on('resize', this.windowOnResize.bind(this));
            this.$window.on('focus', this.windowOnFocus.bind(this));
            this.$window.on('blur', this.windowOnBlur.bind(this));

            this.$document.on('keydown', this.documentOnKeydown.bind(this));
            this.$document.one('touchstart', this.documentOnTouchstart.bind(this));

            this.scroll.on('start', this.scrollOnStart.bind(this));
            this.scroll.on('change', this.scrollOnChange.bind(this));
            this.scroll.on('end', this.scrollOnEnd.bind(this));

            this.audio.on('analyse', this.audioOnAnaylse.bind(this));
            this.audio.on('peak', this.audioOnPeak.bind(this));
            this.audio.audio.addEventListener('playing', function () {
                _this22.autoplay = true;
            });

            this.$navToggle.on('click', this.navToggleOnClick.bind(this));
            this.$shareToggle.on('click', this.shareToggleOnClick.bind(this));
            this.$shareOverlay.on('click', this.shareOverlayOnClick.bind(this));

            this.$scrollIndicator.on('click', this.scrollIndicatorOnClick.bind(this));

            this.$toggleMute.on('click', this.toggleMuteOnClick.bind(this));

            var cbt = void 0;
            new Clipboard('.copy-url', {
                text: function text() {
                    return _this22.$shareOverlay.find('input').val();
                },
                target: function target(trigger) {
                    var el = $(trigger);
                    if (cbt) {
                        clearTimeout(cbt);
                        el.removeClass('copied');
                        setTimeout(function () {
                            el.addClass('copied');
                        }, 10);
                    } else {
                        el.addClass('copied');
                    }
                    cbt = setTimeout(function () {
                        el.removeClass('copied');
                    }, 3500);
                }
            });

            this.$mainNav.find('a').on('click', this.mainNavOnClick.bind(this));
            this.$workNav.find('a').on('click', this.workNavOnClick.bind(this));

            this.$reelVideo.find('.toggle-play').on('click', this.reelVideoOnClick.bind(this));
            this.$reelVideo.find('.fullscreen-layer').on('click', this.reelVideoOnClick.bind(this));
            this.$reelVideo.find('.close').on('click', this.reelVideoOnClick.bind(this));
            this.$reelVideo.find('.fullscreen-layer').on('mousemove', this.reelVideoOnMousemove.bind(this));

            this.$workExample.find('button').on('click', this.workExampleOnClick.bind(this));
            this.$workModal.find('.close').on('click', this.workModalCloseOnClick.bind(this));
            this.$workModal.find('.scroll-container').on('click', this.workModalOnClick.bind(this));
            this.$workModal.find('.scroll-container').on('scroll', this.workModalOnScroll.bind(this));

            this.$contact.find('video').on('playing', function (e) {
                _this22.$contact.addClass('video-is-playing');
            });
        }
    }]);

    return YearInReview;
}();

$(document).ready(function () {

    new YearInReview();
});

},{"./../00_settings/data.json":2,"./audio-visualization/audio-visualization":5,"./distortions/image-distortion":7,"./distortions/svg-distortion":8,"./distortions/video-distortion":9,"./render-engine/render-engine":10,"./scroll/scroll-control":12}],12:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScrollControl = function () {
    function ScrollControl(sections) {
        _classCallCheck(this, ScrollControl);

        // private
        this._activeSection;

        // config
        this.DATA_ID_SELECTOR = 'section-id';
        this.ACTIVE_CLASS = 'is-active';
        this.SCROLL_DURATION = 750;
        this.SCROLL_EASING = 'easeInOutCirc';
        this.JUMP_SCROLL = false;
        this.SWITCH_SECTION_TIMEOUT = 1000;
        this.MOUSEWHEEL_TIMEOUT = 750;
        this.SCROLL_TIMEOUT = 250;

        // properties
        this.$window = $(window);
        this.$document = $(document);
        this.$scrollel = $('html, body');
        this.$html = $('html');
        this.$body = $('body');
        this.$sections = sections;

        this.dimension = {};

        this.sections = [];
        this.sectionDimension = {};

        this.freeScroll;

        this.mousewheelDirection = 0;
        this.mousewheelEasing = false;
        this.mousewheelDeltaY = 0;
        this.mousewheelTimeout;

        this.scrollTop = 0;
        this.scrollTimeout;

        this.switchingSection;
        this.sectionDirection;

        this.listener = {};

        this.enabled = true;
        this.touch = false;
    }

    _createClass(ScrollControl, [{
        key: 'start',
        value: function start() {
            this.measure();
            this.addEventListeners();
            this.determineActiveSection();
        }

        // measure all sections and window dimension

    }, {
        key: 'measure',
        value: function measure() {
            var _this = this;

            this.sections = [];
            this.sectionDimension = {};
            this.$sections.each(function (k, v) {
                var $el = $(v),
                    id = $el.data(_this.DATA_ID_SELECTOR),
                    width = $el.outerWidth(true),
                    height = $el.outerHeight(true),
                    offset = $el.offset(),
                    left = offset.left,
                    top = offset.top;
                _this.sections.push(id);
                _this.sectionDimension[id] = { width: width, height: height, left: left, top: top };
            });
            var width = this.$window.width(),
                height = this.$window.height(),
                middle = height / 2;
            this.dimension = { width: width, height: height, middle: middle };
        }
    }, {
        key: 'determineActiveSection',
        value: function determineActiveSection() {
            var active = void 0;
            var middle = this.scrollTop + this.dimension.height / 2;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.sections[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var section = _step.value;

                    var dimension = this.sectionDimension[section];
                    if (middle >= dimension.top && middle <= dimension.top + dimension.height) active = section;
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            this.activeSection = active;
        }
    }, {
        key: 'switchSection',
        value: function switchSection(direction) {
            var _this2 = this;

            var index = this.sections.indexOf(this.activeSection) + direction;
            if (index >= 0 && index < this.sections.length) {
                this.trigger('start', { id: this.sections[index] });
                this.scrollToSection(this.sections[index], false, function () {
                    _this2.trigger('end', { id: _this2.sections[index] });
                });
            }
        }
    }, {
        key: 'scrollToSection',
        value: function scrollToSection(id, jump, cb) {
            var _this3 = this;

            var top = this.sectionDimension[id].top;
            if (this.sectionDimension[id].height > this.dimension.height && this.sections.indexOf(id) < this.sections.indexOf(this._activeSection)) {
                top = this.sectionDimension[id].top + this.sectionDimension[id].height - this.dimension.height;
            }
            this.switchingSection = true;
            var ac = false;
            this.$scrollel.stop(true, this.JUMP_SCROLL).animate({ scrollTop: top }, {
                duration: jump ? 0 : this.SCROLL_DURATION,
                easing: this.SCROLL_EASING,
                complete: function complete() {
                    if (!ac) {
                        if (cb) cb();
                        ac = true;
                    }
                }
            });
            setTimeout(function () {
                _this3.switchingSection = false;
            }, jump ? 0 : this.SWITCH_SECTION_TIMEOUT);
        }
    }, {
        key: 'enable',
        value: function enable() {
            this.enabled = true;
        }
    }, {
        key: 'disable',
        value: function disable() {
            this.enabled = false;
        }
    }, {
        key: 'windowOnResize',
        value: function windowOnResize() {
            this.measure();
        }
    }, {
        key: 'windowOnScroll',
        value: function windowOnScroll(e) {
            var _this4 = this;

            if (this.enabled) {
                this.scrollTop = this.$window.scrollTop();
                this.determineActiveSection();
                if (!this.touch) {
                    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
                    this.scrollTimeout = setTimeout(function () {
                        if (!_this4.freeScroll) _this4.scrollToSection(_this4.activeSection);
                    }, this.SCROLL_TIMEOUT);
                }
                this.trigger('scroll', { top: this.scrollTop });
            }
        }
    }, {
        key: 'windowOnMousewheel',
        value: function windowOnMousewheel(e) {
            var _this5 = this;

            if (this.enabled) {
                var delta = e.originalEvent.deltaY || e.originalEvent.detail,
                    direction = delta > 0 ? 1 : delta === -0 && this.mousewheelDirection > 0 ? 1 : -1,
                    cod = direction != this.mousewheelDirection;
                this.mousewheelDirection = direction;
                this.mousewheelEasing = this.mousewheelDirection > 0 ? delta < this.mousewheelDeltaY + 1 : delta > this.mousewheelDeltaY - 1;
                this.mousewheelDeltaY = delta;

                if (this.mousewheelTimeout) clearTimeout(this.mousewheelTimeout);
                this.mousewheelTimeout = setTimeout(function () {
                    _this5.mousewheelEasing = false;
                }, this.MOUSEWHEEL_TIMEOUT);

                if (!this.freeScroll) {
                    if (!this.switchingSection && !this.mousewheelEasing) {
                        this.switchSection(this.mousewheelDirection);
                    }
                    e.preventDefault();
                    return false;
                } else {
                    if (this.switchingSection) {
                        e.preventDefault();
                        return false;
                    } else {
                        var d = this.sectionDimension[this.activeSection];
                        if (this.mousewheelDirection > 0) {
                            if (this.scrollTop + this.dimension.height - this.dimension.middle / 2 > d.top + d.height) {
                                this.mousewheelEasing ? e.preventDefault() : this.switchSection(1);
                            }
                        } else {
                            if (this.scrollTop + this.dimension.middle / 2 < d.top) {
                                this.mousewheelEasing ? e.preventDefault() : this.switchSection(-1);
                            }
                        }
                    }
                }
            }
        }
    }, {
        key: 'addEventListeners',
        value: function addEventListeners() {
            this.$window.on('resize', this.windowOnResize.bind(this));
            this.$window.on('scroll', this.windowOnScroll.bind(this));

            var event = 'onwheel' in document.createElement('div') ? 'wheel' : document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
            this.$window.on(event, this.windowOnMousewheel.bind(this));
        }

        // custom event listeners

    }, {
        key: 'on',
        value: function on(key, fn) {
            if (!this.listener[key]) this.listener[key] = [];
            this.listener[key].push(fn);
        }
    }, {
        key: 'off',
        value: function off(key) {
            delete this.listener[key];
        }
    }, {
        key: 'trigger',
        value: function trigger(key, data) {
            if (this.listener[key]) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.listener[key][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _fnc = _step2.value;
                        _fnc(data);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }
        }
    }, {
        key: 'activeSection',
        set: function set(id) {
            if (id && id != this.activeSection) {
                this.sectionDirection = this.sections.indexOf(id) > this.sections.indexOf(this._activeSection) ? 1 : -1;
                this.freeScroll = this.sectionDimension[id].height > this.dimension.height;
                var $section = this.$sections.filter('[data-' + this.DATA_ID_SELECTOR + '="' + id + '"]');
                this.$sections.removeClass(this.ACTIVE_CLASS);
                $section.addClass(this.ACTIVE_CLASS);
                this.trigger('change', { id: id, data: $section.data() });
                this._activeSection = id;
            }
        },
        get: function get() {
            return this._activeSection;
        }
    }]);

    return ScrollControl;
}();

module.exports = ScrollControl;

},{}]},{},[1])

