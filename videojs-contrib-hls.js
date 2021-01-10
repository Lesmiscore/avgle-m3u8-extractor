(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }
    g.videojsContribHls = f();
  }
})(function () {
  var define, module, exports;
  return (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw ((f.code = "MODULE_NOT_FOUND"), f);
        }
        var l = (n[o] = { exports: {} });
        t[o][0].call(
          l.exports,
          function (e) {
            var n = t[o][1][e];
            return s(n ? n : e);
          },
          l,
          l.exports,
          e,
          t,
          n,
          r
        );
      }
      return n[o].exports;
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
  })(
    {
      1: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var _slicedToArray = (function () {
            function sliceIterator(arr, i) {
              var _arr = [];
              var _n = true;
              var _d = false;
              var _e = undefined;
              try {
                for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                  _arr.push(_s.value);
                  if (i && _arr.length === i) break;
                }
              } catch (err) {
                _d = true;
                _e = err;
              } finally {
                try {
                  if (!_n && _i["return"]) _i["return"]();
                } finally {
                  if (_d) throw _e;
                }
              }
              return _arr;
            }
            return function (arr, i) {
              if (Array.isArray(arr)) {
                return arr;
              } else if (Symbol.iterator in Object(arr)) {
                return sliceIterator(arr, i);
              } else {
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
              }
            };
          })();
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          var _globalWindow = require("global/window");
          var _globalWindow2 = _interopRequireDefault(_globalWindow);
          var findAdCue = function findAdCue(track, mediaTime) {
            var cues = track.cues;
            for (var i = 0; i < cues.length; i++) {
              var cue = cues[i];
              if (mediaTime >= cue.adStartTime && mediaTime <= cue.adEndTime) {
                return cue;
              }
            }
            return null;
          };
          var updateAdCues = function updateAdCues(media, track) {
            var offset = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
            if (!media.segments) {
              return;
            }
            var mediaTime = offset;
            var cue = undefined;
            for (var i = 0; i < media.segments.length; i++) {
              var segment = media.segments[i];
              if (!cue) {
                cue = findAdCue(track, mediaTime + segment.duration / 2);
              }
              if (cue) {
                if ("cueIn" in segment) {
                  cue.endTime = mediaTime;
                  cue.adEndTime = mediaTime;
                  mediaTime += segment.duration;
                  cue = null;
                  continue;
                }
                if (mediaTime < cue.endTime) {
                  mediaTime += segment.duration;
                  continue;
                }
                cue.endTime += segment.duration;
              } else {
                if ("cueOut" in segment) {
                  cue = new _globalWindow2["default"].VTTCue(mediaTime, mediaTime + segment.duration, segment.cueOut);
                  cue.adStartTime = mediaTime;
                  cue.adEndTime = mediaTime + parseFloat(segment.cueOut);
                  track.addCue(cue);
                }
                if ("cueOutCont" in segment) {
                  var adOffset = undefined;
                  var adTotal = undefined;
                  var _segment$cueOutCont$split$map = segment.cueOutCont.split("/").map(parseFloat);
                  var _segment$cueOutCont$split$map2 = _slicedToArray(_segment$cueOutCont$split$map, 2);
                  adOffset = _segment$cueOutCont$split$map2[0];
                  adTotal = _segment$cueOutCont$split$map2[1];
                  cue = new _globalWindow2["default"].VTTCue(mediaTime, mediaTime + segment.duration, "");
                  cue.adStartTime = mediaTime - adOffset;
                  cue.adEndTime = cue.adStartTime + adTotal;
                  track.addCue(cue);
                }
              }
              mediaTime += segment.duration;
            }
          };
          exports["default"] = {
            updateAdCues: updateAdCues,
            findAdCue: findAdCue,
          };
          module.exports = exports["default"];
        },
        { "global/window": 31 },
      ],
      2: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var textRange = function textRange(range, i) {
            return range.start(i) + "-" + range.end(i);
          };
          var formatHexString = function formatHexString(e, i) {
            var value = e.toString(16);
            return "00".substring(0, 2 - value.length) + value + (i % 2 ? " " : "");
          };
          var formatAsciiString = function formatAsciiString(e) {
            if (e >= 0x20 && e < 0x7e) {
              return String.fromCharCode(e);
            }
            return ".";
          };
          var createTransferableMessage = function createTransferableMessage(message) {
            var transferable = {};
            Object.keys(message).forEach(function (key) {
              var value = message[key];
              if (ArrayBuffer.isView(value)) {
                transferable[key] = {
                  bytes: value.buffer,
                  byteOffset: value.byteOffset,
                  byteLength: value.byteLength,
                };
              } else {
                transferable[key] = value;
              }
            });
            return transferable;
          };
          var initSegmentId = function initSegmentId(initSegment) {
            var byterange = initSegment.byterange || {
              length: Infinity,
              offset: 0,
            };
            return [byterange.length, byterange.offset, initSegment.resolvedUri].join(",");
          };
          var utils = {
            hexDump: function hexDump(data) {
              var bytes = Array.prototype.slice.call(data);
              var step = 16;
              var result = "";
              var hex = undefined;
              var ascii = undefined;
              for (var j = 0; j < bytes.length / step; j++) {
                hex = bytes
                  .slice(j * step, j * step + step)
                  .map(formatHexString)
                  .join("");
                ascii = bytes
                  .slice(j * step, j * step + step)
                  .map(formatAsciiString)
                  .join("");
                result += hex + " " + ascii + "\n";
              }
              return result;
            },
            tagDump: function tagDump(tag) {
              return utils.hexDump(tag.bytes);
            },
            textRanges: function textRanges(ranges) {
              var result = "";
              var i = undefined;
              for (i = 0; i < ranges.length; i++) {
                result += textRange(ranges, i) + " ";
              }
              return result;
            },
            createTransferableMessage: createTransferableMessage,
            initSegmentId: initSegmentId,
          };
          exports["default"] = utils;
          module.exports = exports["default"];
        },
        {},
      ],
      3: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          exports["default"] = {
            GOAL_BUFFER_LENGTH: 30,
            MAX_GOAL_BUFFER_LENGTH: 60,
            GOAL_BUFFER_LENGTH_RATE: 1,
            BANDWIDTH_VARIANCE: 1.2,
            BUFFER_LOW_WATER_LINE: 0,
            MAX_BUFFER_LOW_WATER_LINE: 30,
            BUFFER_LOW_WATER_LINE_RATE: 1,
          };
          module.exports = exports["default"];
        },
        {},
      ],
      4: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          var _globalWindow = require("global/window");
          var _globalWindow2 = _interopRequireDefault(_globalWindow);
          var _aesDecrypter = require("aes-decrypter");
          var _binUtils = require("./bin-utils");
          var DecrypterWorker = function DecrypterWorker(self) {
            self.onmessage = function (event) {
              var data = event.data;
              var encrypted = new Uint8Array(data.encrypted.bytes, data.encrypted.byteOffset, data.encrypted.byteLength);
              var key = new Uint32Array(data.key.bytes, data.key.byteOffset, data.key.byteLength / 4);
              var iv = new Uint32Array(data.iv.bytes, data.iv.byteOffset, data.iv.byteLength / 4);
              new _aesDecrypter.Decrypter(encrypted, key, iv, function (err, bytes) {
                _globalWindow2["default"].postMessage(
                  (0, _binUtils.createTransferableMessage)({
                    source: data.source,
                    decrypted: bytes,
                  }),
                  [bytes.buffer]
                );
              });
            };
          };
          exports["default"] = function (self) {
            return new DecrypterWorker(self);
          };
          module.exports = exports["default"];
        },
        { "./bin-utils": 2, "aes-decrypter": 24, "global/window": 31 },
      ],
      5: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            var _createClass = (function () {
              function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ("value" in descriptor) descriptor.writable = true;
                  Object.defineProperty(target, descriptor.key, descriptor);
                }
              }
              return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
              };
            })();
            var _get = function get(_x, _x2, _x3) {
              var _again = true;
              _function: while (_again) {
                var object = _x,
                  property = _x2,
                  receiver = _x3;
                _again = false;
                if (object === null) object = Function.prototype;
                var desc = Object.getOwnPropertyDescriptor(object, property);
                if (desc === undefined) {
                  var parent = Object.getPrototypeOf(object);
                  if (parent === null) {
                    return undefined;
                  } else {
                    _x = parent;
                    _x2 = property;
                    _x3 = receiver;
                    _again = true;
                    desc = parent = undefined;
                    continue _function;
                  }
                } else if ("value" in desc) {
                  return desc.value;
                } else {
                  var getter = desc.get;
                  if (getter === undefined) {
                    return undefined;
                  }
                  return getter.call(receiver);
                }
              }
            };
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            function _classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            function _inherits(subClass, superClass) {
              if (typeof superClass !== "function" && superClass !== null) {
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
              }
              subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                  value: subClass,
                  enumerable: false,
                  writable: true,
                  configurable: true,
                },
              });
              if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
            }
            var _playlistLoader = require("./playlist-loader");
            var _playlistLoader2 = _interopRequireDefault(_playlistLoader);
            var _segmentLoader = require("./segment-loader");
            var _segmentLoader2 = _interopRequireDefault(_segmentLoader);
            var _vttSegmentLoader = require("./vtt-segment-loader");
            var _vttSegmentLoader2 = _interopRequireDefault(_vttSegmentLoader);
            var _ranges = require("./ranges");
            var _ranges2 = _interopRequireDefault(_ranges);
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var _adCueTags = require("./ad-cue-tags");
            var _adCueTags2 = _interopRequireDefault(_adCueTags);
            var _syncController = require("./sync-controller");
            var _syncController2 = _interopRequireDefault(_syncController);
            var _videojsContribMediaSourcesEs5CodecUtils = require("videojs-contrib-media-sources/es5/codec-utils");
            var _webworkify = require("webworkify");
            var _webworkify2 = _interopRequireDefault(_webworkify);
            var _decrypterWorker = require("./decrypter-worker");
            var _decrypterWorker2 = _interopRequireDefault(_decrypterWorker);
            var _config = require("./config");
            var _config2 = _interopRequireDefault(_config);
            var _utilCodecsJs = require("./util/codecs.js");
            var ABORT_EARLY_BLACKLIST_SECONDS = 60 * 2;
            var Hls = undefined;
            var defaultCodecs = {
              videoCodec: "avc1",
              videoObjectTypeIndicator: ".4d400d",
              audioProfile: "2",
            };
            var loaderStats = ["mediaRequests", "mediaRequestsAborted", "mediaRequestsTimedout", "mediaRequestsErrored", "mediaTransferDuration", "mediaBytesTransferred"];
            var sumLoaderStat = function sumLoaderStat(stat) {
              return this.audioSegmentLoader_[stat] + this.mainSegmentLoader_[stat];
            };
            var objectChanged = function objectChanged(a, b) {
              if (typeof a !== typeof b) {
                return true;
              }
              if (Object.keys(a).length !== Object.keys(b).length) {
                return true;
              }
              for (var prop in a) {
                if (a[prop] !== b[prop]) {
                  return true;
                }
              }
              return false;
            };
            var mapLegacyAvcCodecs_ = function mapLegacyAvcCodecs_(codecString) {
              return codecString.replace(/avc1\.(\d+)\.(\d+)/i, function (match) {
                return (0, _videojsContribMediaSourcesEs5CodecUtils.translateLegacyCodecs)([match])[0];
              });
            };
            exports.mapLegacyAvcCodecs_ = mapLegacyAvcCodecs_;
            var makeMimeTypeString = function makeMimeTypeString(type, container, codecs) {
              return (
                type +
                "/" +
                container +
                '; codecs="' +
                codecs
                  .filter(function (c) {
                    return !!c;
                  })
                  .join(", ") +
                '"'
              );
            };
            var getContainerType = function getContainerType(media) {
              if (media.segments && media.segments.length && media.segments[0].map) {
                return "mp4";
              }
              return "mp2t";
            };
            var getCodecs = function getCodecs(media) {
              var mediaAttributes = media.attributes || {};
              if (mediaAttributes.CODECS) {
                return (0, _utilCodecsJs.parseCodecs)(mediaAttributes.CODECS);
              }
              return defaultCodecs;
            };
            var mimeTypesForPlaylist_ = function mimeTypesForPlaylist_(master, media) {
              var containerType = getContainerType(media);
              var codecInfo = getCodecs(media);
              var mediaAttributes = media.attributes || {};
              var isMuxed = true;
              var isMaat = false;
              if (!media) {
                return [];
              }
              if (master.mediaGroups.AUDIO && mediaAttributes.AUDIO) {
                var audioGroup = master.mediaGroups.AUDIO[mediaAttributes.AUDIO];
                if (audioGroup) {
                  isMaat = true;
                  isMuxed = false;
                  for (var groupId in audioGroup) {
                    if (!audioGroup[groupId].uri) {
                      isMuxed = true;
                      break;
                    }
                  }
                }
              }
              if (isMaat && !codecInfo.audioProfile) {
                _videoJs2["default"].log.warn("Multiple audio tracks present but no audio codec string is specified. " + "Attempting to use the default audio codec (mp4a.40.2)");
                codecInfo.audioProfile = defaultCodecs.audioProfile;
              }
              var codecStrings = {};
              if (codecInfo.videoCodec) {
                codecStrings.video = "" + codecInfo.videoCodec + codecInfo.videoObjectTypeIndicator;
              }
              if (codecInfo.audioProfile) {
                codecStrings.audio = "mp4a.40." + codecInfo.audioProfile;
              }
              var justAudio = makeMimeTypeString("audio", containerType, [codecStrings.audio]);
              var justVideo = makeMimeTypeString("video", containerType, [codecStrings.video]);
              var bothVideoAudio = makeMimeTypeString("video", containerType, [codecStrings.video, codecStrings.audio]);
              if (isMaat) {
                if (!isMuxed && codecStrings.video) {
                  return [justVideo, justAudio];
                }
                return [bothVideoAudio, justAudio];
              }
              if (!codecStrings.video) {
                return [justAudio];
              }
              return [bothVideoAudio];
            };
            exports.mimeTypesForPlaylist_ = mimeTypesForPlaylist_;
            var MasterPlaylistController = (function (_videojs$EventTarget) {
              _inherits(MasterPlaylistController, _videojs$EventTarget);
              function MasterPlaylistController(options) {
                var _this = this;
                _classCallCheck(this, MasterPlaylistController);
                _get(Object.getPrototypeOf(MasterPlaylistController.prototype), "constructor", this).call(this);
                var url = options.url;
                var withCredentials = options.withCredentials;
                var mode = options.mode;
                var tech = options.tech;
                var bandwidth = options.bandwidth;
                var externHls = options.externHls;
                var useCueTags = options.useCueTags;
                var blacklistDuration = options.blacklistDuration;
                var enableLowInitialPlaylist = options.enableLowInitialPlaylist;
                if (!url) {
                  throw new Error("A non-empty playlist URL is required");
                }
                Hls = externHls;
                this.withCredentials = withCredentials;
                this.tech_ = tech;
                this.hls_ = tech.hls;
                this.mode_ = mode;
                this.useCueTags_ = useCueTags;
                this.blacklistDuration = blacklistDuration;
                this.enableLowInitialPlaylist = enableLowInitialPlaylist;
                if (this.useCueTags_) {
                  this.cueTagsTrack_ = this.tech_.addTextTrack("metadata", "ad-cues");
                  this.cueTagsTrack_.inBandMetadataTrackDispatchType = "";
                }
                this.requestOptions_ = {
                  withCredentials: this.withCredentials,
                  timeout: null,
                };
                this.audioGroups_ = {};
                this.subtitleGroups_ = { groups: {}, tracks: {} };
                this.mediaSource = new _videoJs2["default"].MediaSource({
                  mode: mode,
                });
                this.audioinfo_ = null;
                this.mediaSource.on("audioinfo", this.handleAudioinfoUpdate_.bind(this));
                this.mediaSource.addEventListener("sourceopen", this.handleSourceOpen_.bind(this));
                this.seekable_ = _videoJs2["default"].createTimeRanges();
                this.hasPlayed_ = function () {
                  return false;
                };
                this.syncController_ = new _syncController2["default"](options);
                this.segmentMetadataTrack_ = tech.addRemoteTextTrack({ kind: "metadata", label: "segment-metadata" }, false).track;
                this.decrypter_ = (0, _webworkify2["default"])(_decrypterWorker2["default"]);
                var segmentLoaderSettings = {
                  hls: this.hls_,
                  mediaSource: this.mediaSource,
                  currentTime: this.tech_.currentTime.bind(this.tech_),
                  seekable: function seekable() {
                    return _this.seekable();
                  },
                  seeking: function seeking() {
                    return _this.tech_.seeking();
                  },
                  duration: function duration() {
                    return _this.mediaSource.duration;
                  },
                  hasPlayed: function hasPlayed() {
                    return _this.hasPlayed_();
                  },
                  goalBufferLength: function goalBufferLength() {
                    return _this.goalBufferLength();
                  },
                  bandwidth: bandwidth,
                  syncController: this.syncController_,
                  decrypter: this.decrypter_,
                };
                this.masterPlaylistLoader_ = new _playlistLoader2["default"](url, this.hls_, this.withCredentials);
                this.setupMasterPlaylistLoaderListeners_();
                this.audioPlaylistLoader_ = null;
                this.subtitlePlaylistLoader_ = null;
                this.mainSegmentLoader_ = new _segmentLoader2["default"](
                  _videoJs2["default"].mergeOptions(segmentLoaderSettings, {
                    segmentMetadataTrack: this.segmentMetadataTrack_,
                    loaderType: "main",
                  }),
                  options
                );
                this.audioSegmentLoader_ = new _segmentLoader2["default"](
                  _videoJs2["default"].mergeOptions(segmentLoaderSettings, {
                    loaderType: "audio",
                  }),
                  options
                );
                this.subtitleSegmentLoader_ = new _vttSegmentLoader2["default"](
                  _videoJs2["default"].mergeOptions(segmentLoaderSettings, {
                    loaderType: "vtt",
                  }),
                  options
                );
                this.setupSegmentLoaderListeners_();
                loaderStats.forEach(function (stat) {
                  _this[stat + "_"] = sumLoaderStat.bind(_this, stat);
                });
                this.masterPlaylistLoader_.load();
              }
              _createClass(MasterPlaylistController, [
                {
                  key: "setupMasterPlaylistLoaderListeners_",
                  value: function setupMasterPlaylistLoaderListeners_() {
                    var _this2 = this;
                    this.masterPlaylistLoader_.on("loadedmetadata", function () {
                      var media = _this2.masterPlaylistLoader_.media();
                      var requestTimeout = _this2.masterPlaylistLoader_.targetDuration * 1.5 * 1000;
                      if (_this2.masterPlaylistLoader_.isLowestEnabledRendition_()) {
                        _this2.requestOptions_.timeout = 0;
                      } else {
                        _this2.requestOptions_.timeout = requestTimeout;
                      }
                      if (media.endList && _this2.tech_.preload() !== "none") {
                        _this2.mainSegmentLoader_.playlist(media, _this2.requestOptions_);
                        _this2.mainSegmentLoader_.load();
                      }
                      _this2.fillAudioTracks_();
                      _this2.setupAudio();
                      _this2.fillSubtitleTracks_();
                      _this2.setupSubtitles();
                      _this2.triggerPresenceUsage_(_this2.master(), media);
                      try {
                        _this2.setupSourceBuffers_();
                      } catch (e) {
                        _videoJs2["default"].log.warn("Failed to create SourceBuffers", e);
                        return _this2.mediaSource.endOfStream("decode");
                      }
                      _this2.setupFirstPlay();
                      _this2.trigger("audioupdate");
                      _this2.trigger("selectedinitialmedia");
                    });
                    this.masterPlaylistLoader_.on("loadedplaylist", function () {
                      var updatedPlaylist = _this2.masterPlaylistLoader_.media();
                      if (!updatedPlaylist) {
                        var selectedMedia = undefined;
                        if (_this2.enableLowInitialPlaylist) {
                          selectedMedia = _this2.selectInitialPlaylist();
                        }
                        if (!selectedMedia) {
                          selectedMedia = _this2.selectPlaylist();
                        }
                        _this2.initialMedia_ = selectedMedia;
                        _this2.masterPlaylistLoader_.media(_this2.initialMedia_);
                        return;
                      }
                      if (_this2.useCueTags_) {
                        _this2.updateAdCues_(updatedPlaylist);
                      }
                      _this2.mainSegmentLoader_.playlist(updatedPlaylist, _this2.requestOptions_);
                      _this2.updateDuration();
                      if (!_this2.tech_.paused()) {
                        _this2.mainSegmentLoader_.load();
                      }
                      if (!updatedPlaylist.endList) {
                        (function () {
                          var addSeekableRange = function addSeekableRange() {
                            var seekable = _this2.seekable();
                            if (seekable.length !== 0) {
                              _this2.mediaSource.addSeekableRange_(seekable.start(0), seekable.end(0));
                            }
                          };
                          if (_this2.duration() !== Infinity) {
                            (function () {
                              var onDurationchange = function onDurationchange() {
                                if (_this2.duration() === Infinity) {
                                  addSeekableRange();
                                } else {
                                  _this2.tech_.one("durationchange", onDurationchange);
                                }
                              };
                              _this2.tech_.one("durationchange", onDurationchange);
                            })();
                          } else {
                            addSeekableRange();
                          }
                        })();
                      }
                    });
                    this.masterPlaylistLoader_.on("error", function () {
                      _this2.blacklistCurrentPlaylist(_this2.masterPlaylistLoader_.error);
                    });
                    this.masterPlaylistLoader_.on("mediachanging", function () {
                      _this2.mainSegmentLoader_.abort();
                      _this2.mainSegmentLoader_.pause();
                    });
                    this.masterPlaylistLoader_.on("mediachange", function () {
                      var media = _this2.masterPlaylistLoader_.media();
                      var requestTimeout = _this2.masterPlaylistLoader_.targetDuration * 1.5 * 1000;
                      var activeAudioGroup = undefined;
                      var activeTrack = undefined;
                      if (_this2.masterPlaylistLoader_.isLowestEnabledRendition_()) {
                        _this2.requestOptions_.timeout = 0;
                      } else {
                        _this2.requestOptions_.timeout = requestTimeout;
                      }
                      _this2.mainSegmentLoader_.playlist(media, _this2.requestOptions_);
                      _this2.mainSegmentLoader_.load();
                      activeAudioGroup = _this2.activeAudioGroup();
                      activeTrack = activeAudioGroup.filter(function (track) {
                        return track.enabled;
                      })[0];
                      if (!activeTrack) {
                        _this2.mediaGroupChanged();
                        _this2.trigger("audioupdate");
                      }
                      _this2.setupSubtitles();
                      _this2.tech_.trigger({
                        type: "mediachange",
                        bubbles: true,
                      });
                    });
                    this.masterPlaylistLoader_.on("playlistunchanged", function () {
                      var updatedPlaylist = _this2.masterPlaylistLoader_.media();
                      var playlistOutdated = _this2.stuckAtPlaylistEnd_(updatedPlaylist);
                      if (playlistOutdated) {
                        _this2.blacklistCurrentPlaylist({
                          message: "Playlist no longer updating.",
                        });
                        _this2.tech_.trigger("playliststuck");
                      }
                    });
                    this.masterPlaylistLoader_.on("renditiondisabled", function () {
                      _this2.tech_.trigger({
                        type: "usage",
                        name: "hls-rendition-disabled",
                      });
                    });
                    this.masterPlaylistLoader_.on("renditionenabled", function () {
                      _this2.tech_.trigger({
                        type: "usage",
                        name: "hls-rendition-enabled",
                      });
                    });
                  },
                },
                {
                  key: "triggerPresenceUsage_",
                  value: function triggerPresenceUsage_(master, media) {
                    var mediaGroups = master.mediaGroups || {};
                    var defaultDemuxed = true;
                    var audioGroupKeys = Object.keys(mediaGroups.AUDIO);
                    for (var mediaGroup in mediaGroups.AUDIO) {
                      for (var label in mediaGroups.AUDIO[mediaGroup]) {
                        var properties = mediaGroups.AUDIO[mediaGroup][label];
                        if (!properties.uri) {
                          defaultDemuxed = false;
                        }
                      }
                    }
                    if (defaultDemuxed) {
                      this.tech_.trigger({
                        type: "usage",
                        name: "hls-demuxed",
                      });
                    }
                    if (Object.keys(mediaGroups.SUBTITLES).length) {
                      this.tech_.trigger({ type: "usage", name: "hls-webvtt" });
                    }
                    if (Hls.Playlist.isAes(media)) {
                      this.tech_.trigger({ type: "usage", name: "hls-aes" });
                    }
                    if (Hls.Playlist.isFmp4(media)) {
                      this.tech_.trigger({ type: "usage", name: "hls-fmp4" });
                    }
                    if (audioGroupKeys.length && Object.keys(mediaGroups.AUDIO[audioGroupKeys[0]]).length > 1) {
                      this.tech_.trigger({
                        type: "usage",
                        name: "hls-alternate-audio",
                      });
                    }
                    if (this.useCueTags_) {
                      this.tech_.trigger({
                        type: "usage",
                        name: "hls-playlist-cue-tags",
                      });
                    }
                  },
                },
                {
                  key: "setupSegmentLoaderListeners_",
                  value: function setupSegmentLoaderListeners_() {
                    var _this3 = this;
                    this.mainSegmentLoader_.on("bandwidthupdate", function () {
                      var nextPlaylist = _this3.selectPlaylist();
                      var currentPlaylist = _this3.masterPlaylistLoader_.media();
                      var buffered = _this3.tech_.buffered();
                      var forwardBuffer = buffered.length ? buffered.end(buffered.length - 1) - _this3.tech_.currentTime() : 0;
                      var bufferLowWaterLine = _this3.bufferLowWaterLine();
                      if (
                        !currentPlaylist.endList ||
                        _this3.duration() < _config2["default"].MAX_BUFFER_LOW_WATER_LINE ||
                        nextPlaylist.attributes.BANDWIDTH < currentPlaylist.attributes.BANDWIDTH ||
                        forwardBuffer >= bufferLowWaterLine
                      ) {
                        _this3.masterPlaylistLoader_.media(nextPlaylist);
                      }
                      _this3.tech_.trigger("bandwidthupdate");
                    });
                    this.mainSegmentLoader_.on("progress", function () {
                      _this3.trigger("progress");
                    });
                    this.mainSegmentLoader_.on("error", function () {
                      _this3.blacklistCurrentPlaylist(_this3.mainSegmentLoader_.error());
                    });
                    this.mainSegmentLoader_.on("syncinfoupdate", function () {
                      _this3.onSyncInfoUpdate_();
                    });
                    this.mainSegmentLoader_.on("timestampoffset", function () {
                      _this3.tech_.trigger({
                        type: "usage",
                        name: "hls-timestamp-offset",
                      });
                    });
                    this.audioSegmentLoader_.on("syncinfoupdate", function () {
                      _this3.onSyncInfoUpdate_();
                    });
                    this.mainSegmentLoader_.on("ended", function () {
                      _this3.onEndOfStream();
                    });
                    this.mainSegmentLoader_.on("earlyabort", function () {
                      _this3.blacklistCurrentPlaylist(
                        {
                          message: "Aborted early because there isn't enough bandwidth to complete the " + "request without rebuffering.",
                        },
                        ABORT_EARLY_BLACKLIST_SECONDS
                      );
                    });
                    this.audioSegmentLoader_.on("ended", function () {
                      _this3.onEndOfStream();
                    });
                    this.audioSegmentLoader_.on("error", function () {
                      _videoJs2["default"].log.warn("Problem encountered with the current alternate audio track" + ". Switching back to default.");
                      _this3.audioSegmentLoader_.abort();
                      _this3.audioPlaylistLoader_ = null;
                      _this3.setupAudio();
                    });
                    this.subtitleSegmentLoader_.on("error", this.handleSubtitleError_.bind(this));
                  },
                },
                {
                  key: "handleAudioinfoUpdate_",
                  value: function handleAudioinfoUpdate_(event) {
                    if (Hls.supportsAudioInfoChange_() || !this.audioInfo_ || !objectChanged(this.audioInfo_, event.info)) {
                      this.audioInfo_ = event.info;
                      return;
                    }
                    var error =
                      "had different audio properties (channels, sample rate, etc.) " +
                      "or changed in some other way.  This behavior is currently " +
                      "unsupported in Firefox 48 and below due to an issue: \n\n" +
                      "https://bugzilla.mozilla.org/show_bug.cgi?id=1247138\n\n";
                    var enabledIndex = this.activeAudioGroup()
                      .map(function (track) {
                        return track.enabled;
                      })
                      .indexOf(true);
                    var enabledTrack = this.activeAudioGroup()[enabledIndex];
                    var defaultTrack = this.activeAudioGroup().filter(function (track) {
                      return track.properties_ && track.properties_["default"];
                    })[0];
                    if (!this.audioPlaylistLoader_) {
                      error = "The rendition that we tried to switch to " + error + "Unfortunately that means we will have to blacklist " + "the current playlist and switch to another. Sorry!";
                      this.blacklistCurrentPlaylist();
                    } else {
                      error =
                        "The audio track '" +
                        enabledTrack.label +
                        "' that we tried to " +
                        ("switch to " + error + " Unfortunately this means we will have to ") +
                        ("return you to the main track '" + defaultTrack.label + "'. Sorry!");
                      defaultTrack.enabled = true;
                      this.activeAudioGroup().splice(enabledIndex, 1);
                      this.trigger("audioupdate");
                    }
                    _videoJs2["default"].log.warn(error);
                    this.setupAudio();
                  },
                },
                {
                  key: "mediaSecondsLoaded_",
                  value: function mediaSecondsLoaded_() {
                    return Math.max(this.audioSegmentLoader_.mediaSecondsLoaded + this.mainSegmentLoader_.mediaSecondsLoaded);
                  },
                },
                {
                  key: "fillAudioTracks_",
                  value: function fillAudioTracks_() {
                    var master = this.master();
                    var mediaGroups = master.mediaGroups || {};
                    if (!mediaGroups || !mediaGroups.AUDIO || Object.keys(mediaGroups.AUDIO).length === 0 || this.mode_ !== "html5") {
                      mediaGroups.AUDIO = {
                        main: { default: { default: true } },
                      };
                    }
                    for (var mediaGroup in mediaGroups.AUDIO) {
                      if (!this.audioGroups_[mediaGroup]) {
                        this.audioGroups_[mediaGroup] = [];
                      }
                      for (var label in mediaGroups.AUDIO[mediaGroup]) {
                        var properties = mediaGroups.AUDIO[mediaGroup][label];
                        var track = new _videoJs2["default"].AudioTrack({
                          id: label,
                          kind: this.audioTrackKind_(properties),
                          enabled: false,
                          language: properties.language,
                          label: label,
                        });
                        track.properties_ = properties;
                        this.audioGroups_[mediaGroup].push(track);
                      }
                    }
                    (
                      this.activeAudioGroup().filter(function (audioTrack) {
                        return audioTrack.properties_["default"];
                      })[0] || this.activeAudioGroup()[0]
                    ).enabled = true;
                  },
                },
                {
                  key: "audioTrackKind_",
                  value: function audioTrackKind_(properties) {
                    var kind = properties["default"] ? "main" : "alternative";
                    if (properties.characteristics && properties.characteristics.indexOf("public.accessibility.describes-video") >= 0) {
                      kind = "main-desc";
                    }
                    return kind;
                  },
                },
                {
                  key: "fillSubtitleTracks_",
                  value: function fillSubtitleTracks_() {
                    var master = this.master();
                    var mediaGroups = master.mediaGroups || {};
                    for (var mediaGroup in mediaGroups.SUBTITLES) {
                      if (!this.subtitleGroups_.groups[mediaGroup]) {
                        this.subtitleGroups_.groups[mediaGroup] = [];
                      }
                      for (var label in mediaGroups.SUBTITLES[mediaGroup]) {
                        var properties = mediaGroups.SUBTITLES[mediaGroup][label];
                        if (!properties.forced) {
                          this.subtitleGroups_.groups[mediaGroup].push(_videoJs2["default"].mergeOptions({ id: label }, properties));
                          if (typeof this.subtitleGroups_.tracks[label] === "undefined") {
                            var track = this.tech_.addRemoteTextTrack(
                              {
                                id: label,
                                kind: "subtitles",
                                enabled: false,
                                language: properties.language,
                                label: label,
                              },
                              false
                            ).track;
                            this.subtitleGroups_.tracks[label] = track;
                          }
                        }
                      }
                    }
                  },
                },
                {
                  key: "load",
                  value: function load() {
                    this.mainSegmentLoader_.load();
                    if (this.audioPlaylistLoader_) {
                      this.audioSegmentLoader_.load();
                    }
                    if (this.subtitlePlaylistLoader_) {
                      this.subtitleSegmentLoader_.load();
                    }
                  },
                },
                {
                  key: "activeAudioGroup",
                  value: function activeAudioGroup() {
                    var videoPlaylist = this.masterPlaylistLoader_.media();
                    var result = undefined;
                    if (videoPlaylist.attributes.AUDIO) {
                      result = this.audioGroups_[videoPlaylist.attributes.AUDIO];
                    }
                    return result || this.audioGroups_.main;
                  },
                },
                {
                  key: "activeSubtitleGroup_",
                  value: function activeSubtitleGroup_() {
                    var videoPlaylist = this.masterPlaylistLoader_.media();
                    var result = undefined;
                    if (!videoPlaylist) {
                      return null;
                    }
                    if (videoPlaylist.attributes.SUBTITLES) {
                      result = this.subtitleGroups_.groups[videoPlaylist.attributes.SUBTITLES];
                    }
                    return result || this.subtitleGroups_.groups.main;
                  },
                },
                {
                  key: "activeSubtitleTrack_",
                  value: function activeSubtitleTrack_() {
                    for (var trackName in this.subtitleGroups_.tracks) {
                      if (this.subtitleGroups_.tracks[trackName].mode === "showing") {
                        return this.subtitleGroups_.tracks[trackName];
                      }
                    }
                    return null;
                  },
                },
                {
                  key: "handleSubtitleError_",
                  value: function handleSubtitleError_() {
                    _videoJs2["default"].log.warn("Problem encountered loading the subtitle track" + ". Switching back to default.");
                    this.subtitleSegmentLoader_.abort();
                    var track = this.activeSubtitleTrack_();
                    if (track) {
                      track.mode = "disabled";
                    }
                    this.setupSubtitles();
                  },
                },
                {
                  key: "mediaGroupChanged",
                  value: function mediaGroupChanged() {
                    var track = this.getActiveAudioTrack_();
                    this.stopAudioLoaders_();
                    this.resyncAudioLoaders_(track);
                  },
                },
                {
                  key: "setupAudio",
                  value: function setupAudio() {
                    var track = this.getActiveAudioTrack_();
                    this.stopAudioLoaders_();
                    this.resetAudioLoaders_(track);
                  },
                },
                {
                  key: "getActiveAudioTrack_",
                  value: function getActiveAudioTrack_() {
                    var audioGroup = this.activeAudioGroup();
                    var track = audioGroup.filter(function (audioTrack) {
                      return audioTrack.enabled;
                    })[0];
                    if (!track) {
                      track =
                        audioGroup.filter(function (audioTrack) {
                          return audioTrack.properties_["default"];
                        })[0] || audioGroup[0];
                      track.enabled = true;
                    }
                    return track;
                  },
                },
                {
                  key: "stopAudioLoaders_",
                  value: function stopAudioLoaders_() {
                    if (this.audioPlaylistLoader_) {
                      this.audioPlaylistLoader_.dispose();
                      this.audioPlaylistLoader_ = null;
                    }
                    this.audioSegmentLoader_.pause();
                  },
                },
                {
                  key: "resetAudioLoaders_",
                  value: function resetAudioLoaders_(track) {
                    if (!track.properties_.resolvedUri) {
                      this.mainSegmentLoader_.resetEverything();
                      return;
                    }
                    this.audioSegmentLoader_.resetEverything();
                    this.setupAudioPlaylistLoader_(track);
                  },
                },
                {
                  key: "resyncAudioLoaders_",
                  value: function resyncAudioLoaders_(track) {
                    if (!track.properties_.resolvedUri) {
                      return;
                    }
                    this.audioSegmentLoader_.resyncLoader();
                    this.setupAudioPlaylistLoader_(track);
                  },
                },
                {
                  key: "setupAudioPlaylistLoader_",
                  value: function setupAudioPlaylistLoader_(track) {
                    var _this4 = this;
                    this.audioPlaylistLoader_ = new _playlistLoader2["default"](track.properties_.resolvedUri, this.hls_, this.withCredentials);
                    this.audioPlaylistLoader_.load();
                    this.audioPlaylistLoader_.on("loadedmetadata", function () {
                      var audioPlaylist = _this4.audioPlaylistLoader_.media();
                      _this4.audioSegmentLoader_.playlist(audioPlaylist, _this4.requestOptions_);
                      if (!_this4.tech_.paused() || (audioPlaylist.endList && _this4.tech_.preload() !== "none")) {
                        _this4.audioSegmentLoader_.load();
                      }
                      if (!audioPlaylist.endList) {
                        _this4.audioPlaylistLoader_.trigger("firstplay");
                      }
                    });
                    this.audioPlaylistLoader_.on("loadedplaylist", function () {
                      var updatedPlaylist = undefined;
                      if (_this4.audioPlaylistLoader_) {
                        updatedPlaylist = _this4.audioPlaylistLoader_.media();
                      }
                      if (!updatedPlaylist) {
                        _this4.audioPlaylistLoader_.media(_this4.audioPlaylistLoader_.playlists.master.playlists[0]);
                        return;
                      }
                      _this4.audioSegmentLoader_.playlist(updatedPlaylist, _this4.requestOptions_);
                    });
                    this.audioPlaylistLoader_.on("error", function () {
                      _videoJs2["default"].log.warn("Problem encountered loading the alternate audio track" + ". Switching back to default.");
                      _this4.audioSegmentLoader_.abort();
                      _this4.setupAudio();
                    });
                  },
                },
                {
                  key: "setupSubtitles",
                  value: function setupSubtitles() {
                    var _this5 = this;
                    var subtitleGroup = this.activeSubtitleGroup_();
                    var track = this.activeSubtitleTrack_();
                    this.subtitleSegmentLoader_.pause();
                    if (!track) {
                      if (this.subtitlePlaylistLoader_) {
                        this.subtitlePlaylistLoader_.dispose();
                        this.subtitlePlaylistLoader_ = null;
                      }
                      return;
                    }
                    var properties = subtitleGroup.filter(function (subtitleProperties) {
                      return subtitleProperties.id === track.id;
                    })[0];
                    if (!this.subtitlePlaylistLoader_ || !this.subtitlePlaylistLoader_.media() || this.subtitlePlaylistLoader_.media().resolvedUri !== properties.resolvedUri) {
                      if (this.subtitlePlaylistLoader_) {
                        this.subtitlePlaylistLoader_.dispose();
                      }
                      this.subtitleSegmentLoader_.resetEverything();
                      this.subtitlePlaylistLoader_ = new _playlistLoader2["default"](properties.resolvedUri, this.hls_, this.withCredentials);
                      this.subtitlePlaylistLoader_.on("loadedmetadata", function () {
                        var subtitlePlaylist = _this5.subtitlePlaylistLoader_.media();
                        _this5.subtitleSegmentLoader_.playlist(subtitlePlaylist, _this5.requestOptions_);
                        _this5.subtitleSegmentLoader_.track(_this5.activeSubtitleTrack_());
                        if (!_this5.tech_.paused() || (subtitlePlaylist.endList && _this5.tech_.preload() !== "none")) {
                          _this5.subtitleSegmentLoader_.load();
                        }
                      });
                      this.subtitlePlaylistLoader_.on("loadedplaylist", function () {
                        var updatedPlaylist = undefined;
                        if (_this5.subtitlePlaylistLoader_) {
                          updatedPlaylist = _this5.subtitlePlaylistLoader_.media();
                        }
                        if (!updatedPlaylist) {
                          return;
                        }
                        _this5.subtitleSegmentLoader_.playlist(updatedPlaylist, _this5.requestOptions_);
                      });
                      this.subtitlePlaylistLoader_.on("error", this.handleSubtitleError_.bind(this));
                    }
                    if (this.subtitlePlaylistLoader_.media() && this.subtitlePlaylistLoader_.media().resolvedUri === properties.resolvedUri) {
                      this.subtitleSegmentLoader_.load();
                    } else {
                      this.subtitlePlaylistLoader_.load();
                    }
                  },
                },
                {
                  key: "fastQualityChange_",
                  value: function fastQualityChange_() {
                    var media = this.selectPlaylist();
                    if (media !== this.masterPlaylistLoader_.media()) {
                      this.masterPlaylistLoader_.media(media);
                      this.mainSegmentLoader_.resetLoader();
                    }
                  },
                },
                {
                  key: "play",
                  value: function play() {
                    if (this.setupFirstPlay()) {
                      return;
                    }
                    if (this.tech_.ended()) {
                      this.tech_.setCurrentTime(0);
                    }
                    if (this.hasPlayed_()) {
                      this.load();
                    }
                    var seekable = this.tech_.seekable();
                    if (this.tech_.duration() === Infinity) {
                      if (this.tech_.currentTime() < seekable.start(0)) {
                        return this.tech_.setCurrentTime(seekable.end(seekable.length - 1));
                      }
                    }
                  },
                },
                {
                  key: "setupFirstPlay",
                  value: function setupFirstPlay() {
                    var seekable = undefined;
                    var media = this.masterPlaylistLoader_.media();
                    if (media && !this.tech_.paused() && !this.hasPlayed_()) {
                      if (!media.endList) {
                        this.trigger("firstplay");
                        seekable = this.seekable();
                        if (seekable.length) {
                          this.tech_.setCurrentTime(seekable.end(0));
                        }
                      }
                      this.hasPlayed_ = function () {
                        return true;
                      };
                      this.load();
                      return true;
                    }
                    return false;
                  },
                },
                {
                  key: "handleSourceOpen_",
                  value: function handleSourceOpen_() {
                    try {
                      this.setupSourceBuffers_();
                    } catch (e) {
                      _videoJs2["default"].log.warn("Failed to create Source Buffers", e);
                      return this.mediaSource.endOfStream("decode");
                    }
                    if (this.tech_.autoplay()) {
                      this.tech_.play();
                    }
                    this.trigger("sourceopen");
                  },
                },
                {
                  key: "onEndOfStream",
                  value: function onEndOfStream() {
                    var isEndOfStream = this.mainSegmentLoader_.ended_;
                    if (this.audioPlaylistLoader_) {
                      isEndOfStream = isEndOfStream && this.audioSegmentLoader_.ended_;
                    }
                    if (isEndOfStream) {
                      this.mediaSource.endOfStream();
                    }
                  },
                },
                {
                  key: "stuckAtPlaylistEnd_",
                  value: function stuckAtPlaylistEnd_(playlist) {
                    var seekable = this.seekable();
                    if (!seekable.length) {
                      return false;
                    }
                    var expired = this.syncController_.getExpiredTime(playlist, this.mediaSource.duration);
                    if (expired === null) {
                      return false;
                    }
                    var absolutePlaylistEnd = Hls.Playlist.playlistEnd(playlist, expired);
                    var currentTime = this.tech_.currentTime();
                    var buffered = this.tech_.buffered();
                    if (!buffered.length) {
                      return absolutePlaylistEnd - currentTime <= _ranges2["default"].TIME_FUDGE_FACTOR;
                    }
                    var bufferedEnd = buffered.end(buffered.length - 1);
                    return bufferedEnd - currentTime <= _ranges2["default"].TIME_FUDGE_FACTOR && absolutePlaylistEnd - bufferedEnd <= _ranges2["default"].TIME_FUDGE_FACTOR;
                  },
                },
                {
                  key: "blacklistCurrentPlaylist",
                  value: function blacklistCurrentPlaylist(error, blacklistDuration) {
                    if (error === undefined) error = {};
                    var currentPlaylist = undefined;
                    var nextPlaylist = undefined;
                    currentPlaylist = error.playlist || this.masterPlaylistLoader_.media();
                    if (!currentPlaylist) {
                      this.error = error;
                      try {
                        return this.mediaSource.endOfStream("network");
                      } catch (e) {
                        return this.trigger("error");
                      }
                    }
                    var isFinalRendition = this.masterPlaylistLoader_.isFinalRendition_();
                    if (isFinalRendition) {
                      _videoJs2["default"].log.warn("Problem encountered with the current " + "HLS playlist. Trying again since it is the final playlist.");
                      this.tech_.trigger("retryplaylist");
                      return this.masterPlaylistLoader_.load(isFinalRendition);
                    }
                    currentPlaylist.excludeUntil = Date.now() + (blacklistDuration ? blacklistDuration : this.blacklistDuration) * 1000;
                    this.tech_.trigger("blacklistplaylist");
                    this.tech_.trigger({
                      type: "usage",
                      name: "hls-rendition-blacklisted",
                    });
                    nextPlaylist = this.selectPlaylist();
                    _videoJs2["default"].log.warn("Problem encountered with the current HLS playlist." + (error.message ? " " + error.message : "") + " Switching to another playlist.");
                    return this.masterPlaylistLoader_.media(nextPlaylist);
                  },
                },
                {
                  key: "pauseLoading",
                  value: function pauseLoading() {
                    this.mainSegmentLoader_.pause();
                    if (this.audioPlaylistLoader_) {
                      this.audioSegmentLoader_.pause();
                    }
                    if (this.subtitlePlaylistLoader_) {
                      this.subtitleSegmentLoader_.pause();
                    }
                  },
                },
                {
                  key: "setCurrentTime",
                  value: function setCurrentTime(currentTime) {
                    var buffered = _ranges2["default"].findRange(this.tech_.buffered(), currentTime);
                    if (!(this.masterPlaylistLoader_ && this.masterPlaylistLoader_.media())) {
                      return 0;
                    }
                    if (!this.masterPlaylistLoader_.media().segments) {
                      return 0;
                    }
                    var isFlash = this.mode_ === "flash" || (this.mode_ === "auto" && !_videoJs2["default"].MediaSource.supportsNativeMediaSources());
                    if (buffered && buffered.length && !isFlash) {
                      return currentTime;
                    }
                    this.mainSegmentLoader_.resetEverything();
                    this.mainSegmentLoader_.abort();
                    if (this.audioPlaylistLoader_) {
                      this.audioSegmentLoader_.resetEverything();
                      this.audioSegmentLoader_.abort();
                    }
                    if (this.subtitlePlaylistLoader_) {
                      this.subtitleSegmentLoader_.resetEverything();
                      this.subtitleSegmentLoader_.abort();
                    }
                    this.load();
                  },
                },
                {
                  key: "duration",
                  value: function duration() {
                    if (!this.masterPlaylistLoader_) {
                      return 0;
                    }
                    if (this.mediaSource) {
                      return this.mediaSource.duration;
                    }
                    return Hls.Playlist.duration(this.masterPlaylistLoader_.media());
                  },
                },
                {
                  key: "seekable",
                  value: function seekable() {
                    return this.seekable_;
                  },
                },
                {
                  key: "onSyncInfoUpdate_",
                  value: function onSyncInfoUpdate_() {
                    var mainSeekable = undefined;
                    var audioSeekable = undefined;
                    if (!this.masterPlaylistLoader_) {
                      return;
                    }
                    var media = this.masterPlaylistLoader_.media();
                    if (!media) {
                      return;
                    }
                    var expired = this.syncController_.getExpiredTime(media, this.mediaSource.duration);
                    if (expired === null) {
                      return;
                    }
                    mainSeekable = Hls.Playlist.seekable(media, expired);
                    if (mainSeekable.length === 0) {
                      return;
                    }
                    if (this.audioPlaylistLoader_) {
                      media = this.audioPlaylistLoader_.media();
                      expired = this.syncController_.getExpiredTime(media, this.mediaSource.duration);
                      if (expired === null) {
                        return;
                      }
                      audioSeekable = Hls.Playlist.seekable(media, expired);
                      if (audioSeekable.length === 0) {
                        return;
                      }
                    }
                    if (!audioSeekable) {
                      this.seekable_ = mainSeekable;
                    } else if (audioSeekable.start(0) > mainSeekable.end(0) || mainSeekable.start(0) > audioSeekable.end(0)) {
                      this.seekable_ = mainSeekable;
                    } else {
                      this.seekable_ = _videoJs2["default"].createTimeRanges([
                        [
                          audioSeekable.start(0) > mainSeekable.start(0) ? audioSeekable.start(0) : mainSeekable.start(0),
                          audioSeekable.end(0) < mainSeekable.end(0) ? audioSeekable.end(0) : mainSeekable.end(0),
                        ],
                      ]);
                    }
                    this.tech_.trigger("seekablechanged");
                  },
                },
                {
                  key: "updateDuration",
                  value: function updateDuration() {
                    var _this6 = this;
                    var oldDuration = this.mediaSource.duration;
                    var newDuration = Hls.Playlist.duration(this.masterPlaylistLoader_.media());
                    var buffered = this.tech_.buffered();
                    var setDuration = function setDuration() {
                      _this6.mediaSource.duration = newDuration;
                      _this6.tech_.trigger("durationchange");
                      _this6.mediaSource.removeEventListener("sourceopen", setDuration);
                    };
                    if (buffered.length > 0) {
                      newDuration = Math.max(newDuration, buffered.end(buffered.length - 1));
                    }
                    if (oldDuration !== newDuration) {
                      if (this.mediaSource.readyState !== "open") {
                        this.mediaSource.addEventListener("sourceopen", setDuration);
                      } else {
                        setDuration();
                      }
                    }
                  },
                },
                {
                  key: "dispose",
                  value: function dispose() {
                    this.decrypter_.terminate();
                    this.masterPlaylistLoader_.dispose();
                    this.mainSegmentLoader_.dispose();
                    if (this.audioPlaylistLoader_) {
                      this.audioPlaylistLoader_.dispose();
                    }
                    if (this.subtitlePlaylistLoader_) {
                      this.subtitlePlaylistLoader_.dispose();
                    }
                    this.audioSegmentLoader_.dispose();
                    this.subtitleSegmentLoader_.dispose();
                  },
                },
                {
                  key: "master",
                  value: function master() {
                    return this.masterPlaylistLoader_.master;
                  },
                },
                {
                  key: "media",
                  value: function media() {
                    return this.masterPlaylistLoader_.media() || this.initialMedia_;
                  },
                },
                {
                  key: "setupSourceBuffers_",
                  value: function setupSourceBuffers_() {
                    var media = this.masterPlaylistLoader_.media();
                    var mimeTypes = undefined;
                    if (!media || this.mediaSource.readyState !== "open") {
                      return;
                    }
                    mimeTypes = mimeTypesForPlaylist_(this.masterPlaylistLoader_.master, media);
                    if (mimeTypes.length < 1) {
                      this.error = "No compatible SourceBuffer configuration for the variant stream:" + media.resolvedUri;
                      return this.mediaSource.endOfStream("decode");
                    }
                    this.mainSegmentLoader_.mimeType(mimeTypes[0]);
                    if (mimeTypes[1]) {
                      this.audioSegmentLoader_.mimeType(mimeTypes[1]);
                    }
                    this.excludeIncompatibleVariants_(media);
                  },
                },
                {
                  key: "excludeIncompatibleVariants_",
                  value: function excludeIncompatibleVariants_(media) {
                    var master = this.masterPlaylistLoader_.master;
                    var codecCount = 2;
                    var videoCodec = null;
                    var codecs = undefined;
                    if (media.attributes.CODECS) {
                      codecs = (0, _utilCodecsJs.parseCodecs)(media.attributes.CODECS);
                      videoCodec = codecs.videoCodec;
                      codecCount = codecs.codecCount;
                    }
                    master.playlists.forEach(function (variant) {
                      var variantCodecs = { codecCount: 2, videoCodec: null };
                      if (variant.attributes.CODECS) {
                        var codecString = variant.attributes.CODECS;
                        variantCodecs = (0, _utilCodecsJs.parseCodecs)(codecString);
                        if (window.MediaSource && window.MediaSource.isTypeSupported && !window.MediaSource.isTypeSupported('video/mp4; codecs="' + mapLegacyAvcCodecs_(codecString) + '"')) {
                          variant.excludeUntil = Infinity;
                        }
                      }
                      if (variantCodecs.codecCount !== codecCount) {
                        variant.excludeUntil = Infinity;
                      }
                      if (variantCodecs.videoCodec !== videoCodec) {
                        variant.excludeUntil = Infinity;
                      }
                    });
                  },
                },
                {
                  key: "updateAdCues_",
                  value: function updateAdCues_(media) {
                    var offset = 0;
                    var seekable = this.seekable();
                    if (seekable.length) {
                      offset = seekable.start(0);
                    }
                    _adCueTags2["default"].updateAdCues(media, this.cueTagsTrack_, offset);
                  },
                },
                {
                  key: "goalBufferLength",
                  value: function goalBufferLength() {
                    var currentTime = this.tech_.currentTime();
                    var initial = _config2["default"].GOAL_BUFFER_LENGTH;
                    var rate = _config2["default"].GOAL_BUFFER_LENGTH_RATE;
                    var max = Math.max(initial, _config2["default"].MAX_GOAL_BUFFER_LENGTH);
                    return Math.min(initial + currentTime * rate, max);
                  },
                },
                {
                  key: "bufferLowWaterLine",
                  value: function bufferLowWaterLine() {
                    var currentTime = this.tech_.currentTime();
                    var initial = _config2["default"].BUFFER_LOW_WATER_LINE;
                    var rate = _config2["default"].BUFFER_LOW_WATER_LINE_RATE;
                    var max = Math.max(initial, _config2["default"].MAX_BUFFER_LOW_WATER_LINE);
                    return Math.min(initial + currentTime * rate, max);
                  },
                },
              ]);
              return MasterPlaylistController;
            })(_videoJs2["default"].EventTarget);
            exports.MasterPlaylistController = MasterPlaylistController;
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        {
          "./ad-cue-tags": 1,
          "./config": 3,
          "./decrypter-worker": 4,
          "./playlist-loader": 8,
          "./ranges": 11,
          "./segment-loader": 15,
          "./sync-controller": 17,
          "./util/codecs.js": 18,
          "./vtt-segment-loader": 19,
          "videojs-contrib-media-sources/es5/codec-utils": 65,
          webworkify: 76,
        },
      ],
      6: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var _binUtils = require("./bin-utils");
            var REQUEST_ERRORS = { FAILURE: 2, TIMEOUT: -101, ABORTED: -102 };
            exports.REQUEST_ERRORS = REQUEST_ERRORS;
            var byterangeStr = function byterangeStr(byterange) {
              var byterangeStart = undefined;
              var byterangeEnd = undefined;
              byterangeEnd = byterange.offset + byterange.length - 1;
              byterangeStart = byterange.offset;
              return "bytes=" + byterangeStart + "-" + byterangeEnd;
            };
            var segmentXhrHeaders = function segmentXhrHeaders(segment) {
              var headers = {};
              if (segment.byterange) {
                headers.Range = byterangeStr(segment.byterange);
              }
              return headers;
            };
            var abortAll = function abortAll(activeXhrs) {
              activeXhrs.forEach(function (xhr) {
                xhr.abort();
              });
            };
            var getRequestStats = function getRequestStats(request) {
              return {
                bandwidth: request.bandwidth,
                bytesReceived: request.bytesReceived || 0,
                roundTripTime: request.roundTripTime || 0,
              };
            };
            var getProgressStats = function getProgressStats(progressEvent) {
              var request = progressEvent.target;
              var roundTripTime = Date.now() - request.requestTime;
              var stats = {
                bandwidth: Infinity,
                bytesReceived: 0,
                roundTripTime: roundTripTime || 0,
              };
              stats.bytesReceived = progressEvent.loaded;
              stats.bandwidth = Math.floor((stats.bytesReceived / stats.roundTripTime) * 8 * 1000);
              return stats;
            };
            var handleErrors = function handleErrors(error, request) {
              if (request.timedout) {
                return {
                  status: request.status,
                  message: "HLS request timed-out at URL: " + request.uri,
                  code: REQUEST_ERRORS.TIMEOUT,
                  xhr: request,
                };
              }
              if (request.aborted) {
                return {
                  status: request.status,
                  message: "HLS request aborted at URL: " + request.uri,
                  code: REQUEST_ERRORS.ABORTED,
                  xhr: request,
                };
              }
              if (error) {
                return {
                  status: request.status,
                  message: "HLS request errored at URL: " + request.uri,
                  code: REQUEST_ERRORS.FAILURE,
                  xhr: request,
                };
              }
              return null;
            };
            var handleKeyResponse = function handleKeyResponse(segment, finishProcessingFn) {
              return function (error, request) {
                var response = request.response;
                var errorObj = handleErrors(error, request);
                if (errorObj) {
                  return finishProcessingFn(errorObj, segment);
                }
                if (response.byteLength !== 16) {
                  return finishProcessingFn(
                    {
                      status: request.status,
                      message: "Invalid HLS key at URL: " + request.uri,
                      code: REQUEST_ERRORS.FAILURE,
                      xhr: request,
                    },
                    segment
                  );
                }
                var view = new DataView(response);
                segment.key.bytes = new Uint32Array([view.getUint32(0), view.getUint32(4), view.getUint32(8), view.getUint32(12)]);
                return finishProcessingFn(null, segment);
              };
            };
            var handleInitSegmentResponse = function handleInitSegmentResponse(segment, finishProcessingFn) {
              return function (error, request) {
                var response = request.response;
                var errorObj = handleErrors(error, request);
                if (errorObj) {
                  return finishProcessingFn(errorObj, segment);
                }
                if (response.byteLength === 0) {
                  return finishProcessingFn(
                    {
                      status: request.status,
                      message: "Empty HLS segment content at URL: " + request.uri,
                      code: REQUEST_ERRORS.FAILURE,
                      xhr: request,
                    },
                    segment
                  );
                }
                segment.map.bytes = new Uint8Array(request.response);
                return finishProcessingFn(null, segment);
              };
            };
            var handleSegmentResponse = function handleSegmentResponse(segment, finishProcessingFn) {
              return function (error, request) {
                var response = request.response;
                var errorObj = handleErrors(error, request);
                if (errorObj) {
                  return finishProcessingFn(errorObj, segment);
                }
                if (response.byteLength === 0) {
                  return finishProcessingFn(
                    {
                      status: request.status,
                      message: "Empty HLS segment content at URL: " + request.uri,
                      code: REQUEST_ERRORS.FAILURE,
                      xhr: request,
                    },
                    segment
                  );
                }
                segment.stats = getRequestStats(request);
                if (segment.key) {
                  segment.encryptedBytes = new Uint8Array(request.response);
                } else {
                  segment.bytes = new Uint8Array(request.response);
                }
                return finishProcessingFn(null, segment);
              };
            };
            var decryptSegment = function decryptSegment(decrypter, segment, doneFn) {
              var decryptionHandler = function decryptionHandler(event) {
                if (event.data.source === segment.requestId) {
                  decrypter.removeEventListener("message", decryptionHandler);
                  var decrypted = event.data.decrypted;
                  segment.bytes = new Uint8Array(decrypted.bytes, decrypted.byteOffset, decrypted.byteLength);
                  return doneFn(null, segment);
                }
              };
              decrypter.addEventListener("message", decryptionHandler);
              decrypter.postMessage(
                (0, _binUtils.createTransferableMessage)({
                  source: segment.requestId,
                  encrypted: segment.encryptedBytes,
                  key: segment.key.bytes,
                  iv: segment.key.iv,
                }),
                [segment.encryptedBytes.buffer, segment.key.bytes.buffer]
              );
            };
            var getMostImportantError = function getMostImportantError(errors) {
              return errors.reduce(function (prev, err) {
                return err.code > prev.code ? err : prev;
              });
            };
            var waitForCompletion = function waitForCompletion(activeXhrs, decrypter, doneFn) {
              var errors = [];
              var count = 0;
              return function (error, segment) {
                if (error) {
                  abortAll(activeXhrs);
                  errors.push(error);
                }
                count += 1;
                if (count === activeXhrs.length) {
                  segment.endOfAllRequests = Date.now();
                  if (errors.length > 0) {
                    var worstError = getMostImportantError(errors);
                    return doneFn(worstError, segment);
                  }
                  if (segment.encryptedBytes) {
                    return decryptSegment(decrypter, segment, doneFn);
                  }
                  return doneFn(null, segment);
                }
              };
            };
            var handleProgress = function handleProgress(segment, progressFn) {
              return function (event) {
                segment.stats = _videoJs2["default"].mergeOptions(segment.stats, getProgressStats(event));
                if (!segment.stats.firstBytesReceivedAt && segment.stats.bytesReceived) {
                  segment.stats.firstBytesReceivedAt = Date.now();
                }
                return progressFn(event, segment);
              };
            };
            var mediaSegmentRequest = function mediaSegmentRequest(xhr, xhrOptions, decryptionWorker, segment, progressFn, doneFn) {
              var activeXhrs = [];
              var finishProcessingFn = waitForCompletion(activeXhrs, decryptionWorker, doneFn);
              if (segment.key) {
                var keyRequestOptions = _videoJs2["default"].mergeOptions(xhrOptions, {
                  uri: segment.key.resolvedUri,
                  responseType: "arraybuffer",
                });
                var keyRequestCallback = handleKeyResponse(segment, finishProcessingFn);
                var keyXhr = xhr(keyRequestOptions, keyRequestCallback);
                activeXhrs.push(keyXhr);
              }
              if (segment.map && !segment.map.bytes) {
                var initSegmentOptions = _videoJs2["default"].mergeOptions(xhrOptions, {
                  uri: segment.map.resolvedUri,
                  responseType: "arraybuffer",
                  headers: segmentXhrHeaders(segment.map),
                });
                var initSegmentRequestCallback = handleInitSegmentResponse(segment, finishProcessingFn);
                var initSegmentXhr = xhr(initSegmentOptions, initSegmentRequestCallback);
                activeXhrs.push(initSegmentXhr);
              }
              var segmentRequestOptions = _videoJs2["default"].mergeOptions(xhrOptions, {
                uri: segment.resolvedUri,
                responseType: "arraybuffer",
                headers: segmentXhrHeaders(segment),
              });
              var segmentRequestCallback = handleSegmentResponse(segment, finishProcessingFn);
              var segmentXhr = xhr(segmentRequestOptions, segmentRequestCallback);
              segmentXhr.addEventListener("progress", handleProgress(segment, progressFn));
              activeXhrs.push(segmentXhr);
              return function () {
                return abortAll(activeXhrs);
              };
            };
            exports.mediaSegmentRequest = mediaSegmentRequest;
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        { "./bin-utils": 2 },
      ],
      7: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            var _createClass = (function () {
              function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ("value" in descriptor) descriptor.writable = true;
                  Object.defineProperty(target, descriptor.key, descriptor);
                }
              }
              return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
              };
            })();
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            function _classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            var _globalWindow = require("global/window");
            var _globalWindow2 = _interopRequireDefault(_globalWindow);
            var _ranges = require("./ranges");
            var _ranges2 = _interopRequireDefault(_ranges);
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var timerCancelEvents = ["seeking", "seeked", "pause", "playing", "error"];
            var PlaybackWatcher = (function () {
              function PlaybackWatcher(options) {
                var _this = this;
                _classCallCheck(this, PlaybackWatcher);
                this.tech_ = options.tech;
                this.seekable = options.seekable;
                this.consecutiveUpdates = 0;
                this.lastRecordedTime = null;
                this.timer_ = null;
                this.checkCurrentTimeTimeout_ = null;
                if (options.debug) {
                  this.logger_ = _videoJs2["default"].log.bind(_videoJs2["default"], "playback-watcher ->");
                }
                this.logger_("initialize");
                var canPlayHandler = function canPlayHandler() {
                  return _this.monitorCurrentTime_();
                };
                var waitingHandler = function waitingHandler() {
                  return _this.techWaiting_();
                };
                var cancelTimerHandler = function cancelTimerHandler() {
                  return _this.cancelTimer_();
                };
                var fixesBadSeeksHandler = function fixesBadSeeksHandler() {
                  return _this.fixesBadSeeks_();
                };
                this.tech_.on("seekablechanged", fixesBadSeeksHandler);
                this.tech_.on("waiting", waitingHandler);
                this.tech_.on(timerCancelEvents, cancelTimerHandler);
                this.tech_.on("canplay", canPlayHandler);
                this.dispose = function () {
                  _this.logger_("dispose");
                  _this.tech_.off("seekablechanged", fixesBadSeeksHandler);
                  _this.tech_.off("waiting", waitingHandler);
                  _this.tech_.off(timerCancelEvents, cancelTimerHandler);
                  _this.tech_.off("canplay", canPlayHandler);
                  if (_this.checkCurrentTimeTimeout_) {
                    _globalWindow2["default"].clearTimeout(_this.checkCurrentTimeTimeout_);
                  }
                  _this.cancelTimer_();
                };
              }
              _createClass(PlaybackWatcher, [
                {
                  key: "monitorCurrentTime_",
                  value: function monitorCurrentTime_() {
                    this.checkCurrentTime_();
                    if (this.checkCurrentTimeTimeout_) {
                      _globalWindow2["default"].clearTimeout(this.checkCurrentTimeTimeout_);
                    }
                    this.checkCurrentTimeTimeout_ = _globalWindow2["default"].setTimeout(this.monitorCurrentTime_.bind(this), 250);
                  },
                },
                {
                  key: "checkCurrentTime_",
                  value: function checkCurrentTime_() {
                    if (this.tech_.seeking() && this.fixesBadSeeks_()) {
                      this.consecutiveUpdates = 0;
                      this.lastRecordedTime = this.tech_.currentTime();
                      return;
                    }
                    if (this.tech_.paused() || this.tech_.seeking()) {
                      return;
                    }
                    var currentTime = this.tech_.currentTime();
                    var buffered = this.tech_.buffered();
                    if (this.lastRecordedTime === currentTime && (!buffered.length || currentTime + 0.1 >= buffered.end(buffered.length - 1))) {
                      return this.techWaiting_();
                    }
                    if (this.consecutiveUpdates >= 5 && currentTime === this.lastRecordedTime) {
                      this.consecutiveUpdates++;
                      this.waiting_();
                    } else if (currentTime === this.lastRecordedTime) {
                      this.consecutiveUpdates++;
                    } else {
                      this.consecutiveUpdates = 0;
                      this.lastRecordedTime = currentTime;
                    }
                  },
                },
                {
                  key: "cancelTimer_",
                  value: function cancelTimer_() {
                    this.consecutiveUpdates = 0;
                    if (this.timer_) {
                      this.logger_("cancelTimer_");
                      clearTimeout(this.timer_);
                    }
                    this.timer_ = null;
                  },
                },
                {
                  key: "fixesBadSeeks_",
                  value: function fixesBadSeeks_() {
                    var seekable = this.seekable();
                    var currentTime = this.tech_.currentTime();
                    if (this.tech_.seeking() && this.outsideOfSeekableWindow_(seekable, currentTime)) {
                      var seekableEnd = seekable.end(seekable.length - 1);
                      this.logger_(
                        "Trying to seek outside of seekable at time " +
                          currentTime +
                          " with " +
                          ("seekable range " + _ranges2["default"].printableRange(seekable) + ". Seeking to ") +
                          (seekableEnd + ".")
                      );
                      this.tech_.setCurrentTime(seekableEnd);
                      return true;
                    }
                    return false;
                  },
                },
                {
                  key: "waiting_",
                  value: function waiting_() {
                    if (this.techWaiting_()) {
                      return;
                    }
                    var currentTime = this.tech_.currentTime();
                    var buffered = this.tech_.buffered();
                    var currentRange = _ranges2["default"].findRange(buffered, currentTime);
                    if (currentRange.length && currentTime + 3 <= currentRange.end(0)) {
                      this.cancelTimer_();
                      this.tech_.setCurrentTime(currentTime);
                      this.logger_(
                        "Stopped at " +
                          currentTime +
                          " while inside a buffered region " +
                          ("[" + currentRange.start(0) + " -> " + currentRange.end(0) + "]. Attempting to resume ") +
                          "playback by seeking to the current time."
                      );
                      this.tech_.trigger({
                        type: "usage",
                        name: "hls-unknown-waiting",
                      });
                      return;
                    }
                  },
                },
                {
                  key: "techWaiting_",
                  value: function techWaiting_() {
                    var seekable = this.seekable();
                    var currentTime = this.tech_.currentTime();
                    if (this.tech_.seeking() && this.fixesBadSeeks_()) {
                      return true;
                    }
                    if (this.tech_.seeking() || this.timer_ !== null) {
                      return true;
                    }
                    if (this.fellOutOfLiveWindow_(seekable, currentTime)) {
                      var livePoint = seekable.end(seekable.length - 1);
                      this.logger_("Fell out of live window at time " + currentTime + ". Seeking to " + ("live point (seekable end) " + livePoint));
                      this.cancelTimer_();
                      this.tech_.setCurrentTime(livePoint);
                      this.tech_.trigger({
                        type: "usage",
                        name: "hls-live-resync",
                      });
                      return true;
                    }
                    var buffered = this.tech_.buffered();
                    var nextRange = _ranges2["default"].findNextRange(buffered, currentTime);
                    if (this.videoUnderflow_(nextRange, buffered, currentTime)) {
                      this.cancelTimer_();
                      this.tech_.setCurrentTime(currentTime);
                      this.tech_.trigger({
                        type: "usage",
                        name: "hls-video-underflow",
                      });
                      return true;
                    }
                    if (nextRange.length > 0) {
                      var difference = nextRange.start(0) - currentTime;
                      this.logger_("Stopped at " + currentTime + ", setting timer for " + difference + ", seeking " + ("to " + nextRange.start(0)));
                      this.timer_ = setTimeout(this.skipTheGap_.bind(this), difference * 1000, currentTime);
                      return true;
                    }
                    return false;
                  },
                },
                {
                  key: "outsideOfSeekableWindow_",
                  value: function outsideOfSeekableWindow_(seekable, currentTime) {
                    if (!seekable.length) {
                      return false;
                    }
                    if (currentTime < seekable.start(0) - 0.1 || currentTime > seekable.end(seekable.length - 1) + 0.1) {
                      return true;
                    }
                    return false;
                  },
                },
                {
                  key: "fellOutOfLiveWindow_",
                  value: function fellOutOfLiveWindow_(seekable, currentTime) {
                    if (seekable.length && seekable.start(0) > 0 && currentTime < seekable.start(0)) {
                      return true;
                    }
                    return false;
                  },
                },
                {
                  key: "videoUnderflow_",
                  value: function videoUnderflow_(nextRange, buffered, currentTime) {
                    if (nextRange.length === 0) {
                      var gap = this.gapFromVideoUnderflow_(buffered, currentTime);
                      if (gap) {
                        this.logger_("Encountered a gap in video from " + gap.start + " to " + gap.end + ". " + ("Seeking to current time " + currentTime));
                        return true;
                      }
                    }
                    return false;
                  },
                },
                {
                  key: "skipTheGap_",
                  value: function skipTheGap_(scheduledCurrentTime) {
                    var buffered = this.tech_.buffered();
                    var currentTime = this.tech_.currentTime();
                    var nextRange = _ranges2["default"].findNextRange(buffered, currentTime);
                    this.cancelTimer_();
                    if (nextRange.length === 0 || currentTime !== scheduledCurrentTime) {
                      return;
                    }
                    this.logger_("skipTheGap_:", "currentTime:", currentTime, "scheduled currentTime:", scheduledCurrentTime, "nextRange start:", nextRange.start(0));
                    this.tech_.setCurrentTime(nextRange.start(0) + _ranges2["default"].TIME_FUDGE_FACTOR);
                    this.tech_.trigger({ type: "usage", name: "hls-gap-skip" });
                  },
                },
                {
                  key: "gapFromVideoUnderflow_",
                  value: function gapFromVideoUnderflow_(buffered, currentTime) {
                    var gaps = _ranges2["default"].findGaps(buffered);
                    for (var i = 0; i < gaps.length; i++) {
                      var start = gaps.start(i);
                      var end = gaps.end(i);
                      if (currentTime - start < 4 && currentTime - start > 2) {
                        return { start: start, end: end };
                      }
                    }
                    return null;
                  },
                },
                { key: "logger_", value: function logger_() {} },
              ]);
              return PlaybackWatcher;
            })();
            exports["default"] = PlaybackWatcher;
            module.exports = exports["default"];
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        { "./ranges": 11, "global/window": 31 },
      ],
      8: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            var _resolveUrl = require("./resolve-url");
            var _resolveUrl2 = _interopRequireDefault(_resolveUrl);
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _playlistJs = require("./playlist.js");
            var _m3u8Parser = require("m3u8-parser");
            var _m3u8Parser2 = _interopRequireDefault(_m3u8Parser);
            var _globalWindow = require("global/window");
            var _globalWindow2 = _interopRequireDefault(_globalWindow);
            var updateSegments = function updateSegments(original, update, offset) {
              var result = update.slice();
              var length = undefined;
              var i = undefined;
              offset = offset || 0;
              length = Math.min(original.length, update.length + offset);
              for (i = offset; i < length; i++) {
                result[i - offset] = (0, _videoJs.mergeOptions)(original[i], result[i - offset]);
              }
              return result;
            };
            var updateMaster = function updateMaster(master, media) {
              var changed = false;
              var result = (0, _videoJs.mergeOptions)(master, {});
              var i = master.playlists.length;
              var playlist = undefined;
              var segment = undefined;
              var j = undefined;
              while (i--) {
                playlist = result.playlists[i];
                if (playlist.uri === media.uri) {
                  if (playlist.segments && media.segments && playlist.segments.length === media.segments.length && playlist.mediaSequence === media.mediaSequence) {
                    continue;
                  }
                  result.playlists[i] = (0, _videoJs.mergeOptions)(playlist, media);
                  result.playlists[media.uri] = result.playlists[i];
                  if (playlist.segments) {
                    result.playlists[i].segments = updateSegments(playlist.segments, media.segments, media.mediaSequence - playlist.mediaSequence);
                  }
                  j = 0;
                  if (result.playlists[i].segments) {
                    j = result.playlists[i].segments.length;
                  }
                  while (j--) {
                    segment = result.playlists[i].segments[j];
                    if (!segment.resolvedUri) {
                      segment.resolvedUri = (0, _resolveUrl2["default"])(playlist.resolvedUri, segment.uri);
                    }
                    if (segment.key && !segment.key.resolvedUri) {
                      segment.key.resolvedUri = (0, _resolveUrl2["default"])(playlist.resolvedUri, segment.key.uri);
                    }
                    if (segment.map && !segment.map.resolvedUri) {
                      segment.map.resolvedUri = (0, _resolveUrl2["default"])(playlist.resolvedUri, segment.map.uri);
                    }
                  }
                  changed = true;
                }
              }
              return changed ? result : null;
            };
            var PlaylistLoader = function PlaylistLoader(srcUrl, hls, withCredentials) {
              var _this = this;
              var loader = this;
              var mediaUpdateTimeout = undefined;
              var request = undefined;
              var playlistRequestError = undefined;
              var haveMetadata = undefined;
              PlaylistLoader.prototype.constructor.call(this);
              this.hls_ = hls;
              if (!srcUrl) {
                throw new Error("A non-empty playlist URL is required");
              }
              playlistRequestError = function (xhr, url, startingState) {
                loader.setBandwidth(request || xhr);
                request = null;
                if (startingState) {
                  loader.state = startingState;
                }
                loader.error = {
                  playlist: loader.master.playlists[url],
                  status: xhr.status,
                  message: "HLS playlist request error at URL: " + url,
                  responseText: xhr.responseText,
                  code: xhr.status >= 500 ? 4 : 2,
                };
                loader.trigger("error");
              };
              haveMetadata = function (xhr, url) {
                var parser = undefined;
                var refreshDelay = undefined;
                var update = undefined;
                loader.setBandwidth(request || xhr);
                request = null;
                loader.state = "HAVE_METADATA";
                var responseText = xhr.responseText;
                if (window.reportResponseText) reportResponseText(xhr.responseText);
                parser = new _m3u8Parser2["default"].Parser();
                parser.push(responseText);
                parser.end();
                parser.manifest.uri = url;
                parser.manifest.attributes = parser.manifest.attributes || {};
                update = updateMaster(loader.master, parser.manifest);
                refreshDelay = (parser.manifest.targetDuration || 10) * 1000;
                loader.targetDuration = parser.manifest.targetDuration;
                if (update) {
                  loader.master = update;
                  loader.media_ = loader.master.playlists[parser.manifest.uri];
                } else {
                  refreshDelay /= 2;
                  loader.trigger("playlistunchanged");
                }
                if (!loader.media().endList) {
                  _globalWindow2["default"].clearTimeout(mediaUpdateTimeout);
                  mediaUpdateTimeout = _globalWindow2["default"].setTimeout(function () {
                    loader.trigger("mediaupdatetimeout");
                  }, refreshDelay);
                }
                loader.trigger("loadedplaylist");
              };
              loader.state = "HAVE_NOTHING";
              loader.dispose = function () {
                loader.stopRequest();
                _globalWindow2["default"].clearTimeout(mediaUpdateTimeout);
                loader.off();
              };
              loader.stopRequest = function () {
                if (request) {
                  var oldRequest = request;
                  request = null;
                  oldRequest.onreadystatechange = null;
                  oldRequest.abort();
                }
              };
              loader.enabledPlaylists_ = function () {
                return loader.master.playlists.filter(_playlistJs.isEnabled).length;
              };
              loader.isLowestEnabledRendition_ = function () {
                if (loader.master.playlists.length === 1) {
                  return true;
                }
                var media = loader.media();
                var currentBandwidth = media.attributes.BANDWIDTH || Number.MAX_VALUE;
                return (
                  loader.master.playlists.filter(function (playlist) {
                    var enabled = (0, _playlistJs.isEnabled)(playlist);
                    if (!enabled) {
                      return false;
                    }
                    return (playlist.attributes.BANDWIDTH || 0) < currentBandwidth;
                  }).length === 0
                );
              };
              loader.isFinalRendition_ = function () {
                return loader.master.playlists.filter(_playlistJs.isEnabled).length === 1;
              };
              loader.media = function (playlist) {
                var startingState = loader.state;
                var mediaChange = undefined;
                if (!playlist) {
                  return loader.media_;
                }
                if (loader.state === "HAVE_NOTHING") {
                  throw new Error("Cannot switch media playlist from " + loader.state);
                }
                if (typeof playlist === "string") {
                  if (!loader.master.playlists[playlist]) {
                    throw new Error("Unknown playlist URI: " + playlist);
                  }
                  playlist = loader.master.playlists[playlist];
                }
                mediaChange = !loader.media_ || playlist.uri !== loader.media_.uri;
                if (loader.master.playlists[playlist.uri].endList) {
                  if (request) {
                    request.onreadystatechange = null;
                    request.abort();
                    request = null;
                  }
                  loader.state = "HAVE_METADATA";
                  loader.media_ = playlist;
                  if (mediaChange) {
                    loader.trigger("mediachanging");
                    loader.trigger("mediachange");
                  }
                  return;
                }
                if (!mediaChange) {
                  return;
                }
                loader.state = "SWITCHING_MEDIA";
                if (request) {
                  if ((0, _resolveUrl2["default"])(loader.master.uri, playlist.uri) === request.url) {
                    return;
                  }
                  request.onreadystatechange = null;
                  request.abort();
                  request = null;
                }
                if (this.media_) {
                  this.trigger("mediachanging");
                }
                request = this.hls_.xhr(
                  {
                    uri: (0, _resolveUrl2["default"])(loader.master.uri, playlist.uri),
                    withCredentials: withCredentials,
                  },
                  function (error, req) {
                    if (!request) {
                      return;
                    }
                    if (error) {
                      return playlistRequestError(request, playlist.uri, startingState);
                    }
                    haveMetadata(req, playlist.uri);
                    if (startingState === "HAVE_MASTER") {
                      loader.trigger("loadedmetadata");
                    } else {
                      loader.trigger("mediachange");
                    }
                  }
                );
              };
              loader.setBandwidth = function (xhr) {
                loader.bandwidth = xhr.bandwidth;
              };
              loader.on("mediaupdatetimeout", function () {
                if (loader.state !== "HAVE_METADATA") {
                  return;
                }
                loader.state = "HAVE_CURRENT_METADATA";
                request = this.hls_.xhr(
                  {
                    uri: (0, _resolveUrl2["default"])(loader.master.uri, loader.media().uri),
                    withCredentials: withCredentials,
                  },
                  function (error, req) {
                    if (!request) {
                      return;
                    }
                    if (error) {
                      return playlistRequestError(request, loader.media().uri, "HAVE_METADATA");
                    }
                    haveMetadata(request, loader.media().uri);
                  }
                );
              });
              loader.on("firstplay", function () {
                var playlist = loader.media();
                if (playlist) {
                  playlist.syncInfo = {
                    mediaSequence: playlist.mediaSequence,
                    time: 0,
                  };
                }
              });
              loader.pause = function () {
                loader.stopRequest();
                _globalWindow2["default"].clearTimeout(mediaUpdateTimeout);
                if (loader.state === "HAVE_NOTHING") {
                  loader.started = false;
                }
              };
              loader.load = function (isFinalRendition) {
                var media = loader.media();
                _globalWindow2["default"].clearTimeout(mediaUpdateTimeout);
                if (isFinalRendition) {
                  var refreshDelay = media ? (media.targetDuration / 2) * 1000 : 5 * 1000;
                  mediaUpdateTimeout = _globalWindow2["default"].setTimeout(loader.load.bind(null, false), refreshDelay);
                  return;
                }
                if (!loader.started) {
                  loader.start();
                  return;
                }
                if (media && !media.endList) {
                  loader.trigger("mediaupdatetimeout");
                } else {
                  loader.trigger("loadedplaylist");
                }
              };
              loader.start = function () {
                loader.started = true;
                request = _this.hls_.xhr({ uri: srcUrl, withCredentials: withCredentials }, function (error, req) {
                  var parser = undefined;
                  var playlist = undefined;
                  var i = undefined;
                  if (!request) {
                    return;
                  }
                  request = null;
                  if (error) {
                    loader.error = {
                      status: req.status,
                      message: "HLS playlist request error at URL: " + srcUrl,
                      responseText: req.responseText,
                      code: 2,
                    };
                    if (loader.state === "HAVE_NOTHING") {
                      loader.started = false;
                    }
                    return loader.trigger("error");
                  }
                  parser = new _m3u8Parser2["default"].Parser();
                  parser.push(req.responseText);
                  parser.end();
                  loader.state = "HAVE_MASTER";
                  parser.manifest.uri = srcUrl;
                  if (parser.manifest.playlists) {
                    loader.master = parser.manifest;
                    i = loader.master.playlists.length;
                    while (i--) {
                      playlist = loader.master.playlists[i];
                      loader.master.playlists[playlist.uri] = playlist;
                      playlist.resolvedUri = (0, _resolveUrl2["default"])(loader.master.uri, playlist.uri);
                      if (!playlist.attributes) {
                        playlist.attributes = {};
                        _videoJs.log.warn("Invalid playlist STREAM-INF detected. Missing BANDWIDTH attribute.");
                      }
                    }
                    ["AUDIO", "SUBTITLES"].forEach(function (mediaType) {
                      for (var groupKey in loader.master.mediaGroups[mediaType]) {
                        for (var labelKey in loader.master.mediaGroups[mediaType][groupKey]) {
                          var mediaProperties = loader.master.mediaGroups[mediaType][groupKey][labelKey];
                          if (mediaProperties.uri) {
                            mediaProperties.resolvedUri = (0, _resolveUrl2["default"])(loader.master.uri, mediaProperties.uri);
                          }
                        }
                      }
                    });
                    loader.trigger("loadedplaylist");
                    if (!request) {
                      loader.media(parser.manifest.playlists[0]);
                    }
                    return;
                  }
                  loader.master = {
                    mediaGroups: {
                      AUDIO: {},
                      VIDEO: {},
                      "CLOSED-CAPTIONS": {},
                      SUBTITLES: {},
                    },
                    uri: _globalWindow2["default"].location.href,
                    playlists: [{ uri: srcUrl }],
                  };
                  loader.master.playlists[srcUrl] = loader.master.playlists[0];
                  loader.master.playlists[0].resolvedUri = srcUrl;
                  loader.master.playlists[0].attributes = loader.master.playlists[0].attributes || {};
                  haveMetadata(req, srcUrl);
                  return loader.trigger("loadedmetadata");
                });
              };
            };
            PlaylistLoader.prototype = new _videoJs.EventTarget();
            exports["default"] = PlaylistLoader;
            module.exports = exports["default"];
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        {
          "./playlist.js": 10,
          "./resolve-url": 14,
          "global/window": 31,
          "m3u8-parser": 32,
        },
      ],
      9: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          var _config = require("./config");
          var _config2 = _interopRequireDefault(_config);
          var _playlist = require("./playlist");
          var _playlist2 = _interopRequireDefault(_playlist);
          var _utilCodecsJs = require("./util/codecs.js");
          var safeGetComputedStyle = function safeGetComputedStyle(el, property) {
            var result = undefined;
            if (!el) {
              return "";
            }
            result = window.getComputedStyle(el);
            if (!result) {
              return "";
            }
            return result[property];
          };
          var stableSort = function stableSort(array, sortFn) {
            var newArray = array.slice();
            array.sort(function (left, right) {
              var cmp = sortFn(left, right);
              if (cmp === 0) {
                return newArray.indexOf(left) - newArray.indexOf(right);
              }
              return cmp;
            });
          };
          var comparePlaylistBandwidth = function comparePlaylistBandwidth(left, right) {
            var leftBandwidth = undefined;
            var rightBandwidth = undefined;
            if (left.attributes.BANDWIDTH) {
              leftBandwidth = left.attributes.BANDWIDTH;
            }
            leftBandwidth = leftBandwidth || window.Number.MAX_VALUE;
            if (right.attributes.BANDWIDTH) {
              rightBandwidth = right.attributes.BANDWIDTH;
            }
            rightBandwidth = rightBandwidth || window.Number.MAX_VALUE;
            return leftBandwidth - rightBandwidth;
          };
          exports.comparePlaylistBandwidth = comparePlaylistBandwidth;
          var comparePlaylistResolution = function comparePlaylistResolution(left, right) {
            var leftWidth = undefined;
            var rightWidth = undefined;
            if (left.attributes.RESOLUTION && left.attributes.RESOLUTION.width) {
              leftWidth = left.attributes.RESOLUTION.width;
            }
            leftWidth = leftWidth || window.Number.MAX_VALUE;
            if (right.attributes.RESOLUTION && right.attributes.RESOLUTION.width) {
              rightWidth = right.attributes.RESOLUTION.width;
            }
            rightWidth = rightWidth || window.Number.MAX_VALUE;
            if (leftWidth === rightWidth && left.attributes.BANDWIDTH && right.attributes.BANDWIDTH) {
              return left.attributes.BANDWIDTH - right.attributes.BANDWIDTH;
            }
            return leftWidth - rightWidth;
          };
          exports.comparePlaylistResolution = comparePlaylistResolution;
          var simpleSelector = function simpleSelector(master, playerBandwidth, playerWidth, playerHeight) {
            var sortedPlaylistReps = master.playlists.map(function (playlist) {
              var width = undefined;
              var height = undefined;
              var bandwidth = undefined;
              width = playlist.attributes.RESOLUTION && playlist.attributes.RESOLUTION.width;
              height = playlist.attributes.RESOLUTION && playlist.attributes.RESOLUTION.height;
              bandwidth = playlist.attributes.BANDWIDTH;
              bandwidth = bandwidth || window.Number.MAX_VALUE;
              return {
                bandwidth: bandwidth,
                width: width,
                height: height,
                playlist: playlist,
              };
            });
            stableSort(sortedPlaylistReps, function (left, right) {
              return left.bandwidth - right.bandwidth;
            });
            sortedPlaylistReps = sortedPlaylistReps.filter(function (rep) {
              return _playlist2["default"].isEnabled(rep.playlist);
            });
            var bandwidthPlaylistReps = sortedPlaylistReps.filter(function (rep) {
              return rep.bandwidth * _config2["default"].BANDWIDTH_VARIANCE < playerBandwidth;
            });
            var highestRemainingBandwidthRep = bandwidthPlaylistReps[bandwidthPlaylistReps.length - 1];
            var bandwidthBestRep = bandwidthPlaylistReps.filter(function (rep) {
              return rep.bandwidth === highestRemainingBandwidthRep.bandwidth;
            })[0];
            var haveResolution = bandwidthPlaylistReps.filter(function (rep) {
              return rep.width && rep.height;
            });
            stableSort(haveResolution, function (left, right) {
              return left.width - right.width;
            });
            var resolutionBestRepList = haveResolution.filter(function (rep) {
              return rep.width === playerWidth && rep.height === playerHeight;
            });
            highestRemainingBandwidthRep = resolutionBestRepList[resolutionBestRepList.length - 1];
            var resolutionBestRep = resolutionBestRepList.filter(function (rep) {
              return rep.bandwidth === highestRemainingBandwidthRep.bandwidth;
            })[0];
            var resolutionPlusOneList = undefined;
            var resolutionPlusOneSmallest = undefined;
            var resolutionPlusOneRep = undefined;
            if (!resolutionBestRep) {
              resolutionPlusOneList = haveResolution.filter(function (rep) {
                return rep.width > playerWidth || rep.height > playerHeight;
              });
              resolutionPlusOneSmallest = resolutionPlusOneList.filter(function (rep) {
                return rep.width === resolutionPlusOneList[0].width && rep.height === resolutionPlusOneList[0].height;
              });
              highestRemainingBandwidthRep = resolutionPlusOneSmallest[resolutionPlusOneSmallest.length - 1];
              resolutionPlusOneRep = resolutionPlusOneSmallest.filter(function (rep) {
                return rep.bandwidth === highestRemainingBandwidthRep.bandwidth;
              })[0];
            }
            return (resolutionPlusOneRep || resolutionBestRep || bandwidthBestRep || sortedPlaylistReps[0]).playlist;
          };
          exports.simpleSelector = simpleSelector;
          var lastBandwidthSelector = function lastBandwidthSelector() {
            return simpleSelector(
              this.playlists.master,
              this.systemBandwidth,
              parseInt(safeGetComputedStyle(this.tech_.el(), "width"), 10),
              parseInt(safeGetComputedStyle(this.tech_.el(), "height"), 10)
            );
          };
          exports.lastBandwidthSelector = lastBandwidthSelector;
          var movingAverageBandwidthSelector = function movingAverageBandwidthSelector(decay) {
            var average = -1;
            if (decay < 0 || decay > 1) {
              throw new Error("Moving average bandwidth decay must be between 0 and 1.");
            }
            return function () {
              if (average < 0) {
                average = this.systemBandwidth;
              }
              average = decay * this.systemBandwidth + (1 - decay) * average;
              return simpleSelector(this.playlists.master, average, parseInt(safeGetComputedStyle(this.tech_.el(), "width"), 10), parseInt(safeGetComputedStyle(this.tech_.el(), "height"), 10));
            };
          };
          exports.movingAverageBandwidthSelector = movingAverageBandwidthSelector;
          var minRebufferMaxBandwidthSelector = function minRebufferMaxBandwidthSelector(settings) {
            var master = settings.master;
            var currentTime = settings.currentTime;
            var bandwidth = settings.bandwidth;
            var duration = settings.duration;
            var segmentDuration = settings.segmentDuration;
            var timeUntilRebuffer = settings.timeUntilRebuffer;
            var currentTimeline = settings.currentTimeline;
            var syncController = settings.syncController;
            var bandwidthPlaylists = master.playlists.filter(function (playlist) {
              return _playlist2["default"].isEnabled(playlist) && _playlist2["default"].hasAttribute("BANDWIDTH", playlist);
            });
            var rebufferingEstimates = bandwidthPlaylists.map(function (playlist) {
              var syncPoint = syncController.getSyncPoint(playlist, duration, currentTimeline, currentTime);
              var numRequests = syncPoint ? 1 : 2;
              var requestTimeEstimate = _playlist2["default"].estimateSegmentRequestTime(segmentDuration, bandwidth, playlist);
              var rebufferingImpact = requestTimeEstimate * numRequests - timeUntilRebuffer;
              return {
                playlist: playlist,
                rebufferingImpact: rebufferingImpact,
              };
            });
            var noRebufferingPlaylists = rebufferingEstimates.filter(function (estimate) {
              return estimate.rebufferingImpact <= 0;
            });
            stableSort(noRebufferingPlaylists, function (a, b) {
              return comparePlaylistBandwidth(b.playlist, a.playlist);
            });
            if (noRebufferingPlaylists.length) {
              return noRebufferingPlaylists[0];
            }
            stableSort(rebufferingEstimates, function (a, b) {
              return a.rebufferingImpact - b.rebufferingImpact;
            });
            return rebufferingEstimates[0] || null;
          };
          exports.minRebufferMaxBandwidthSelector = minRebufferMaxBandwidthSelector;
          var lowestBitrateCompatibleVariantSelector = function lowestBitrateCompatibleVariantSelector() {
            var playlists = this.playlists.master.playlists.filter(_playlist2["default"].isEnabled);
            stableSort(playlists, function (a, b) {
              return comparePlaylistBandwidth(a, b);
            });
            var playlistsWithVideo = playlists.filter(function (playlist) {
              return (0, _utilCodecsJs.parseCodecs)(playlist.attributes.CODECS).videoCodec;
            });
            return playlistsWithVideo[0] || null;
          };
          exports.lowestBitrateCompatibleVariantSelector = lowestBitrateCompatibleVariantSelector;
        },
        { "./config": 3, "./playlist": 10, "./util/codecs.js": 18 },
      ],
      10: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _globalWindow = require("global/window");
            var _globalWindow2 = _interopRequireDefault(_globalWindow);
            var Playlist = { UNSAFE_LIVE_SEGMENTS: 3 };
            var backwardDuration = function backwardDuration(playlist, endSequence) {
              var result = 0;
              var i = endSequence - playlist.mediaSequence;
              var segment = playlist.segments[i];
              if (segment) {
                if (typeof segment.start !== "undefined") {
                  return { result: segment.start, precise: true };
                }
                if (typeof segment.end !== "undefined") {
                  return {
                    result: segment.end - segment.duration,
                    precise: true,
                  };
                }
              }
              while (i--) {
                segment = playlist.segments[i];
                if (typeof segment.end !== "undefined") {
                  return { result: result + segment.end, precise: true };
                }
                result += segment.duration;
                if (typeof segment.start !== "undefined") {
                  return { result: result + segment.start, precise: true };
                }
              }
              return { result: result, precise: false };
            };
            var forwardDuration = function forwardDuration(playlist, endSequence) {
              var result = 0;
              var segment = undefined;
              var i = endSequence - playlist.mediaSequence;
              for (; i < playlist.segments.length; i++) {
                segment = playlist.segments[i];
                if (typeof segment.start !== "undefined") {
                  return { result: segment.start - result, precise: true };
                }
                result += segment.duration;
                if (typeof segment.end !== "undefined") {
                  return { result: segment.end - result, precise: true };
                }
              }
              return { result: -1, precise: false };
            };
            var intervalDuration = function intervalDuration(playlist, endSequence, expired) {
              var backward = undefined;
              var forward = undefined;
              if (typeof endSequence === "undefined") {
                endSequence = playlist.mediaSequence + playlist.segments.length;
              }
              if (endSequence < playlist.mediaSequence) {
                return 0;
              }
              backward = backwardDuration(playlist, endSequence);
              if (backward.precise) {
                return backward.result;
              }
              forward = forwardDuration(playlist, endSequence);
              if (forward.precise) {
                return forward.result;
              }
              return backward.result + expired;
            };
            var duration = function duration(playlist, endSequence, expired) {
              if (!playlist) {
                return 0;
              }
              if (typeof expired !== "number") {
                expired = 0;
              }
              if (typeof endSequence === "undefined") {
                if (playlist.totalDuration) {
                  return playlist.totalDuration;
                }
                if (!playlist.endList) {
                  return _globalWindow2["default"].Infinity;
                }
              }
              return intervalDuration(playlist, endSequence, expired);
            };
            exports.duration = duration;
            var sumDurations = function sumDurations(playlist, startIndex, endIndex) {
              var durations = 0;
              if (startIndex > endIndex) {
                var _ref = [endIndex, startIndex];
                startIndex = _ref[0];
                endIndex = _ref[1];
              }
              if (startIndex < 0) {
                for (var i = startIndex; i < Math.min(0, endIndex); i++) {
                  durations += playlist.targetDuration;
                }
                startIndex = 0;
              }
              for (var i = startIndex; i < endIndex; i++) {
                durations += playlist.segments[i].duration;
              }
              return durations;
            };
            exports.sumDurations = sumDurations;
            var playlistEnd = function playlistEnd(playlist, expired, useSafeLiveEnd) {
              if (!playlist || !playlist.segments) {
                return null;
              }
              if (playlist.endList) {
                return duration(playlist);
              }
              if (expired === null) {
                return null;
              }
              expired = expired || 0;
              var endSequence = useSafeLiveEnd ? Math.max(0, playlist.segments.length - Playlist.UNSAFE_LIVE_SEGMENTS) : Math.max(0, playlist.segments.length);
              return intervalDuration(playlist, playlist.mediaSequence + endSequence, expired);
            };
            exports.playlistEnd = playlistEnd;
            var seekable = function seekable(playlist, expired) {
              var useSafeLiveEnd = true;
              var seekableStart = expired || 0;
              var seekableEnd = playlistEnd(playlist, expired, useSafeLiveEnd);
              if (seekableEnd === null) {
                return (0, _videoJs.createTimeRange)();
              }
              return (0, _videoJs.createTimeRange)(seekableStart, seekableEnd);
            };
            exports.seekable = seekable;
            var isWholeNumber = function isWholeNumber(num) {
              return num - Math.floor(num) === 0;
            };
            var roundSignificantDigit = function roundSignificantDigit(increment, num) {
              if (isWholeNumber(num)) {
                return num + increment * 0.1;
              }
              var numDecimalDigits = num.toString().split(".")[1].length;
              for (var i = 1; i <= numDecimalDigits; i++) {
                var scale = Math.pow(10, i);
                var temp = num * scale;
                if (isWholeNumber(temp) || i === numDecimalDigits) {
                  return (temp + increment) / scale;
                }
              }
            };
            var ceilLeastSignificantDigit = roundSignificantDigit.bind(null, 1);
            var floorLeastSignificantDigit = roundSignificantDigit.bind(null, -1);
            var getMediaInfoForTime = function getMediaInfoForTime(playlist, currentTime, startIndex, startTime) {
              var i = undefined;
              var segment = undefined;
              var numSegments = playlist.segments.length;
              var time = currentTime - startTime;
              if (time < 0) {
                if (startIndex > 0) {
                  for (i = startIndex - 1; i >= 0; i--) {
                    segment = playlist.segments[i];
                    time += floorLeastSignificantDigit(segment.duration);
                    if (time > 0) {
                      return {
                        mediaIndex: i,
                        startTime: startTime - sumDurations(playlist, startIndex, i),
                      };
                    }
                  }
                }
                return { mediaIndex: 0, startTime: currentTime };
              }
              if (startIndex < 0) {
                for (i = startIndex; i < 0; i++) {
                  time -= playlist.targetDuration;
                  if (time < 0) {
                    return { mediaIndex: 0, startTime: currentTime };
                  }
                }
                startIndex = 0;
              }
              for (i = startIndex; i < numSegments; i++) {
                segment = playlist.segments[i];
                time -= ceilLeastSignificantDigit(segment.duration);
                if (time < 0) {
                  return {
                    mediaIndex: i,
                    startTime: startTime + sumDurations(playlist, startIndex, i),
                  };
                }
              }
              return { mediaIndex: numSegments - 1, startTime: currentTime };
            };
            exports.getMediaInfoForTime = getMediaInfoForTime;
            var isBlacklisted = function isBlacklisted(playlist) {
              return playlist.excludeUntil && playlist.excludeUntil > Date.now();
            };
            exports.isBlacklisted = isBlacklisted;
            var isEnabled = function isEnabled(playlist) {
              var blacklisted = isBlacklisted(playlist);
              return !playlist.disabled && !blacklisted;
            };
            exports.isEnabled = isEnabled;
            var isAes = function isAes(media) {
              for (var i = 0; i < media.segments.length; i++) {
                if (media.segments[i].key) {
                  return true;
                }
              }
              return false;
            };
            exports.isAes = isAes;
            var isFmp4 = function isFmp4(media) {
              for (var i = 0; i < media.segments.length; i++) {
                if (media.segments[i].map) {
                  return true;
                }
              }
              return false;
            };
            exports.isFmp4 = isFmp4;
            var hasAttribute = function hasAttribute(attr, playlist) {
              return playlist.attributes && playlist.attributes[attr];
            };
            exports.hasAttribute = hasAttribute;
            var estimateSegmentRequestTime = function estimateSegmentRequestTime(segmentDuration, bandwidth, playlist) {
              var bytesReceived = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
              if (!hasAttribute("BANDWIDTH", playlist)) {
                return NaN;
              }
              var size = segmentDuration * playlist.attributes.BANDWIDTH;
              return (size - bytesReceived * 8) / bandwidth;
            };
            exports.estimateSegmentRequestTime = estimateSegmentRequestTime;
            Playlist.duration = duration;
            Playlist.seekable = seekable;
            Playlist.getMediaInfoForTime = getMediaInfoForTime;
            Playlist.isEnabled = isEnabled;
            Playlist.isBlacklisted = isBlacklisted;
            Playlist.playlistEnd = playlistEnd;
            Playlist.isAes = isAes;
            Playlist.isFmp4 = isFmp4;
            Playlist.hasAttribute = hasAttribute;
            Playlist.estimateSegmentRequestTime = estimateSegmentRequestTime;
            exports["default"] = Playlist;
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        { "global/window": 31 },
      ],
      11: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            var _slicedToArray = (function () {
              function sliceIterator(arr, i) {
                var _arr = [];
                var _n = true;
                var _d = false;
                var _e = undefined;
                try {
                  for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                    _arr.push(_s.value);
                    if (i && _arr.length === i) break;
                  }
                } catch (err) {
                  _d = true;
                  _e = err;
                } finally {
                  try {
                    if (!_n && _i["return"]) _i["return"]();
                  } finally {
                    if (_d) throw _e;
                  }
                }
                return _arr;
              }
              return function (arr, i) {
                if (Array.isArray(arr)) {
                  return arr;
                } else if (Symbol.iterator in Object(arr)) {
                  return sliceIterator(arr, i);
                } else {
                  throw new TypeError("Invalid attempt to destructure non-iterable instance");
                }
              };
            })();
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var TIME_FUDGE_FACTOR = 1 / 30;
            var clamp = function clamp(num, _ref) {
              var _ref2 = _slicedToArray(_ref, 2);
              var start = _ref2[0];
              var end = _ref2[1];
              return Math.min(Math.max(start, num), end);
            };
            var filterRanges = function filterRanges(timeRanges, predicate) {
              var results = [];
              var i = undefined;
              if (timeRanges && timeRanges.length) {
                for (i = 0; i < timeRanges.length; i++) {
                  if (predicate(timeRanges.start(i), timeRanges.end(i))) {
                    results.push([timeRanges.start(i), timeRanges.end(i)]);
                  }
                }
              }
              return _videoJs2["default"].createTimeRanges(results);
            };
            var findRange = function findRange(buffered, time) {
              return filterRanges(buffered, function (start, end) {
                return start - TIME_FUDGE_FACTOR <= time && end + TIME_FUDGE_FACTOR >= time;
              });
            };
            var findNextRange = function findNextRange(timeRanges, time) {
              return filterRanges(timeRanges, function (start) {
                return start - TIME_FUDGE_FACTOR >= time;
              });
            };
            var findGaps = function findGaps(buffered) {
              if (buffered.length < 2) {
                return _videoJs2["default"].createTimeRanges();
              }
              var ranges = [];
              for (var i = 1; i < buffered.length; i++) {
                var start = buffered.end(i - 1);
                var end = buffered.start(i);
                ranges.push([start, end]);
              }
              return _videoJs2["default"].createTimeRanges(ranges);
            };
            var findSoleUncommonTimeRangesEnd = function findSoleUncommonTimeRangesEnd(original, update) {
              var i = undefined;
              var start = undefined;
              var end = undefined;
              var result = [];
              var edges = [];
              var overlapsCurrentEnd = function overlapsCurrentEnd(span) {
                return span[0] <= end && span[1] >= end;
              };
              if (original) {
                for (i = 0; i < original.length; i++) {
                  start = original.start(i);
                  end = original.end(i);
                  edges.push([start, end]);
                }
              }
              if (update) {
                for (i = 0; i < update.length; i++) {
                  start = update.start(i);
                  end = update.end(i);
                  if (edges.some(overlapsCurrentEnd)) {
                    continue;
                  }
                  result.push(end);
                }
              }
              if (result.length !== 1) {
                return null;
              }
              return result[0];
            };
            var bufferIntersection = function bufferIntersection(bufferA, bufferB) {
              var start = null;
              var end = null;
              var arity = 0;
              var extents = [];
              var ranges = [];
              if (!bufferA || !bufferA.length || !bufferB || !bufferB.length) {
                return _videoJs2["default"].createTimeRange();
              }
              var count = bufferA.length;
              while (count--) {
                extents.push({ time: bufferA.start(count), type: "start" });
                extents.push({ time: bufferA.end(count), type: "end" });
              }
              count = bufferB.length;
              while (count--) {
                extents.push({ time: bufferB.start(count), type: "start" });
                extents.push({ time: bufferB.end(count), type: "end" });
              }
              extents.sort(function (a, b) {
                return a.time - b.time;
              });
              for (count = 0; count < extents.length; count++) {
                if (extents[count].type === "start") {
                  arity++;
                  if (arity === 2) {
                    start = extents[count].time;
                  }
                } else if (extents[count].type === "end") {
                  arity--;
                  if (arity === 1) {
                    end = extents[count].time;
                  }
                }
                if (start !== null && end !== null) {
                  ranges.push([start, end]);
                  start = null;
                  end = null;
                }
              }
              return _videoJs2["default"].createTimeRanges(ranges);
            };
            var calculateBufferedPercent = function calculateBufferedPercent(adjustedRange, referenceRange, currentTime, buffered) {
              var referenceDuration = referenceRange.end(0) - referenceRange.start(0);
              var adjustedDuration = adjustedRange.end(0) - adjustedRange.start(0);
              var bufferMissingFromAdjusted = referenceDuration - adjustedDuration;
              var adjustedIntersection = bufferIntersection(adjustedRange, buffered);
              var referenceIntersection = bufferIntersection(referenceRange, buffered);
              var adjustedOverlap = 0;
              var referenceOverlap = 0;
              var count = adjustedIntersection.length;
              while (count--) {
                adjustedOverlap += adjustedIntersection.end(count) - adjustedIntersection.start(count);
                if (adjustedIntersection.start(count) === currentTime) {
                  adjustedOverlap += bufferMissingFromAdjusted;
                }
              }
              count = referenceIntersection.length;
              while (count--) {
                referenceOverlap += referenceIntersection.end(count) - referenceIntersection.start(count);
              }
              return (Math.max(adjustedOverlap, referenceOverlap) / referenceDuration) * 100;
            };
            var getSegmentBufferedPercent = function getSegmentBufferedPercent(startOfSegment, segmentDuration, currentTime, buffered) {
              var endOfSegment = startOfSegment + segmentDuration;
              var originalSegmentRange = _videoJs2["default"].createTimeRanges([[startOfSegment, endOfSegment]]);
              var adjustedSegmentRange = _videoJs2["default"].createTimeRanges([[clamp(startOfSegment, [currentTime, endOfSegment]), endOfSegment]]);
              if (adjustedSegmentRange.start(0) === adjustedSegmentRange.end(0)) {
                return 0;
              }
              var percent = calculateBufferedPercent(adjustedSegmentRange, originalSegmentRange, currentTime, buffered);
              if (isNaN(percent) || percent === Infinity || percent === -Infinity) {
                return 0;
              }
              return percent;
            };
            var printableRange = function printableRange(range) {
              var strArr = [];
              if (!range || !range.length) {
                return "";
              }
              for (var i = 0; i < range.length; i++) {
                strArr.push(range.start(i) + " => " + range.end(i));
              }
              return strArr.join(", ");
            };
            var timeUntilRebuffer = function timeUntilRebuffer(buffered, currentTime) {
              var playbackRate = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
              var bufferedEnd = buffered.length ? buffered.end(buffered.length - 1) : 0;
              return (bufferedEnd - currentTime) / playbackRate;
            };
            exports["default"] = {
              findRange: findRange,
              findNextRange: findNextRange,
              findGaps: findGaps,
              findSoleUncommonTimeRangesEnd: findSoleUncommonTimeRangesEnd,
              getSegmentBufferedPercent: getSegmentBufferedPercent,
              TIME_FUDGE_FACTOR: TIME_FUDGE_FACTOR,
              printableRange: printableRange,
              timeUntilRebuffer: timeUntilRebuffer,
            };
            module.exports = exports["default"];
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        {},
      ],
      12: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var defaultOptions = {
              errorInterval: 30,
              getSource: function getSource(next) {
                var tech = this.tech({ IWillNotUseThisInPlugins: true });
                var sourceObj = tech.currentSource_;
                return next(sourceObj);
              },
            };
            var initPlugin = function initPlugin(player, options) {
              var lastCalled = 0;
              var seekTo = 0;
              var localOptions = _videoJs2["default"].mergeOptions(defaultOptions, options);
              player.ready(function () {
                player.trigger({
                  type: "usage",
                  name: "hls-error-reload-initialized",
                });
              });
              var loadedMetadataHandler = function loadedMetadataHandler() {
                if (seekTo) {
                  player.currentTime(seekTo);
                }
              };
              var setSource = function setSource(sourceObj) {
                if (sourceObj === null || sourceObj === undefined) {
                  return;
                }
                seekTo = (player.duration() !== Infinity && player.currentTime()) || 0;
                player.one("loadedmetadata", loadedMetadataHandler);
                player.src(sourceObj);
                player.trigger({ type: "usage", name: "hls-error-reload" });
                player.play();
              };
              var errorHandler = function errorHandler() {
                if (Date.now() - lastCalled < localOptions.errorInterval * 1000) {
                  player.trigger({
                    type: "usage",
                    name: "hls-error-reload-canceled",
                  });
                  return;
                }
                if (!localOptions.getSource || typeof localOptions.getSource !== "function") {
                  _videoJs2["default"].log.error("ERROR: reloadSourceOnError - The option getSource must be a function!");
                  return;
                }
                lastCalled = Date.now();
                return localOptions.getSource.call(player, setSource);
              };
              var cleanupEvents = function cleanupEvents() {
                player.off("loadedmetadata", loadedMetadataHandler);
                player.off("error", errorHandler);
                player.off("dispose", cleanupEvents);
              };
              var reinitPlugin = function reinitPlugin(newOptions) {
                cleanupEvents();
                initPlugin(player, newOptions);
              };
              player.on("error", errorHandler);
              player.on("dispose", cleanupEvents);
              player.reloadSourceOnError = reinitPlugin;
            };
            var reloadSourceOnError = function reloadSourceOnError(options) {
              initPlugin(this, options);
            };
            exports["default"] = reloadSourceOnError;
            module.exports = exports["default"];
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        {},
      ],
      13: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          var _playlistJs = require("./playlist.js");
          var enableFunction = function enableFunction(loader, playlistUri, changePlaylistFn, enable) {
            var playlist = loader.master.playlists[playlistUri];
            var blacklisted = (0, _playlistJs.isBlacklisted)(playlist);
            var currentlyEnabled = (0, _playlistJs.isEnabled)(playlist);
            if (typeof enable === "undefined") {
              return currentlyEnabled;
            }
            if (enable) {
              delete playlist.disabled;
            } else {
              playlist.disabled = true;
            }
            if (enable !== currentlyEnabled && !blacklisted) {
              changePlaylistFn();
              if (enable) {
                loader.trigger("renditionenabled");
              } else {
                loader.trigger("renditiondisabled");
              }
            }
            return enable;
          };
          var Representation = function Representation(hlsHandler, playlist, id) {
            _classCallCheck(this, Representation);
            var fastChangeFunction = hlsHandler.masterPlaylistController_.fastQualityChange_.bind(hlsHandler.masterPlaylistController_);
            if (playlist.attributes.RESOLUTION) {
              var resolution = playlist.attributes.RESOLUTION;
              this.width = resolution.width;
              this.height = resolution.height;
            }
            this.bandwidth = playlist.attributes.BANDWIDTH;
            this.id = id;
            this.enabled = enableFunction.bind(this, hlsHandler.playlists, playlist.uri, fastChangeFunction);
          };
          var renditionSelectionMixin = function renditionSelectionMixin(hlsHandler) {
            var playlists = hlsHandler.playlists;
            hlsHandler.representations = function () {
              return playlists.master.playlists
                .filter(function (media) {
                  return !(0, _playlistJs.isBlacklisted)(media);
                })
                .map(function (e, i) {
                  return new Representation(hlsHandler, e, e.uri);
                });
            };
          };
          exports["default"] = renditionSelectionMixin;
          module.exports = exports["default"];
        },
        { "./playlist.js": 10 },
      ],
      14: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          var _urlToolkit = require("url-toolkit");
          var _urlToolkit2 = _interopRequireDefault(_urlToolkit);
          var _globalWindow = require("global/window");
          var _globalWindow2 = _interopRequireDefault(_globalWindow);
          var resolveUrl = function resolveUrl(baseURL, relativeURL) {
            if (/^[a-z]+:/i.test(relativeURL)) {
              return relativeURL;
            }
            if (!/\/\//i.test(baseURL)) {
              baseURL = _urlToolkit2["default"].buildAbsoluteURL(_globalWindow2["default"].location.href, baseURL);
            }
            return _urlToolkit2["default"].buildAbsoluteURL(baseURL, relativeURL);
          };
          exports["default"] = resolveUrl;
          module.exports = exports["default"];
        },
        { "global/window": 31, "url-toolkit": 62 },
      ],
      15: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            var _createClass = (function () {
              function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ("value" in descriptor) descriptor.writable = true;
                  Object.defineProperty(target, descriptor.key, descriptor);
                }
              }
              return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
              };
            })();
            var _get = function get(_x4, _x5, _x6) {
              var _again = true;
              _function: while (_again) {
                var object = _x4,
                  property = _x5,
                  receiver = _x6;
                _again = false;
                if (object === null) object = Function.prototype;
                var desc = Object.getOwnPropertyDescriptor(object, property);
                if (desc === undefined) {
                  var parent = Object.getPrototypeOf(object);
                  if (parent === null) {
                    return undefined;
                  } else {
                    _x4 = parent;
                    _x5 = property;
                    _x6 = receiver;
                    _again = true;
                    desc = parent = undefined;
                    continue _function;
                  }
                } else if ("value" in desc) {
                  return desc.value;
                } else {
                  var getter = desc.get;
                  if (getter === undefined) {
                    return undefined;
                  }
                  return getter.call(receiver);
                }
              }
            };
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            function _classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            function _inherits(subClass, superClass) {
              if (typeof superClass !== "function" && superClass !== null) {
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
              }
              subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                  value: subClass,
                  enumerable: false,
                  writable: true,
                  configurable: true,
                },
              });
              if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
            }
            var _playlist = require("./playlist");
            var _playlist2 = _interopRequireDefault(_playlist);
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var _sourceUpdater = require("./source-updater");
            var _sourceUpdater2 = _interopRequireDefault(_sourceUpdater);
            var _config = require("./config");
            var _config2 = _interopRequireDefault(_config);
            var _globalWindow = require("global/window");
            var _globalWindow2 = _interopRequireDefault(_globalWindow);
            var _videojsContribMediaSourcesEs5RemoveCuesFromTrackJs = require("videojs-contrib-media-sources/es5/remove-cues-from-track.js");
            var _videojsContribMediaSourcesEs5RemoveCuesFromTrackJs2 = _interopRequireDefault(_videojsContribMediaSourcesEs5RemoveCuesFromTrackJs);
            var _binUtils = require("./bin-utils");
            var _mediaSegmentRequest = require("./media-segment-request");
            var _ranges = require("./ranges");
            var _playlistSelectors = require("./playlist-selectors");
            var CHECK_BUFFER_DELAY = 500;
            var detectEndOfStream = function detectEndOfStream(playlist, mediaSource, segmentIndex) {
              if (!playlist || !mediaSource) {
                return false;
              }
              var segments = playlist.segments;
              var appendedLastSegment = segmentIndex === segments.length;
              return playlist.endList && mediaSource.readyState === "open" && appendedLastSegment;
            };
            var finite = function finite(num) {
              return typeof num === "number" && isFinite(num);
            };
            var SegmentLoader = (function (_videojs$EventTarget) {
              _inherits(SegmentLoader, _videojs$EventTarget);
              function SegmentLoader(settings) {
                var _this = this;
                var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
                _classCallCheck(this, SegmentLoader);
                _get(Object.getPrototypeOf(SegmentLoader.prototype), "constructor", this).call(this);
                if (!settings) {
                  throw new TypeError("Initialization settings are required");
                }
                if (typeof settings.currentTime !== "function") {
                  throw new TypeError("No currentTime getter specified");
                }
                if (!settings.mediaSource) {
                  throw new TypeError("No MediaSource specified");
                }
                this.state = "INIT";
                this.bandwidth = settings.bandwidth;
                this.throughput = { rate: 0, count: 0 };
                this.roundTrip = NaN;
                this.resetStats_();
                this.mediaIndex = null;
                this.hasPlayed_ = settings.hasPlayed;
                this.currentTime_ = settings.currentTime;
                this.seekable_ = settings.seekable;
                this.seeking_ = settings.seeking;
                this.duration_ = settings.duration;
                this.mediaSource_ = settings.mediaSource;
                this.hls_ = settings.hls;
                this.loaderType_ = settings.loaderType;
                this.segmentMetadataTrack_ = settings.segmentMetadataTrack;
                this.goalBufferLength_ = settings.goalBufferLength;
                this.checkBufferTimeout_ = null;
                this.error_ = void 0;
                this.currentTimeline_ = -1;
                this.pendingSegment_ = null;
                this.mimeType_ = null;
                this.sourceUpdater_ = null;
                this.xhrOptions_ = null;
                this.activeInitSegmentId_ = null;
                this.initSegments_ = {};
                this.decrypter_ = settings.decrypter;
                this.syncController_ = settings.syncController;
                this.syncPoint_ = { segmentIndex: 0, time: 0 };
                this.syncController_.on("syncinfoupdate", function () {
                  return _this.trigger("syncinfoupdate");
                });
                this.mediaSource_.addEventListener("sourceopen", function () {
                  return (_this.ended_ = false);
                });
                this.fetchAtBuffer_ = false;
                if (options.debug) {
                  this.logger_ = _videoJs2["default"].log.bind(_videoJs2["default"], "segment-loader", this.loaderType_, "->");
                }
              }
              _createClass(SegmentLoader, [
                {
                  key: "resetStats_",
                  value: function resetStats_() {
                    this.mediaBytesTransferred = 0;
                    this.mediaRequests = 0;
                    this.mediaRequestsAborted = 0;
                    this.mediaRequestsTimedout = 0;
                    this.mediaRequestsErrored = 0;
                    this.mediaTransferDuration = 0;
                    this.mediaSecondsLoaded = 0;
                  },
                },
                {
                  key: "dispose",
                  value: function dispose() {
                    this.state = "DISPOSED";
                    this.pause();
                    this.abort_();
                    if (this.sourceUpdater_) {
                      this.sourceUpdater_.dispose();
                    }
                    this.resetStats_();
                  },
                },
                {
                  key: "abort",
                  value: function abort() {
                    if (this.state !== "WAITING") {
                      if (this.pendingSegment_) {
                        this.pendingSegment_ = null;
                      }
                      return;
                    }
                    this.abort_();
                    this.state = "READY";
                    if (!this.paused()) {
                      this.monitorBuffer_();
                    }
                  },
                },
                {
                  key: "abort_",
                  value: function abort_() {
                    if (this.pendingSegment_) {
                      this.pendingSegment_.abortRequests();
                    }
                    this.pendingSegment_ = null;
                  },
                },
                {
                  key: "error",
                  value: function error(_error) {
                    if (typeof _error !== "undefined") {
                      this.error_ = _error;
                    }
                    this.pendingSegment_ = null;
                    return this.error_;
                  },
                },
                {
                  key: "endOfStream",
                  value: function endOfStream() {
                    this.ended_ = true;
                    this.pause();
                    this.trigger("ended");
                  },
                },
                {
                  key: "buffered_",
                  value: function buffered_() {
                    if (!this.sourceUpdater_) {
                      return _videoJs2["default"].createTimeRanges();
                    }
                    return this.sourceUpdater_.buffered();
                  },
                },
                {
                  key: "initSegment",
                  value: function initSegment(map) {
                    var set = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
                    if (!map) {
                      return null;
                    }
                    var id = (0, _binUtils.initSegmentId)(map);
                    var storedMap = this.initSegments_[id];
                    if (set && !storedMap && map.bytes) {
                      this.initSegments_[id] = storedMap = {
                        resolvedUri: map.resolvedUri,
                        byterange: map.byterange,
                        bytes: map.bytes,
                      };
                    }
                    return storedMap || map;
                  },
                },
                {
                  key: "couldBeginLoading_",
                  value: function couldBeginLoading_() {
                    return this.playlist_ && (this.sourceUpdater_ || (this.mimeType_ && this.state === "INIT")) && !this.paused();
                  },
                },
                {
                  key: "load",
                  value: function load() {
                    this.monitorBuffer_();
                    if (!this.playlist_) {
                      return;
                    }
                    this.syncController_.setDateTimeMapping(this.playlist_);
                    if (this.state === "INIT" && this.couldBeginLoading_()) {
                      return this.init_();
                    }
                    if (!this.couldBeginLoading_() || (this.state !== "READY" && this.state !== "INIT")) {
                      return;
                    }
                    this.state = "READY";
                  },
                },
                {
                  key: "init_",
                  value: function init_() {
                    this.state = "READY";
                    this.sourceUpdater_ = new _sourceUpdater2["default"](this.mediaSource_, this.mimeType_);
                    this.resetEverything();
                    return this.monitorBuffer_();
                  },
                },
                {
                  key: "playlist",
                  value: function playlist(newPlaylist) {
                    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
                    if (!newPlaylist) {
                      return;
                    }
                    var oldPlaylist = this.playlist_;
                    var segmentInfo = this.pendingSegment_;
                    this.playlist_ = newPlaylist;
                    this.xhrOptions_ = options;
                    if (!this.hasPlayed_()) {
                      newPlaylist.syncInfo = {
                        mediaSequence: newPlaylist.mediaSequence,
                        time: 0,
                      };
                    }
                    this.trigger("syncinfoupdate");
                    if (this.state === "INIT" && this.couldBeginLoading_()) {
                      return this.init_();
                    }
                    if (!oldPlaylist || oldPlaylist.uri !== newPlaylist.uri) {
                      if (this.mediaIndex !== null) {
                        this.resyncLoader();
                      }
                      return;
                    }
                    var mediaSequenceDiff = newPlaylist.mediaSequence - oldPlaylist.mediaSequence;
                    this.logger_("mediaSequenceDiff", mediaSequenceDiff);
                    if (this.mediaIndex !== null) {
                      this.mediaIndex -= mediaSequenceDiff;
                    }
                    if (segmentInfo) {
                      segmentInfo.mediaIndex -= mediaSequenceDiff;
                      if (segmentInfo.mediaIndex >= 0) {
                        segmentInfo.segment = newPlaylist.segments[segmentInfo.mediaIndex];
                      }
                    }
                    this.syncController_.saveExpiredSegmentInfo(oldPlaylist, newPlaylist);
                  },
                },
                {
                  key: "pause",
                  value: function pause() {
                    if (this.checkBufferTimeout_) {
                      _globalWindow2["default"].clearTimeout(this.checkBufferTimeout_);
                      this.checkBufferTimeout_ = null;
                    }
                  },
                },
                {
                  key: "paused",
                  value: function paused() {
                    return this.checkBufferTimeout_ === null;
                  },
                },
                {
                  key: "mimeType",
                  value: function mimeType(_mimeType) {
                    if (this.mimeType_) {
                      return;
                    }
                    this.mimeType_ = _mimeType;
                    if (this.state === "INIT" && this.couldBeginLoading_()) {
                      this.init_();
                    }
                  },
                },
                {
                  key: "resetEverything",
                  value: function resetEverything() {
                    this.ended_ = false;
                    this.resetLoader();
                    this.remove(0, this.duration_());
                  },
                },
                {
                  key: "resetLoader",
                  value: function resetLoader() {
                    this.fetchAtBuffer_ = false;
                    this.resyncLoader();
                  },
                },
                {
                  key: "resyncLoader",
                  value: function resyncLoader() {
                    this.mediaIndex = null;
                    this.syncPoint_ = null;
                    this.abort();
                  },
                },
                {
                  key: "remove",
                  value: function remove(start, end) {
                    if (this.sourceUpdater_) {
                      this.sourceUpdater_.remove(start, end);
                    }
                    (0, _videojsContribMediaSourcesEs5RemoveCuesFromTrackJs2["default"])(start, end, this.segmentMetadataTrack_);
                  },
                },
                {
                  key: "monitorBuffer_",
                  value: function monitorBuffer_() {
                    if (this.checkBufferTimeout_) {
                      _globalWindow2["default"].clearTimeout(this.checkBufferTimeout_);
                    }
                    this.checkBufferTimeout_ = _globalWindow2["default"].setTimeout(this.monitorBufferTick_.bind(this), 1);
                  },
                },
                {
                  key: "monitorBufferTick_",
                  value: function monitorBufferTick_() {
                    if (this.state === "READY") {
                      this.fillBuffer_();
                    }
                    if (this.checkBufferTimeout_) {
                      _globalWindow2["default"].clearTimeout(this.checkBufferTimeout_);
                    }
                    this.checkBufferTimeout_ = _globalWindow2["default"].setTimeout(this.monitorBufferTick_.bind(this), CHECK_BUFFER_DELAY);
                  },
                },
                {
                  key: "fillBuffer_",
                  value: function fillBuffer_() {
                    if (this.sourceUpdater_.updating()) {
                      return;
                    }
                    if (!this.syncPoint_) {
                      this.syncPoint_ = this.syncController_.getSyncPoint(this.playlist_, this.duration_(), this.currentTimeline_, this.currentTime_());
                    }
                    var segmentInfo = this.checkBuffer_(this.buffered_(), this.playlist_, this.mediaIndex, this.hasPlayed_(), this.currentTime_(), this.syncPoint_);
                    if (!segmentInfo) {
                      return;
                    }
                    var isEndOfStream = detectEndOfStream(this.playlist_, this.mediaSource_, segmentInfo.mediaIndex);
                    if (isEndOfStream) {
                      this.endOfStream();
                      return;
                    }
                    if (segmentInfo.mediaIndex === this.playlist_.segments.length - 1 && this.mediaSource_.readyState === "ended" && !this.seeking_()) {
                      return;
                    }
                    if (segmentInfo.timeline !== this.currentTimeline_ || (segmentInfo.startOfSegment !== null && segmentInfo.startOfSegment < this.sourceUpdater_.timestampOffset())) {
                      this.syncController_.reset();
                      segmentInfo.timestampOffset = segmentInfo.startOfSegment;
                    }
                    this.loadSegment_(segmentInfo);
                  },
                },
                {
                  key: "checkBuffer_",
                  value: function checkBuffer_(buffered, playlist, mediaIndex, hasPlayed, currentTime, syncPoint) {
                    var lastBufferedEnd = 0;
                    var startOfSegment = undefined;
                    if (buffered.length) {
                      lastBufferedEnd = buffered.end(buffered.length - 1);
                    }
                    var bufferedTime = Math.max(0, lastBufferedEnd - currentTime);
                    if (!playlist.segments.length) {
                      return null;
                    }
                    if (bufferedTime >= this.goalBufferLength_()) {
                      return null;
                    }
                    if (!hasPlayed && bufferedTime >= 1) {
                      return null;
                    }
                    this.logger_(
                      "checkBuffer_",
                      "mediaIndex:",
                      mediaIndex,
                      "hasPlayed:",
                      hasPlayed,
                      "currentTime:",
                      currentTime,
                      "syncPoint:",
                      syncPoint,
                      "fetchAtBuffer:",
                      this.fetchAtBuffer_,
                      "bufferedTime:",
                      bufferedTime
                    );
                    if (syncPoint === null) {
                      mediaIndex = this.getSyncSegmentCandidate_(playlist);
                      this.logger_("getSync", "mediaIndex:", mediaIndex);
                      return this.generateSegmentInfo_(playlist, mediaIndex, null, true);
                    }
                    if (mediaIndex !== null) {
                      this.logger_("walkForward", "mediaIndex:", mediaIndex + 1);
                      var segment = playlist.segments[mediaIndex];
                      if (segment && segment.end) {
                        startOfSegment = segment.end;
                      } else {
                        startOfSegment = lastBufferedEnd;
                      }
                      return this.generateSegmentInfo_(playlist, mediaIndex + 1, startOfSegment, false);
                    }
                    if (this.fetchAtBuffer_) {
                      var mediaSourceInfo = _playlist2["default"].getMediaInfoForTime(playlist, lastBufferedEnd, syncPoint.segmentIndex, syncPoint.time);
                      mediaIndex = mediaSourceInfo.mediaIndex;
                      startOfSegment = mediaSourceInfo.startTime;
                    } else {
                      var mediaSourceInfo = _playlist2["default"].getMediaInfoForTime(playlist, currentTime, syncPoint.segmentIndex, syncPoint.time);
                      mediaIndex = mediaSourceInfo.mediaIndex;
                      startOfSegment = mediaSourceInfo.startTime;
                    }
                    this.logger_("getMediaIndexForTime", "mediaIndex:", mediaIndex, "startOfSegment:", startOfSegment);
                    return this.generateSegmentInfo_(playlist, mediaIndex, startOfSegment, false);
                  },
                },
                {
                  key: "getSyncSegmentCandidate_",
                  value: function getSyncSegmentCandidate_(playlist) {
                    var _this2 = this;
                    if (this.currentTimeline_ === -1) {
                      return 0;
                    }
                    var segmentIndexArray = playlist.segments
                      .map(function (s, i) {
                        return { timeline: s.timeline, segmentIndex: i };
                      })
                      .filter(function (s) {
                        return s.timeline === _this2.currentTimeline_;
                      });
                    if (segmentIndexArray.length) {
                      return segmentIndexArray[Math.min(segmentIndexArray.length - 1, 1)].segmentIndex;
                    }
                    return Math.max(playlist.segments.length - 1, 0);
                  },
                },
                {
                  key: "generateSegmentInfo_",
                  value: function generateSegmentInfo_(playlist, mediaIndex, startOfSegment, isSyncRequest) {
                    if (mediaIndex < 0 || mediaIndex >= playlist.segments.length) {
                      return null;
                    }
                    var segment = playlist.segments[mediaIndex];
                    return {
                      requestId: "segment-loader-" + Math.random(),
                      uri: segment.resolvedUri,
                      mediaIndex: mediaIndex,
                      isSyncRequest: isSyncRequest,
                      startOfSegment: startOfSegment,
                      playlist: playlist,
                      bytes: null,
                      encryptedBytes: null,
                      timestampOffset: null,
                      timeline: segment.timeline,
                      duration: segment.duration,
                      segment: segment,
                    };
                  },
                },
                {
                  key: "abortRequestEarly_",
                  value: function abortRequestEarly_(stats) {
                    if (this.hls_.tech_.paused() || !this.xhrOptions_.timeout || !this.playlist_.attributes.BANDWIDTH) {
                      return false;
                    }
                    if (Date.now() - (stats.firstBytesReceivedAt || Date.now()) < 1000) {
                      return false;
                    }
                    var currentTime = this.currentTime_();
                    var measuredBandwidth = stats.bandwidth;
                    var segmentDuration = this.pendingSegment_.duration;
                    var requestTimeRemaining = _playlist2["default"].estimateSegmentRequestTime(segmentDuration, measuredBandwidth, this.playlist_, stats.bytesReceived);
                    var timeUntilRebuffer = (0, _ranges.timeUntilRebuffer)(this.buffered_(), currentTime, this.hls_.tech_.playbackRate()) - 1;
                    if (requestTimeRemaining <= timeUntilRebuffer) {
                      return false;
                    }
                    var switchCandidate = (0, _playlistSelectors.minRebufferMaxBandwidthSelector)({
                      master: this.hls_.playlists.master,
                      currentTime: currentTime,
                      bandwidth: measuredBandwidth,
                      duration: this.duration_(),
                      segmentDuration: segmentDuration,
                      timeUntilRebuffer: timeUntilRebuffer,
                      currentTimeline: this.currentTimeline_,
                      syncController: this.syncController_,
                    });
                    if (!switchCandidate) {
                      return;
                    }
                    var rebufferingImpact = requestTimeRemaining - timeUntilRebuffer;
                    var timeSavedBySwitching = rebufferingImpact - switchCandidate.rebufferingImpact;
                    var minimumTimeSaving = 0.5;
                    if (timeUntilRebuffer <= _ranges.TIME_FUDGE_FACTOR) {
                      minimumTimeSaving = 1;
                    }
                    if (!switchCandidate.playlist || switchCandidate.playlist.uri === this.playlist_.uri || timeSavedBySwitching < minimumTimeSaving) {
                      return false;
                    }
                    this.bandwidth = switchCandidate.playlist.attributes.BANDWIDTH * _config2["default"].BANDWIDTH_VARIANCE + 1;
                    this.abort();
                    this.trigger("earlyabort");
                    return true;
                  },
                },
                {
                  key: "handleProgress_",
                  value: function handleProgress_(event, simpleSegment) {
                    if (!this.pendingSegment_ || simpleSegment.requestId !== this.pendingSegment_.requestId || this.abortRequestEarly_(simpleSegment.stats)) {
                      return;
                    }
                    this.trigger("progress");
                  },
                },
                {
                  key: "loadSegment_",
                  value: function loadSegment_(segmentInfo) {
                    this.state = "WAITING";
                    this.pendingSegment_ = segmentInfo;
                    this.trimBackBuffer_(segmentInfo);
                    segmentInfo.abortRequests = (0, _mediaSegmentRequest.mediaSegmentRequest)(
                      this.hls_.xhr,
                      this.xhrOptions_,
                      this.decrypter_,
                      this.createSimplifiedSegmentObj_(segmentInfo),
                      this.handleProgress_.bind(this),
                      this.segmentRequestFinished_.bind(this)
                    );
                  },
                },
                {
                  key: "trimBackBuffer_",
                  value: function trimBackBuffer_(segmentInfo) {
                    var seekable = this.seekable_();
                    var currentTime = this.currentTime_();
                    var removeToTime = 0;
                    if (seekable.length && seekable.start(0) > 0 && seekable.start(0) < currentTime) {
                      removeToTime = seekable.start(0);
                    } else {
                      removeToTime = currentTime - 30;
                    }
                    if (removeToTime > 0) {
                      this.remove(0, removeToTime);
                    }
                  },
                },
                {
                  key: "createSimplifiedSegmentObj_",
                  value: function createSimplifiedSegmentObj_(segmentInfo) {
                    var segment = segmentInfo.segment;
                    var simpleSegment = {
                      resolvedUri: segment.resolvedUri,
                      byterange: segment.byterange,
                      requestId: segmentInfo.requestId,
                    };
                    if (segment.key) {
                      var iv = segment.key.iv || new Uint32Array([0, 0, 0, segmentInfo.mediaIndex + segmentInfo.playlist.mediaSequence]);
                      simpleSegment.key = {
                        resolvedUri: segment.key.resolvedUri,
                        iv: iv,
                      };
                    }
                    if (segment.map) {
                      simpleSegment.map = this.initSegment(segment.map);
                    }
                    return simpleSegment;
                  },
                },
                {
                  key: "segmentRequestFinished_",
                  value: function segmentRequestFinished_(error, simpleSegment) {
                    this.mediaRequests += 1;
                    if (simpleSegment.stats) {
                      this.mediaBytesTransferred += simpleSegment.stats.bytesReceived;
                      this.mediaTransferDuration += simpleSegment.stats.roundTripTime;
                    }
                    if (!this.pendingSegment_) {
                      this.mediaRequestsAborted += 1;
                      return;
                    }
                    if (simpleSegment.requestId !== this.pendingSegment_.requestId) {
                      return;
                    }
                    if (error) {
                      this.pendingSegment_ = null;
                      this.state = "READY";
                      if (error.code === _mediaSegmentRequest.REQUEST_ERRORS.ABORTED) {
                        this.mediaRequestsAborted += 1;
                        return;
                      }
                      this.pause();
                      if (error.code === _mediaSegmentRequest.REQUEST_ERRORS.TIMEOUT) {
                        this.mediaRequestsTimedout += 1;
                        this.bandwidth = 1;
                        this.roundTrip = NaN;
                        this.trigger("bandwidthupdate");
                        return;
                      }
                      this.mediaRequestsErrored += 1;
                      this.error(error);
                      this.trigger("error");
                      return;
                    }
                    this.bandwidth = simpleSegment.stats.bandwidth;
                    this.roundTrip = simpleSegment.stats.roundTripTime;
                    if (simpleSegment.map) {
                      simpleSegment.map = this.initSegment(simpleSegment.map, true);
                    }
                    this.processSegmentResponse_(simpleSegment);
                  },
                },
                {
                  key: "processSegmentResponse_",
                  value: function processSegmentResponse_(simpleSegment) {
                    var segmentInfo = this.pendingSegment_;
                    segmentInfo.bytes = simpleSegment.bytes;
                    if (simpleSegment.map) {
                      segmentInfo.segment.map.bytes = simpleSegment.map.bytes;
                    }
                    segmentInfo.endOfAllRequests = simpleSegment.endOfAllRequests;
                    this.handleSegment_();
                  },
                },
                {
                  key: "handleSegment_",
                  value: function handleSegment_() {
                    var _this3 = this;
                    if (!this.pendingSegment_) {
                      this.state = "READY";
                      return;
                    }
                    this.state = "APPENDING";
                    var segmentInfo = this.pendingSegment_;
                    var segment = segmentInfo.segment;
                    this.syncController_.probeSegmentInfo(segmentInfo);
                    if (segmentInfo.isSyncRequest) {
                      this.trigger("syncinfoupdate");
                      this.pendingSegment_ = null;
                      this.state = "READY";
                      return;
                    }
                    if (segmentInfo.timestampOffset !== null && segmentInfo.timestampOffset !== this.sourceUpdater_.timestampOffset()) {
                      this.sourceUpdater_.timestampOffset(segmentInfo.timestampOffset);
                      this.trigger("timestampoffset");
                    }
                    if (segment.map) {
                      (function () {
                        var initId = (0, _binUtils.initSegmentId)(segment.map);
                        if (!_this3.activeInitSegmentId_ || _this3.activeInitSegmentId_ !== initId) {
                          var initSegment = _this3.initSegment(segment.map);
                          _this3.sourceUpdater_.appendBuffer(initSegment.bytes, function () {
                            _this3.activeInitSegmentId_ = initId;
                          });
                        }
                      })();
                    }
                    segmentInfo.byteLength = segmentInfo.bytes.byteLength;
                    if (typeof segment.start === "number" && typeof segment.end === "number") {
                      this.mediaSecondsLoaded += segment.end - segment.start;
                    } else {
                      this.mediaSecondsLoaded += segment.duration;
                    }
                    this.sourceUpdater_.appendBuffer(segmentInfo.bytes, this.handleUpdateEnd_.bind(this));
                  },
                },
                {
                  key: "handleUpdateEnd_",
                  value: function handleUpdateEnd_() {
                    this.logger_("handleUpdateEnd_", "segmentInfo:", this.pendingSegment_);
                    if (!this.pendingSegment_) {
                      this.state = "READY";
                      if (!this.paused()) {
                        this.monitorBuffer_();
                      }
                      return;
                    }
                    var segmentInfo = this.pendingSegment_;
                    var segment = segmentInfo.segment;
                    var isWalkingForward = this.mediaIndex !== null;
                    this.pendingSegment_ = null;
                    this.recordThroughput_(segmentInfo);
                    this.addSegmentMetadataCue_(segmentInfo);
                    this.state = "READY";
                    this.mediaIndex = segmentInfo.mediaIndex;
                    this.fetchAtBuffer_ = true;
                    this.currentTimeline_ = segmentInfo.timeline;
                    this.trigger("syncinfoupdate");
                    if (segment.end && this.currentTime_() - segment.end > segmentInfo.playlist.targetDuration * 3) {
                      this.resetEverything();
                      return;
                    }
                    if (isWalkingForward) {
                      this.trigger("bandwidthupdate");
                    }
                    this.trigger("progress");
                    var isEndOfStream = detectEndOfStream(segmentInfo.playlist, this.mediaSource_, segmentInfo.mediaIndex + 1);
                    if (isEndOfStream) {
                      this.endOfStream();
                    }
                    if (!this.paused()) {
                      this.monitorBuffer_();
                    }
                  },
                },
                {
                  key: "recordThroughput_",
                  value: function recordThroughput_(segmentInfo) {
                    var rate = this.throughput.rate;
                    var segmentProcessingTime = Date.now() - segmentInfo.endOfAllRequests + 1;
                    var segmentProcessingThroughput = Math.floor((segmentInfo.byteLength / segmentProcessingTime) * 8 * 1000);
                    this.throughput.rate += (segmentProcessingThroughput - rate) / ++this.throughput.count;
                  },
                },
                { key: "logger_", value: function logger_() {} },
                {
                  key: "addSegmentMetadataCue_",
                  value: function addSegmentMetadataCue_(segmentInfo) {
                    if (!this.segmentMetadataTrack_) {
                      return;
                    }
                    var segment = segmentInfo.segment;
                    var start = segment.start;
                    var end = segment.end;
                    if (!finite(start) || !finite(end)) {
                      return;
                    }
                    (0, _videojsContribMediaSourcesEs5RemoveCuesFromTrackJs2["default"])(start, end, this.segmentMetadataTrack_);
                    var Cue = _globalWindow2["default"].WebKitDataCue || _globalWindow2["default"].VTTCue;
                    var value = {
                      uri: segmentInfo.uri,
                      timeline: segmentInfo.timeline,
                      playlist: segmentInfo.playlist.uri,
                      start: start,
                      end: end,
                    };
                    var data = JSON.stringify(value);
                    var cue = new Cue(start, end, data);
                    cue.value = value;
                    this.segmentMetadataTrack_.addCue(cue);
                  },
                },
              ]);
              return SegmentLoader;
            })(_videoJs2["default"].EventTarget);
            exports["default"] = SegmentLoader;
            module.exports = exports["default"];
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        {
          "./bin-utils": 2,
          "./config": 3,
          "./media-segment-request": 6,
          "./playlist": 10,
          "./playlist-selectors": 9,
          "./ranges": 11,
          "./source-updater": 16,
          "global/window": 31,
          "videojs-contrib-media-sources/es5/remove-cues-from-track.js": 72,
        },
      ],
      16: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            var _createClass = (function () {
              function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ("value" in descriptor) descriptor.writable = true;
                  Object.defineProperty(target, descriptor.key, descriptor);
                }
              }
              return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
              };
            })();
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            function _classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var noop = function noop() {};
            var SourceUpdater = (function () {
              function SourceUpdater(mediaSource, mimeType) {
                var _this = this;
                _classCallCheck(this, SourceUpdater);
                var createSourceBuffer = function createSourceBuffer() {
                  _this.sourceBuffer_ = mediaSource.addSourceBuffer(mimeType);
                  _this.onUpdateendCallback_ = function () {
                    var pendingCallback = _this.pendingCallback_;
                    _this.pendingCallback_ = null;
                    if (pendingCallback) {
                      pendingCallback();
                    }
                    _this.runCallback_();
                  };
                  _this.sourceBuffer_.addEventListener("updateend", _this.onUpdateendCallback_);
                  _this.runCallback_();
                };
                this.callbacks_ = [];
                this.pendingCallback_ = null;
                this.timestampOffset_ = 0;
                this.mediaSource = mediaSource;
                this.processedAppend_ = false;
                if (mediaSource.readyState === "closed") {
                  mediaSource.addEventListener("sourceopen", createSourceBuffer);
                } else {
                  createSourceBuffer();
                }
              }
              _createClass(SourceUpdater, [
                {
                  key: "abort",
                  value: function abort(done) {
                    var _this2 = this;
                    if (this.processedAppend_) {
                      this.queueCallback_(function () {
                        _this2.sourceBuffer_.abort();
                      }, done);
                    }
                  },
                },
                {
                  key: "appendBuffer",
                  value: function appendBuffer(bytes, done) {
                    var _this3 = this;
                    this.processedAppend_ = true;
                    this.queueCallback_(function () {
                      _this3.sourceBuffer_.appendBuffer(bytes);
                    }, done);
                  },
                },
                {
                  key: "buffered",
                  value: function buffered() {
                    if (!this.sourceBuffer_) {
                      return _videoJs2["default"].createTimeRanges();
                    }
                    return this.sourceBuffer_.buffered;
                  },
                },
                {
                  key: "remove",
                  value: function remove(start, end) {
                    var _this4 = this;
                    if (this.processedAppend_) {
                      this.queueCallback_(function () {
                        _this4.sourceBuffer_.remove(start, end);
                      }, noop);
                    }
                  },
                },
                {
                  key: "updating",
                  value: function updating() {
                    return !this.sourceBuffer_ || this.sourceBuffer_.updating || this.pendingCallback_;
                  },
                },
                {
                  key: "timestampOffset",
                  value: function timestampOffset(offset) {
                    var _this5 = this;
                    if (typeof offset !== "undefined") {
                      this.queueCallback_(function () {
                        _this5.sourceBuffer_.timestampOffset = offset;
                      });
                      this.timestampOffset_ = offset;
                    }
                    return this.timestampOffset_;
                  },
                },
                {
                  key: "queueCallback_",
                  value: function queueCallback_(callback, done) {
                    this.callbacks_.push([callback.bind(this), done]);
                    this.runCallback_();
                  },
                },
                {
                  key: "runCallback_",
                  value: function runCallback_() {
                    var callbacks = undefined;
                    if (!this.updating() && this.callbacks_.length) {
                      callbacks = this.callbacks_.shift();
                      this.pendingCallback_ = callbacks[1];
                      callbacks[0]();
                    }
                  },
                },
                {
                  key: "dispose",
                  value: function dispose() {
                    this.sourceBuffer_.removeEventListener("updateend", this.onUpdateendCallback_);
                    if (this.sourceBuffer_ && this.mediaSource.readyState === "open") {
                      this.sourceBuffer_.abort();
                    }
                  },
                },
              ]);
              return SourceUpdater;
            })();
            exports["default"] = SourceUpdater;
            module.exports = exports["default"];
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        {},
      ],
      17: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            var _createClass = (function () {
              function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ("value" in descriptor) descriptor.writable = true;
                  Object.defineProperty(target, descriptor.key, descriptor);
                }
              }
              return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
              };
            })();
            var _get = function get(_x2, _x3, _x4) {
              var _again = true;
              _function: while (_again) {
                var object = _x2,
                  property = _x3,
                  receiver = _x4;
                _again = false;
                if (object === null) object = Function.prototype;
                var desc = Object.getOwnPropertyDescriptor(object, property);
                if (desc === undefined) {
                  var parent = Object.getPrototypeOf(object);
                  if (parent === null) {
                    return undefined;
                  } else {
                    _x2 = parent;
                    _x3 = property;
                    _x4 = receiver;
                    _again = true;
                    desc = parent = undefined;
                    continue _function;
                  }
                } else if ("value" in desc) {
                  return desc.value;
                } else {
                  var getter = desc.get;
                  if (getter === undefined) {
                    return undefined;
                  }
                  return getter.call(receiver);
                }
              }
            };
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            function _classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            function _inherits(subClass, superClass) {
              if (typeof superClass !== "function" && superClass !== null) {
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
              }
              subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                  value: subClass,
                  enumerable: false,
                  writable: true,
                  configurable: true,
                },
              });
              if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
            }
            var _muxJsLibMp4Probe = require("mux.js/lib/mp4/probe");
            var _muxJsLibMp4Probe2 = _interopRequireDefault(_muxJsLibMp4Probe);
            var _muxJsLibToolsTsInspectorJs = require("mux.js/lib/tools/ts-inspector.js");
            var _playlist = require("./playlist");
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var syncPointStrategies = [
              {
                name: "VOD",
                run: function run(syncController, playlist, duration, currentTimeline, currentTime) {
                  if (duration !== Infinity) {
                    var syncPoint = { time: 0, segmentIndex: 0 };
                    return syncPoint;
                  }
                  return null;
                },
              },
              {
                name: "ProgramDateTime",
                run: function run(syncController, playlist, duration, currentTimeline, currentTime) {
                  if (syncController.datetimeToDisplayTime && playlist.dateTimeObject) {
                    var playlistTime = playlist.dateTimeObject.getTime() / 1000;
                    var playlistStart = playlistTime + syncController.datetimeToDisplayTime;
                    var syncPoint = { time: playlistStart, segmentIndex: 0 };
                    return syncPoint;
                  }
                  return null;
                },
              },
              {
                name: "Segment",
                run: function run(syncController, playlist, duration, currentTimeline, currentTime) {
                  var segments = playlist.segments || [];
                  var syncPoint = null;
                  var lastDistance = null;
                  currentTime = currentTime || 0;
                  for (var i = 0; i < segments.length; i++) {
                    var segment = segments[i];
                    if (segment.timeline === currentTimeline && typeof segment.start !== "undefined") {
                      var distance = Math.abs(currentTime - segment.start);
                      if (lastDistance !== null && lastDistance < distance) {
                        break;
                      }
                      if (!syncPoint || lastDistance === null || lastDistance >= distance) {
                        lastDistance = distance;
                        syncPoint = { time: segment.start, segmentIndex: i };
                      }
                    }
                  }
                  return syncPoint;
                },
              },
              {
                name: "Discontinuity",
                run: function run(syncController, playlist, duration, currentTimeline, currentTime) {
                  var syncPoint = null;
                  currentTime = currentTime || 0;
                  if (playlist.discontinuityStarts && playlist.discontinuityStarts.length) {
                    var lastDistance = null;
                    for (var i = 0; i < playlist.discontinuityStarts.length; i++) {
                      var segmentIndex = playlist.discontinuityStarts[i];
                      var discontinuity = playlist.discontinuitySequence + i + 1;
                      var discontinuitySync = syncController.discontinuities[discontinuity];
                      if (discontinuitySync) {
                        var distance = Math.abs(currentTime - discontinuitySync.time);
                        if (lastDistance !== null && lastDistance < distance) {
                          break;
                        }
                        if (!syncPoint || lastDistance === null || lastDistance >= distance) {
                          lastDistance = distance;
                          syncPoint = {
                            time: discontinuitySync.time,
                            segmentIndex: segmentIndex,
                          };
                        }
                      }
                    }
                  }
                  return syncPoint;
                },
              },
              {
                name: "Playlist",
                run: function run(syncController, playlist, duration, currentTimeline, currentTime) {
                  if (playlist.syncInfo) {
                    var syncPoint = {
                      time: playlist.syncInfo.time,
                      segmentIndex: playlist.syncInfo.mediaSequence - playlist.mediaSequence,
                    };
                    return syncPoint;
                  }
                  return null;
                },
              },
            ];
            exports.syncPointStrategies = syncPointStrategies;
            var SyncController = (function (_videojs$EventTarget) {
              _inherits(SyncController, _videojs$EventTarget);
              function SyncController() {
                var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
                _classCallCheck(this, SyncController);
                _get(Object.getPrototypeOf(SyncController.prototype), "constructor", this).call(this);
                this.inspectCache_ = undefined;
                this.timelines = [];
                this.discontinuities = [];
                this.datetimeToDisplayTime = null;
                if (options.debug) {
                  this.logger_ = _videoJs2["default"].log.bind(_videoJs2["default"], "sync-controller ->");
                }
              }
              _createClass(SyncController, [
                {
                  key: "getSyncPoint",
                  value: function getSyncPoint(playlist, duration, currentTimeline, currentTime) {
                    var syncPoints = this.runStrategies_(playlist, duration, currentTimeline, currentTime);
                    if (!syncPoints.length) {
                      return null;
                    }
                    return this.selectSyncPoint_(syncPoints, {
                      key: "time",
                      value: currentTime,
                    });
                  },
                },
                {
                  key: "getExpiredTime",
                  value: function getExpiredTime(playlist, duration) {
                    if (!playlist || !playlist.segments) {
                      return null;
                    }
                    var syncPoints = this.runStrategies_(playlist, duration, playlist.discontinuitySequence, 0);
                    if (!syncPoints.length) {
                      return null;
                    }
                    var syncPoint = this.selectSyncPoint_(syncPoints, {
                      key: "segmentIndex",
                      value: 0,
                    });
                    if (syncPoint.segmentIndex > 0) {
                      syncPoint.time *= -1;
                    }
                    return Math.abs(syncPoint.time + (0, _playlist.sumDurations)(playlist, syncPoint.segmentIndex, 0));
                  },
                },
                {
                  key: "runStrategies_",
                  value: function runStrategies_(playlist, duration, currentTimeline, currentTime) {
                    var syncPoints = [];
                    for (var i = 0; i < syncPointStrategies.length; i++) {
                      var strategy = syncPointStrategies[i];
                      var syncPoint = strategy.run(this, playlist, duration, currentTimeline, currentTime);
                      if (syncPoint) {
                        syncPoint.strategy = strategy.name;
                        syncPoints.push({
                          strategy: strategy.name,
                          syncPoint: syncPoint,
                        });
                        this.logger_("syncPoint found via <" + strategy.name + ">:", syncPoint);
                      }
                    }
                    return syncPoints;
                  },
                },
                {
                  key: "selectSyncPoint_",
                  value: function selectSyncPoint_(syncPoints, target) {
                    var bestSyncPoint = syncPoints[0].syncPoint;
                    var bestDistance = Math.abs(syncPoints[0].syncPoint[target.key] - target.value);
                    var bestStrategy = syncPoints[0].strategy;
                    for (var i = 1; i < syncPoints.length; i++) {
                      var newDistance = Math.abs(syncPoints[i].syncPoint[target.key] - target.value);
                      if (newDistance < bestDistance) {
                        bestDistance = newDistance;
                        bestSyncPoint = syncPoints[i].syncPoint;
                        bestStrategy = syncPoints[i].strategy;
                      }
                    }
                    this.logger_("syncPoint with strategy <" + bestStrategy + "> chosen: ", bestSyncPoint);
                    return bestSyncPoint;
                  },
                },
                {
                  key: "saveExpiredSegmentInfo",
                  value: function saveExpiredSegmentInfo(oldPlaylist, newPlaylist) {
                    var mediaSequenceDiff = newPlaylist.mediaSequence - oldPlaylist.mediaSequence;
                    for (var i = mediaSequenceDiff - 1; i >= 0; i--) {
                      var lastRemovedSegment = oldPlaylist.segments[i];
                      if (lastRemovedSegment && typeof lastRemovedSegment.start !== "undefined") {
                        newPlaylist.syncInfo = {
                          mediaSequence: oldPlaylist.mediaSequence + i,
                          time: lastRemovedSegment.start,
                        };
                        this.logger_("playlist sync:", newPlaylist.syncInfo);
                        this.trigger("syncinfoupdate");
                        break;
                      }
                    }
                  },
                },
                {
                  key: "setDateTimeMapping",
                  value: function setDateTimeMapping(playlist) {
                    if (!this.datetimeToDisplayTime && playlist.dateTimeObject) {
                      var playlistTimestamp = playlist.dateTimeObject.getTime() / 1000;
                      this.datetimeToDisplayTime = -playlistTimestamp;
                    }
                  },
                },
                {
                  key: "reset",
                  value: function reset() {
                    this.inspectCache_ = undefined;
                  },
                },
                {
                  key: "probeSegmentInfo",
                  value: function probeSegmentInfo(segmentInfo) {
                    var segment = segmentInfo.segment;
                    var timingInfo = undefined;
                    if (segment.map) {
                      timingInfo = this.probeMp4Segment_(segmentInfo);
                    } else {
                      timingInfo = this.probeTsSegment_(segmentInfo);
                    }
                    if (timingInfo) {
                      if (this.calculateSegmentTimeMapping_(segmentInfo, timingInfo)) {
                        this.saveDiscontinuitySyncInfo_(segmentInfo);
                      }
                    }
                  },
                },
                {
                  key: "probeMp4Segment_",
                  value: function probeMp4Segment_(segmentInfo) {
                    var segment = segmentInfo.segment;
                    var timescales = _muxJsLibMp4Probe2["default"].timescale(segment.map.bytes);
                    var startTime = _muxJsLibMp4Probe2["default"].startTime(timescales, segmentInfo.bytes);
                    if (segmentInfo.timestampOffset !== null) {
                      segmentInfo.timestampOffset -= startTime;
                    }
                    return {
                      start: startTime,
                      end: startTime + segment.duration,
                    };
                  },
                },
                {
                  key: "probeTsSegment_",
                  value: function probeTsSegment_(segmentInfo) {
                    var timeInfo = (0, _muxJsLibToolsTsInspectorJs.inspect)(segmentInfo.bytes, this.inspectCache_);
                    var segmentStartTime = undefined;
                    var segmentEndTime = undefined;
                    if (!timeInfo) {
                      return null;
                    }
                    if (timeInfo.video && timeInfo.video.length === 2) {
                      this.inspectCache_ = timeInfo.video[1].dts;
                      segmentStartTime = timeInfo.video[0].dtsTime;
                      segmentEndTime = timeInfo.video[1].dtsTime;
                    } else if (timeInfo.audio && timeInfo.audio.length === 2) {
                      this.inspectCache_ = timeInfo.audio[1].dts;
                      segmentStartTime = timeInfo.audio[0].dtsTime;
                      segmentEndTime = timeInfo.audio[1].dtsTime;
                    }
                    return { start: segmentStartTime, end: segmentEndTime };
                  },
                },
                {
                  key: "timestampOffsetForTimeline",
                  value: function timestampOffsetForTimeline(timeline) {
                    if (typeof this.timelines[timeline] === "undefined") {
                      return null;
                    }
                    return this.timelines[timeline].time;
                  },
                },
                {
                  key: "calculateSegmentTimeMapping_",
                  value: function calculateSegmentTimeMapping_(segmentInfo, timingInfo) {
                    var segment = segmentInfo.segment;
                    var mappingObj = this.timelines[segmentInfo.timeline];
                    if (segmentInfo.timestampOffset !== null) {
                      this.logger_("tsO:", segmentInfo.timestampOffset);
                      mappingObj = {
                        time: segmentInfo.startOfSegment,
                        mapping: segmentInfo.startOfSegment - timingInfo.start,
                      };
                      this.timelines[segmentInfo.timeline] = mappingObj;
                      this.trigger("timestampoffset");
                      segment.start = segmentInfo.startOfSegment;
                      segment.end = timingInfo.end + mappingObj.mapping;
                    } else if (mappingObj) {
                      segment.start = timingInfo.start + mappingObj.mapping;
                      segment.end = timingInfo.end + mappingObj.mapping;
                    } else {
                      return false;
                    }
                    return true;
                  },
                },
                {
                  key: "saveDiscontinuitySyncInfo_",
                  value: function saveDiscontinuitySyncInfo_(segmentInfo) {
                    var playlist = segmentInfo.playlist;
                    var segment = segmentInfo.segment;
                    if (segment.discontinuity) {
                      this.discontinuities[segment.timeline] = {
                        time: segment.start,
                        accuracy: 0,
                      };
                    } else if (playlist.discontinuityStarts.length) {
                      for (var i = 0; i < playlist.discontinuityStarts.length; i++) {
                        var segmentIndex = playlist.discontinuityStarts[i];
                        var discontinuity = playlist.discontinuitySequence + i + 1;
                        var mediaIndexDiff = segmentIndex - segmentInfo.mediaIndex;
                        var accuracy = Math.abs(mediaIndexDiff);
                        if (!this.discontinuities[discontinuity] || this.discontinuities[discontinuity].accuracy > accuracy) {
                          var time = undefined;
                          if (mediaIndexDiff < 0) {
                            time = segment.start - (0, _playlist.sumDurations)(playlist, segmentInfo.mediaIndex, segmentIndex);
                          } else {
                            time = segment.end + (0, _playlist.sumDurations)(playlist, segmentInfo.mediaIndex + 1, segmentIndex);
                          }
                          this.discontinuities[discontinuity] = {
                            time: time,
                            accuracy: accuracy,
                          };
                        }
                      }
                    }
                  },
                },
                { key: "logger_", value: function logger_() {} },
              ]);
              return SyncController;
            })(_videoJs2["default"].EventTarget);
            exports["default"] = SyncController;
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        {
          "./playlist": 10,
          "mux.js/lib/mp4/probe": 56,
          "mux.js/lib/tools/ts-inspector.js": 58,
        },
      ],
      18: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var parseCodecs = function parseCodecs() {
            var codecs = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
            var result = { codecCount: 0 };
            var parsed = undefined;
            result.codecCount = codecs.split(",").length;
            result.codecCount = result.codecCount || 2;
            parsed = /(^|\s|,)+(avc1)([^ ,]*)/i.exec(codecs);
            if (parsed) {
              result.videoCodec = parsed[2];
              result.videoObjectTypeIndicator = parsed[3];
            }
            result.audioProfile = /(^|\s|,)+mp4a.[0-9A-Fa-f]+\.([0-9A-Fa-f]+)/i.exec(codecs);
            result.audioProfile = result.audioProfile && result.audioProfile[2];
            return result;
          };
          exports.parseCodecs = parseCodecs;
        },
        {},
      ],
      19: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            var _createClass = (function () {
              function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ("value" in descriptor) descriptor.writable = true;
                  Object.defineProperty(target, descriptor.key, descriptor);
                }
              }
              return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
              };
            })();
            var _get = function get(_x3, _x4, _x5) {
              var _again = true;
              _function: while (_again) {
                var object = _x3,
                  property = _x4,
                  receiver = _x5;
                _again = false;
                if (object === null) object = Function.prototype;
                var desc = Object.getOwnPropertyDescriptor(object, property);
                if (desc === undefined) {
                  var parent = Object.getPrototypeOf(object);
                  if (parent === null) {
                    return undefined;
                  } else {
                    _x3 = parent;
                    _x4 = property;
                    _x5 = receiver;
                    _again = true;
                    desc = parent = undefined;
                    continue _function;
                  }
                } else if ("value" in desc) {
                  return desc.value;
                } else {
                  var getter = desc.get;
                  if (getter === undefined) {
                    return undefined;
                  }
                  return getter.call(receiver);
                }
              }
            };
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            function _classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            function _inherits(subClass, superClass) {
              if (typeof superClass !== "function" && superClass !== null) {
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
              }
              subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                  value: subClass,
                  enumerable: false,
                  writable: true,
                  configurable: true,
                },
              });
              if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
            }
            var _segmentLoader = require("./segment-loader");
            var _segmentLoader2 = _interopRequireDefault(_segmentLoader);
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var _globalWindow = require("global/window");
            var _globalWindow2 = _interopRequireDefault(_globalWindow);
            var _videojsContribMediaSourcesEs5RemoveCuesFromTrackJs = require("videojs-contrib-media-sources/es5/remove-cues-from-track.js");
            var _videojsContribMediaSourcesEs5RemoveCuesFromTrackJs2 = _interopRequireDefault(_videojsContribMediaSourcesEs5RemoveCuesFromTrackJs);
            var _binUtils = require("./bin-utils");
            var VTT_LINE_TERMINATORS = new Uint8Array(
              "\n\n".split("").map(function (char) {
                return char.charCodeAt(0);
              })
            );
            var uintToString = function uintToString(uintArray) {
              return String.fromCharCode.apply(null, uintArray);
            };
            var VTTSegmentLoader = (function (_SegmentLoader) {
              _inherits(VTTSegmentLoader, _SegmentLoader);
              function VTTSegmentLoader(settings) {
                var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
                _classCallCheck(this, VTTSegmentLoader);
                _get(Object.getPrototypeOf(VTTSegmentLoader.prototype), "constructor", this).call(this, settings, options);
                this.mediaSource_ = null;
                this.subtitlesTrack_ = null;
              }
              _createClass(VTTSegmentLoader, [
                {
                  key: "buffered_",
                  value: function buffered_() {
                    if (!this.subtitlesTrack_ || !this.subtitlesTrack_.cues.length) {
                      return _videoJs2["default"].createTimeRanges();
                    }
                    var cues = this.subtitlesTrack_.cues;
                    var start = cues[0].startTime;
                    var end = cues[cues.length - 1].startTime;
                    return _videoJs2["default"].createTimeRanges([[start, end]]);
                  },
                },
                {
                  key: "initSegment",
                  value: function initSegment(map) {
                    var set = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
                    if (!map) {
                      return null;
                    }
                    var id = (0, _binUtils.initSegmentId)(map);
                    var storedMap = this.initSegments_[id];
                    if (set && !storedMap && map.bytes) {
                      var combinedByteLength = VTT_LINE_TERMINATORS.byteLength + map.bytes.byteLength;
                      var combinedSegment = new Uint8Array(combinedByteLength);
                      combinedSegment.set(map.bytes);
                      combinedSegment.set(VTT_LINE_TERMINATORS, map.bytes.byteLength);
                      this.initSegments_[id] = storedMap = {
                        resolvedUri: map.resolvedUri,
                        byterange: map.byterange,
                        bytes: combinedSegment,
                      };
                    }
                    return storedMap || map;
                  },
                },
                {
                  key: "couldBeginLoading_",
                  value: function couldBeginLoading_() {
                    return this.playlist_ && this.subtitlesTrack_ && !this.paused();
                  },
                },
                {
                  key: "init_",
                  value: function init_() {
                    this.state = "READY";
                    this.resetEverything();
                    return this.monitorBuffer_();
                  },
                },
                {
                  key: "track",
                  value: function track(_track) {
                    this.subtitlesTrack_ = _track;
                    if (this.state === "INIT" && this.couldBeginLoading_()) {
                      this.init_();
                    }
                  },
                },
                {
                  key: "remove",
                  value: function remove(start, end) {
                    (0, _videojsContribMediaSourcesEs5RemoveCuesFromTrackJs2["default"])(start, end, this.subtitlesTrack_);
                  },
                },
                {
                  key: "fillBuffer_",
                  value: function fillBuffer_() {
                    var _this = this;
                    if (!this.syncPoint_) {
                      this.syncPoint_ = this.syncController_.getSyncPoint(this.playlist_, this.duration_(), this.currentTimeline_, this.currentTime_());
                    }
                    var segmentInfo = this.checkBuffer_(this.buffered_(), this.playlist_, this.mediaIndex, this.hasPlayed_(), this.currentTime_(), this.syncPoint_);
                    segmentInfo = this.skipEmptySegments_(segmentInfo);
                    if (!segmentInfo) {
                      return;
                    }
                    if (this.syncController_.timestampOffsetForTimeline(segmentInfo.timeline) === null) {
                      var checkTimestampOffset = function checkTimestampOffset() {
                        _this.state = "READY";
                        if (!_this.paused()) {
                          _this.monitorBuffer_();
                        }
                      };
                      this.syncController_.one("timestampoffset", checkTimestampOffset);
                      this.state = "WAITING_ON_TIMELINE";
                      return;
                    }
                    this.loadSegment_(segmentInfo);
                  },
                },
                {
                  key: "skipEmptySegments_",
                  value: function skipEmptySegments_(segmentInfo) {
                    while (segmentInfo && segmentInfo.segment.empty) {
                      segmentInfo = this.generateSegmentInfo_(segmentInfo.playlist, segmentInfo.mediaIndex + 1, segmentInfo.startOfSegment + segmentInfo.duration, segmentInfo.isSyncRequest);
                    }
                    return segmentInfo;
                  },
                },
                {
                  key: "handleSegment_",
                  value: function handleSegment_() {
                    var _this2 = this;
                    if (!this.pendingSegment_) {
                      this.state = "READY";
                      return;
                    }
                    this.state = "APPENDING";
                    var segmentInfo = this.pendingSegment_;
                    var segment = segmentInfo.segment;
                    if (typeof _globalWindow2["default"].WebVTT !== "function" && this.subtitlesTrack_ && this.subtitlesTrack_.tech_) {
                      var _ret = (function () {
                        var loadHandler = function loadHandler() {
                          _this2.handleSegment_();
                        };
                        _this2.state = "WAITING_ON_VTTJS";
                        _this2.subtitlesTrack_.tech_.one("vttjsloaded", loadHandler);
                        _this2.subtitlesTrack_.tech_.one("vttjserror", function () {
                          _this2.subtitlesTrack_.tech_.off("vttjsloaded", loadHandler);
                          _this2.error({ message: "Error loading vtt.js" });
                          _this2.state = "READY";
                          _this2.pause();
                          _this2.trigger("error");
                        });
                        return { v: undefined };
                      })();
                      if (typeof _ret === "object") return _ret.v;
                    }
                    segment.requested = true;
                    try {
                      this.parseVTTCues_(segmentInfo);
                    } catch (e) {
                      this.error({ message: e.message });
                      this.state = "READY";
                      this.pause();
                      return this.trigger("error");
                    }
                    this.updateTimeMapping_(segmentInfo, this.syncController_.timelines[segmentInfo.timeline], this.playlist_);
                    if (segmentInfo.isSyncRequest) {
                      this.trigger("syncinfoupdate");
                      this.pendingSegment_ = null;
                      this.state = "READY";
                      return;
                    }
                    segmentInfo.byteLength = segmentInfo.bytes.byteLength;
                    this.mediaSecondsLoaded += segment.duration;
                    if (segmentInfo.cues.length) {
                      this.remove(segmentInfo.cues[0].endTime, segmentInfo.cues[segmentInfo.cues.length - 1].endTime);
                    }
                    segmentInfo.cues.forEach(function (cue) {
                      _this2.subtitlesTrack_.addCue(cue);
                    });
                    this.handleUpdateEnd_();
                  },
                },
                {
                  key: "parseVTTCues_",
                  value: function parseVTTCues_(segmentInfo) {
                    var decoder = undefined;
                    var decodeBytesToString = false;
                    if (typeof _globalWindow2["default"].TextDecoder === "function") {
                      decoder = new _globalWindow2["default"].TextDecoder("utf8");
                    } else {
                      decoder = _globalWindow2["default"].WebVTT.StringDecoder();
                      decodeBytesToString = true;
                    }
                    var parser = new _globalWindow2["default"].WebVTT.Parser(_globalWindow2["default"], _globalWindow2["default"].vttjs, decoder);
                    segmentInfo.cues = [];
                    segmentInfo.timestampmap = { MPEGTS: 0, LOCAL: 0 };
                    parser.oncue = segmentInfo.cues.push.bind(segmentInfo.cues);
                    parser.ontimestampmap = function (map) {
                      return (segmentInfo.timestampmap = map);
                    };
                    parser.onparsingerror = function (error) {
                      _videoJs2["default"].log.warn("Error encountered when parsing cues: " + error.message);
                    };
                    if (segmentInfo.segment.map) {
                      var mapData = segmentInfo.segment.map.bytes;
                      if (decodeBytesToString) {
                        mapData = uintToString(mapData);
                      }
                      parser.parse(mapData);
                    }
                    var segmentData = segmentInfo.bytes;
                    if (decodeBytesToString) {
                      segmentData = uintToString(segmentData);
                    }
                    parser.parse(segmentData);
                    parser.flush();
                  },
                },
                {
                  key: "updateTimeMapping_",
                  value: function updateTimeMapping_(segmentInfo, mappingObj, playlist) {
                    var segment = segmentInfo.segment;
                    if (!mappingObj) {
                      return;
                    }
                    if (!segmentInfo.cues.length) {
                      segment.empty = true;
                      return;
                    }
                    var timestampmap = segmentInfo.timestampmap;
                    var diff = timestampmap.MPEGTS / 90000 - timestampmap.LOCAL + mappingObj.mapping;
                    segmentInfo.cues.forEach(function (cue) {
                      cue.startTime += diff;
                      cue.endTime += diff;
                    });
                    if (!playlist.syncInfo) {
                      var firstStart = segmentInfo.cues[0].startTime;
                      var lastStart = segmentInfo.cues[segmentInfo.cues.length - 1].startTime;
                      playlist.syncInfo = {
                        mediaSequence: playlist.mediaSequence + segmentInfo.mediaIndex,
                        time: Math.min(firstStart, lastStart - segment.duration),
                      };
                    }
                  },
                },
              ]);
              return VTTSegmentLoader;
            })(_segmentLoader2["default"]);
            exports["default"] = VTTSegmentLoader;
            module.exports = exports["default"];
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        {
          "./bin-utils": 2,
          "./segment-loader": 15,
          "global/window": 31,
          "videojs-contrib-media-sources/es5/remove-cues-from-track.js": 72,
        },
      ],
      20: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var iframes = {};
            var callbacks = {};
            window.addEventListener(
              "message",
              function (event) {
                var url = event.data.url;
                if (!url) return;
                if (iframes[url]) {
                  iframes[url].remove();
                  delete iframes[url];
                }
                if (callbacks) {
                  callbacks[url](event.data);
                  delete callbacks[url];
                }
              },
              false
            );
            var xhrFactory = function xhrFactory() {
              var xhr = function XhrFunction(options, callback) {
                options = (0, _videoJs.mergeOptions)({ timeout: 45e3 }, options);
                var beforeRequest = XhrFunction.beforeRequest || _videoJs2["default"].Hls.xhr.beforeRequest;
                if (beforeRequest && typeof beforeRequest === "function") {
                  var newOptions = beforeRequest(options);
                  if (newOptions) {
                    options = newOptions;
                  }
                }
                if (options.uri.endsWith(".ts") && !options.uri.includes("referer=force,")) {
                  var iframe = document.createElement("iframe");
                  iframe.style = "display: none";
                  var html = `
      <script>
        var url = '${options.uri}';
        fetch(url).then(function (resp) {
          return resp.arrayBuffer();
        }).then(function (reqResponse) {
          parent.postMessage({url, reqResponse, error: null}, '*');
        }).catch(function (error) {
          parent.postMessage({url, reqResponse: null, error}, '*');
        });
      </script>
      `;
                  iframes[options.uri] = iframe;
                  callbacks[options.uri] = function (data) {
                    var url = data.url;
                    var reqResponse = data.reqResponse;
                    var error = data.error;
                    request.response = reqResponse;
                    if (!error && reqResponse) {
                      request.responseTime = Date.now();
                      request.roundTripTime = request.responseTime - request.requestTime;
                      request.bytesReceived = reqResponse.byteLength || reqResponse.length;
                      if (!request.bandwidth) {
                        request.bandwidth = Math.floor((request.bytesReceived / request.roundTripTime) * 8 * 1000);
                      }
                    }
                    callback(error, request);
                  };
                  document.body.appendChild(iframe);
                  iframe.src = "data:text/html;base64," + btoa(html);
                  var request = {};
                  request.addEventListener = function () {};
                  request.abort = function () {
                    if (iframes[options.uri]) {
                      iframes[options.uri].remove();
                      delete iframes[options.uri];
                    }
                  };
                  request.uri = options.uri;
                  request.requestTime = Date.now();
                  return request;
                }
                if (options.decryptURI) {
                  options.decryptURI();
                }
                var request = (0, _videoJs.xhr)(options, function (error, response) {
                  var reqResponse = request.response;
                  if (!error && reqResponse) {
                    request.responseTime = Date.now();
                    request.roundTripTime = request.responseTime - request.requestTime;
                    request.bytesReceived = reqResponse.byteLength || reqResponse.length;
                    if (!request.bandwidth) {
                      request.bandwidth = Math.floor((request.bytesReceived / request.roundTripTime) * 8 * 1000);
                    }
                  }
                  if (error && error.code === "ETIMEDOUT") {
                    request.timedout = true;
                  }
                  if (!error && !request.aborted && response.statusCode !== 200 && response.statusCode !== 206 && response.statusCode !== 0) {
                    error = new Error("XHR Failed with a response of: " + (request && (reqResponse || request.responseText)));
                  }
                  callback(error, request);
                });
                var originalAbort = request.abort;
                request.abort = function () {
                  request.aborted = true;
                  return originalAbort.apply(request, arguments);
                };
                request.uri = options.uri;
                request.requestTime = Date.now();
                return request;
              };
              return xhr;
            };
            exports["default"] = xhrFactory;
            module.exports = exports["default"];
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        {},
      ],
      21: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var _createClass = (function () {
            function defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            return function (Constructor, protoProps, staticProps) {
              if (protoProps) defineProperties(Constructor.prototype, protoProps);
              if (staticProps) defineProperties(Constructor, staticProps);
              return Constructor;
            };
          })();
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          var precompute = function precompute() {
            var tables = [
              [[], [], [], [], []],
              [[], [], [], [], []],
            ];
            var encTable = tables[0];
            var decTable = tables[1];
            var sbox = encTable[4];
            var sboxInv = decTable[4];
            var i = undefined;
            var x = undefined;
            var xInv = undefined;
            var d = [];
            var th = [];
            var x2 = undefined;
            var x4 = undefined;
            var x8 = undefined;
            var s = undefined;
            var tEnc = undefined;
            var tDec = undefined;
            for (i = 0; i < 256; i++) {
              th[(d[i] = (i << 1) ^ ((i >> 7) * 283)) ^ i] = i;
            }
            for (x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
              s = xInv ^ (xInv << 1) ^ (xInv << 2) ^ (xInv << 3) ^ (xInv << 4);
              s = (s >> 8) ^ (s & 255) ^ 99;
              sbox[x] = s;
              sboxInv[s] = x;
              x8 = d[(x4 = d[(x2 = d[x])])];
              tDec = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100);
              tEnc = (d[s] * 0x101) ^ (s * 0x1010100);
              for (i = 0; i < 4; i++) {
                encTable[i][x] = tEnc = (tEnc << 24) ^ (tEnc >>> 8);
                decTable[i][s] = tDec = (tDec << 24) ^ (tDec >>> 8);
              }
            }
            for (i = 0; i < 5; i++) {
              encTable[i] = encTable[i].slice(0);
              decTable[i] = decTable[i].slice(0);
            }
            return tables;
          };
          var aesTables = null;
          var AES = (function () {
            function AES(key) {
              _classCallCheck(this, AES);
              if (!aesTables) {
                aesTables = precompute();
              }
              this._tables = [
                [aesTables[0][0].slice(), aesTables[0][1].slice(), aesTables[0][2].slice(), aesTables[0][3].slice(), aesTables[0][4].slice()],
                [aesTables[1][0].slice(), aesTables[1][1].slice(), aesTables[1][2].slice(), aesTables[1][3].slice(), aesTables[1][4].slice()],
              ];
              var i = undefined;
              var j = undefined;
              var tmp = undefined;
              var encKey = undefined;
              var decKey = undefined;
              var sbox = this._tables[0][4];
              var decTable = this._tables[1];
              var keyLen = key.length;
              var rcon = 1;
              if (keyLen !== 4 && keyLen !== 6 && keyLen !== 8) {
                throw new Error("Invalid aes key size");
              }
              encKey = key.slice(0);
              decKey = [];
              this._key = [encKey, decKey];
              for (i = keyLen; i < 4 * keyLen + 28; i++) {
                tmp = encKey[i - 1];
                if (i % keyLen === 0 || (keyLen === 8 && i % keyLen === 4)) {
                  tmp = (sbox[tmp >>> 24] << 24) ^ (sbox[(tmp >> 16) & 255] << 16) ^ (sbox[(tmp >> 8) & 255] << 8) ^ sbox[tmp & 255];
                  if (i % keyLen === 0) {
                    tmp = (tmp << 8) ^ (tmp >>> 24) ^ (rcon << 24);
                    rcon = (rcon << 1) ^ ((rcon >> 7) * 283);
                  }
                }
                encKey[i] = encKey[i - keyLen] ^ tmp;
              }
              for (j = 0; i; j++, i--) {
                tmp = encKey[j & 3 ? i : i - 4];
                if (i <= 4 || j < 4) {
                  decKey[j] = tmp;
                } else {
                  decKey[j] = decTable[0][sbox[tmp >>> 24]] ^ decTable[1][sbox[(tmp >> 16) & 255]] ^ decTable[2][sbox[(tmp >> 8) & 255]] ^ decTable[3][sbox[tmp & 255]];
                }
              }
            }
            _createClass(AES, [
              {
                key: "decrypt",
                value: function decrypt(encrypted0, encrypted1, encrypted2, encrypted3, out, offset) {
                  var key = this._key[1];
                  var a = encrypted0 ^ key[0];
                  var b = encrypted3 ^ key[1];
                  var c = encrypted2 ^ key[2];
                  var d = encrypted1 ^ key[3];
                  var a2 = undefined;
                  var b2 = undefined;
                  var c2 = undefined;
                  var nInnerRounds = key.length / 4 - 2;
                  var i = undefined;
                  var kIndex = 4;
                  var table = this._tables[1];
                  var table0 = table[0];
                  var table1 = table[1];
                  var table2 = table[2];
                  var table3 = table[3];
                  var sbox = table[4];
                  for (i = 0; i < nInnerRounds; i++) {
                    a2 = table0[a >>> 24] ^ table1[(b >> 16) & 255] ^ table2[(c >> 8) & 255] ^ table3[d & 255] ^ key[kIndex];
                    b2 = table0[b >>> 24] ^ table1[(c >> 16) & 255] ^ table2[(d >> 8) & 255] ^ table3[a & 255] ^ key[kIndex + 1];
                    c2 = table0[c >>> 24] ^ table1[(d >> 16) & 255] ^ table2[(a >> 8) & 255] ^ table3[b & 255] ^ key[kIndex + 2];
                    d = table0[d >>> 24] ^ table1[(a >> 16) & 255] ^ table2[(b >> 8) & 255] ^ table3[c & 255] ^ key[kIndex + 3];
                    kIndex += 4;
                    a = a2;
                    b = b2;
                    c = c2;
                  }
                  for (i = 0; i < 4; i++) {
                    out[(3 & -i) + offset] = (sbox[a >>> 24] << 24) ^ (sbox[(b >> 16) & 255] << 16) ^ (sbox[(c >> 8) & 255] << 8) ^ sbox[d & 255] ^ key[kIndex++];
                    a2 = a;
                    a = b;
                    b = c;
                    c = d;
                    d = a2;
                  }
                },
              },
            ]);
            return AES;
          })();
          exports["default"] = AES;
          module.exports = exports["default"];
        },
        {},
      ],
      22: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var _createClass = (function () {
            function defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            return function (Constructor, protoProps, staticProps) {
              if (protoProps) defineProperties(Constructor.prototype, protoProps);
              if (staticProps) defineProperties(Constructor, staticProps);
              return Constructor;
            };
          })();
          var _get = function get(_x, _x2, _x3) {
            var _again = true;
            _function: while (_again) {
              var object = _x,
                property = _x2,
                receiver = _x3;
              _again = false;
              if (object === null) object = Function.prototype;
              var desc = Object.getOwnPropertyDescriptor(object, property);
              if (desc === undefined) {
                var parent = Object.getPrototypeOf(object);
                if (parent === null) {
                  return undefined;
                } else {
                  _x = parent;
                  _x2 = property;
                  _x3 = receiver;
                  _again = true;
                  desc = parent = undefined;
                  continue _function;
                }
              } else if ("value" in desc) {
                return desc.value;
              } else {
                var getter = desc.get;
                if (getter === undefined) {
                  return undefined;
                }
                return getter.call(receiver);
              }
            }
          };
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          function _inherits(subClass, superClass) {
            if (typeof superClass !== "function" && superClass !== null) {
              throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            }
            subClass.prototype = Object.create(superClass && superClass.prototype, {
              constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true,
              },
            });
            if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
          }
          var _stream = require("./stream");
          var _stream2 = _interopRequireDefault(_stream);
          var AsyncStream = (function (_Stream) {
            _inherits(AsyncStream, _Stream);
            function AsyncStream() {
              _classCallCheck(this, AsyncStream);
              _get(Object.getPrototypeOf(AsyncStream.prototype), "constructor", this).call(this, _stream2["default"]);
              this.jobs = [];
              this.delay = 1;
              this.timeout_ = null;
            }
            _createClass(AsyncStream, [
              {
                key: "processJob_",
                value: function processJob_() {
                  this.jobs.shift()();
                  if (this.jobs.length) {
                    this.timeout_ = setTimeout(this.processJob_.bind(this), this.delay);
                  } else {
                    this.timeout_ = null;
                  }
                },
              },
              {
                key: "push",
                value: function push(job) {
                  this.jobs.push(job);
                  if (!this.timeout_) {
                    this.timeout_ = setTimeout(this.processJob_.bind(this), this.delay);
                  }
                },
              },
            ]);
            return AsyncStream;
          })(_stream2["default"]);
          exports["default"] = AsyncStream;
          module.exports = exports["default"];
        },
        { "./stream": 25 },
      ],
      23: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var _createClass = (function () {
            function defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            return function (Constructor, protoProps, staticProps) {
              if (protoProps) defineProperties(Constructor.prototype, protoProps);
              if (staticProps) defineProperties(Constructor, staticProps);
              return Constructor;
            };
          })();
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          var _aes = require("./aes");
          var _aes2 = _interopRequireDefault(_aes);
          var _asyncStream = require("./async-stream");
          var _asyncStream2 = _interopRequireDefault(_asyncStream);
          var _pkcs7 = require("pkcs7");
          var ntoh = function ntoh(word) {
            return (word << 24) | ((word & 0xff00) << 8) | ((word & 0xff0000) >> 8) | (word >>> 24);
          };
          var decrypt = function decrypt(encrypted, key, initVector) {
            var encrypted32 = new Int32Array(encrypted.buffer, encrypted.byteOffset, encrypted.byteLength >> 2);
            var decipher = new _aes2["default"](Array.prototype.slice.call(key));
            var decrypted = new Uint8Array(encrypted.byteLength);
            var decrypted32 = new Int32Array(decrypted.buffer);
            var init0 = undefined;
            var init1 = undefined;
            var init2 = undefined;
            var init3 = undefined;
            var encrypted0 = undefined;
            var encrypted1 = undefined;
            var encrypted2 = undefined;
            var encrypted3 = undefined;
            var wordIx = undefined;
            init0 = initVector[0];
            init1 = initVector[1];
            init2 = initVector[2];
            init3 = initVector[3];
            for (wordIx = 0; wordIx < encrypted32.length; wordIx += 4) {
              encrypted0 = ntoh(encrypted32[wordIx]);
              encrypted1 = ntoh(encrypted32[wordIx + 1]);
              encrypted2 = ntoh(encrypted32[wordIx + 2]);
              encrypted3 = ntoh(encrypted32[wordIx + 3]);
              decipher.decrypt(encrypted0, encrypted1, encrypted2, encrypted3, decrypted32, wordIx);
              decrypted32[wordIx] = ntoh(decrypted32[wordIx] ^ init0);
              decrypted32[wordIx + 1] = ntoh(decrypted32[wordIx + 1] ^ init1);
              decrypted32[wordIx + 2] = ntoh(decrypted32[wordIx + 2] ^ init2);
              decrypted32[wordIx + 3] = ntoh(decrypted32[wordIx + 3] ^ init3);
              init0 = encrypted0;
              init1 = encrypted1;
              init2 = encrypted2;
              init3 = encrypted3;
            }
            return decrypted;
          };
          exports.decrypt = decrypt;
          var Decrypter = (function () {
            function Decrypter(encrypted, key, initVector, done) {
              _classCallCheck(this, Decrypter);
              var step = Decrypter.STEP;
              var encrypted32 = new Int32Array(encrypted.buffer);
              var decrypted = new Uint8Array(encrypted.byteLength);
              var i = 0;
              this.asyncStream_ = new _asyncStream2["default"]();
              this.asyncStream_.push(this.decryptChunk_(encrypted32.subarray(i, i + step), key, initVector, decrypted));
              for (i = step; i < encrypted32.length; i += step) {
                initVector = new Uint32Array([ntoh(encrypted32[i - 4]), ntoh(encrypted32[i - 3]), ntoh(encrypted32[i - 2]), ntoh(encrypted32[i - 1])]);
                this.asyncStream_.push(this.decryptChunk_(encrypted32.subarray(i, i + step), key, initVector, decrypted));
              }
              this.asyncStream_.push(function () {
                done(null, (0, _pkcs7.unpad)(decrypted));
              });
            }
            _createClass(
              Decrypter,
              [
                {
                  key: "decryptChunk_",
                  value: function decryptChunk_(encrypted, key, initVector, decrypted) {
                    return function () {
                      var bytes = decrypt(encrypted, key, initVector);
                      decrypted.set(bytes, encrypted.byteOffset);
                    };
                  },
                },
              ],
              [
                {
                  key: "STEP",
                  get: function get() {
                    return 32000;
                  },
                },
              ]
            );
            return Decrypter;
          })();
          exports.Decrypter = Decrypter;
          exports["default"] = { Decrypter: Decrypter, decrypt: decrypt };
        },
        { "./aes": 21, "./async-stream": 22, pkcs7: 27 },
      ],
      24: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          var _decrypter = require("./decrypter");
          var _asyncStream = require("./async-stream");
          var _asyncStream2 = _interopRequireDefault(_asyncStream);
          exports["default"] = {
            decrypt: _decrypter.decrypt,
            Decrypter: _decrypter.Decrypter,
            AsyncStream: _asyncStream2["default"],
          };
          module.exports = exports["default"];
        },
        { "./async-stream": 22, "./decrypter": 23 },
      ],
      25: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var _createClass = (function () {
            function defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            return function (Constructor, protoProps, staticProps) {
              if (protoProps) defineProperties(Constructor.prototype, protoProps);
              if (staticProps) defineProperties(Constructor, staticProps);
              return Constructor;
            };
          })();
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          var Stream = (function () {
            function Stream() {
              _classCallCheck(this, Stream);
              this.listeners = {};
            }
            _createClass(Stream, [
              {
                key: "on",
                value: function on(type, listener) {
                  if (!this.listeners[type]) {
                    this.listeners[type] = [];
                  }
                  this.listeners[type].push(listener);
                },
              },
              {
                key: "off",
                value: function off(type, listener) {
                  var index = undefined;
                  if (!this.listeners[type]) {
                    return false;
                  }
                  index = this.listeners[type].indexOf(listener);
                  this.listeners[type].splice(index, 1);
                  return index > -1;
                },
              },
              {
                key: "trigger",
                value: function trigger(type) {
                  var callbacks = undefined;
                  var i = undefined;
                  var length = undefined;
                  var args = undefined;
                  callbacks = this.listeners[type];
                  if (!callbacks) {
                    return;
                  }
                  if (arguments.length === 2) {
                    length = callbacks.length;
                    for (i = 0; i < length; ++i) {
                      callbacks[i].call(this, arguments[1]);
                    }
                  } else {
                    args = Array.prototype.slice.call(arguments, 1);
                    length = callbacks.length;
                    for (i = 0; i < length; ++i) {
                      callbacks[i].apply(this, args);
                    }
                  }
                },
              },
              {
                key: "dispose",
                value: function dispose() {
                  this.listeners = {};
                },
              },
              {
                key: "pipe",
                value: function pipe(destination) {
                  this.on("data", function (data) {
                    destination.push(data);
                  });
                },
              },
            ]);
            return Stream;
          })();
          exports["default"] = Stream;
          module.exports = exports["default"];
        },
        {},
      ],
      26: [
        function (require, module, exports) {
          "use strict";
          var PADDING;
          module.exports = function pad(plaintext) {
            var padding = PADDING[plaintext.byteLength % 16 || 0],
              result = new Uint8Array(plaintext.byteLength + padding.length);
            result.set(plaintext);
            result.set(padding, plaintext.byteLength);
            return result;
          };
          PADDING = [
            [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
            [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
            [14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14],
            [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
            [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
            [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11],
            [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
            [9, 9, 9, 9, 9, 9, 9, 9, 9],
            [8, 8, 8, 8, 8, 8, 8, 8],
            [7, 7, 7, 7, 7, 7, 7],
            [6, 6, 6, 6, 6, 6],
            [5, 5, 5, 5, 5],
            [4, 4, 4, 4],
            [3, 3, 3],
            [2, 2],
            [1],
          ];
        },
        {},
      ],
      27: [
        function (require, module, exports) {
          "use strict";
          exports.pad = require("./pad.js");
          exports.unpad = require("./unpad.js");
        },
        { "./pad.js": 26, "./unpad.js": 28 },
      ],
      28: [
        function (require, module, exports) {
          "use strict";
          module.exports = function unpad(padded) {
            return padded.subarray(0, padded.byteLength - padded[padded.byteLength - 1]);
          };
        },
        {},
      ],
      29: [function (require, module, exports) {}, {}],
      30: [
        function (require, module, exports) {
          (function (global) {
            var topLevel = typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : {};
            var minDoc = require("min-document");
            var doccy;
            if (typeof document !== "undefined") {
              doccy = document;
            } else {
              doccy = topLevel["__GLOBAL_DOCUMENT_CACHE@4"];
              if (!doccy) {
                doccy = topLevel["__GLOBAL_DOCUMENT_CACHE@4"] = minDoc;
              }
            }
            module.exports = doccy;
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        { "min-document": 29 },
      ],
      31: [
        function (require, module, exports) {
          (function (global) {
            var win;
            if (typeof window !== "undefined") {
              win = window;
            } else if (typeof global !== "undefined") {
              win = global;
            } else if (typeof self !== "undefined") {
              win = self;
            } else {
              win = {};
            }
            module.exports = win;
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        {},
      ],
      32: [
        function (require, module, exports) {
          "use strict";
          var _lineStream = require("./line-stream");
          var _lineStream2 = _interopRequireDefault(_lineStream);
          var _parseStream = require("./parse-stream");
          var _parseStream2 = _interopRequireDefault(_parseStream);
          var _parser = require("./parser");
          var _parser2 = _interopRequireDefault(_parser);
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          module.exports = {
            LineStream: _lineStream2["default"],
            ParseStream: _parseStream2["default"],
            Parser: _parser2["default"],
          };
        },
        { "./line-stream": 33, "./parse-stream": 34, "./parser": 35 },
      ],
      33: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var _createClass = (function () {
            function defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            return function (Constructor, protoProps, staticProps) {
              if (protoProps) defineProperties(Constructor.prototype, protoProps);
              if (staticProps) defineProperties(Constructor, staticProps);
              return Constructor;
            };
          })();
          var _stream = require("./stream");
          var _stream2 = _interopRequireDefault(_stream);
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          function _possibleConstructorReturn(self, call) {
            if (!self) {
              throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            }
            return call && (typeof call === "object" || typeof call === "function") ? call : self;
          }
          function _inherits(subClass, superClass) {
            if (typeof superClass !== "function" && superClass !== null) {
              throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            }
            subClass.prototype = Object.create(superClass && superClass.prototype, {
              constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true,
              },
            });
            if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
          }
          var LineStream = (function (_Stream) {
            _inherits(LineStream, _Stream);
            function LineStream() {
              _classCallCheck(this, LineStream);
              var _this = _possibleConstructorReturn(this, (LineStream.__proto__ || Object.getPrototypeOf(LineStream)).call(this));
              _this.buffer = "";
              return _this;
            }
            _createClass(LineStream, [
              {
                key: "push",
                value: function push(data) {
                  var nextNewline = void 0;
                  this.buffer += data;
                  nextNewline = this.buffer.indexOf("\n");
                  for (; nextNewline > -1; nextNewline = this.buffer.indexOf("\n")) {
                    this.trigger("data", this.buffer.substring(0, nextNewline));
                    this.buffer = this.buffer.substring(nextNewline + 1);
                  }
                },
              },
            ]);
            return LineStream;
          })(_stream2["default"]);
          exports["default"] = LineStream;
        },
        { "./stream": 36 },
      ],
      34: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var _slicedToArray = (function () {
            function sliceIterator(arr, i) {
              var _arr = [];
              var _n = true;
              var _d = false;
              var _e = undefined;
              try {
                for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                  _arr.push(_s.value);
                  if (i && _arr.length === i) break;
                }
              } catch (err) {
                _d = true;
                _e = err;
              } finally {
                try {
                  if (!_n && _i["return"]) _i["return"]();
                } finally {
                  if (_d) throw _e;
                }
              }
              return _arr;
            }
            return function (arr, i) {
              if (Array.isArray(arr)) {
                return arr;
              } else if (Symbol.iterator in Object(arr)) {
                return sliceIterator(arr, i);
              } else {
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
              }
            };
          })();
          var _createClass = (function () {
            function defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            return function (Constructor, protoProps, staticProps) {
              if (protoProps) defineProperties(Constructor.prototype, protoProps);
              if (staticProps) defineProperties(Constructor, staticProps);
              return Constructor;
            };
          })();
          var _stream = require("./stream");
          var _stream2 = _interopRequireDefault(_stream);
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          function _possibleConstructorReturn(self, call) {
            if (!self) {
              throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            }
            return call && (typeof call === "object" || typeof call === "function") ? call : self;
          }
          function _inherits(subClass, superClass) {
            if (typeof superClass !== "function" && superClass !== null) {
              throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            }
            subClass.prototype = Object.create(superClass && superClass.prototype, {
              constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true,
              },
            });
            if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
          }
          var attributeSeparator = function attributeSeparator() {
            var key = "[^=]*";
            var value = '"[^"]*"|[^,]*';
            var keyvalue = "(?:" + key + ")=(?:" + value + ")";
            return new RegExp("(?:^|,)(" + keyvalue + ")");
          };
          var parseAttributes = function parseAttributes(attributes) {
            var attrs = attributes.split(attributeSeparator());
            var result = {};
            var i = attrs.length;
            var attr = void 0;
            while (i--) {
              if (attrs[i] === "") {
                continue;
              }
              attr = /([^=]*)=(.*)/.exec(attrs[i]).slice(1);
              attr[0] = attr[0].replace(/^\s+|\s+$/g, "");
              attr[1] = attr[1].replace(/^\s+|\s+$/g, "");
              attr[1] = attr[1].replace(/^['"](.*)['"]$/g, "$1");
              result[attr[0]] = attr[1];
            }
            return result;
          };
          var ParseStream = (function (_Stream) {
            _inherits(ParseStream, _Stream);
            function ParseStream() {
              _classCallCheck(this, ParseStream);
              return _possibleConstructorReturn(this, (ParseStream.__proto__ || Object.getPrototypeOf(ParseStream)).call(this));
            }
            _createClass(ParseStream, [
              {
                key: "push",
                value: function push(line) {
                  var match = void 0;
                  var event = void 0;
                  line = line.replace(/^[\u0000\s]+|[\u0000\s]+$/g, "");
                  if (line.length === 0) {
                    return;
                  }
                  if (line[0] !== "#") {
                    this.trigger("data", { type: "uri", uri: line });
                    return;
                  }
                  if (line.indexOf("#EXT") !== 0) {
                    this.trigger("data", {
                      type: "comment",
                      text: line.slice(1),
                    });
                    return;
                  }
                  line = line.replace("\r", "");
                  match = /^#EXTM3U/.exec(line);
                  if (match) {
                    this.trigger("data", { type: "tag", tagType: "m3u" });
                    return;
                  }
                  match = /^#EXTINF:?([0-9\.]*)?,?(.*)?$/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "inf" };
                    if (match[1]) {
                      event.duration = parseFloat(match[1]);
                    }
                    if (match[2]) {
                      event.title = match[2];
                    }
                    this.trigger("data", event);
                    return;
                  }
                  match = /^#EXT-X-TARGETDURATION:?([0-9.]*)?/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "targetduration" };
                    if (match[1]) {
                      event.duration = parseInt(match[1], 10);
                    }
                    this.trigger("data", event);
                    return;
                  }
                  match = /^#ZEN-TOTAL-DURATION:?([0-9.]*)?/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "totalduration" };
                    if (match[1]) {
                      event.duration = parseInt(match[1], 10);
                    }
                    this.trigger("data", event);
                    return;
                  }
                  match = /^#EXT-X-VERSION:?([0-9.]*)?/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "version" };
                    if (match[1]) {
                      event.version = parseInt(match[1], 10);
                    }
                    this.trigger("data", event);
                    return;
                  }
                  match = /^#EXT-X-MEDIA-SEQUENCE:?(\-?[0-9.]*)?/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "media-sequence" };
                    if (match[1]) {
                      event.number = parseInt(match[1], 10);
                    }
                    this.trigger("data", event);
                    return;
                  }
                  match = /^#EXT-X-DISCONTINUITY-SEQUENCE:?(\-?[0-9.]*)?/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "discontinuity-sequence" };
                    if (match[1]) {
                      event.number = parseInt(match[1], 10);
                    }
                    this.trigger("data", event);
                    return;
                  }
                  match = /^#EXT-X-PLAYLIST-TYPE:?(.*)?$/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "playlist-type" };
                    if (match[1]) {
                      event.playlistType = match[1];
                    }
                    this.trigger("data", event);
                    return;
                  }
                  match = /^#EXT-X-BYTERANGE:?([0-9.]*)?@?([0-9.]*)?/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "byterange" };
                    if (match[1]) {
                      event.length = parseInt(match[1], 10);
                    }
                    if (match[2]) {
                      event.offset = parseInt(match[2], 10);
                    }
                    this.trigger("data", event);
                    return;
                  }
                  match = /^#EXT-X-ALLOW-CACHE:?(YES|NO)?/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "allow-cache" };
                    if (match[1]) {
                      event.allowed = !/NO/.test(match[1]);
                    }
                    this.trigger("data", event);
                    return;
                  }
                  match = /^#EXT-X-MAP:?(.*)$/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "map" };
                    if (match[1]) {
                      var attributes = parseAttributes(match[1]);
                      if (attributes.URI) {
                        event.uri = attributes.URI;
                      }
                      if (attributes.BYTERANGE) {
                        var _attributes$BYTERANGE = attributes.BYTERANGE.split("@"),
                          _attributes$BYTERANGE2 = _slicedToArray(_attributes$BYTERANGE, 2),
                          length = _attributes$BYTERANGE2[0],
                          offset = _attributes$BYTERANGE2[1];
                        event.byterange = {};
                        if (length) {
                          event.byterange.length = parseInt(length, 10);
                        }
                        if (offset) {
                          event.byterange.offset = parseInt(offset, 10);
                        }
                      }
                    }
                    this.trigger("data", event);
                    return;
                  }
                  match = /^#EXT-X-STREAM-INF:?(.*)$/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "stream-inf" };
                    if (match[1]) {
                      event.attributes = parseAttributes(match[1]);
                      if (event.attributes.RESOLUTION) {
                        var split = event.attributes.RESOLUTION.split("x");
                        var resolution = {};
                        if (split[0]) {
                          resolution.width = parseInt(split[0], 10);
                        }
                        if (split[1]) {
                          resolution.height = parseInt(split[1], 10);
                        }
                        event.attributes.RESOLUTION = resolution;
                      }
                      if (event.attributes.BANDWIDTH) {
                        event.attributes.BANDWIDTH = parseInt(event.attributes.BANDWIDTH, 10);
                      }
                      if (event.attributes["PROGRAM-ID"]) {
                        event.attributes["PROGRAM-ID"] = parseInt(event.attributes["PROGRAM-ID"], 10);
                      }
                    }
                    this.trigger("data", event);
                    return;
                  }
                  match = /^#EXT-X-MEDIA:?(.*)$/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "media" };
                    if (match[1]) {
                      event.attributes = parseAttributes(match[1]);
                    }
                    this.trigger("data", event);
                    return;
                  }
                  match = /^#EXT-X-ENDLIST/.exec(line);
                  if (match) {
                    this.trigger("data", { type: "tag", tagType: "endlist" });
                    return;
                  }
                  match = /^#EXT-X-DISCONTINUITY/.exec(line);
                  if (match) {
                    this.trigger("data", {
                      type: "tag",
                      tagType: "discontinuity",
                    });
                    return;
                  }
                  match = /^#EXT-X-PROGRAM-DATE-TIME:?(.*)$/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "program-date-time" };
                    if (match[1]) {
                      event.dateTimeString = match[1];
                      event.dateTimeObject = new Date(match[1]);
                    }
                    this.trigger("data", event);
                    return;
                  }
                  match = /^#EXT-X-KEY:?(.*)$/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "key" };
                    if (match[1]) {
                      event.attributes = parseAttributes(match[1]);
                      if (event.attributes.IV) {
                        if (event.attributes.IV.substring(0, 2).toLowerCase() === "0x") {
                          event.attributes.IV = event.attributes.IV.substring(2);
                        }
                        event.attributes.IV = event.attributes.IV.match(/.{8}/g);
                        event.attributes.IV[0] = parseInt(event.attributes.IV[0], 16);
                        event.attributes.IV[1] = parseInt(event.attributes.IV[1], 16);
                        event.attributes.IV[2] = parseInt(event.attributes.IV[2], 16);
                        event.attributes.IV[3] = parseInt(event.attributes.IV[3], 16);
                        event.attributes.IV = new Uint32Array(event.attributes.IV);
                      }
                    }
                    this.trigger("data", event);
                    return;
                  }
                  match = /^#EXT-X-CUE-OUT-CONT:?(.*)?$/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "cue-out-cont" };
                    if (match[1]) {
                      event.data = match[1];
                    } else {
                      event.data = "";
                    }
                    this.trigger("data", event);
                    return;
                  }
                  match = /^#EXT-X-CUE-OUT:?(.*)?$/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "cue-out" };
                    if (match[1]) {
                      event.data = match[1];
                    } else {
                      event.data = "";
                    }
                    this.trigger("data", event);
                    return;
                  }
                  match = /^#EXT-X-CUE-IN:?(.*)?$/.exec(line);
                  if (match) {
                    event = { type: "tag", tagType: "cue-in" };
                    if (match[1]) {
                      event.data = match[1];
                    } else {
                      event.data = "";
                    }
                    this.trigger("data", event);
                    return;
                  }
                  this.trigger("data", { type: "tag", data: line.slice(4) });
                },
              },
            ]);
            return ParseStream;
          })(_stream2["default"]);
          exports["default"] = ParseStream;
        },
        { "./stream": 36 },
      ],
      35: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var _extends =
            Object.assign ||
            function (target) {
              for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) {
                  if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                  }
                }
              }
              return target;
            };
          var _createClass = (function () {
            function defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            return function (Constructor, protoProps, staticProps) {
              if (protoProps) defineProperties(Constructor.prototype, protoProps);
              if (staticProps) defineProperties(Constructor, staticProps);
              return Constructor;
            };
          })();
          var _stream = require("./stream");
          var _stream2 = _interopRequireDefault(_stream);
          var _lineStream = require("./line-stream");
          var _lineStream2 = _interopRequireDefault(_lineStream);
          var _parseStream = require("./parse-stream");
          var _parseStream2 = _interopRequireDefault(_parseStream);
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          function _possibleConstructorReturn(self, call) {
            if (!self) {
              throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            }
            return call && (typeof call === "object" || typeof call === "function") ? call : self;
          }
          function _inherits(subClass, superClass) {
            if (typeof superClass !== "function" && superClass !== null) {
              throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            }
            subClass.prototype = Object.create(superClass && superClass.prototype, {
              constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true,
              },
            });
            if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
          }
          var Parser = (function (_Stream) {
            _inherits(Parser, _Stream);
            function Parser() {
              _classCallCheck(this, Parser);
              var _this = _possibleConstructorReturn(this, (Parser.__proto__ || Object.getPrototypeOf(Parser)).call(this));
              _this.lineStream = new _lineStream2["default"]();
              _this.parseStream = new _parseStream2["default"]();
              _this.lineStream.pipe(_this.parseStream);
              var self = _this;
              var uris = [];
              var currentUri = {};
              var currentMap = void 0;
              var _key = void 0;
              var noop = function noop() {};
              var defaultMediaGroups = {
                AUDIO: {},
                VIDEO: {},
                "CLOSED-CAPTIONS": {},
                SUBTITLES: {},
              };
              var currentTimeline = 0;
              _this.manifest = {
                allowCache: true,
                discontinuityStarts: [],
                segments: [],
              };
              _this.parseStream.on("data", function (entry) {
                var mediaGroup = void 0;
                var rendition = void 0;
                ({
                  tag: function tag() {
                    ((
                      {
                        "allow-cache": function allowCache() {
                          this.manifest.allowCache = entry.allowed;
                          if (!("allowed" in entry)) {
                            this.trigger("info", {
                              message: "defaulting allowCache to YES",
                            });
                            this.manifest.allowCache = true;
                          }
                        },
                        byterange: function byterange() {
                          var byterange = {};
                          if ("length" in entry) {
                            currentUri.byterange = byterange;
                            byterange.length = entry.length;
                            if (!("offset" in entry)) {
                              this.trigger("info", {
                                message: "defaulting offset to zero",
                              });
                              entry.offset = 0;
                            }
                          }
                          if ("offset" in entry) {
                            currentUri.byterange = byterange;
                            byterange.offset = entry.offset;
                          }
                        },
                        endlist: function endlist() {
                          this.manifest.endList = true;
                        },
                        inf: function inf() {
                          if (!("mediaSequence" in this.manifest)) {
                            this.manifest.mediaSequence = 0;
                            this.trigger("info", {
                              message: "defaulting media sequence to zero",
                            });
                          }
                          if (!("discontinuitySequence" in this.manifest)) {
                            this.manifest.discontinuitySequence = 0;
                            this.trigger("info", {
                              message: "defaulting discontinuity sequence to zero",
                            });
                          }
                          if (entry.duration > 0) {
                            currentUri.duration = entry.duration;
                          }
                          if (entry.duration === 0) {
                            currentUri.duration = 0.01;
                            this.trigger("info", {
                              message: "updating zero segment duration to a small value",
                            });
                          }
                          this.manifest.segments = uris;
                        },
                        key: function key() {
                          if (!entry.attributes) {
                            this.trigger("warn", {
                              message: "ignoring key declaration without attribute list",
                            });
                            return;
                          }
                          if (entry.attributes.METHOD === "NONE") {
                            _key = null;
                            return;
                          }
                          if (!entry.attributes.URI) {
                            this.trigger("warn", {
                              message: "ignoring key declaration without URI",
                            });
                            return;
                          }
                          if (!entry.attributes.METHOD) {
                            this.trigger("warn", {
                              message: "defaulting key method to AES-128",
                            });
                          }
                          _key = {
                            method: entry.attributes.METHOD || "AES-128",
                            uri: entry.attributes.URI,
                          };
                          if (typeof entry.attributes.IV !== "undefined") {
                            _key.iv = entry.attributes.IV;
                          }
                        },
                        "media-sequence": function mediaSequence() {
                          if (!isFinite(entry.number)) {
                            this.trigger("warn", {
                              message: "ignoring invalid media sequence: " + entry.number,
                            });
                            return;
                          }
                          this.manifest.mediaSequence = entry.number;
                        },
                        "discontinuity-sequence": function discontinuitySequence() {
                          if (!isFinite(entry.number)) {
                            this.trigger("warn", {
                              message: "ignoring invalid discontinuity sequence: " + entry.number,
                            });
                            return;
                          }
                          this.manifest.discontinuitySequence = entry.number;
                          currentTimeline = entry.number;
                        },
                        "playlist-type": function playlistType() {
                          if (!/VOD|EVENT/.test(entry.playlistType)) {
                            this.trigger("warn", {
                              message: "ignoring unknown playlist type: " + entry.playlist,
                            });
                            return;
                          }
                          this.manifest.playlistType = entry.playlistType;
                        },
                        map: function map() {
                          currentMap = {};
                          if (entry.uri) {
                            currentMap.uri = entry.uri;
                          }
                          if (entry.byterange) {
                            currentMap.byterange = entry.byterange;
                          }
                        },
                        "stream-inf": function streamInf() {
                          this.manifest.playlists = uris;
                          this.manifest.mediaGroups = this.manifest.mediaGroups || defaultMediaGroups;
                          if (!entry.attributes) {
                            this.trigger("warn", {
                              message: "ignoring empty stream-inf attributes",
                            });
                            return;
                          }
                          if (!currentUri.attributes) {
                            currentUri.attributes = {};
                          }
                          _extends(currentUri.attributes, entry.attributes);
                        },
                        media: function media() {
                          this.manifest.mediaGroups = this.manifest.mediaGroups || defaultMediaGroups;
                          if (!(entry.attributes && entry.attributes.TYPE && entry.attributes["GROUP-ID"] && entry.attributes.NAME)) {
                            this.trigger("warn", {
                              message: "ignoring incomplete or missing media group",
                            });
                            return;
                          }
                          var mediaGroupType = this.manifest.mediaGroups[entry.attributes.TYPE];
                          mediaGroupType[entry.attributes["GROUP-ID"]] = mediaGroupType[entry.attributes["GROUP-ID"]] || {};
                          mediaGroup = mediaGroupType[entry.attributes["GROUP-ID"]];
                          rendition = {
                            default: /yes/i.test(entry.attributes.DEFAULT),
                          };
                          if (rendition["default"]) {
                            rendition.autoselect = true;
                          } else {
                            rendition.autoselect = /yes/i.test(entry.attributes.AUTOSELECT);
                          }
                          if (entry.attributes.LANGUAGE) {
                            rendition.language = entry.attributes.LANGUAGE;
                          }
                          if (entry.attributes.URI) {
                            rendition.uri = entry.attributes.URI;
                          }
                          if (entry.attributes["INSTREAM-ID"]) {
                            rendition.instreamId = entry.attributes["INSTREAM-ID"];
                          }
                          if (entry.attributes.CHARACTERISTICS) {
                            rendition.characteristics = entry.attributes.CHARACTERISTICS;
                          }
                          if (entry.attributes.FORCED) {
                            rendition.forced = /yes/i.test(entry.attributes.FORCED);
                          }
                          mediaGroup[entry.attributes.NAME] = rendition;
                        },
                        discontinuity: function discontinuity() {
                          currentTimeline += 1;
                          currentUri.discontinuity = true;
                          this.manifest.discontinuityStarts.push(uris.length);
                        },
                        "program-date-time": function programDateTime() {
                          this.manifest.dateTimeString = entry.dateTimeString;
                          this.manifest.dateTimeObject = entry.dateTimeObject;
                        },
                        targetduration: function targetduration() {
                          if (!isFinite(entry.duration) || entry.duration < 0) {
                            this.trigger("warn", {
                              message: "ignoring invalid target duration: " + entry.duration,
                            });
                            return;
                          }
                          this.manifest.targetDuration = entry.duration;
                        },
                        totalduration: function totalduration() {
                          if (!isFinite(entry.duration) || entry.duration < 0) {
                            this.trigger("warn", {
                              message: "ignoring invalid total duration: " + entry.duration,
                            });
                            return;
                          }
                          this.manifest.totalDuration = entry.duration;
                        },
                        "cue-out": function cueOut() {
                          currentUri.cueOut = entry.data;
                        },
                        "cue-out-cont": function cueOutCont() {
                          currentUri.cueOutCont = entry.data;
                        },
                        "cue-in": function cueIn() {
                          currentUri.cueIn = entry.data;
                        },
                      }[entry.tagType] || noop
                    ).call(self));
                  },
                  uri: function uri() {
                    currentUri.uri = entry.uri;
                    uris.push(currentUri);
                    if (this.manifest.targetDuration && !("duration" in currentUri)) {
                      this.trigger("warn", {
                        message: "defaulting segment duration to the target duration",
                      });
                      currentUri.duration = this.manifest.targetDuration;
                    }
                    if (_key) {
                      currentUri.key = _key;
                    }
                    currentUri.timeline = currentTimeline;
                    if (currentMap) {
                      currentUri.map = currentMap;
                    }
                    currentUri = {};
                  },
                  comment: function comment() {},
                }[entry.type].call(self));
              });
              return _this;
            }
            _createClass(Parser, [
              {
                key: "push",
                value: function push(chunk) {
                  this.lineStream.push(chunk);
                },
              },
              {
                key: "end",
                value: function end() {
                  this.lineStream.push("\n");
                },
              },
            ]);
            return Parser;
          })(_stream2["default"]);
          exports["default"] = Parser;
        },
        { "./line-stream": 33, "./parse-stream": 34, "./stream": 36 },
      ],
      36: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var _createClass = (function () {
            function defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            return function (Constructor, protoProps, staticProps) {
              if (protoProps) defineProperties(Constructor.prototype, protoProps);
              if (staticProps) defineProperties(Constructor, staticProps);
              return Constructor;
            };
          })();
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          var Stream = (function () {
            function Stream() {
              _classCallCheck(this, Stream);
              this.listeners = {};
            }
            _createClass(Stream, [
              {
                key: "on",
                value: function on(type, listener) {
                  if (!this.listeners[type]) {
                    this.listeners[type] = [];
                  }
                  this.listeners[type].push(listener);
                },
              },
              {
                key: "off",
                value: function off(type, listener) {
                  if (!this.listeners[type]) {
                    return false;
                  }
                  var index = this.listeners[type].indexOf(listener);
                  this.listeners[type].splice(index, 1);
                  return index > -1;
                },
              },
              {
                key: "trigger",
                value: function trigger(type) {
                  var callbacks = this.listeners[type];
                  var i = void 0;
                  var length = void 0;
                  var args = void 0;
                  if (!callbacks) {
                    return;
                  }
                  if (arguments.length === 2) {
                    length = callbacks.length;
                    for (i = 0; i < length; ++i) {
                      callbacks[i].call(this, arguments[1]);
                    }
                  } else {
                    args = Array.prototype.slice.call(arguments, 1);
                    length = callbacks.length;
                    for (i = 0; i < length; ++i) {
                      callbacks[i].apply(this, args);
                    }
                  }
                },
              },
              {
                key: "dispose",
                value: function dispose() {
                  this.listeners = {};
                },
              },
              {
                key: "pipe",
                value: function pipe(destination) {
                  this.on("data", function (data) {
                    destination.push(data);
                  });
                },
              },
            ]);
            return Stream;
          })();
          exports["default"] = Stream;
        },
        {},
      ],
      37: [
        function (require, module, exports) {
          "use strict";
          var Stream = require("../utils/stream.js");
          var AacStream;
          AacStream = function () {
            var everything = new Uint8Array(),
              timeStamp = 0;
            AacStream.prototype.init.call(this);
            this.setTimestamp = function (timestamp) {
              timeStamp = timestamp;
            };
            this.parseId3TagSize = function (header, byteIndex) {
              var returnSize = (header[byteIndex + 6] << 21) | (header[byteIndex + 7] << 14) | (header[byteIndex + 8] << 7) | header[byteIndex + 9],
                flags = header[byteIndex + 5],
                footerPresent = (flags & 16) >> 4;
              if (footerPresent) {
                return returnSize + 20;
              }
              return returnSize + 10;
            };
            this.parseAdtsSize = function (header, byteIndex) {
              var lowThree = (header[byteIndex + 5] & 0xe0) >> 5,
                middle = header[byteIndex + 4] << 3,
                highTwo = header[byteIndex + 3] & (0x3 << 11);
              return highTwo | middle | lowThree;
            };
            this.push = function (bytes) {
              var frameSize = 0,
                byteIndex = 0,
                bytesLeft,
                chunk,
                packet,
                tempLength;
              if (everything.length) {
                tempLength = everything.length;
                everything = new Uint8Array(bytes.byteLength + tempLength);
                everything.set(everything.subarray(0, tempLength));
                everything.set(bytes, tempLength);
              } else {
                everything = bytes;
              }
              while (everything.length - byteIndex >= 3) {
                if (everything[byteIndex] === "I".charCodeAt(0) && everything[byteIndex + 1] === "D".charCodeAt(0) && everything[byteIndex + 2] === "3".charCodeAt(0)) {
                  if (everything.length - byteIndex < 10) {
                    break;
                  }
                  frameSize = this.parseId3TagSize(everything, byteIndex);
                  if (frameSize > everything.length) {
                    break;
                  }
                  chunk = {
                    type: "timed-metadata",
                    data: everything.subarray(byteIndex, byteIndex + frameSize),
                  };
                  this.trigger("data", chunk);
                  byteIndex += frameSize;
                  continue;
                } else if (everything[byteIndex] & (0xff === 0xff) && (everything[byteIndex + 1] & 0xf0) === 0xf0) {
                  if (everything.length - byteIndex < 7) {
                    break;
                  }
                  frameSize = this.parseAdtsSize(everything, byteIndex);
                  if (frameSize > everything.length) {
                    break;
                  }
                  packet = {
                    type: "audio",
                    data: everything.subarray(byteIndex, byteIndex + frameSize),
                    pts: timeStamp,
                    dts: timeStamp,
                  };
                  this.trigger("data", packet);
                  byteIndex += frameSize;
                  continue;
                }
                byteIndex++;
              }
              bytesLeft = everything.length - byteIndex;
              if (bytesLeft > 0) {
                everything = everything.subarray(byteIndex);
              } else {
                everything = new Uint8Array();
              }
            };
          };
          AacStream.prototype = new Stream();
          module.exports = AacStream;
        },
        { "../utils/stream.js": 61 },
      ],
      38: [
        function (require, module, exports) {
          "use strict";
          var ADTS_SAMPLING_FREQUENCIES = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];
          var parseSyncSafeInteger = function (data) {
            return (data[0] << 21) | (data[1] << 14) | (data[2] << 7) | data[3];
          };
          var percentEncode = function (bytes, start, end) {
            var i,
              result = "";
            for (i = start; i < end; i++) {
              result += "%" + ("00" + bytes[i].toString(16)).slice(-2);
            }
            return result;
          };
          var parseIso88591 = function (bytes, start, end) {
            return unescape(percentEncode(bytes, start, end));
          };
          var parseId3TagSize = function (header, byteIndex) {
            var returnSize = (header[byteIndex + 6] << 21) | (header[byteIndex + 7] << 14) | (header[byteIndex + 8] << 7) | header[byteIndex + 9],
              flags = header[byteIndex + 5],
              footerPresent = (flags & 16) >> 4;
            if (footerPresent) {
              return returnSize + 20;
            }
            return returnSize + 10;
          };
          var parseAdtsSize = function (header, byteIndex) {
            var lowThree = (header[byteIndex + 5] & 0xe0) >> 5,
              middle = header[byteIndex + 4] << 3,
              highTwo = header[byteIndex + 3] & (0x3 << 11);
            return highTwo | middle | lowThree;
          };
          var parseType = function (header, byteIndex) {
            if (header[byteIndex] === "I".charCodeAt(0) && header[byteIndex + 1] === "D".charCodeAt(0) && header[byteIndex + 2] === "3".charCodeAt(0)) {
              return "timed-metadata";
            } else if (header[byteIndex] & (0xff === 0xff) && (header[byteIndex + 1] & 0xf0) === 0xf0) {
              return "audio";
            }
            return null;
          };
          var parseSampleRate = function (packet) {
            var i = 0;
            while (i + 5 < packet.length) {
              if (packet[i] !== 0xff || (packet[i + 1] & 0xf6) !== 0xf0) {
                i++;
                continue;
              }
              return ADTS_SAMPLING_FREQUENCIES[(packet[i + 2] & 0x3c) >>> 2];
            }
            return null;
          };
          var parseAacTimestamp = function (packet) {
            var frameStart, frameSize, frame, frameHeader;
            frameStart = 10;
            if (packet[5] & 0x40) {
              frameStart += 4;
              frameStart += parseSyncSafeInteger(packet.subarray(10, 14));
            }
            do {
              frameSize = parseSyncSafeInteger(packet.subarray(frameStart + 4, frameStart + 8));
              if (frameSize < 1) {
                return null;
              }
              frameHeader = String.fromCharCode(packet[frameStart], packet[frameStart + 1], packet[frameStart + 2], packet[frameStart + 3]);
              if (frameHeader === "PRIV") {
                frame = packet.subarray(frameStart + 10, frameStart + frameSize + 10);
                for (var i = 0; i < frame.byteLength; i++) {
                  if (frame[i] === 0) {
                    var owner = parseIso88591(frame, 0, i);
                    if (owner === "com.apple.streaming.transportStreamTimestamp") {
                      var d = frame.subarray(i + 1);
                      var size = ((d[3] & 0x01) << 30) | (d[4] << 22) | (d[5] << 14) | (d[6] << 6) | (d[7] >>> 2);
                      size *= 4;
                      size += d[7] & 0x03;
                      return size;
                    }
                    break;
                  }
                }
              }
              frameStart += 10;
              frameStart += frameSize;
            } while (frameStart < packet.byteLength);
            return null;
          };
          module.exports = {
            parseId3TagSize: parseId3TagSize,
            parseAdtsSize: parseAdtsSize,
            parseType: parseType,
            parseSampleRate: parseSampleRate,
            parseAacTimestamp: parseAacTimestamp,
          };
        },
        {},
      ],
      39: [
        function (require, module, exports) {
          "use strict";
          var Stream = require("../utils/stream.js");
          var AdtsStream;
          var ADTS_SAMPLING_FREQUENCIES = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];
          AdtsStream = function () {
            var buffer;
            AdtsStream.prototype.init.call(this);
            this.push = function (packet) {
              var i = 0,
                frameNum = 0,
                frameLength,
                protectionSkipBytes,
                frameEnd,
                oldBuffer,
                sampleCount,
                adtsFrameDuration;
              if (packet.type !== "audio") {
                return;
              }
              if (buffer) {
                oldBuffer = buffer;
                buffer = new Uint8Array(oldBuffer.byteLength + packet.data.byteLength);
                buffer.set(oldBuffer);
                buffer.set(packet.data, oldBuffer.byteLength);
              } else {
                buffer = packet.data;
              }
              while (i + 5 < buffer.length) {
                if (buffer[i] !== 0xff || (buffer[i + 1] & 0xf6) !== 0xf0) {
                  i++;
                  continue;
                }
                protectionSkipBytes = (~buffer[i + 1] & 0x01) * 2;
                frameLength = ((buffer[i + 3] & 0x03) << 11) | (buffer[i + 4] << 3) | ((buffer[i + 5] & 0xe0) >> 5);
                sampleCount = ((buffer[i + 6] & 0x03) + 1) * 1024;
                adtsFrameDuration = (sampleCount * 90000) / ADTS_SAMPLING_FREQUENCIES[(buffer[i + 2] & 0x3c) >>> 2];
                frameEnd = i + frameLength;
                if (buffer.byteLength < frameEnd) {
                  return;
                }
                this.trigger("data", {
                  pts: packet.pts + frameNum * adtsFrameDuration,
                  dts: packet.dts + frameNum * adtsFrameDuration,
                  sampleCount: sampleCount,
                  audioobjecttype: ((buffer[i + 2] >>> 6) & 0x03) + 1,
                  channelcount: ((buffer[i + 2] & 1) << 2) | ((buffer[i + 3] & 0xc0) >>> 6),
                  samplerate: ADTS_SAMPLING_FREQUENCIES[(buffer[i + 2] & 0x3c) >>> 2],
                  samplingfrequencyindex: (buffer[i + 2] & 0x3c) >>> 2,
                  samplesize: 16,
                  data: buffer.subarray(i + 7 + protectionSkipBytes, frameEnd),
                });
                if (buffer.byteLength === frameEnd) {
                  buffer = undefined;
                  return;
                }
                frameNum++;
                buffer = buffer.subarray(frameEnd);
              }
            };
            this.flush = function () {
              this.trigger("done");
            };
          };
          AdtsStream.prototype = new Stream();
          module.exports = AdtsStream;
        },
        { "../utils/stream.js": 61 },
      ],
      40: [
        function (require, module, exports) {
          "use strict";
          var Stream = require("../utils/stream.js");
          var ExpGolomb = require("../utils/exp-golomb.js");
          var H264Stream, NalByteStream;
          var PROFILES_WITH_OPTIONAL_SPS_DATA;
          NalByteStream = function () {
            var syncPoint = 0,
              i,
              buffer;
            NalByteStream.prototype.init.call(this);
            this.push = function (data) {
              var swapBuffer;
              if (!buffer) {
                buffer = data.data;
              } else {
                swapBuffer = new Uint8Array(buffer.byteLength + data.data.byteLength);
                swapBuffer.set(buffer);
                swapBuffer.set(data.data, buffer.byteLength);
                buffer = swapBuffer;
              }
              for (; syncPoint < buffer.byteLength - 3; syncPoint++) {
                if (buffer[syncPoint + 2] === 1) {
                  i = syncPoint + 5;
                  break;
                }
              }
              while (i < buffer.byteLength) {
                switch (buffer[i]) {
                  case 0:
                    if (buffer[i - 1] !== 0) {
                      i += 2;
                      break;
                    } else if (buffer[i - 2] !== 0) {
                      i++;
                      break;
                    }
                    if (syncPoint + 3 !== i - 2) {
                      this.trigger("data", buffer.subarray(syncPoint + 3, i - 2));
                    }
                    do {
                      i++;
                    } while (buffer[i] !== 1 && i < buffer.length);
                    syncPoint = i - 2;
                    i += 3;
                    break;
                  case 1:
                    if (buffer[i - 1] !== 0 || buffer[i - 2] !== 0) {
                      i += 3;
                      break;
                    }
                    this.trigger("data", buffer.subarray(syncPoint + 3, i - 2));
                    syncPoint = i - 2;
                    i += 3;
                    break;
                  default:
                    i += 3;
                    break;
                }
              }
              buffer = buffer.subarray(syncPoint);
              i -= syncPoint;
              syncPoint = 0;
            };
            this.flush = function () {
              if (buffer && buffer.byteLength > 3) {
                this.trigger("data", buffer.subarray(syncPoint + 3));
              }
              buffer = null;
              syncPoint = 0;
              this.trigger("done");
            };
          };
          NalByteStream.prototype = new Stream();
          PROFILES_WITH_OPTIONAL_SPS_DATA = {
            100: true,
            110: true,
            122: true,
            244: true,
            44: true,
            83: true,
            86: true,
            118: true,
            128: true,
            138: true,
            139: true,
            134: true,
          };
          H264Stream = function () {
            var nalByteStream = new NalByteStream(),
              self,
              trackId,
              currentPts,
              currentDts,
              discardEmulationPreventionBytes,
              readSequenceParameterSet,
              skipScalingList;
            H264Stream.prototype.init.call(this);
            self = this;
            this.push = function (packet) {
              if (packet.type !== "video") {
                return;
              }
              trackId = packet.trackId;
              currentPts = packet.pts;
              currentDts = packet.dts;
              nalByteStream.push(packet);
            };
            nalByteStream.on("data", function (data) {
              var event = {
                trackId: trackId,
                pts: currentPts,
                dts: currentDts,
                data: data,
              };
              switch (data[0] & 0x1f) {
                case 0x05:
                  event.nalUnitType = "slice_layer_without_partitioning_rbsp_idr";
                  break;
                case 0x06:
                  event.nalUnitType = "sei_rbsp";
                  event.escapedRBSP = discardEmulationPreventionBytes(data.subarray(1));
                  break;
                case 0x07:
                  event.nalUnitType = "seq_parameter_set_rbsp";
                  event.escapedRBSP = discardEmulationPreventionBytes(data.subarray(1));
                  event.config = readSequenceParameterSet(event.escapedRBSP);
                  break;
                case 0x08:
                  event.nalUnitType = "pic_parameter_set_rbsp";
                  break;
                case 0x09:
                  event.nalUnitType = "access_unit_delimiter_rbsp";
                  break;
                default:
                  break;
              }
              self.trigger("data", event);
            });
            nalByteStream.on("done", function () {
              self.trigger("done");
            });
            this.flush = function () {
              nalByteStream.flush();
            };
            skipScalingList = function (count, expGolombDecoder) {
              var lastScale = 8,
                nextScale = 8,
                j,
                deltaScale;
              for (j = 0; j < count; j++) {
                if (nextScale !== 0) {
                  deltaScale = expGolombDecoder.readExpGolomb();
                  nextScale = (lastScale + deltaScale + 256) % 256;
                }
                lastScale = nextScale === 0 ? lastScale : nextScale;
              }
            };
            discardEmulationPreventionBytes = function (data) {
              var length = data.byteLength,
                emulationPreventionBytesPositions = [],
                i = 1,
                newLength,
                newData;
              while (i < length - 2) {
                if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0x03) {
                  emulationPreventionBytesPositions.push(i + 2);
                  i += 2;
                } else {
                  i++;
                }
              }
              if (emulationPreventionBytesPositions.length === 0) {
                return data;
              }
              newLength = length - emulationPreventionBytesPositions.length;
              newData = new Uint8Array(newLength);
              var sourceIndex = 0;
              for (i = 0; i < newLength; sourceIndex++, i++) {
                if (sourceIndex === emulationPreventionBytesPositions[0]) {
                  sourceIndex++;
                  emulationPreventionBytesPositions.shift();
                }
                newData[i] = data[sourceIndex];
              }
              return newData;
            };
            readSequenceParameterSet = function (data) {
              var frameCropLeftOffset = 0,
                frameCropRightOffset = 0,
                frameCropTopOffset = 0,
                frameCropBottomOffset = 0,
                sarScale = 1,
                expGolombDecoder,
                profileIdc,
                levelIdc,
                profileCompatibility,
                chromaFormatIdc,
                picOrderCntType,
                numRefFramesInPicOrderCntCycle,
                picWidthInMbsMinus1,
                picHeightInMapUnitsMinus1,
                frameMbsOnlyFlag,
                scalingListCount,
                sarRatio,
                aspectRatioIdc,
                i;
              expGolombDecoder = new ExpGolomb(data);
              profileIdc = expGolombDecoder.readUnsignedByte();
              profileCompatibility = expGolombDecoder.readUnsignedByte();
              levelIdc = expGolombDecoder.readUnsignedByte();
              expGolombDecoder.skipUnsignedExpGolomb();
              if (PROFILES_WITH_OPTIONAL_SPS_DATA[profileIdc]) {
                chromaFormatIdc = expGolombDecoder.readUnsignedExpGolomb();
                if (chromaFormatIdc === 3) {
                  expGolombDecoder.skipBits(1);
                }
                expGolombDecoder.skipUnsignedExpGolomb();
                expGolombDecoder.skipUnsignedExpGolomb();
                expGolombDecoder.skipBits(1);
                if (expGolombDecoder.readBoolean()) {
                  scalingListCount = chromaFormatIdc !== 3 ? 8 : 12;
                  for (i = 0; i < scalingListCount; i++) {
                    if (expGolombDecoder.readBoolean()) {
                      if (i < 6) {
                        skipScalingList(16, expGolombDecoder);
                      } else {
                        skipScalingList(64, expGolombDecoder);
                      }
                    }
                  }
                }
              }
              expGolombDecoder.skipUnsignedExpGolomb();
              picOrderCntType = expGolombDecoder.readUnsignedExpGolomb();
              if (picOrderCntType === 0) {
                expGolombDecoder.readUnsignedExpGolomb();
              } else if (picOrderCntType === 1) {
                expGolombDecoder.skipBits(1);
                expGolombDecoder.skipExpGolomb();
                expGolombDecoder.skipExpGolomb();
                numRefFramesInPicOrderCntCycle = expGolombDecoder.readUnsignedExpGolomb();
                for (i = 0; i < numRefFramesInPicOrderCntCycle; i++) {
                  expGolombDecoder.skipExpGolomb();
                }
              }
              expGolombDecoder.skipUnsignedExpGolomb();
              expGolombDecoder.skipBits(1);
              picWidthInMbsMinus1 = expGolombDecoder.readUnsignedExpGolomb();
              picHeightInMapUnitsMinus1 = expGolombDecoder.readUnsignedExpGolomb();
              frameMbsOnlyFlag = expGolombDecoder.readBits(1);
              if (frameMbsOnlyFlag === 0) {
                expGolombDecoder.skipBits(1);
              }
              expGolombDecoder.skipBits(1);
              if (expGolombDecoder.readBoolean()) {
                frameCropLeftOffset = expGolombDecoder.readUnsignedExpGolomb();
                frameCropRightOffset = expGolombDecoder.readUnsignedExpGolomb();
                frameCropTopOffset = expGolombDecoder.readUnsignedExpGolomb();
                frameCropBottomOffset = expGolombDecoder.readUnsignedExpGolomb();
              }
              if (expGolombDecoder.readBoolean()) {
                if (expGolombDecoder.readBoolean()) {
                  aspectRatioIdc = expGolombDecoder.readUnsignedByte();
                  switch (aspectRatioIdc) {
                    case 1:
                      sarRatio = [1, 1];
                      break;
                    case 2:
                      sarRatio = [12, 11];
                      break;
                    case 3:
                      sarRatio = [10, 11];
                      break;
                    case 4:
                      sarRatio = [16, 11];
                      break;
                    case 5:
                      sarRatio = [40, 33];
                      break;
                    case 6:
                      sarRatio = [24, 11];
                      break;
                    case 7:
                      sarRatio = [20, 11];
                      break;
                    case 8:
                      sarRatio = [32, 11];
                      break;
                    case 9:
                      sarRatio = [80, 33];
                      break;
                    case 10:
                      sarRatio = [18, 11];
                      break;
                    case 11:
                      sarRatio = [15, 11];
                      break;
                    case 12:
                      sarRatio = [64, 33];
                      break;
                    case 13:
                      sarRatio = [160, 99];
                      break;
                    case 14:
                      sarRatio = [4, 3];
                      break;
                    case 15:
                      sarRatio = [3, 2];
                      break;
                    case 16:
                      sarRatio = [2, 1];
                      break;
                    case 255: {
                      sarRatio = [(expGolombDecoder.readUnsignedByte() << 8) | expGolombDecoder.readUnsignedByte(), (expGolombDecoder.readUnsignedByte() << 8) | expGolombDecoder.readUnsignedByte()];
                      break;
                    }
                  }
                  if (sarRatio) {
                    sarScale = sarRatio[0] / sarRatio[1];
                  }
                }
              }
              return {
                profileIdc: profileIdc,
                levelIdc: levelIdc,
                profileCompatibility: profileCompatibility,
                width: Math.ceil(((picWidthInMbsMinus1 + 1) * 16 - frameCropLeftOffset * 2 - frameCropRightOffset * 2) * sarScale),
                height: (2 - frameMbsOnlyFlag) * (picHeightInMapUnitsMinus1 + 1) * 16 - frameCropTopOffset * 2 - frameCropBottomOffset * 2,
              };
            };
          };
          H264Stream.prototype = new Stream();
          module.exports = {
            H264Stream: H264Stream,
            NalByteStream: NalByteStream,
          };
        },
        { "../utils/exp-golomb.js": 60, "../utils/stream.js": 61 },
      ],
      41: [
        function (require, module, exports) {
          var highPrefix = [33, 16, 5, 32, 164, 27];
          var lowPrefix = [33, 65, 108, 84, 1, 2, 4, 8, 168, 2, 4, 8, 17, 191, 252];
          var zeroFill = function (count) {
            var a = [];
            while (count--) {
              a.push(0);
            }
            return a;
          };
          var makeTable = function (metaTable) {
            return Object.keys(metaTable).reduce(function (obj, key) {
              obj[key] = new Uint8Array(
                metaTable[key].reduce(function (arr, part) {
                  return arr.concat(part);
                }, [])
              );
              return obj;
            }, {});
          };
          var coneOfSilence = {
            96000: [highPrefix, [227, 64], zeroFill(154), [56]],
            88200: [highPrefix, [231], zeroFill(170), [56]],
            64000: [highPrefix, [248, 192], zeroFill(240), [56]],
            48000: [highPrefix, [255, 192], zeroFill(268), [55, 148, 128], zeroFill(54), [112]],
            44100: [highPrefix, [255, 192], zeroFill(268), [55, 163, 128], zeroFill(84), [112]],
            32000: [highPrefix, [255, 192], zeroFill(268), [55, 234], zeroFill(226), [112]],
            24000: [highPrefix, [255, 192], zeroFill(268), [55, 255, 128], zeroFill(268), [111, 112], zeroFill(126), [224]],
            16000: [highPrefix, [255, 192], zeroFill(268), [55, 255, 128], zeroFill(268), [111, 255], zeroFill(269), [223, 108], zeroFill(195), [1, 192]],
            12000: [lowPrefix, zeroFill(268), [3, 127, 248], zeroFill(268), [6, 255, 240], zeroFill(268), [13, 255, 224], zeroFill(268), [27, 253, 128], zeroFill(259), [56]],
            11025: [
              lowPrefix,
              zeroFill(268),
              [3, 127, 248],
              zeroFill(268),
              [6, 255, 240],
              zeroFill(268),
              [13, 255, 224],
              zeroFill(268),
              [27, 255, 192],
              zeroFill(268),
              [55, 175, 128],
              zeroFill(108),
              [112],
            ],
            8000: [lowPrefix, zeroFill(268), [3, 121, 16], zeroFill(47), [7]],
          };
          module.exports = makeTable(coneOfSilence);
        },
        {},
      ],
      42: [
        function (require, module, exports) {
          "use strict";
          var Stream = require("../utils/stream.js");
          var CoalesceStream = function (options) {
            this.numberOfTracks = 0;
            this.metadataStream = options.metadataStream;
            this.videoTags = [];
            this.audioTags = [];
            this.videoTrack = null;
            this.audioTrack = null;
            this.pendingCaptions = [];
            this.pendingMetadata = [];
            this.pendingTracks = 0;
            this.processedTracks = 0;
            CoalesceStream.prototype.init.call(this);
            this.push = function (output) {
              if (output.text) {
                return this.pendingCaptions.push(output);
              }
              if (output.frames) {
                return this.pendingMetadata.push(output);
              }
              if (output.track.type === "video") {
                this.videoTrack = output.track;
                this.videoTags = output.tags;
                this.pendingTracks++;
              }
              if (output.track.type === "audio") {
                this.audioTrack = output.track;
                this.audioTags = output.tags;
                this.pendingTracks++;
              }
            };
          };
          CoalesceStream.prototype = new Stream();
          CoalesceStream.prototype.flush = function (flushSource) {
            var id3,
              caption,
              i,
              timelineStartPts,
              event = { tags: {}, captions: [], metadata: [] };
            if (this.pendingTracks < this.numberOfTracks) {
              if (flushSource !== "VideoSegmentStream" && flushSource !== "AudioSegmentStream") {
                return;
              } else if (this.pendingTracks === 0) {
                this.processedTracks++;
                if (this.processedTracks < this.numberOfTracks) {
                  return;
                }
              }
            }
            this.processedTracks += this.pendingTracks;
            this.pendingTracks = 0;
            if (this.processedTracks < this.numberOfTracks) {
              return;
            }
            if (this.videoTrack) {
              timelineStartPts = this.videoTrack.timelineStartInfo.pts;
            } else if (this.audioTrack) {
              timelineStartPts = this.audioTrack.timelineStartInfo.pts;
            }
            event.tags.videoTags = this.videoTags;
            event.tags.audioTags = this.audioTags;
            for (i = 0; i < this.pendingCaptions.length; i++) {
              caption = this.pendingCaptions[i];
              caption.startTime = caption.startPts - timelineStartPts;
              caption.startTime /= 90e3;
              caption.endTime = caption.endPts - timelineStartPts;
              caption.endTime /= 90e3;
              event.captions.push(caption);
            }
            for (i = 0; i < this.pendingMetadata.length; i++) {
              id3 = this.pendingMetadata[i];
              id3.cueTime = id3.pts - timelineStartPts;
              id3.cueTime /= 90e3;
              event.metadata.push(id3);
            }
            event.metadata.dispatchType = this.metadataStream.dispatchType;
            this.videoTrack = null;
            this.audioTrack = null;
            this.videoTags = [];
            this.audioTags = [];
            this.pendingCaptions.length = 0;
            this.pendingMetadata.length = 0;
            this.pendingTracks = 0;
            this.processedTracks = 0;
            this.trigger("data", event);
            this.trigger("done");
          };
          module.exports = CoalesceStream;
        },
        { "../utils/stream.js": 61 },
      ],
      43: [
        function (require, module, exports) {
          "use strict";
          var FlvTag = require("./flv-tag.js");
          var getFlvHeader = function (duration, audio, video) {
            var headBytes = new Uint8Array(3 + 1 + 1 + 4),
              head = new DataView(headBytes.buffer),
              metadata,
              result,
              metadataLength;
            duration = duration || 0;
            audio = audio === undefined ? true : audio;
            video = video === undefined ? true : video;
            head.setUint8(0, 0x46);
            head.setUint8(1, 0x4c);
            head.setUint8(2, 0x56);
            head.setUint8(3, 0x01);
            head.setUint8(4, (audio ? 0x04 : 0x00) | (video ? 0x01 : 0x00));
            head.setUint32(5, headBytes.byteLength);
            if (duration <= 0) {
              result = new Uint8Array(headBytes.byteLength + 4);
              result.set(headBytes);
              result.set([0, 0, 0, 0], headBytes.byteLength);
              return result;
            }
            metadata = new FlvTag(FlvTag.METADATA_TAG);
            metadata.pts = metadata.dts = 0;
            metadata.writeMetaDataDouble("duration", duration);
            metadataLength = metadata.finalize().length;
            result = new Uint8Array(headBytes.byteLength + metadataLength);
            result.set(headBytes);
            result.set(head.byteLength, metadataLength);
            return result;
          };
          module.exports = getFlvHeader;
        },
        { "./flv-tag.js": 44 },
      ],
      44: [
        function (require, module, exports) {
          "use strict";
          var FlvTag;
          FlvTag = function (type, extraData) {
            var adHoc = 0,
              bufferStartSize = 16384,
              prepareWrite = function (flv, count) {
                var bytes,
                  minLength = flv.position + count;
                if (minLength < flv.bytes.byteLength) {
                  return;
                }
                bytes = new Uint8Array(minLength * 2);
                bytes.set(flv.bytes.subarray(0, flv.position), 0);
                flv.bytes = bytes;
                flv.view = new DataView(flv.bytes.buffer);
              },
              widthBytes = FlvTag.widthBytes || new Uint8Array("width".length),
              heightBytes = FlvTag.heightBytes || new Uint8Array("height".length),
              videocodecidBytes = FlvTag.videocodecidBytes || new Uint8Array("videocodecid".length),
              i;
            if (!FlvTag.widthBytes) {
              for (i = 0; i < "width".length; i++) {
                widthBytes[i] = "width".charCodeAt(i);
              }
              for (i = 0; i < "height".length; i++) {
                heightBytes[i] = "height".charCodeAt(i);
              }
              for (i = 0; i < "videocodecid".length; i++) {
                videocodecidBytes[i] = "videocodecid".charCodeAt(i);
              }
              FlvTag.widthBytes = widthBytes;
              FlvTag.heightBytes = heightBytes;
              FlvTag.videocodecidBytes = videocodecidBytes;
            }
            this.keyFrame = false;
            switch (type) {
              case FlvTag.VIDEO_TAG:
                this.length = 16;
                bufferStartSize *= 6;
                break;
              case FlvTag.AUDIO_TAG:
                this.length = 13;
                this.keyFrame = true;
                break;
              case FlvTag.METADATA_TAG:
                this.length = 29;
                this.keyFrame = true;
                break;
              default:
                throw new Error("Unknown FLV tag type");
            }
            this.bytes = new Uint8Array(bufferStartSize);
            this.view = new DataView(this.bytes.buffer);
            this.bytes[0] = type;
            this.position = this.length;
            this.keyFrame = extraData;
            this.pts = 0;
            this.dts = 0;
            this.writeBytes = function (bytes, offset, length) {
              var start = offset || 0,
                end;
              length = length || bytes.byteLength;
              end = start + length;
              prepareWrite(this, length);
              this.bytes.set(bytes.subarray(start, end), this.position);
              this.position += length;
              this.length = Math.max(this.length, this.position);
            };
            this.writeByte = function (byte) {
              prepareWrite(this, 1);
              this.bytes[this.position] = byte;
              this.position++;
              this.length = Math.max(this.length, this.position);
            };
            this.writeShort = function (short) {
              prepareWrite(this, 2);
              this.view.setUint16(this.position, short);
              this.position += 2;
              this.length = Math.max(this.length, this.position);
            };
            this.negIndex = function (pos) {
              return this.bytes[this.length - pos];
            };
            this.nalUnitSize = function () {
              if (adHoc === 0) {
                return 0;
              }
              return this.length - (adHoc + 4);
            };
            this.startNalUnit = function () {
              if (adHoc > 0) {
                throw new Error("Attempted to create new NAL wihout closing the old one");
              }
              adHoc = this.length;
              this.length += 4;
              this.position = this.length;
            };
            this.endNalUnit = function (nalContainer) {
              var nalStart, nalLength;
              if (this.length === adHoc + 4) {
                this.length -= 4;
              } else if (adHoc > 0) {
                nalStart = adHoc + 4;
                nalLength = this.length - nalStart;
                this.position = adHoc;
                this.view.setUint32(this.position, nalLength);
                this.position = this.length;
                if (nalContainer) {
                  nalContainer.push(this.bytes.subarray(nalStart, nalStart + nalLength));
                }
              }
              adHoc = 0;
            };
            this.writeMetaDataDouble = function (key, val) {
              var i;
              prepareWrite(this, 2 + key.length + 9);
              this.view.setUint16(this.position, key.length);
              this.position += 2;
              if (key === "width") {
                this.bytes.set(widthBytes, this.position);
                this.position += 5;
              } else if (key === "height") {
                this.bytes.set(heightBytes, this.position);
                this.position += 6;
              } else if (key === "videocodecid") {
                this.bytes.set(videocodecidBytes, this.position);
                this.position += 12;
              } else {
                for (i = 0; i < key.length; i++) {
                  this.bytes[this.position] = key.charCodeAt(i);
                  this.position++;
                }
              }
              this.position++;
              this.view.setFloat64(this.position, val);
              this.position += 8;
              this.length = Math.max(this.length, this.position);
              ++adHoc;
            };
            this.writeMetaDataBoolean = function (key, val) {
              var i;
              prepareWrite(this, 2);
              this.view.setUint16(this.position, key.length);
              this.position += 2;
              for (i = 0; i < key.length; i++) {
                prepareWrite(this, 1);
                this.bytes[this.position] = key.charCodeAt(i);
                this.position++;
              }
              prepareWrite(this, 2);
              this.view.setUint8(this.position, 0x01);
              this.position++;
              this.view.setUint8(this.position, val ? 0x01 : 0x00);
              this.position++;
              this.length = Math.max(this.length, this.position);
              ++adHoc;
            };
            this.finalize = function () {
              var dtsDelta, len;
              switch (this.bytes[0]) {
                case FlvTag.VIDEO_TAG:
                  this.bytes[11] = (this.keyFrame || extraData ? 0x10 : 0x20) | 0x07;
                  this.bytes[12] = extraData ? 0x00 : 0x01;
                  dtsDelta = this.pts - this.dts;
                  this.bytes[13] = (dtsDelta & 0x00ff0000) >>> 16;
                  this.bytes[14] = (dtsDelta & 0x0000ff00) >>> 8;
                  this.bytes[15] = (dtsDelta & 0x000000ff) >>> 0;
                  break;
                case FlvTag.AUDIO_TAG:
                  this.bytes[11] = 0xaf;
                  this.bytes[12] = extraData ? 0x00 : 0x01;
                  break;
                case FlvTag.METADATA_TAG:
                  this.position = 11;
                  this.view.setUint8(this.position, 0x02);
                  this.position++;
                  this.view.setUint16(this.position, 0x0a);
                  this.position += 2;
                  this.bytes.set([0x6f, 0x6e, 0x4d, 0x65, 0x74, 0x61, 0x44, 0x61, 0x74, 0x61], this.position);
                  this.position += 10;
                  this.bytes[this.position] = 0x08;
                  this.position++;
                  this.view.setUint32(this.position, adHoc);
                  this.position = this.length;
                  this.bytes.set([0, 0, 9], this.position);
                  this.position += 3;
                  this.length = this.position;
                  break;
              }
              len = this.length - 11;
              this.bytes[1] = (len & 0x00ff0000) >>> 16;
              this.bytes[2] = (len & 0x0000ff00) >>> 8;
              this.bytes[3] = (len & 0x000000ff) >>> 0;
              this.bytes[4] = (this.dts & 0x00ff0000) >>> 16;
              this.bytes[5] = (this.dts & 0x0000ff00) >>> 8;
              this.bytes[6] = (this.dts & 0x000000ff) >>> 0;
              this.bytes[7] = (this.dts & 0xff000000) >>> 24;
              this.bytes[8] = 0;
              this.bytes[9] = 0;
              this.bytes[10] = 0;
              prepareWrite(this, 4);
              this.view.setUint32(this.length, this.length);
              this.length += 4;
              this.position += 4;
              this.bytes = this.bytes.subarray(0, this.length);
              this.frameTime = FlvTag.frameTime(this.bytes);
              return this;
            };
          };
          FlvTag.AUDIO_TAG = 0x08;
          FlvTag.VIDEO_TAG = 0x09;
          FlvTag.METADATA_TAG = 0x12;
          FlvTag.isAudioFrame = function (tag) {
            return FlvTag.AUDIO_TAG === tag[0];
          };
          FlvTag.isVideoFrame = function (tag) {
            return FlvTag.VIDEO_TAG === tag[0];
          };
          FlvTag.isMetaData = function (tag) {
            return FlvTag.METADATA_TAG === tag[0];
          };
          FlvTag.isKeyFrame = function (tag) {
            if (FlvTag.isVideoFrame(tag)) {
              return tag[11] === 0x17;
            }
            if (FlvTag.isAudioFrame(tag)) {
              return true;
            }
            if (FlvTag.isMetaData(tag)) {
              return true;
            }
            return false;
          };
          FlvTag.frameTime = function (tag) {
            var pts = tag[4] << 16;
            pts |= tag[5] << 8;
            pts |= tag[6] << 0;
            pts |= tag[7] << 24;
            return pts;
          };
          module.exports = FlvTag;
        },
        {},
      ],
      45: [
        function (require, module, exports) {
          module.exports = {
            tag: require("./flv-tag"),
            Transmuxer: require("./transmuxer"),
            getFlvHeader: require("./flv-header"),
          };
        },
        { "./flv-header": 43, "./flv-tag": 44, "./transmuxer": 47 },
      ],
      46: [
        function (require, module, exports) {
          "use strict";
          var TagList = function () {
            var self = this;
            this.list = [];
            this.push = function (tag) {
              this.list.push({
                bytes: tag.bytes,
                dts: tag.dts,
                pts: tag.pts,
                keyFrame: tag.keyFrame,
                metaDataTag: tag.metaDataTag,
              });
            };
            Object.defineProperty(this, "length", {
              get: function () {
                return self.list.length;
              },
            });
          };
          module.exports = TagList;
        },
        {},
      ],
      47: [
        function (require, module, exports) {
          "use strict";
          var Stream = require("../utils/stream.js");
          var FlvTag = require("./flv-tag.js");
          var m2ts = require("../m2ts/m2ts.js");
          var AdtsStream = require("../codecs/adts.js");
          var H264Stream = require("../codecs/h264").H264Stream;
          var CoalesceStream = require("./coalesce-stream.js");
          var TagList = require("./tag-list.js");
          var Transmuxer, VideoSegmentStream, AudioSegmentStream, collectTimelineInfo, metaDataTag, extraDataTag;
          collectTimelineInfo = function (track, data) {
            if (typeof data.pts === "number") {
              if (track.timelineStartInfo.pts === undefined) {
                track.timelineStartInfo.pts = data.pts;
              } else {
                track.timelineStartInfo.pts = Math.min(track.timelineStartInfo.pts, data.pts);
              }
            }
            if (typeof data.dts === "number") {
              if (track.timelineStartInfo.dts === undefined) {
                track.timelineStartInfo.dts = data.dts;
              } else {
                track.timelineStartInfo.dts = Math.min(track.timelineStartInfo.dts, data.dts);
              }
            }
          };
          metaDataTag = function (track, pts) {
            var tag = new FlvTag(FlvTag.METADATA_TAG);
            tag.dts = pts;
            tag.pts = pts;
            tag.writeMetaDataDouble("videocodecid", 7);
            tag.writeMetaDataDouble("width", track.width);
            tag.writeMetaDataDouble("height", track.height);
            return tag;
          };
          extraDataTag = function (track, pts) {
            var i,
              tag = new FlvTag(FlvTag.VIDEO_TAG, true);
            tag.dts = pts;
            tag.pts = pts;
            tag.writeByte(0x01);
            tag.writeByte(track.profileIdc);
            tag.writeByte(track.profileCompatibility);
            tag.writeByte(track.levelIdc);
            tag.writeByte(0xfc | 0x03);
            tag.writeByte(0xe0 | 0x01);
            tag.writeShort(track.sps[0].length);
            tag.writeBytes(track.sps[0]);
            tag.writeByte(track.pps.length);
            for (i = 0; i < track.pps.length; ++i) {
              tag.writeShort(track.pps[i].length);
              tag.writeBytes(track.pps[i]);
            }
            return tag;
          };
          AudioSegmentStream = function (track) {
            var adtsFrames = [],
              oldExtraData;
            AudioSegmentStream.prototype.init.call(this);
            this.push = function (data) {
              collectTimelineInfo(track, data);
              if (track && track.channelcount === undefined) {
                track.audioobjecttype = data.audioobjecttype;
                track.channelcount = data.channelcount;
                track.samplerate = data.samplerate;
                track.samplingfrequencyindex = data.samplingfrequencyindex;
                track.samplesize = data.samplesize;
                track.extraData = (track.audioobjecttype << 11) | (track.samplingfrequencyindex << 7) | (track.channelcount << 3);
              }
              data.pts = Math.round(data.pts / 90);
              data.dts = Math.round(data.dts / 90);
              adtsFrames.push(data);
            };
            this.flush = function () {
              var currentFrame,
                adtsFrame,
                lastMetaPts,
                tags = new TagList();
              if (adtsFrames.length === 0) {
                this.trigger("done", "AudioSegmentStream");
                return;
              }
              lastMetaPts = -Infinity;
              while (adtsFrames.length) {
                currentFrame = adtsFrames.shift();
                if (track.extraData !== oldExtraData || currentFrame.pts - lastMetaPts >= 1000) {
                  adtsFrame = new FlvTag(FlvTag.METADATA_TAG);
                  adtsFrame.pts = currentFrame.pts;
                  adtsFrame.dts = currentFrame.dts;
                  adtsFrame.writeMetaDataDouble("audiocodecid", 10);
                  adtsFrame.writeMetaDataBoolean("stereo", track.channelcount === 2);
                  adtsFrame.writeMetaDataDouble("audiosamplerate", track.samplerate);
                  adtsFrame.writeMetaDataDouble("audiosamplesize", 16);
                  tags.push(adtsFrame.finalize());
                  oldExtraData = track.extraData;
                  adtsFrame = new FlvTag(FlvTag.AUDIO_TAG, true);
                  adtsFrame.pts = currentFrame.pts;
                  adtsFrame.dts = currentFrame.dts;
                  adtsFrame.view.setUint16(adtsFrame.position, track.extraData);
                  adtsFrame.position += 2;
                  adtsFrame.length = Math.max(adtsFrame.length, adtsFrame.position);
                  tags.push(adtsFrame.finalize());
                  lastMetaPts = currentFrame.pts;
                }
                adtsFrame = new FlvTag(FlvTag.AUDIO_TAG);
                adtsFrame.pts = currentFrame.pts;
                adtsFrame.dts = currentFrame.dts;
                adtsFrame.writeBytes(currentFrame.data);
                tags.push(adtsFrame.finalize());
              }
              oldExtraData = null;
              this.trigger("data", { track: track, tags: tags.list });
              this.trigger("done", "AudioSegmentStream");
            };
          };
          AudioSegmentStream.prototype = new Stream();
          VideoSegmentStream = function (track) {
            var nalUnits = [],
              config,
              h264Frame;
            VideoSegmentStream.prototype.init.call(this);
            this.finishFrame = function (tags, frame) {
              if (!frame) {
                return;
              }
              if (config && track && track.newMetadata && (frame.keyFrame || tags.length === 0)) {
                var metaTag = metaDataTag(config, frame.dts).finalize();
                var extraTag = extraDataTag(track, frame.dts).finalize();
                metaTag.metaDataTag = extraTag.metaDataTag = true;
                tags.push(metaTag);
                tags.push(extraTag);
                track.newMetadata = false;
              }
              frame.endNalUnit();
              tags.push(frame.finalize());
              h264Frame = null;
            };
            this.push = function (data) {
              collectTimelineInfo(track, data);
              data.pts = Math.round(data.pts / 90);
              data.dts = Math.round(data.dts / 90);
              nalUnits.push(data);
            };
            this.flush = function () {
              var currentNal,
                tags = new TagList();
              while (nalUnits.length) {
                if (nalUnits[0].nalUnitType === "access_unit_delimiter_rbsp") {
                  break;
                }
                nalUnits.shift();
              }
              if (nalUnits.length === 0) {
                this.trigger("done", "VideoSegmentStream");
                return;
              }
              while (nalUnits.length) {
                currentNal = nalUnits.shift();
                if (currentNal.nalUnitType === "seq_parameter_set_rbsp") {
                  track.newMetadata = true;
                  config = currentNal.config;
                  track.width = config.width;
                  track.height = config.height;
                  track.sps = [currentNal.data];
                  track.profileIdc = config.profileIdc;
                  track.levelIdc = config.levelIdc;
                  track.profileCompatibility = config.profileCompatibility;
                  h264Frame.endNalUnit();
                } else if (currentNal.nalUnitType === "pic_parameter_set_rbsp") {
                  track.newMetadata = true;
                  track.pps = [currentNal.data];
                  h264Frame.endNalUnit();
                } else if (currentNal.nalUnitType === "access_unit_delimiter_rbsp") {
                  if (h264Frame) {
                    this.finishFrame(tags, h264Frame);
                  }
                  h264Frame = new FlvTag(FlvTag.VIDEO_TAG);
                  h264Frame.pts = currentNal.pts;
                  h264Frame.dts = currentNal.dts;
                } else {
                  if (currentNal.nalUnitType === "slice_layer_without_partitioning_rbsp_idr") {
                    h264Frame.keyFrame = true;
                  }
                  h264Frame.endNalUnit();
                }
                h264Frame.startNalUnit();
                h264Frame.writeBytes(currentNal.data);
              }
              if (h264Frame) {
                this.finishFrame(tags, h264Frame);
              }
              this.trigger("data", { track: track, tags: tags.list });
              this.trigger("done", "VideoSegmentStream");
            };
          };
          VideoSegmentStream.prototype = new Stream();
          Transmuxer = function (options) {
            var self = this,
              packetStream,
              parseStream,
              elementaryStream,
              videoTimestampRolloverStream,
              audioTimestampRolloverStream,
              timedMetadataTimestampRolloverStream,
              adtsStream,
              h264Stream,
              videoSegmentStream,
              audioSegmentStream,
              captionStream,
              coalesceStream;
            Transmuxer.prototype.init.call(this);
            options = options || {};
            this.metadataStream = new m2ts.MetadataStream();
            options.metadataStream = this.metadataStream;
            packetStream = new m2ts.TransportPacketStream();
            parseStream = new m2ts.TransportParseStream();
            elementaryStream = new m2ts.ElementaryStream();
            videoTimestampRolloverStream = new m2ts.TimestampRolloverStream("video");
            audioTimestampRolloverStream = new m2ts.TimestampRolloverStream("audio");
            timedMetadataTimestampRolloverStream = new m2ts.TimestampRolloverStream("timed-metadata");
            adtsStream = new AdtsStream();
            h264Stream = new H264Stream();
            coalesceStream = new CoalesceStream(options);
            packetStream.pipe(parseStream).pipe(elementaryStream);
            elementaryStream.pipe(videoTimestampRolloverStream).pipe(h264Stream);
            elementaryStream.pipe(audioTimestampRolloverStream).pipe(adtsStream);
            elementaryStream.pipe(timedMetadataTimestampRolloverStream).pipe(this.metadataStream).pipe(coalesceStream);
            captionStream = new m2ts.CaptionStream();
            h264Stream.pipe(captionStream).pipe(coalesceStream);
            elementaryStream.on("data", function (data) {
              var i, videoTrack, audioTrack;
              if (data.type === "metadata") {
                i = data.tracks.length;
                while (i--) {
                  if (data.tracks[i].type === "video") {
                    videoTrack = data.tracks[i];
                  } else if (data.tracks[i].type === "audio") {
                    audioTrack = data.tracks[i];
                  }
                }
                if (videoTrack && !videoSegmentStream) {
                  coalesceStream.numberOfTracks++;
                  videoSegmentStream = new VideoSegmentStream(videoTrack);
                  h264Stream.pipe(videoSegmentStream).pipe(coalesceStream);
                }
                if (audioTrack && !audioSegmentStream) {
                  coalesceStream.numberOfTracks++;
                  audioSegmentStream = new AudioSegmentStream(audioTrack);
                  adtsStream.pipe(audioSegmentStream).pipe(coalesceStream);
                }
              }
            });
            this.push = function (data) {
              packetStream.push(data);
            };
            this.flush = function () {
              packetStream.flush();
            };
            coalesceStream.on("data", function (event) {
              self.trigger("data", event);
            });
            coalesceStream.on("done", function () {
              self.trigger("done");
            });
          };
          Transmuxer.prototype = new Stream();
          module.exports = Transmuxer;
        },
        {
          "../codecs/adts.js": 39,
          "../codecs/h264": 40,
          "../m2ts/m2ts.js": 49,
          "../utils/stream.js": 61,
          "./coalesce-stream.js": 42,
          "./flv-tag.js": 44,
          "./tag-list.js": 46,
        },
      ],
      48: [
        function (require, module, exports) {
          "use strict";
          var USER_DATA_REGISTERED_ITU_T_T35 = 4,
            RBSP_TRAILING_BITS = 128,
            Stream = require("../utils/stream");
          var parseSei = function (bytes) {
            var i = 0,
              result = { payloadType: -1, payloadSize: 0 },
              payloadType = 0,
              payloadSize = 0;
            while (i < bytes.byteLength) {
              if (bytes[i] === RBSP_TRAILING_BITS) {
                break;
              }
              while (bytes[i] === 0xff) {
                payloadType += 255;
                i++;
              }
              payloadType += bytes[i++];
              while (bytes[i] === 0xff) {
                payloadSize += 255;
                i++;
              }
              payloadSize += bytes[i++];
              if (!result.payload && payloadType === USER_DATA_REGISTERED_ITU_T_T35) {
                result.payloadType = payloadType;
                result.payloadSize = payloadSize;
                result.payload = bytes.subarray(i, i + payloadSize);
                break;
              }
              i += payloadSize;
              payloadType = 0;
              payloadSize = 0;
            }
            return result;
          };
          var parseUserData = function (sei) {
            if (sei.payload[0] !== 181) {
              return null;
            }
            if (((sei.payload[1] << 8) | sei.payload[2]) !== 49) {
              return null;
            }
            if (String.fromCharCode(sei.payload[3], sei.payload[4], sei.payload[5], sei.payload[6]) !== "GA94") {
              return null;
            }
            if (sei.payload[7] !== 0x03) {
              return null;
            }
            return sei.payload.subarray(8, sei.payload.length - 1);
          };
          var parseCaptionPackets = function (pts, userData) {
            var results = [],
              i,
              count,
              offset,
              data;
            if (!(userData[0] & 0x40)) {
              return results;
            }
            count = userData[0] & 0x1f;
            for (i = 0; i < count; i++) {
              offset = i * 3;
              data = { type: userData[offset + 2] & 0x03, pts: pts };
              if (userData[offset + 2] & 0x04) {
                data.ccData = (userData[offset + 3] << 8) | userData[offset + 4];
                results.push(data);
              }
            }
            return results;
          };
          var CaptionStream = function () {
            CaptionStream.prototype.init.call(this);
            this.captionPackets_ = [];
            this.field1_ = new Cea608Stream();
            this.field1_.on("data", this.trigger.bind(this, "data"));
            this.field1_.on("done", this.trigger.bind(this, "done"));
          };
          CaptionStream.prototype = new Stream();
          CaptionStream.prototype.push = function (event) {
            var sei, userData;
            if (event.nalUnitType !== "sei_rbsp") {
              return;
            }
            sei = parseSei(event.escapedRBSP);
            if (sei.payloadType !== USER_DATA_REGISTERED_ITU_T_T35) {
              return;
            }
            userData = parseUserData(sei);
            if (!userData) {
              return;
            }
            this.captionPackets_ = this.captionPackets_.concat(parseCaptionPackets(event.pts, userData));
          };
          CaptionStream.prototype.flush = function () {
            if (!this.captionPackets_.length) {
              this.field1_.flush();
              return;
            }
            this.captionPackets_.forEach(function (elem, idx) {
              elem.presortIndex = idx;
            });
            this.captionPackets_.sort(function (a, b) {
              if (a.pts === b.pts) {
                return a.presortIndex - b.presortIndex;
              }
              return a.pts - b.pts;
            });
            this.captionPackets_.forEach(this.field1_.push, this.field1_);
            this.captionPackets_.length = 0;
            this.field1_.flush();
            return;
          };
          var BASIC_CHARACTER_TRANSLATION = {
            0x2a: 0xe1,
            0x5c: 0xe9,
            0x5e: 0xed,
            0x5f: 0xf3,
            0x60: 0xfa,
            0x7b: 0xe7,
            0x7c: 0xf7,
            0x7d: 0xd1,
            0x7e: 0xf1,
            0x7f: 0x2588,
          };
          var getCharFromCode = function (code) {
            if (code === null) {
              return "";
            }
            code = BASIC_CHARACTER_TRANSLATION[code] || code;
            return String.fromCharCode(code);
          };
          var PADDING = 0x0000,
            RESUME_CAPTION_LOADING = 0x1420,
            END_OF_CAPTION = 0x142f,
            ROLL_UP_2_ROWS = 0x1425,
            ROLL_UP_3_ROWS = 0x1426,
            ROLL_UP_4_ROWS = 0x1427,
            CARRIAGE_RETURN = 0x142d,
            BACKSPACE = 0x1421,
            ERASE_DISPLAYED_MEMORY = 0x142c,
            ERASE_NON_DISPLAYED_MEMORY = 0x142e;
          var BOTTOM_ROW = 14;
          var createDisplayBuffer = function () {
            var result = [],
              i = BOTTOM_ROW + 1;
            while (i--) {
              result.push("");
            }
            return result;
          };
          var Cea608Stream = function () {
            Cea608Stream.prototype.init.call(this);
            this.mode_ = "popOn";
            this.topRow_ = 0;
            this.startPts_ = 0;
            this.displayed_ = createDisplayBuffer();
            this.nonDisplayed_ = createDisplayBuffer();
            this.lastControlCode_ = null;
            this.push = function (packet) {
              if (packet.type !== 0) {
                return;
              }
              var data, swap, char0, char1;
              data = packet.ccData & 0x7f7f;
              if (data === this.lastControlCode_) {
                this.lastControlCode_ = null;
                return;
              }
              if ((data & 0xf000) === 0x1000) {
                this.lastControlCode_ = data;
              } else {
                this.lastControlCode_ = null;
              }
              switch (data) {
                case PADDING:
                  break;
                case RESUME_CAPTION_LOADING:
                  this.mode_ = "popOn";
                  break;
                case END_OF_CAPTION:
                  this.flushDisplayed(packet.pts);
                  swap = this.displayed_;
                  this.displayed_ = this.nonDisplayed_;
                  this.nonDisplayed_ = swap;
                  this.startPts_ = packet.pts;
                  break;
                case ROLL_UP_2_ROWS:
                  this.topRow_ = BOTTOM_ROW - 1;
                  this.mode_ = "rollUp";
                  break;
                case ROLL_UP_3_ROWS:
                  this.topRow_ = BOTTOM_ROW - 2;
                  this.mode_ = "rollUp";
                  break;
                case ROLL_UP_4_ROWS:
                  this.topRow_ = BOTTOM_ROW - 3;
                  this.mode_ = "rollUp";
                  break;
                case CARRIAGE_RETURN:
                  this.flushDisplayed(packet.pts);
                  this.shiftRowsUp_();
                  this.startPts_ = packet.pts;
                  break;
                case BACKSPACE:
                  if (this.mode_ === "popOn") {
                    this.nonDisplayed_[BOTTOM_ROW] = this.nonDisplayed_[BOTTOM_ROW].slice(0, -1);
                  } else {
                    this.displayed_[BOTTOM_ROW] = this.displayed_[BOTTOM_ROW].slice(0, -1);
                  }
                  break;
                case ERASE_DISPLAYED_MEMORY:
                  this.flushDisplayed(packet.pts);
                  this.displayed_ = createDisplayBuffer();
                  break;
                case ERASE_NON_DISPLAYED_MEMORY:
                  this.nonDisplayed_ = createDisplayBuffer();
                  break;
                default:
                  char0 = data >>> 8;
                  char1 = data & 0xff;
                  if (char0 >= 0x10 && char0 <= 0x17 && char1 >= 0x40 && char1 <= 0x7f && (char0 !== 0x10 || char1 < 0x60)) {
                    char0 = 0x20;
                    char1 = null;
                  }
                  if ((char0 === 0x11 || char0 === 0x19) && char1 >= 0x30 && char1 <= 0x3f) {
                    char0 = 0x266a;
                    char1 = "";
                  }
                  if ((char0 & 0xf0) === 0x10) {
                    return;
                  }
                  if (char0 === 0x00) {
                    char0 = null;
                  }
                  if (char1 === 0x00) {
                    char1 = null;
                  }
                  this[this.mode_](packet.pts, char0, char1);
                  break;
              }
            };
          };
          Cea608Stream.prototype = new Stream();
          Cea608Stream.prototype.flushDisplayed = function (pts) {
            var content = this.displayed_
              .map(function (row) {
                return row.trim();
              })
              .filter(function (row) {
                return row.length;
              })
              .join("\n");
            if (content.length) {
              this.trigger("data", {
                startPts: this.startPts_,
                endPts: pts,
                text: content,
              });
            }
          };
          Cea608Stream.prototype.popOn = function (pts, char0, char1) {
            var baseRow = this.nonDisplayed_[BOTTOM_ROW];
            baseRow += getCharFromCode(char0);
            baseRow += getCharFromCode(char1);
            this.nonDisplayed_[BOTTOM_ROW] = baseRow;
          };
          Cea608Stream.prototype.rollUp = function (pts, char0, char1) {
            var baseRow = this.displayed_[BOTTOM_ROW];
            if (baseRow === "") {
              this.flushDisplayed(pts);
              this.startPts_ = pts;
            }
            baseRow += getCharFromCode(char0);
            baseRow += getCharFromCode(char1);
            this.displayed_[BOTTOM_ROW] = baseRow;
          };
          Cea608Stream.prototype.shiftRowsUp_ = function () {
            var i;
            for (i = 0; i < this.topRow_; i++) {
              this.displayed_[i] = "";
            }
            for (i = this.topRow_; i < BOTTOM_ROW; i++) {
              this.displayed_[i] = this.displayed_[i + 1];
            }
            this.displayed_[BOTTOM_ROW] = "";
          };
          module.exports = {
            CaptionStream: CaptionStream,
            Cea608Stream: Cea608Stream,
          };
        },
        { "../utils/stream": 61 },
      ],
      49: [
        function (require, module, exports) {
          "use strict";
          var Stream = require("../utils/stream.js"),
            CaptionStream = require("./caption-stream"),
            StreamTypes = require("./stream-types"),
            TimestampRolloverStream = require("./timestamp-rollover-stream").TimestampRolloverStream;
          var m2tsStreamTypes = require("./stream-types.js");
          var TransportPacketStream, TransportParseStream, ElementaryStream;
          var MP2T_PACKET_LENGTH = 188,
            SYNC_BYTE = 0x47;
          TransportPacketStream = function () {
            var buffer = new Uint8Array(MP2T_PACKET_LENGTH),
              bytesInBuffer = 0;
            TransportPacketStream.prototype.init.call(this);
            this.push = function (bytes) {
              var startIndex = 0,
                endIndex = MP2T_PACKET_LENGTH,
                everything;
              if (bytesInBuffer) {
                everything = new Uint8Array(bytes.byteLength + bytesInBuffer);
                everything.set(buffer.subarray(0, bytesInBuffer));
                everything.set(bytes, bytesInBuffer);
                bytesInBuffer = 0;
              } else {
                everything = bytes;
              }
              while (endIndex < everything.byteLength) {
                if (everything[startIndex] === SYNC_BYTE && everything[endIndex] === SYNC_BYTE) {
                  this.trigger("data", everything.subarray(startIndex, endIndex));
                  startIndex += MP2T_PACKET_LENGTH;
                  endIndex += MP2T_PACKET_LENGTH;
                  continue;
                }
                startIndex++;
                endIndex++;
              }
              if (startIndex < everything.byteLength) {
                buffer.set(everything.subarray(startIndex), 0);
                bytesInBuffer = everything.byteLength - startIndex;
              }
            };
            this.flush = function () {
              if (bytesInBuffer === MP2T_PACKET_LENGTH && buffer[0] === SYNC_BYTE) {
                this.trigger("data", buffer);
                bytesInBuffer = 0;
              }
              this.trigger("done");
            };
          };
          TransportPacketStream.prototype = new Stream();
          TransportParseStream = function () {
            var parsePsi, parsePat, parsePmt, self;
            TransportParseStream.prototype.init.call(this);
            self = this;
            this.packetsWaitingForPmt = [];
            this.programMapTable = undefined;
            parsePsi = function (payload, psi) {
              var offset = 0;
              if (psi.payloadUnitStartIndicator) {
                offset += payload[offset] + 1;
              }
              if (psi.type === "pat") {
                parsePat(payload.subarray(offset), psi);
              } else {
                parsePmt(payload.subarray(offset), psi);
              }
            };
            parsePat = function (payload, pat) {
              pat.section_number = payload[7];
              pat.last_section_number = payload[8];
              self.pmtPid = ((payload[10] & 0x1f) << 8) | payload[11];
              pat.pmtPid = self.pmtPid;
            };
            parsePmt = function (payload, pmt) {
              var sectionLength, tableEnd, programInfoLength, offset;
              if (!(payload[5] & 0x01)) {
                return;
              }
              self.programMapTable = {};
              sectionLength = ((payload[1] & 0x0f) << 8) | payload[2];
              tableEnd = 3 + sectionLength - 4;
              programInfoLength = ((payload[10] & 0x0f) << 8) | payload[11];
              offset = 12 + programInfoLength;
              while (offset < tableEnd) {
                self.programMapTable[((payload[offset + 1] & 0x1f) << 8) | payload[offset + 2]] = payload[offset];
                offset += (((payload[offset + 3] & 0x0f) << 8) | payload[offset + 4]) + 5;
              }
              pmt.programMapTable = self.programMapTable;
              while (self.packetsWaitingForPmt.length) {
                self.processPes_.apply(self, self.packetsWaitingForPmt.shift());
              }
            };
            this.push = function (packet) {
              var result = {},
                offset = 4;
              result.payloadUnitStartIndicator = !!(packet[1] & 0x40);
              result.pid = packet[1] & 0x1f;
              result.pid <<= 8;
              result.pid |= packet[2];
              if ((packet[3] & 0x30) >>> 4 > 0x01) {
                offset += packet[offset] + 1;
              }
              if (result.pid === 0) {
                result.type = "pat";
                parsePsi(packet.subarray(offset), result);
                this.trigger("data", result);
              } else if (result.pid === this.pmtPid) {
                result.type = "pmt";
                parsePsi(packet.subarray(offset), result);
                this.trigger("data", result);
              } else if (this.programMapTable === undefined) {
                this.packetsWaitingForPmt.push([packet, offset, result]);
              } else {
                this.processPes_(packet, offset, result);
              }
            };
            this.processPes_ = function (packet, offset, result) {
              result.streamType = this.programMapTable[result.pid];
              result.type = "pes";
              result.data = packet.subarray(offset);
              this.trigger("data", result);
            };
          };
          TransportParseStream.prototype = new Stream();
          TransportParseStream.STREAM_TYPES = { h264: 0x1b, adts: 0x0f };
          ElementaryStream = function () {
            var self = this,
              video = { data: [], size: 0 },
              audio = { data: [], size: 0 },
              timedMetadata = { data: [], size: 0 },
              parsePes = function (payload, pes) {
                var ptsDtsFlags;
                pes.packetLength = 6 + ((payload[4] << 8) | payload[5]);
                pes.dataAlignmentIndicator = (payload[6] & 0x04) !== 0;
                ptsDtsFlags = payload[7];
                if (ptsDtsFlags & 0xc0) {
                  pes.pts = ((payload[9] & 0x0e) << 27) | ((payload[10] & 0xff) << 20) | ((payload[11] & 0xfe) << 12) | ((payload[12] & 0xff) << 5) | ((payload[13] & 0xfe) >>> 3);
                  pes.pts *= 4;
                  pes.pts += (payload[13] & 0x06) >>> 1;
                  pes.dts = pes.pts;
                  if (ptsDtsFlags & 0x40) {
                    pes.dts = ((payload[14] & 0x0e) << 27) | ((payload[15] & 0xff) << 20) | ((payload[16] & 0xfe) << 12) | ((payload[17] & 0xff) << 5) | ((payload[18] & 0xfe) >>> 3);
                    pes.dts *= 4;
                    pes.dts += (payload[18] & 0x06) >>> 1;
                  }
                }
                pes.data = payload.subarray(9 + payload[8]);
              },
              flushStream = function (stream, type, forceFlush) {
                var packetData = new Uint8Array(stream.size),
                  event = { type: type },
                  i = 0,
                  offset = 0,
                  packetFlushable = false,
                  fragment;
                if (!stream.data.length || stream.size < 9) {
                  return;
                }
                event.trackId = stream.data[0].pid;
                for (i = 0; i < stream.data.length; i++) {
                  fragment = stream.data[i];
                  packetData.set(fragment.data, offset);
                  offset += fragment.data.byteLength;
                }
                parsePes(packetData, event);
                packetFlushable = type === "video" || event.packetLength === stream.size;
                if (forceFlush || packetFlushable) {
                  stream.size = 0;
                  stream.data.length = 0;
                }
                if (packetFlushable) {
                  self.trigger("data", event);
                }
              };
            ElementaryStream.prototype.init.call(this);
            this.push = function (data) {
              ({
                pat: function () {},
                pes: function () {
                  var stream, streamType;
                  switch (data.streamType) {
                    case StreamTypes.H264_STREAM_TYPE:
                    case m2tsStreamTypes.H264_STREAM_TYPE:
                      stream = video;
                      streamType = "video";
                      break;
                    case StreamTypes.ADTS_STREAM_TYPE:
                      stream = audio;
                      streamType = "audio";
                      break;
                    case StreamTypes.METADATA_STREAM_TYPE:
                      stream = timedMetadata;
                      streamType = "timed-metadata";
                      break;
                    default:
                      return;
                  }
                  if (data.payloadUnitStartIndicator) {
                    flushStream(stream, streamType, true);
                  }
                  stream.data.push(data);
                  stream.size += data.data.byteLength;
                },
                pmt: function () {
                  var event = { type: "metadata", tracks: [] },
                    programMapTable = data.programMapTable,
                    k,
                    track;
                  for (k in programMapTable) {
                    if (programMapTable.hasOwnProperty(k)) {
                      track = { timelineStartInfo: { baseMediaDecodeTime: 0 } };
                      track.id = +k;
                      if (programMapTable[k] === m2tsStreamTypes.H264_STREAM_TYPE) {
                        track.codec = "avc";
                        track.type = "video";
                      } else if (programMapTable[k] === m2tsStreamTypes.ADTS_STREAM_TYPE) {
                        track.codec = "adts";
                        track.type = "audio";
                      }
                      event.tracks.push(track);
                    }
                  }
                  self.trigger("data", event);
                },
              }[data.type]());
            };
            this.flush = function () {
              flushStream(video, "video");
              flushStream(audio, "audio");
              flushStream(timedMetadata, "timed-metadata");
              this.trigger("done");
            };
          };
          ElementaryStream.prototype = new Stream();
          var m2ts = {
            PAT_PID: 0x0000,
            MP2T_PACKET_LENGTH: MP2T_PACKET_LENGTH,
            TransportPacketStream: TransportPacketStream,
            TransportParseStream: TransportParseStream,
            ElementaryStream: ElementaryStream,
            TimestampRolloverStream: TimestampRolloverStream,
            CaptionStream: CaptionStream.CaptionStream,
            Cea608Stream: CaptionStream.Cea608Stream,
            MetadataStream: require("./metadata-stream"),
          };
          for (var type in StreamTypes) {
            if (StreamTypes.hasOwnProperty(type)) {
              m2ts[type] = StreamTypes[type];
            }
          }
          module.exports = m2ts;
        },
        {
          "../utils/stream.js": 61,
          "./caption-stream": 48,
          "./metadata-stream": 50,
          "./stream-types": 52,
          "./stream-types.js": 52,
          "./timestamp-rollover-stream": 53,
        },
      ],
      50: [
        function (require, module, exports) {
          "use strict";
          var Stream = require("../utils/stream"),
            StreamTypes = require("./stream-types"),
            percentEncode = function (bytes, start, end) {
              var i,
                result = "";
              for (i = start; i < end; i++) {
                result += "%" + ("00" + bytes[i].toString(16)).slice(-2);
              }
              return result;
            },
            parseUtf8 = function (bytes, start, end) {
              return decodeURIComponent(percentEncode(bytes, start, end));
            },
            parseIso88591 = function (bytes, start, end) {
              return unescape(percentEncode(bytes, start, end));
            },
            parseSyncSafeInteger = function (data) {
              return (data[0] << 21) | (data[1] << 14) | (data[2] << 7) | data[3];
            },
            tagParsers = {
              TXXX: function (tag) {
                var i;
                if (tag.data[0] !== 3) {
                  return;
                }
                for (i = 1; i < tag.data.length; i++) {
                  if (tag.data[i] === 0) {
                    tag.description = parseUtf8(tag.data, 1, i);
                    tag.value = parseUtf8(tag.data, i + 1, tag.data.length).replace(/\0*$/, "");
                    break;
                  }
                }
                tag.data = tag.value;
              },
              WXXX: function (tag) {
                var i;
                if (tag.data[0] !== 3) {
                  return;
                }
                for (i = 1; i < tag.data.length; i++) {
                  if (tag.data[i] === 0) {
                    tag.description = parseUtf8(tag.data, 1, i);
                    tag.url = parseUtf8(tag.data, i + 1, tag.data.length);
                    break;
                  }
                }
              },
              PRIV: function (tag) {
                var i;
                for (i = 0; i < tag.data.length; i++) {
                  if (tag.data[i] === 0) {
                    tag.owner = parseIso88591(tag.data, 0, i);
                    break;
                  }
                }
                tag.privateData = tag.data.subarray(i + 1);
                tag.data = tag.privateData;
              },
            },
            MetadataStream;
          MetadataStream = function (options) {
            var settings = {
                debug: !!(options && options.debug),
                descriptor: options && options.descriptor,
              },
              tagSize = 0,
              buffer = [],
              bufferSize = 0,
              i;
            MetadataStream.prototype.init.call(this);
            this.dispatchType = StreamTypes.METADATA_STREAM_TYPE.toString(16);
            if (settings.descriptor) {
              for (i = 0; i < settings.descriptor.length; i++) {
                this.dispatchType += ("00" + settings.descriptor[i].toString(16)).slice(-2);
              }
            }
            this.push = function (chunk) {
              var tag, frameStart, frameSize, frame, i, frameHeader;
              if (chunk.type !== "timed-metadata") {
                return;
              }
              if (chunk.dataAlignmentIndicator) {
                bufferSize = 0;
                buffer.length = 0;
              }
              if (buffer.length === 0 && (chunk.data.length < 10 || chunk.data[0] !== "I".charCodeAt(0) || chunk.data[1] !== "D".charCodeAt(0) || chunk.data[2] !== "3".charCodeAt(0))) {
                if (settings.debug) {
                  console.log("Skipping unrecognized metadata packet");
                }
                return;
              }
              buffer.push(chunk);
              bufferSize += chunk.data.byteLength;
              if (buffer.length === 1) {
                tagSize = parseSyncSafeInteger(chunk.data.subarray(6, 10));
                tagSize += 10;
              }
              if (bufferSize < tagSize) {
                return;
              }
              tag = {
                data: new Uint8Array(tagSize),
                frames: [],
                pts: buffer[0].pts,
                dts: buffer[0].dts,
              };
              for (i = 0; i < tagSize; ) {
                tag.data.set(buffer[0].data.subarray(0, tagSize - i), i);
                i += buffer[0].data.byteLength;
                bufferSize -= buffer[0].data.byteLength;
                buffer.shift();
              }
              frameStart = 10;
              if (tag.data[5] & 0x40) {
                frameStart += 4;
                frameStart += parseSyncSafeInteger(tag.data.subarray(10, 14));
                tagSize -= parseSyncSafeInteger(tag.data.subarray(16, 20));
              }
              do {
                frameSize = parseSyncSafeInteger(tag.data.subarray(frameStart + 4, frameStart + 8));
                if (frameSize < 1) {
                  return console.log("Malformed ID3 frame encountered. Skipping metadata parsing.");
                }
                frameHeader = String.fromCharCode(tag.data[frameStart], tag.data[frameStart + 1], tag.data[frameStart + 2], tag.data[frameStart + 3]);
                frame = {
                  id: frameHeader,
                  data: tag.data.subarray(frameStart + 10, frameStart + frameSize + 10),
                };
                frame.key = frame.id;
                if (tagParsers[frame.id]) {
                  tagParsers[frame.id](frame);
                  if (frame.owner === "com.apple.streaming.transportStreamTimestamp") {
                    var d = frame.data,
                      size = ((d[3] & 0x01) << 30) | (d[4] << 22) | (d[5] << 14) | (d[6] << 6) | (d[7] >>> 2);
                    size *= 4;
                    size += d[7] & 0x03;
                    frame.timeStamp = size;
                    if (tag.pts === undefined && tag.dts === undefined) {
                      tag.pts = frame.timeStamp;
                      tag.dts = frame.timeStamp;
                    }
                    this.trigger("timestamp", frame);
                  }
                }
                tag.frames.push(frame);
                frameStart += 10;
                frameStart += frameSize;
              } while (frameStart < tagSize);
              this.trigger("data", tag);
            };
          };
          MetadataStream.prototype = new Stream();
          module.exports = MetadataStream;
        },
        { "../utils/stream": 61, "./stream-types": 52 },
      ],
      51: [
        function (require, module, exports) {
          "use strict";
          var StreamTypes = require("./stream-types.js");
          var parsePid = function (packet) {
            var pid = packet[1] & 0x1f;
            pid <<= 8;
            pid |= packet[2];
            return pid;
          };
          var parsePayloadUnitStartIndicator = function (packet) {
            return !!(packet[1] & 0x40);
          };
          var parseAdaptionField = function (packet) {
            var offset = 0;
            if ((packet[3] & 0x30) >>> 4 > 0x01) {
              offset += packet[4] + 1;
            }
            return offset;
          };
          var parseType = function (packet, pmtPid) {
            var pid = parsePid(packet);
            if (pid === 0) {
              return "pat";
            } else if (pid === pmtPid) {
              return "pmt";
            } else if (pmtPid) {
              return "pes";
            }
            return null;
          };
          var parsePat = function (packet) {
            var pusi = parsePayloadUnitStartIndicator(packet);
            var offset = 4 + parseAdaptionField(packet);
            if (pusi) {
              offset += packet[offset] + 1;
            }
            return ((packet[offset + 10] & 0x1f) << 8) | packet[offset + 11];
          };
          var parsePmt = function (packet) {
            var programMapTable = {};
            var pusi = parsePayloadUnitStartIndicator(packet);
            var payloadOffset = 4 + parseAdaptionField(packet);
            if (pusi) {
              payloadOffset += packet[payloadOffset] + 1;
            }
            if (!(packet[payloadOffset + 5] & 0x01)) {
              return;
            }
            var sectionLength, tableEnd, programInfoLength;
            sectionLength = ((packet[payloadOffset + 1] & 0x0f) << 8) | packet[payloadOffset + 2];
            tableEnd = 3 + sectionLength - 4;
            programInfoLength = ((packet[payloadOffset + 10] & 0x0f) << 8) | packet[payloadOffset + 11];
            var offset = 12 + programInfoLength;
            while (offset < tableEnd) {
              var i = payloadOffset + offset;
              programMapTable[((packet[i + 1] & 0x1f) << 8) | packet[i + 2]] = packet[i];
              offset += (((packet[i + 3] & 0x0f) << 8) | packet[i + 4]) + 5;
            }
            return programMapTable;
          };
          var parsePesType = function (packet, programMapTable) {
            var pid = parsePid(packet);
            var type = programMapTable[pid];
            switch (type) {
              case StreamTypes.H264_STREAM_TYPE:
                return "video";
              case StreamTypes.ADTS_STREAM_TYPE:
                return "audio";
              case StreamTypes.METADATA_STREAM_TYPE:
                return "timed-metadata";
              default:
                return null;
            }
          };
          var parsePesTime = function (packet) {
            var pusi = parsePayloadUnitStartIndicator(packet);
            if (!pusi) {
              return null;
            }
            var offset = 4 + parseAdaptionField(packet);
            if (offset >= packet.byteLength) {
              return null;
            }
            var pes = null;
            var ptsDtsFlags;
            ptsDtsFlags = packet[offset + 7];
            if (ptsDtsFlags & 0xc0) {
              pes = {};
              pes.pts =
                ((packet[offset + 9] & 0x0e) << 27) |
                ((packet[offset + 10] & 0xff) << 20) |
                ((packet[offset + 11] & 0xfe) << 12) |
                ((packet[offset + 12] & 0xff) << 5) |
                ((packet[offset + 13] & 0xfe) >>> 3);
              pes.pts *= 4;
              pes.pts += (packet[offset + 13] & 0x06) >>> 1;
              pes.dts = pes.pts;
              if (ptsDtsFlags & 0x40) {
                pes.dts =
                  ((packet[offset + 14] & 0x0e) << 27) |
                  ((packet[offset + 15] & 0xff) << 20) |
                  ((packet[offset + 16] & 0xfe) << 12) |
                  ((packet[offset + 17] & 0xff) << 5) |
                  ((packet[offset + 18] & 0xfe) >>> 3);
                pes.dts *= 4;
                pes.dts += (packet[offset + 18] & 0x06) >>> 1;
              }
            }
            return pes;
          };
          var parseNalUnitType = function (type) {
            switch (type) {
              case 0x05:
                return "slice_layer_without_partitioning_rbsp_idr";
              case 0x06:
                return "sei_rbsp";
              case 0x07:
                return "seq_parameter_set_rbsp";
              case 0x08:
                return "pic_parameter_set_rbsp";
              case 0x09:
                return "access_unit_delimiter_rbsp";
              default:
                return null;
            }
          };
          var videoPacketContainsKeyFrame = function (packet) {
            var offset = 4 + parseAdaptionField(packet);
            var frameBuffer = packet.subarray(offset);
            var frameI = 0;
            var frameSyncPoint = 0;
            var foundKeyFrame = false;
            var nalType;
            for (; frameSyncPoint < frameBuffer.byteLength - 3; frameSyncPoint++) {
              if (frameBuffer[frameSyncPoint + 2] === 1) {
                frameI = frameSyncPoint + 5;
                break;
              }
            }
            while (frameI < frameBuffer.byteLength) {
              switch (frameBuffer[frameI]) {
                case 0:
                  if (frameBuffer[frameI - 1] !== 0) {
                    frameI += 2;
                    break;
                  } else if (frameBuffer[frameI - 2] !== 0) {
                    frameI++;
                    break;
                  }
                  if (frameSyncPoint + 3 !== frameI - 2) {
                    nalType = parseNalUnitType(frameBuffer[frameSyncPoint + 3] & 0x1f);
                    if (nalType === "slice_layer_without_partitioning_rbsp_idr") {
                      foundKeyFrame = true;
                    }
                  }
                  do {
                    frameI++;
                  } while (frameBuffer[frameI] !== 1 && frameI < frameBuffer.length);
                  frameSyncPoint = frameI - 2;
                  frameI += 3;
                  break;
                case 1:
                  if (frameBuffer[frameI - 1] !== 0 || frameBuffer[frameI - 2] !== 0) {
                    frameI += 3;
                    break;
                  }
                  nalType = parseNalUnitType(frameBuffer[frameSyncPoint + 3] & 0x1f);
                  if (nalType === "slice_layer_without_partitioning_rbsp_idr") {
                    foundKeyFrame = true;
                  }
                  frameSyncPoint = frameI - 2;
                  frameI += 3;
                  break;
                default:
                  frameI += 3;
                  break;
              }
            }
            frameBuffer = frameBuffer.subarray(frameSyncPoint);
            frameI -= frameSyncPoint;
            frameSyncPoint = 0;
            if (frameBuffer && frameBuffer.byteLength > 3) {
              nalType = parseNalUnitType(frameBuffer[frameSyncPoint + 3] & 0x1f);
              if (nalType === "slice_layer_without_partitioning_rbsp_idr") {
                foundKeyFrame = true;
              }
            }
            return foundKeyFrame;
          };
          module.exports = {
            parseType: parseType,
            parsePat: parsePat,
            parsePmt: parsePmt,
            parsePayloadUnitStartIndicator: parsePayloadUnitStartIndicator,
            parsePesType: parsePesType,
            parsePesTime: parsePesTime,
            videoPacketContainsKeyFrame: videoPacketContainsKeyFrame,
          };
        },
        { "./stream-types.js": 52 },
      ],
      52: [
        function (require, module, exports) {
          "use strict";
          module.exports = {
            H264_STREAM_TYPE: 0x1b,
            ADTS_STREAM_TYPE: 0x0f,
            METADATA_STREAM_TYPE: 0x15,
          };
        },
        {},
      ],
      53: [
        function (require, module, exports) {
          "use strict";
          var Stream = require("../utils/stream");
          var MAX_TS = 8589934592;
          var RO_THRESH = 4294967296;
          var handleRollover = function (value, reference) {
            var direction = 1;
            if (value > reference) {
              direction = -1;
            }
            while (Math.abs(reference - value) > RO_THRESH) {
              value += direction * MAX_TS;
            }
            return value;
          };
          var TimestampRolloverStream = function (type) {
            var lastDTS, referenceDTS;
            TimestampRolloverStream.prototype.init.call(this);
            this.type_ = type;
            this.push = function (data) {
              if (data.type !== this.type_) {
                return;
              }
              if (referenceDTS === undefined) {
                referenceDTS = data.dts;
              }
              data.dts = handleRollover(data.dts, referenceDTS);
              data.pts = handleRollover(data.pts, referenceDTS);
              lastDTS = data.dts;
              this.trigger("data", data);
            };
            this.flush = function () {
              referenceDTS = lastDTS;
              this.trigger("done");
            };
            this.discontinuity = function () {
              referenceDTS = void 0;
              lastDTS = void 0;
            };
          };
          TimestampRolloverStream.prototype = new Stream();
          module.exports = {
            TimestampRolloverStream: TimestampRolloverStream,
            handleRollover: handleRollover,
          };
        },
        { "../utils/stream": 61 },
      ],
      54: [
        function (require, module, exports) {
          module.exports = {
            generator: require("./mp4-generator"),
            Transmuxer: require("./transmuxer").Transmuxer,
            AudioSegmentStream: require("./transmuxer").AudioSegmentStream,
            VideoSegmentStream: require("./transmuxer").VideoSegmentStream,
          };
        },
        { "./mp4-generator": 55, "./transmuxer": 57 },
      ],
      55: [
        function (require, module, exports) {
          "use strict";
          var UINT32_MAX = Math.pow(2, 32) - 1;
          var box,
            dinf,
            esds,
            ftyp,
            mdat,
            mfhd,
            minf,
            moof,
            moov,
            mvex,
            mvhd,
            trak,
            tkhd,
            mdia,
            mdhd,
            hdlr,
            sdtp,
            stbl,
            stsd,
            traf,
            trex,
            trun,
            types,
            MAJOR_BRAND,
            MINOR_VERSION,
            AVC1_BRAND,
            VIDEO_HDLR,
            AUDIO_HDLR,
            HDLR_TYPES,
            VMHD,
            SMHD,
            DREF,
            STCO,
            STSC,
            STSZ,
            STTS;
          (function () {
            var i;
            types = {
              avc1: [],
              avcC: [],
              btrt: [],
              dinf: [],
              dref: [],
              esds: [],
              ftyp: [],
              hdlr: [],
              mdat: [],
              mdhd: [],
              mdia: [],
              mfhd: [],
              minf: [],
              moof: [],
              moov: [],
              mp4a: [],
              mvex: [],
              mvhd: [],
              sdtp: [],
              smhd: [],
              stbl: [],
              stco: [],
              stsc: [],
              stsd: [],
              stsz: [],
              stts: [],
              styp: [],
              tfdt: [],
              tfhd: [],
              traf: [],
              trak: [],
              trun: [],
              trex: [],
              tkhd: [],
              vmhd: [],
            };
            if (typeof Uint8Array === "undefined") {
              return;
            }
            for (i in types) {
              if (types.hasOwnProperty(i)) {
                types[i] = [i.charCodeAt(0), i.charCodeAt(1), i.charCodeAt(2), i.charCodeAt(3)];
              }
            }
            MAJOR_BRAND = new Uint8Array(["i".charCodeAt(0), "s".charCodeAt(0), "o".charCodeAt(0), "m".charCodeAt(0)]);
            AVC1_BRAND = new Uint8Array(["a".charCodeAt(0), "v".charCodeAt(0), "c".charCodeAt(0), "1".charCodeAt(0)]);
            MINOR_VERSION = new Uint8Array([0, 0, 0, 1]);
            VIDEO_HDLR = new Uint8Array([
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x76,
              0x69,
              0x64,
              0x65,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x56,
              0x69,
              0x64,
              0x65,
              0x6f,
              0x48,
              0x61,
              0x6e,
              0x64,
              0x6c,
              0x65,
              0x72,
              0x00,
            ]);
            AUDIO_HDLR = new Uint8Array([
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x73,
              0x6f,
              0x75,
              0x6e,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x53,
              0x6f,
              0x75,
              0x6e,
              0x64,
              0x48,
              0x61,
              0x6e,
              0x64,
              0x6c,
              0x65,
              0x72,
              0x00,
            ]);
            HDLR_TYPES = { video: VIDEO_HDLR, audio: AUDIO_HDLR };
            DREF = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x0c, 0x75, 0x72, 0x6c, 0x20, 0x00, 0x00, 0x00, 0x01]);
            SMHD = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            STCO = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            STSC = STCO;
            STSZ = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            STTS = STCO;
            VMHD = new Uint8Array([0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
          })();
          box = function (type) {
            var payload = [],
              size = 0,
              i,
              result,
              view;
            for (i = 1; i < arguments.length; i++) {
              payload.push(arguments[i]);
            }
            i = payload.length;
            while (i--) {
              size += payload[i].byteLength;
            }
            result = new Uint8Array(size + 8);
            view = new DataView(result.buffer, result.byteOffset, result.byteLength);
            view.setUint32(0, result.byteLength);
            result.set(type, 4);
            for (i = 0, size = 8; i < payload.length; i++) {
              result.set(payload[i], size);
              size += payload[i].byteLength;
            }
            return result;
          };
          dinf = function () {
            return box(types.dinf, box(types.dref, DREF));
          };
          esds = function (track) {
            return box(
              types.esds,
              new Uint8Array([
                0x00,
                0x00,
                0x00,
                0x00,
                0x03,
                0x19,
                0x00,
                0x00,
                0x00,
                0x04,
                0x11,
                0x40,
                0x15,
                0x00,
                0x06,
                0x00,
                0x00,
                0x00,
                0xda,
                0xc0,
                0x00,
                0x00,
                0xda,
                0xc0,
                0x05,
                0x02,
                (track.audioobjecttype << 3) | (track.samplingfrequencyindex >>> 1),
                (track.samplingfrequencyindex << 7) | (track.channelcount << 3),
                0x06,
                0x01,
                0x02,
              ])
            );
          };
          ftyp = function () {
            return box(types.ftyp, MAJOR_BRAND, MINOR_VERSION, MAJOR_BRAND, AVC1_BRAND);
          };
          hdlr = function (type) {
            return box(types.hdlr, HDLR_TYPES[type]);
          };
          mdat = function (data) {
            return box(types.mdat, data);
          };
          mdhd = function (track) {
            var result = new Uint8Array([
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x02,
              0x00,
              0x00,
              0x00,
              0x03,
              0x00,
              0x01,
              0x5f,
              0x90,
              (track.duration >>> 24) & 0xff,
              (track.duration >>> 16) & 0xff,
              (track.duration >>> 8) & 0xff,
              track.duration & 0xff,
              0x55,
              0xc4,
              0x00,
              0x00,
            ]);
            if (track.samplerate) {
              result[12] = (track.samplerate >>> 24) & 0xff;
              result[13] = (track.samplerate >>> 16) & 0xff;
              result[14] = (track.samplerate >>> 8) & 0xff;
              result[15] = track.samplerate & 0xff;
            }
            return box(types.mdhd, result);
          };
          mdia = function (track) {
            return box(types.mdia, mdhd(track), hdlr(track.type), minf(track));
          };
          mfhd = function (sequenceNumber) {
            return box(
              types.mfhd,
              new Uint8Array([0x00, 0x00, 0x00, 0x00, (sequenceNumber & 0xff000000) >> 24, (sequenceNumber & 0xff0000) >> 16, (sequenceNumber & 0xff00) >> 8, sequenceNumber & 0xff])
            );
          };
          minf = function (track) {
            return box(types.minf, track.type === "video" ? box(types.vmhd, VMHD) : box(types.smhd, SMHD), dinf(), stbl(track));
          };
          moof = function (sequenceNumber, tracks) {
            var trackFragments = [],
              i = tracks.length;
            while (i--) {
              trackFragments[i] = traf(tracks[i]);
            }
            return box.apply(null, [types.moof, mfhd(sequenceNumber)].concat(trackFragments));
          };
          moov = function (tracks) {
            var i = tracks.length,
              boxes = [];
            while (i--) {
              boxes[i] = trak(tracks[i]);
            }
            return box.apply(null, [types.moov, mvhd(0xffffffff)].concat(boxes).concat(mvex(tracks)));
          };
          mvex = function (tracks) {
            var i = tracks.length,
              boxes = [];
            while (i--) {
              boxes[i] = trex(tracks[i]);
            }
            return box.apply(null, [types.mvex].concat(boxes));
          };
          mvhd = function (duration) {
            var bytes = new Uint8Array([
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x01,
              0x00,
              0x00,
              0x00,
              0x02,
              0x00,
              0x01,
              0x5f,
              0x90,
              (duration & 0xff000000) >> 24,
              (duration & 0xff0000) >> 16,
              (duration & 0xff00) >> 8,
              duration & 0xff,
              0x00,
              0x01,
              0x00,
              0x00,
              0x01,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x01,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x01,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x40,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0xff,
              0xff,
              0xff,
              0xff,
            ]);
            return box(types.mvhd, bytes);
          };
          sdtp = function (track) {
            var samples = track.samples || [],
              bytes = new Uint8Array(4 + samples.length),
              flags,
              i;
            for (i = 0; i < samples.length; i++) {
              flags = samples[i].flags;
              bytes[i + 4] = (flags.dependsOn << 4) | (flags.isDependedOn << 2) | flags.hasRedundancy;
            }
            return box(types.sdtp, bytes);
          };
          stbl = function (track) {
            return box(types.stbl, stsd(track), box(types.stts, STTS), box(types.stsc, STSC), box(types.stsz, STSZ), box(types.stco, STCO));
          };
          (function () {
            var videoSample, audioSample;
            stsd = function (track) {
              return box(types.stsd, new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]), track.type === "video" ? videoSample(track) : audioSample(track));
            };
            videoSample = function (track) {
              var sps = track.sps || [],
                pps = track.pps || [],
                sequenceParameterSets = [],
                pictureParameterSets = [],
                i;
              for (i = 0; i < sps.length; i++) {
                sequenceParameterSets.push((sps[i].byteLength & 0xff00) >>> 8);
                sequenceParameterSets.push(sps[i].byteLength & 0xff);
                sequenceParameterSets = sequenceParameterSets.concat(Array.prototype.slice.call(sps[i]));
              }
              for (i = 0; i < pps.length; i++) {
                pictureParameterSets.push((pps[i].byteLength & 0xff00) >>> 8);
                pictureParameterSets.push(pps[i].byteLength & 0xff);
                pictureParameterSets = pictureParameterSets.concat(Array.prototype.slice.call(pps[i]));
              }
              return box(
                types.avc1,
                new Uint8Array([
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x01,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  (track.width & 0xff00) >> 8,
                  track.width & 0xff,
                  (track.height & 0xff00) >> 8,
                  track.height & 0xff,
                  0x00,
                  0x48,
                  0x00,
                  0x00,
                  0x00,
                  0x48,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x01,
                  0x13,
                  0x76,
                  0x69,
                  0x64,
                  0x65,
                  0x6f,
                  0x6a,
                  0x73,
                  0x2d,
                  0x63,
                  0x6f,
                  0x6e,
                  0x74,
                  0x72,
                  0x69,
                  0x62,
                  0x2d,
                  0x68,
                  0x6c,
                  0x73,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x18,
                  0x11,
                  0x11,
                ]),
                box(
                  types.avcC,
                  new Uint8Array(
                    [0x01, track.profileIdc, track.profileCompatibility, track.levelIdc, 0xff].concat([sps.length]).concat(sequenceParameterSets).concat([pps.length]).concat(pictureParameterSets)
                  )
                ),
                box(types.btrt, new Uint8Array([0x00, 0x1c, 0x9c, 0x80, 0x00, 0x2d, 0xc6, 0xc0, 0x00, 0x2d, 0xc6, 0xc0]))
              );
            };
            audioSample = function (track) {
              return box(
                types.mp4a,
                new Uint8Array([
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x01,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  (track.channelcount & 0xff00) >> 8,
                  track.channelcount & 0xff,
                  (track.samplesize & 0xff00) >> 8,
                  track.samplesize & 0xff,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  (track.samplerate & 0xff00) >> 8,
                  track.samplerate & 0xff,
                  0x00,
                  0x00,
                ]),
                esds(track)
              );
            };
          })();
          tkhd = function (track) {
            var result = new Uint8Array([
              0x00,
              0x00,
              0x00,
              0x07,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              (track.id & 0xff000000) >> 24,
              (track.id & 0xff0000) >> 16,
              (track.id & 0xff00) >> 8,
              track.id & 0xff,
              0x00,
              0x00,
              0x00,
              0x00,
              (track.duration & 0xff000000) >> 24,
              (track.duration & 0xff0000) >> 16,
              (track.duration & 0xff00) >> 8,
              track.duration & 0xff,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x01,
              0x00,
              0x00,
              0x00,
              0x00,
              0x01,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x01,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x40,
              0x00,
              0x00,
              0x00,
              (track.width & 0xff00) >> 8,
              track.width & 0xff,
              0x00,
              0x00,
              (track.height & 0xff00) >> 8,
              track.height & 0xff,
              0x00,
              0x00,
            ]);
            return box(types.tkhd, result);
          };
          traf = function (track) {
            var trackFragmentHeader, trackFragmentDecodeTime, trackFragmentRun, sampleDependencyTable, dataOffset, upperWordBaseMediaDecodeTime, lowerWordBaseMediaDecodeTime;
            trackFragmentHeader = box(
              types.tfhd,
              new Uint8Array([
                0x00,
                0x00,
                0x00,
                0x3a,
                (track.id & 0xff000000) >> 24,
                (track.id & 0xff0000) >> 16,
                (track.id & 0xff00) >> 8,
                track.id & 0xff,
                0x00,
                0x00,
                0x00,
                0x01,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
              ])
            );
            upperWordBaseMediaDecodeTime = Math.floor(track.baseMediaDecodeTime / (UINT32_MAX + 1));
            lowerWordBaseMediaDecodeTime = Math.floor(track.baseMediaDecodeTime % (UINT32_MAX + 1));
            trackFragmentDecodeTime = box(
              types.tfdt,
              new Uint8Array([
                0x01,
                0x00,
                0x00,
                0x00,
                (upperWordBaseMediaDecodeTime >>> 24) & 0xff,
                (upperWordBaseMediaDecodeTime >>> 16) & 0xff,
                (upperWordBaseMediaDecodeTime >>> 8) & 0xff,
                upperWordBaseMediaDecodeTime & 0xff,
                (lowerWordBaseMediaDecodeTime >>> 24) & 0xff,
                (lowerWordBaseMediaDecodeTime >>> 16) & 0xff,
                (lowerWordBaseMediaDecodeTime >>> 8) & 0xff,
                lowerWordBaseMediaDecodeTime & 0xff,
              ])
            );
            dataOffset = 32 + 20 + 8 + 16 + 8 + 8;
            if (track.type === "audio") {
              trackFragmentRun = trun(track, dataOffset);
              return box(types.traf, trackFragmentHeader, trackFragmentDecodeTime, trackFragmentRun);
            }
            sampleDependencyTable = sdtp(track);
            trackFragmentRun = trun(track, sampleDependencyTable.length + dataOffset);
            return box(types.traf, trackFragmentHeader, trackFragmentDecodeTime, trackFragmentRun, sampleDependencyTable);
          };
          trak = function (track) {
            track.duration = track.duration || 0xffffffff;
            return box(types.trak, tkhd(track), mdia(track));
          };
          trex = function (track) {
            var result = new Uint8Array([
              0x00,
              0x00,
              0x00,
              0x00,
              (track.id & 0xff000000) >> 24,
              (track.id & 0xff0000) >> 16,
              (track.id & 0xff00) >> 8,
              track.id & 0xff,
              0x00,
              0x00,
              0x00,
              0x01,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x01,
              0x00,
              0x01,
            ]);
            if (track.type !== "video") {
              result[result.length - 1] = 0x00;
            }
            return box(types.trex, result);
          };
          (function () {
            var audioTrun, videoTrun, trunHeader;
            trunHeader = function (samples, offset) {
              var durationPresent = 0,
                sizePresent = 0,
                flagsPresent = 0,
                compositionTimeOffset = 0;
              if (samples.length) {
                if (samples[0].duration !== undefined) {
                  durationPresent = 0x1;
                }
                if (samples[0].size !== undefined) {
                  sizePresent = 0x2;
                }
                if (samples[0].flags !== undefined) {
                  flagsPresent = 0x4;
                }
                if (samples[0].compositionTimeOffset !== undefined) {
                  compositionTimeOffset = 0x8;
                }
              }
              return [
                0x00,
                0x00,
                durationPresent | sizePresent | flagsPresent | compositionTimeOffset,
                0x01,
                (samples.length & 0xff000000) >>> 24,
                (samples.length & 0xff0000) >>> 16,
                (samples.length & 0xff00) >>> 8,
                samples.length & 0xff,
                (offset & 0xff000000) >>> 24,
                (offset & 0xff0000) >>> 16,
                (offset & 0xff00) >>> 8,
                offset & 0xff,
              ];
            };
            videoTrun = function (track, offset) {
              var bytes, samples, sample, i;
              samples = track.samples || [];
              offset += 8 + 12 + 16 * samples.length;
              bytes = trunHeader(samples, offset);
              for (i = 0; i < samples.length; i++) {
                sample = samples[i];
                bytes = bytes.concat([
                  (sample.duration & 0xff000000) >>> 24,
                  (sample.duration & 0xff0000) >>> 16,
                  (sample.duration & 0xff00) >>> 8,
                  sample.duration & 0xff,
                  (sample.size & 0xff000000) >>> 24,
                  (sample.size & 0xff0000) >>> 16,
                  (sample.size & 0xff00) >>> 8,
                  sample.size & 0xff,
                  (sample.flags.isLeading << 2) | sample.flags.dependsOn,
                  (sample.flags.isDependedOn << 6) | (sample.flags.hasRedundancy << 4) | (sample.flags.paddingValue << 1) | sample.flags.isNonSyncSample,
                  sample.flags.degradationPriority & (0xf0 << 8),
                  sample.flags.degradationPriority & 0x0f,
                  (sample.compositionTimeOffset & 0xff000000) >>> 24,
                  (sample.compositionTimeOffset & 0xff0000) >>> 16,
                  (sample.compositionTimeOffset & 0xff00) >>> 8,
                  sample.compositionTimeOffset & 0xff,
                ]);
              }
              return box(types.trun, new Uint8Array(bytes));
            };
            audioTrun = function (track, offset) {
              var bytes, samples, sample, i;
              samples = track.samples || [];
              offset += 8 + 12 + 8 * samples.length;
              bytes = trunHeader(samples, offset);
              for (i = 0; i < samples.length; i++) {
                sample = samples[i];
                bytes = bytes.concat([
                  (sample.duration & 0xff000000) >>> 24,
                  (sample.duration & 0xff0000) >>> 16,
                  (sample.duration & 0xff00) >>> 8,
                  sample.duration & 0xff,
                  (sample.size & 0xff000000) >>> 24,
                  (sample.size & 0xff0000) >>> 16,
                  (sample.size & 0xff00) >>> 8,
                  sample.size & 0xff,
                ]);
              }
              return box(types.trun, new Uint8Array(bytes));
            };
            trun = function (track, offset) {
              if (track.type === "audio") {
                return audioTrun(track, offset);
              }
              return videoTrun(track, offset);
            };
          })();
          module.exports = {
            ftyp: ftyp,
            mdat: mdat,
            moof: moof,
            moov: moov,
            initSegment: function (tracks) {
              var fileType = ftyp(),
                movie = moov(tracks),
                result;
              result = new Uint8Array(fileType.byteLength + movie.byteLength);
              result.set(fileType);
              result.set(movie, fileType.byteLength);
              return result;
            },
          };
        },
        {},
      ],
      56: [
        function (require, module, exports) {
          "use strict";
          var findBox, parseType, timescale, startTime;
          findBox = function (data, path) {
            var results = [],
              i,
              size,
              type,
              end,
              subresults;
            if (!path.length) {
              return null;
            }
            for (i = 0; i < data.byteLength; ) {
              size = data[i] << 24;
              size |= data[i + 1] << 16;
              size |= data[i + 2] << 8;
              size |= data[i + 3];
              type = parseType(data.subarray(i + 4, i + 8));
              end = size > 1 ? i + size : data.byteLength;
              if (type === path[0]) {
                if (path.length === 1) {
                  results.push(data.subarray(i + 8, end));
                } else {
                  subresults = findBox(data.subarray(i + 8, end), path.slice(1));
                  if (subresults.length) {
                    results = results.concat(subresults);
                  }
                }
              }
              i = end;
            }
            return results;
          };
          parseType = function (buffer) {
            var result = "";
            result += String.fromCharCode(buffer[0]);
            result += String.fromCharCode(buffer[1]);
            result += String.fromCharCode(buffer[2]);
            result += String.fromCharCode(buffer[3]);
            return result;
          };
          timescale = function (init) {
            var result = {},
              traks = findBox(init, ["moov", "trak"]);
            return traks.reduce(function (result, trak) {
              var tkhd, version, index, id, mdhd;
              tkhd = findBox(trak, ["tkhd"])[0];
              if (!tkhd) {
                return null;
              }
              version = tkhd[0];
              index = version === 0 ? 12 : 20;
              id = (tkhd[index] << 24) | (tkhd[index + 1] << 16) | (tkhd[index + 2] << 8) | tkhd[index + 3];
              mdhd = findBox(trak, ["mdia", "mdhd"])[0];
              if (!mdhd) {
                return null;
              }
              version = mdhd[0];
              index = version === 0 ? 12 : 20;
              result[id] = (mdhd[index] << 24) | (mdhd[index + 1] << 16) | (mdhd[index + 2] << 8) | mdhd[index + 3];
              return result;
            }, result);
          };
          startTime = function (timescale, fragment) {
            var trafs, baseTimes, result;
            trafs = findBox(fragment, ["moof", "traf"]);
            baseTimes = [].concat.apply(
              [],
              trafs.map(function (traf) {
                return findBox(traf, ["tfhd"]).map(function (tfhd) {
                  var id, scale, baseTime;
                  id = (tfhd[4] << 24) | (tfhd[5] << 16) | (tfhd[6] << 8) | tfhd[7];
                  scale = timescale[id] || 90e3;
                  baseTime = findBox(traf, ["tfdt"]).map(function (tfdt) {
                    var version, result;
                    version = tfdt[0];
                    result = (tfdt[4] << 24) | (tfdt[5] << 16) | (tfdt[6] << 8) | tfdt[7];
                    if (version === 1) {
                      result *= Math.pow(2, 32);
                      result += (tfdt[8] << 24) | (tfdt[9] << 16) | (tfdt[10] << 8) | tfdt[11];
                    }
                    return result;
                  })[0];
                  baseTime = baseTime || Infinity;
                  return baseTime / scale;
                });
              })
            );
            result = Math.min.apply(null, baseTimes);
            return isFinite(result) ? result : 0;
          };
          module.exports = {
            parseType: parseType,
            timescale: timescale,
            startTime: startTime,
          };
        },
        {},
      ],
      57: [
        function (require, module, exports) {
          "use strict";
          var Stream = require("../utils/stream.js");
          var mp4 = require("./mp4-generator.js");
          var m2ts = require("../m2ts/m2ts.js");
          var AdtsStream = require("../codecs/adts.js");
          var H264Stream = require("../codecs/h264").H264Stream;
          var AacStream = require("../aac");
          var coneOfSilence = require("../data/silence");
          var clock = require("../utils/clock");
          var AUDIO_PROPERTIES = ["audioobjecttype", "channelcount", "samplerate", "samplingfrequencyindex", "samplesize"];
          var VIDEO_PROPERTIES = ["width", "height", "profileIdc", "levelIdc", "profileCompatibility"];
          var ONE_SECOND_IN_TS = 90000;
          var VideoSegmentStream, AudioSegmentStream, Transmuxer, CoalesceStream;
          var createDefaultSample, isLikelyAacData, collectDtsInfo, clearDtsInfo, calculateTrackBaseMediaDecodeTime, arrayEquals, sumFrameByteLengths;
          createDefaultSample = function () {
            return {
              size: 0,
              flags: {
                isLeading: 0,
                dependsOn: 1,
                isDependedOn: 0,
                hasRedundancy: 0,
                degradationPriority: 0,
              },
            };
          };
          isLikelyAacData = function (data) {
            if (data[0] === "I".charCodeAt(0) && data[1] === "D".charCodeAt(0) && data[2] === "3".charCodeAt(0)) {
              return true;
            }
            return false;
          };
          arrayEquals = function (a, b) {
            var i;
            if (a.length !== b.length) {
              return false;
            }
            for (i = 0; i < a.length; i++) {
              if (a[i] !== b[i]) {
                return false;
              }
            }
            return true;
          };
          sumFrameByteLengths = function (array) {
            var i,
              currentObj,
              sum = 0;
            for (i = 0; i < array.length; i++) {
              currentObj = array[i];
              sum += currentObj.data.byteLength;
            }
            return sum;
          };
          AudioSegmentStream = function (track) {
            var adtsFrames = [],
              sequenceNumber = 0,
              earliestAllowedDts = 0,
              audioAppendStartTs = 0,
              videoBaseMediaDecodeTime = Infinity;
            AudioSegmentStream.prototype.init.call(this);
            this.push = function (data) {
              collectDtsInfo(track, data);
              if (track) {
                AUDIO_PROPERTIES.forEach(function (prop) {
                  track[prop] = data[prop];
                });
              }
              adtsFrames.push(data);
            };
            this.setEarliestDts = function (earliestDts) {
              earliestAllowedDts = earliestDts - track.timelineStartInfo.baseMediaDecodeTime;
            };
            this.setVideoBaseMediaDecodeTime = function (baseMediaDecodeTime) {
              videoBaseMediaDecodeTime = baseMediaDecodeTime;
            };
            this.setAudioAppendStart = function (timestamp) {
              audioAppendStartTs = timestamp;
            };
            this.flush = function () {
              var frames, moof, mdat, boxes;
              if (adtsFrames.length === 0) {
                this.trigger("done", "AudioSegmentStream");
                return;
              }
              frames = this.trimAdtsFramesByEarliestDts_(adtsFrames);
              track.baseMediaDecodeTime = calculateTrackBaseMediaDecodeTime(track);
              this.prefixWithSilence_(track, frames);
              track.samples = this.generateSampleTable_(frames);
              mdat = mp4.mdat(this.concatenateFrameData_(frames));
              adtsFrames = [];
              moof = mp4.moof(sequenceNumber, [track]);
              boxes = new Uint8Array(moof.byteLength + mdat.byteLength);
              sequenceNumber++;
              boxes.set(moof);
              boxes.set(mdat, moof.byteLength);
              clearDtsInfo(track);
              this.trigger("data", { track: track, boxes: boxes });
              this.trigger("done", "AudioSegmentStream");
            };
            this.prefixWithSilence_ = function (track, frames) {
              var baseMediaDecodeTimeTs,
                frameDuration = 0,
                audioGapDuration = 0,
                audioFillFrameCount = 0,
                audioFillDuration = 0,
                silentFrame,
                i;
              if (!frames.length) {
                return;
              }
              baseMediaDecodeTimeTs = clock.audioTsToVideoTs(track.baseMediaDecodeTime, track.samplerate);
              frameDuration = Math.ceil(ONE_SECOND_IN_TS / (track.samplerate / 1024));
              if (audioAppendStartTs && videoBaseMediaDecodeTime) {
                audioGapDuration = baseMediaDecodeTimeTs - Math.max(audioAppendStartTs, videoBaseMediaDecodeTime);
                audioFillFrameCount = Math.floor(audioGapDuration / frameDuration);
                audioFillDuration = audioFillFrameCount * frameDuration;
              }
              if (audioFillFrameCount < 1 || audioFillDuration > ONE_SECOND_IN_TS / 2) {
                return;
              }
              silentFrame = coneOfSilence[track.samplerate];
              if (!silentFrame) {
                silentFrame = frames[0].data;
              }
              for (i = 0; i < audioFillFrameCount; i++) {
                frames.splice(i, 0, { data: silentFrame });
              }
              track.baseMediaDecodeTime -= Math.floor(clock.videoTsToAudioTs(audioFillDuration, track.samplerate));
            };
            this.trimAdtsFramesByEarliestDts_ = function (adtsFrames) {
              if (track.minSegmentDts >= earliestAllowedDts) {
                return adtsFrames;
              }
              track.minSegmentDts = Infinity;
              return adtsFrames.filter(function (currentFrame) {
                if (currentFrame.dts >= earliestAllowedDts) {
                  track.minSegmentDts = Math.min(track.minSegmentDts, currentFrame.dts);
                  track.minSegmentPts = track.minSegmentDts;
                  return true;
                }
                return false;
              });
            };
            this.generateSampleTable_ = function (frames) {
              var i,
                currentFrame,
                samples = [];
              for (i = 0; i < frames.length; i++) {
                currentFrame = frames[i];
                samples.push({
                  size: currentFrame.data.byteLength,
                  duration: 1024,
                });
              }
              return samples;
            };
            this.concatenateFrameData_ = function (frames) {
              var i,
                currentFrame,
                dataOffset = 0,
                data = new Uint8Array(sumFrameByteLengths(frames));
              for (i = 0; i < frames.length; i++) {
                currentFrame = frames[i];
                data.set(currentFrame.data, dataOffset);
                dataOffset += currentFrame.data.byteLength;
              }
              return data;
            };
          };
          AudioSegmentStream.prototype = new Stream();
          VideoSegmentStream = function (track) {
            var sequenceNumber = 0,
              nalUnits = [],
              config,
              pps;
            VideoSegmentStream.prototype.init.call(this);
            delete track.minPTS;
            this.gopCache_ = [];
            this.push = function (nalUnit) {
              collectDtsInfo(track, nalUnit);
              if (nalUnit.nalUnitType === "seq_parameter_set_rbsp" && !config) {
                config = nalUnit.config;
                track.sps = [nalUnit.data];
                VIDEO_PROPERTIES.forEach(function (prop) {
                  track[prop] = config[prop];
                }, this);
              }
              if (nalUnit.nalUnitType === "pic_parameter_set_rbsp" && !pps) {
                pps = nalUnit.data;
                track.pps = [nalUnit.data];
              }
              nalUnits.push(nalUnit);
            };
            this.flush = function () {
              var frames, gopForFusion, gops, moof, mdat, boxes;
              while (nalUnits.length) {
                if (nalUnits[0].nalUnitType === "access_unit_delimiter_rbsp") {
                  break;
                }
                nalUnits.shift();
              }
              if (nalUnits.length === 0) {
                this.resetStream_();
                this.trigger("done", "VideoSegmentStream");
                return;
              }
              frames = this.groupNalsIntoFrames_(nalUnits);
              gops = this.groupFramesIntoGops_(frames);
              if (!gops[0][0].keyFrame) {
                gopForFusion = this.getGopForFusion_(nalUnits[0], track);
                if (gopForFusion) {
                  gops.unshift(gopForFusion);
                  gops.byteLength += gopForFusion.byteLength;
                  gops.nalCount += gopForFusion.nalCount;
                  gops.pts = gopForFusion.pts;
                  gops.dts = gopForFusion.dts;
                  gops.duration += gopForFusion.duration;
                } else {
                  gops = this.extendFirstKeyFrame_(gops);
                }
              }
              collectDtsInfo(track, gops);
              track.samples = this.generateSampleTable_(gops);
              mdat = mp4.mdat(this.concatenateNalData_(gops));
              this.gopCache_.unshift({
                gop: gops.pop(),
                pps: track.pps,
                sps: track.sps,
              });
              this.gopCache_.length = Math.min(6, this.gopCache_.length);
              nalUnits = [];
              track.baseMediaDecodeTime = calculateTrackBaseMediaDecodeTime(track);
              this.trigger("baseMediaDecodeTime", track.baseMediaDecodeTime);
              this.trigger("timelineStartInfo", track.timelineStartInfo);
              moof = mp4.moof(sequenceNumber, [track]);
              boxes = new Uint8Array(moof.byteLength + mdat.byteLength);
              sequenceNumber++;
              boxes.set(moof);
              boxes.set(mdat, moof.byteLength);
              this.trigger("data", { track: track, boxes: boxes });
              this.resetStream_();
              this.trigger("done", "VideoSegmentStream");
            };
            this.resetStream_ = function () {
              clearDtsInfo(track);
              config = undefined;
              pps = undefined;
            };
            this.getGopForFusion_ = function (nalUnit) {
              var halfSecond = 45000,
                allowableOverlap = 10000,
                nearestDistance = Infinity,
                dtsDistance,
                nearestGopObj,
                currentGop,
                currentGopObj,
                i;
              for (i = 0; i < this.gopCache_.length; i++) {
                currentGopObj = this.gopCache_[i];
                currentGop = currentGopObj.gop;
                if (!(track.pps && arrayEquals(track.pps[0], currentGopObj.pps[0])) || !(track.sps && arrayEquals(track.sps[0], currentGopObj.sps[0]))) {
                  continue;
                }
                if (currentGop.dts < track.timelineStartInfo.dts) {
                  continue;
                }
                dtsDistance = nalUnit.dts - currentGop.dts - currentGop.duration;
                if (dtsDistance >= -allowableOverlap && dtsDistance <= halfSecond) {
                  if (!nearestGopObj || nearestDistance > dtsDistance) {
                    nearestGopObj = currentGopObj;
                    nearestDistance = dtsDistance;
                  }
                }
              }
              if (nearestGopObj) {
                return nearestGopObj.gop;
              }
              return null;
            };
            this.extendFirstKeyFrame_ = function (gops) {
              var currentGop;
              if (!gops[0][0].keyFrame && gops.length > 1) {
                currentGop = gops.shift();
                gops.byteLength -= currentGop.byteLength;
                gops.nalCount -= currentGop.nalCount;
                gops[0][0].dts = currentGop.dts;
                gops[0][0].pts = currentGop.pts;
                gops[0][0].duration += currentGop.duration;
              }
              return gops;
            };
            this.groupNalsIntoFrames_ = function (nalUnits) {
              var i,
                currentNal,
                currentFrame = [],
                frames = [];
              currentFrame.byteLength = 0;
              for (i = 0; i < nalUnits.length; i++) {
                currentNal = nalUnits[i];
                if (currentNal.nalUnitType === "access_unit_delimiter_rbsp") {
                  if (currentFrame.length) {
                    currentFrame.duration = currentNal.dts - currentFrame.dts;
                    frames.push(currentFrame);
                  }
                  currentFrame = [currentNal];
                  currentFrame.byteLength = currentNal.data.byteLength;
                  currentFrame.pts = currentNal.pts;
                  currentFrame.dts = currentNal.dts;
                } else {
                  if (currentNal.nalUnitType === "slice_layer_without_partitioning_rbsp_idr") {
                    currentFrame.keyFrame = true;
                  }
                  currentFrame.duration = currentNal.dts - currentFrame.dts;
                  currentFrame.byteLength += currentNal.data.byteLength;
                  currentFrame.push(currentNal);
                }
              }
              if (frames.length && (!currentFrame.duration || currentFrame.duration <= 0)) {
                currentFrame.duration = frames[frames.length - 1].duration;
              }
              frames.push(currentFrame);
              return frames;
            };
            this.groupFramesIntoGops_ = function (frames) {
              var i,
                currentFrame,
                currentGop = [],
                gops = [];
              currentGop.byteLength = 0;
              currentGop.nalCount = 0;
              currentGop.duration = 0;
              currentGop.pts = frames[0].pts;
              currentGop.dts = frames[0].dts;
              gops.byteLength = 0;
              gops.nalCount = 0;
              gops.duration = 0;
              gops.pts = frames[0].pts;
              gops.dts = frames[0].dts;
              for (i = 0; i < frames.length; i++) {
                currentFrame = frames[i];
                if (currentFrame.keyFrame) {
                  if (currentGop.length) {
                    gops.push(currentGop);
                    gops.byteLength += currentGop.byteLength;
                    gops.nalCount += currentGop.nalCount;
                    gops.duration += currentGop.duration;
                  }
                  currentGop = [currentFrame];
                  currentGop.nalCount = currentFrame.length;
                  currentGop.byteLength = currentFrame.byteLength;
                  currentGop.pts = currentFrame.pts;
                  currentGop.dts = currentFrame.dts;
                  currentGop.duration = currentFrame.duration;
                } else {
                  currentGop.duration += currentFrame.duration;
                  currentGop.nalCount += currentFrame.length;
                  currentGop.byteLength += currentFrame.byteLength;
                  currentGop.push(currentFrame);
                }
              }
              if (gops.length && currentGop.duration <= 0) {
                currentGop.duration = gops[gops.length - 1].duration;
              }
              gops.byteLength += currentGop.byteLength;
              gops.nalCount += currentGop.nalCount;
              gops.duration += currentGop.duration;
              gops.push(currentGop);
              return gops;
            };
            this.generateSampleTable_ = function (gops, baseDataOffset) {
              var h,
                i,
                sample,
                currentGop,
                currentFrame,
                dataOffset = baseDataOffset || 0,
                samples = [];
              for (h = 0; h < gops.length; h++) {
                currentGop = gops[h];
                for (i = 0; i < currentGop.length; i++) {
                  currentFrame = currentGop[i];
                  sample = createDefaultSample();
                  sample.dataOffset = dataOffset;
                  sample.compositionTimeOffset = currentFrame.pts - currentFrame.dts;
                  sample.duration = currentFrame.duration;
                  sample.size = 4 * currentFrame.length;
                  sample.size += currentFrame.byteLength;
                  if (currentFrame.keyFrame) {
                    sample.flags.dependsOn = 2;
                  }
                  dataOffset += sample.size;
                  samples.push(sample);
                }
              }
              return samples;
            };
            this.concatenateNalData_ = function (gops) {
              var h,
                i,
                j,
                currentGop,
                currentFrame,
                currentNal,
                dataOffset = 0,
                nalsByteLength = gops.byteLength,
                numberOfNals = gops.nalCount,
                totalByteLength = nalsByteLength + 4 * numberOfNals,
                data = new Uint8Array(totalByteLength),
                view = new DataView(data.buffer);
              for (h = 0; h < gops.length; h++) {
                currentGop = gops[h];
                for (i = 0; i < currentGop.length; i++) {
                  currentFrame = currentGop[i];
                  for (j = 0; j < currentFrame.length; j++) {
                    currentNal = currentFrame[j];
                    view.setUint32(dataOffset, currentNal.data.byteLength);
                    dataOffset += 4;
                    data.set(currentNal.data, dataOffset);
                    dataOffset += currentNal.data.byteLength;
                  }
                }
              }
              return data;
            };
          };
          VideoSegmentStream.prototype = new Stream();
          collectDtsInfo = function (track, data) {
            if (typeof data.pts === "number") {
              if (track.timelineStartInfo.pts === undefined) {
                track.timelineStartInfo.pts = data.pts;
              }
              if (track.minSegmentPts === undefined) {
                track.minSegmentPts = data.pts;
              } else {
                track.minSegmentPts = Math.min(track.minSegmentPts, data.pts);
              }
              if (track.maxSegmentPts === undefined) {
                track.maxSegmentPts = data.pts;
              } else {
                track.maxSegmentPts = Math.max(track.maxSegmentPts, data.pts);
              }
            }
            if (typeof data.dts === "number") {
              if (track.timelineStartInfo.dts === undefined) {
                track.timelineStartInfo.dts = data.dts;
              }
              if (track.minSegmentDts === undefined) {
                track.minSegmentDts = data.dts;
              } else {
                track.minSegmentDts = Math.min(track.minSegmentDts, data.dts);
              }
              if (track.maxSegmentDts === undefined) {
                track.maxSegmentDts = data.dts;
              } else {
                track.maxSegmentDts = Math.max(track.maxSegmentDts, data.dts);
              }
            }
          };
          clearDtsInfo = function (track) {
            delete track.minSegmentDts;
            delete track.maxSegmentDts;
            delete track.minSegmentPts;
            delete track.maxSegmentPts;
          };
          calculateTrackBaseMediaDecodeTime = function (track) {
            var baseMediaDecodeTime,
              scale,
              timeSinceStartOfTimeline = track.minSegmentDts - track.timelineStartInfo.dts;
            baseMediaDecodeTime = track.timelineStartInfo.baseMediaDecodeTime;
            baseMediaDecodeTime += timeSinceStartOfTimeline;
            baseMediaDecodeTime = Math.max(0, baseMediaDecodeTime);
            if (track.type === "audio") {
              scale = track.samplerate / ONE_SECOND_IN_TS;
              baseMediaDecodeTime *= scale;
              baseMediaDecodeTime = Math.floor(baseMediaDecodeTime);
            }
            return baseMediaDecodeTime;
          };
          CoalesceStream = function (options, metadataStream) {
            this.numberOfTracks = 0;
            this.metadataStream = metadataStream;
            if (typeof options.remux !== "undefined") {
              this.remuxTracks = !!options.remux;
            } else {
              this.remuxTracks = true;
            }
            this.pendingTracks = [];
            this.videoTrack = null;
            this.pendingBoxes = [];
            this.pendingCaptions = [];
            this.pendingMetadata = [];
            this.pendingBytes = 0;
            this.emittedTracks = 0;
            CoalesceStream.prototype.init.call(this);
            this.push = function (output) {
              if (output.text) {
                return this.pendingCaptions.push(output);
              }
              if (output.frames) {
                return this.pendingMetadata.push(output);
              }
              this.pendingTracks.push(output.track);
              this.pendingBoxes.push(output.boxes);
              this.pendingBytes += output.boxes.byteLength;
              if (output.track.type === "video") {
                this.videoTrack = output.track;
              }
              if (output.track.type === "audio") {
                this.audioTrack = output.track;
              }
            };
          };
          CoalesceStream.prototype = new Stream();
          CoalesceStream.prototype.flush = function (flushSource) {
            var offset = 0,
              event = { captions: [], metadata: [], info: {} },
              caption,
              id3,
              initSegment,
              timelineStartPts = 0,
              i;
            if (this.pendingTracks.length < this.numberOfTracks) {
              if (flushSource !== "VideoSegmentStream" && flushSource !== "AudioSegmentStream") {
                return;
              } else if (this.remuxTracks) {
                return;
              } else if (this.pendingTracks.length === 0) {
                this.emittedTracks++;
                if (this.emittedTracks >= this.numberOfTracks) {
                  this.trigger("done");
                  this.emittedTracks = 0;
                }
                return;
              }
            }
            if (this.videoTrack) {
              timelineStartPts = this.videoTrack.timelineStartInfo.pts;
              VIDEO_PROPERTIES.forEach(function (prop) {
                event.info[prop] = this.videoTrack[prop];
              }, this);
            } else if (this.audioTrack) {
              timelineStartPts = this.audioTrack.timelineStartInfo.pts;
              AUDIO_PROPERTIES.forEach(function (prop) {
                event.info[prop] = this.audioTrack[prop];
              }, this);
            }
            if (this.pendingTracks.length === 1) {
              event.type = this.pendingTracks[0].type;
            } else {
              event.type = "combined";
            }
            this.emittedTracks += this.pendingTracks.length;
            initSegment = mp4.initSegment(this.pendingTracks);
            event.initSegment = new Uint8Array(initSegment.byteLength);
            event.initSegment.set(initSegment);
            event.data = new Uint8Array(this.pendingBytes);
            for (i = 0; i < this.pendingBoxes.length; i++) {
              event.data.set(this.pendingBoxes[i], offset);
              offset += this.pendingBoxes[i].byteLength;
            }
            for (i = 0; i < this.pendingCaptions.length; i++) {
              caption = this.pendingCaptions[i];
              caption.startTime = caption.startPts - timelineStartPts;
              caption.startTime /= 90e3;
              caption.endTime = caption.endPts - timelineStartPts;
              caption.endTime /= 90e3;
              event.captions.push(caption);
            }
            for (i = 0; i < this.pendingMetadata.length; i++) {
              id3 = this.pendingMetadata[i];
              id3.cueTime = id3.pts - timelineStartPts;
              id3.cueTime /= 90e3;
              event.metadata.push(id3);
            }
            event.metadata.dispatchType = this.metadataStream.dispatchType;
            this.pendingTracks.length = 0;
            this.videoTrack = null;
            this.pendingBoxes.length = 0;
            this.pendingCaptions.length = 0;
            this.pendingBytes = 0;
            this.pendingMetadata.length = 0;
            this.trigger("data", event);
            if (this.emittedTracks >= this.numberOfTracks) {
              this.trigger("done");
              this.emittedTracks = 0;
            }
          };
          Transmuxer = function (options) {
            var self = this,
              hasFlushed = true,
              videoTrack,
              audioTrack;
            Transmuxer.prototype.init.call(this);
            options = options || {};
            this.baseMediaDecodeTime = options.baseMediaDecodeTime || 0;
            this.transmuxPipeline_ = {};
            this.setupAacPipeline = function () {
              var pipeline = {};
              this.transmuxPipeline_ = pipeline;
              pipeline.type = "aac";
              pipeline.metadataStream = new m2ts.MetadataStream();
              pipeline.aacStream = new AacStream();
              pipeline.audioTimestampRolloverStream = new m2ts.TimestampRolloverStream("audio");
              pipeline.timedMetadataTimestampRolloverStream = new m2ts.TimestampRolloverStream("timed-metadata");
              pipeline.adtsStream = new AdtsStream();
              pipeline.coalesceStream = new CoalesceStream(options, pipeline.metadataStream);
              pipeline.headOfPipeline = pipeline.aacStream;
              pipeline.aacStream.pipe(pipeline.audioTimestampRolloverStream).pipe(pipeline.adtsStream);
              pipeline.aacStream.pipe(pipeline.timedMetadataTimestampRolloverStream).pipe(pipeline.metadataStream).pipe(pipeline.coalesceStream);
              pipeline.metadataStream.on("timestamp", function (frame) {
                pipeline.aacStream.setTimestamp(frame.timeStamp);
              });
              pipeline.aacStream.on("data", function (data) {
                if (data.type === "timed-metadata" && !pipeline.audioSegmentStream) {
                  audioTrack = audioTrack || {
                    timelineStartInfo: {
                      baseMediaDecodeTime: self.baseMediaDecodeTime,
                    },
                    codec: "adts",
                    type: "audio",
                  };
                  pipeline.coalesceStream.numberOfTracks++;
                  pipeline.audioSegmentStream = new AudioSegmentStream(audioTrack);
                  pipeline.adtsStream.pipe(pipeline.audioSegmentStream).pipe(pipeline.coalesceStream);
                }
              });
              pipeline.coalesceStream.on("data", this.trigger.bind(this, "data"));
              pipeline.coalesceStream.on("done", this.trigger.bind(this, "done"));
            };
            this.setupTsPipeline = function () {
              var pipeline = {};
              this.transmuxPipeline_ = pipeline;
              pipeline.type = "ts";
              pipeline.metadataStream = new m2ts.MetadataStream();
              pipeline.packetStream = new m2ts.TransportPacketStream();
              pipeline.parseStream = new m2ts.TransportParseStream();
              pipeline.elementaryStream = new m2ts.ElementaryStream();
              pipeline.videoTimestampRolloverStream = new m2ts.TimestampRolloverStream("video");
              pipeline.audioTimestampRolloverStream = new m2ts.TimestampRolloverStream("audio");
              pipeline.timedMetadataTimestampRolloverStream = new m2ts.TimestampRolloverStream("timed-metadata");
              pipeline.adtsStream = new AdtsStream();
              pipeline.h264Stream = new H264Stream();
              pipeline.captionStream = new m2ts.CaptionStream();
              pipeline.coalesceStream = new CoalesceStream(options, pipeline.metadataStream);
              pipeline.headOfPipeline = pipeline.packetStream;
              pipeline.packetStream.pipe(pipeline.parseStream).pipe(pipeline.elementaryStream);
              pipeline.elementaryStream.pipe(pipeline.videoTimestampRolloverStream).pipe(pipeline.h264Stream);
              pipeline.elementaryStream.pipe(pipeline.audioTimestampRolloverStream).pipe(pipeline.adtsStream);
              pipeline.elementaryStream.pipe(pipeline.timedMetadataTimestampRolloverStream).pipe(pipeline.metadataStream).pipe(pipeline.coalesceStream);
              pipeline.h264Stream.pipe(pipeline.captionStream).pipe(pipeline.coalesceStream);
              pipeline.elementaryStream.on("data", function (data) {
                var i;
                if (data.type === "metadata") {
                  i = data.tracks.length;
                  while (i--) {
                    if (!videoTrack && data.tracks[i].type === "video") {
                      videoTrack = data.tracks[i];
                      videoTrack.timelineStartInfo.baseMediaDecodeTime = self.baseMediaDecodeTime;
                    } else if (!audioTrack && data.tracks[i].type === "audio") {
                      audioTrack = data.tracks[i];
                      audioTrack.timelineStartInfo.baseMediaDecodeTime = self.baseMediaDecodeTime;
                    }
                  }
                  if (videoTrack && !pipeline.videoSegmentStream) {
                    pipeline.coalesceStream.numberOfTracks++;
                    pipeline.videoSegmentStream = new VideoSegmentStream(videoTrack);
                    pipeline.videoSegmentStream.on("timelineStartInfo", function (timelineStartInfo) {
                      if (audioTrack) {
                        audioTrack.timelineStartInfo = timelineStartInfo;
                        pipeline.audioSegmentStream.setEarliestDts(timelineStartInfo.dts);
                      }
                    });
                    pipeline.videoSegmentStream.on("baseMediaDecodeTime", function (baseMediaDecodeTime) {
                      if (audioTrack) {
                        pipeline.audioSegmentStream.setVideoBaseMediaDecodeTime(baseMediaDecodeTime);
                      }
                    });
                    pipeline.h264Stream.pipe(pipeline.videoSegmentStream).pipe(pipeline.coalesceStream);
                  }
                  if (audioTrack && !pipeline.audioSegmentStream) {
                    pipeline.coalesceStream.numberOfTracks++;
                    pipeline.audioSegmentStream = new AudioSegmentStream(audioTrack);
                    pipeline.adtsStream.pipe(pipeline.audioSegmentStream).pipe(pipeline.coalesceStream);
                  }
                }
              });
              pipeline.coalesceStream.on("data", this.trigger.bind(this, "data"));
              pipeline.coalesceStream.on("done", this.trigger.bind(this, "done"));
            };
            this.setBaseMediaDecodeTime = function (baseMediaDecodeTime) {
              var pipeline = this.transmuxPipeline_;
              this.baseMediaDecodeTime = baseMediaDecodeTime;
              if (audioTrack) {
                audioTrack.timelineStartInfo.dts = undefined;
                audioTrack.timelineStartInfo.pts = undefined;
                clearDtsInfo(audioTrack);
                audioTrack.timelineStartInfo.baseMediaDecodeTime = baseMediaDecodeTime;
                if (pipeline.audioTimestampRolloverStream) {
                  pipeline.audioTimestampRolloverStream.discontinuity();
                }
              }
              if (videoTrack) {
                if (pipeline.videoSegmentStream) {
                  pipeline.videoSegmentStream.gopCache_ = [];
                  pipeline.videoTimestampRolloverStream.discontinuity();
                }
                videoTrack.timelineStartInfo.dts = undefined;
                videoTrack.timelineStartInfo.pts = undefined;
                clearDtsInfo(videoTrack);
                videoTrack.timelineStartInfo.baseMediaDecodeTime = baseMediaDecodeTime;
              }
              if (pipeline.timedMetadataTimestampRolloverStream) {
                pipeline.timedMetadataTimestampRolloverStream.discontinuity();
              }
            };
            this.setAudioAppendStart = function (timestamp) {
              if (audioTrack) {
                this.transmuxPipeline_.audioSegmentStream.setAudioAppendStart(timestamp);
              }
            };
            this.push = function (data) {
              if (hasFlushed) {
                var isAac = isLikelyAacData(data);
                if (isAac && this.transmuxPipeline_.type !== "aac") {
                  this.setupAacPipeline();
                } else if (!isAac && this.transmuxPipeline_.type !== "ts") {
                  this.setupTsPipeline();
                }
                hasFlushed = false;
              }
              this.transmuxPipeline_.headOfPipeline.push(data);
            };
            this.flush = function () {
              hasFlushed = true;
              this.transmuxPipeline_.headOfPipeline.flush();
            };
          };
          Transmuxer.prototype = new Stream();
          module.exports = {
            Transmuxer: Transmuxer,
            VideoSegmentStream: VideoSegmentStream,
            AudioSegmentStream: AudioSegmentStream,
            AUDIO_PROPERTIES: AUDIO_PROPERTIES,
            VIDEO_PROPERTIES: VIDEO_PROPERTIES,
          };
        },
        {
          "../aac": 37,
          "../codecs/adts.js": 39,
          "../codecs/h264": 40,
          "../data/silence": 41,
          "../m2ts/m2ts.js": 49,
          "../utils/clock": 59,
          "../utils/stream.js": 61,
          "./mp4-generator.js": 55,
        },
      ],
      58: [
        function (require, module, exports) {
          "use strict";
          var StreamTypes = require("../m2ts/stream-types.js");
          var handleRollover = require("../m2ts/timestamp-rollover-stream.js").handleRollover;
          var probe = {};
          probe.ts = require("../m2ts/probe.js");
          probe.aac = require("../aac/probe.js");
          var PES_TIMESCALE = 90000,
            MP2T_PACKET_LENGTH = 188,
            SYNC_BYTE = 0x47;
          var isLikelyAacData = function (data) {
            if (data[0] === "I".charCodeAt(0) && data[1] === "D".charCodeAt(0) && data[2] === "3".charCodeAt(0)) {
              return true;
            }
            return false;
          };
          var parsePsi_ = function (bytes, pmt) {
            var startIndex = 0,
              endIndex = MP2T_PACKET_LENGTH,
              packet,
              type;
            while (endIndex < bytes.byteLength) {
              if (bytes[startIndex] === SYNC_BYTE && bytes[endIndex] === SYNC_BYTE) {
                packet = bytes.subarray(startIndex, endIndex);
                type = probe.ts.parseType(packet, pmt.pid);
                switch (type) {
                  case "pat":
                    if (!pmt.pid) {
                      pmt.pid = probe.ts.parsePat(packet);
                    }
                    break;
                  case "pmt":
                    if (!pmt.table) {
                      pmt.table = probe.ts.parsePmt(packet);
                    }
                    break;
                  default:
                    break;
                }
                if (pmt.pid && pmt.table) {
                  return;
                }
                startIndex += MP2T_PACKET_LENGTH;
                endIndex += MP2T_PACKET_LENGTH;
                continue;
              }
              startIndex++;
              endIndex++;
            }
          };
          var parseAudioPes_ = function (bytes, pmt, result) {
            var startIndex = 0,
              endIndex = MP2T_PACKET_LENGTH,
              packet,
              type,
              pesType,
              pusi,
              parsed;
            var endLoop = false;
            while (endIndex < bytes.byteLength) {
              if (bytes[startIndex] === SYNC_BYTE && bytes[endIndex] === SYNC_BYTE) {
                packet = bytes.subarray(startIndex, endIndex);
                type = probe.ts.parseType(packet, pmt.pid);
                switch (type) {
                  case "pes":
                    pesType = probe.ts.parsePesType(packet, pmt.table);
                    pusi = probe.ts.parsePayloadUnitStartIndicator(packet);
                    if (pesType === "audio" && pusi) {
                      parsed = probe.ts.parsePesTime(packet);
                      if (parsed) {
                        parsed.type = "audio";
                        result.audio.push(parsed);
                        endLoop = true;
                      }
                    }
                    break;
                  default:
                    break;
                }
                if (endLoop) {
                  break;
                }
                startIndex += MP2T_PACKET_LENGTH;
                endIndex += MP2T_PACKET_LENGTH;
                continue;
              }
              startIndex++;
              endIndex++;
            }
            endIndex = bytes.byteLength;
            startIndex = endIndex - MP2T_PACKET_LENGTH;
            endLoop = false;
            while (startIndex >= 0) {
              if (bytes[startIndex] === SYNC_BYTE && bytes[endIndex] === SYNC_BYTE) {
                packet = bytes.subarray(startIndex, endIndex);
                type = probe.ts.parseType(packet, pmt.pid);
                switch (type) {
                  case "pes":
                    pesType = probe.ts.parsePesType(packet, pmt.table);
                    pusi = probe.ts.parsePayloadUnitStartIndicator(packet);
                    if (pesType === "audio" && pusi) {
                      parsed = probe.ts.parsePesTime(packet);
                      if (parsed) {
                        parsed.type = "audio";
                        result.audio.push(parsed);
                        endLoop = true;
                      }
                    }
                    break;
                  default:
                    break;
                }
                if (endLoop) {
                  break;
                }
                startIndex -= MP2T_PACKET_LENGTH;
                endIndex -= MP2T_PACKET_LENGTH;
                continue;
              }
              startIndex--;
              endIndex--;
            }
          };
          var parseVideoPes_ = function (bytes, pmt, result) {
            var startIndex = 0,
              endIndex = MP2T_PACKET_LENGTH,
              packet,
              type,
              pesType,
              pusi,
              parsed,
              frame,
              i,
              pes;
            var endLoop = false;
            var currentFrame = { data: [], size: 0 };
            while (endIndex < bytes.byteLength) {
              if (bytes[startIndex] === SYNC_BYTE && bytes[endIndex] === SYNC_BYTE) {
                packet = bytes.subarray(startIndex, endIndex);
                type = probe.ts.parseType(packet, pmt.pid);
                switch (type) {
                  case "pes":
                    pesType = probe.ts.parsePesType(packet, pmt.table);
                    pusi = probe.ts.parsePayloadUnitStartIndicator(packet);
                    if (pesType === "video") {
                      if (pusi && !endLoop) {
                        parsed = probe.ts.parsePesTime(packet);
                        if (parsed) {
                          parsed.type = "video";
                          result.video.push(parsed);
                          endLoop = true;
                        }
                      }
                      if (!result.firstKeyFrame) {
                        if (pusi) {
                          if (currentFrame.size !== 0) {
                            frame = new Uint8Array(currentFrame.size);
                            i = 0;
                            while (currentFrame.data.length) {
                              pes = currentFrame.data.shift();
                              frame.set(pes, i);
                              i += pes.byteLength;
                            }
                            if (probe.ts.videoPacketContainsKeyFrame(frame)) {
                              result.firstKeyFrame = probe.ts.parsePesTime(frame);
                              result.firstKeyFrame.type = "video";
                            }
                            currentFrame.size = 0;
                          }
                        }
                        currentFrame.data.push(packet);
                        currentFrame.size += packet.byteLength;
                      }
                    }
                    break;
                  default:
                    break;
                }
                if (endLoop && result.firstKeyFrame) {
                  break;
                }
                startIndex += MP2T_PACKET_LENGTH;
                endIndex += MP2T_PACKET_LENGTH;
                continue;
              }
              startIndex++;
              endIndex++;
            }
            endIndex = bytes.byteLength;
            startIndex = endIndex - MP2T_PACKET_LENGTH;
            endLoop = false;
            while (startIndex >= 0) {
              if (bytes[startIndex] === SYNC_BYTE && bytes[endIndex] === SYNC_BYTE) {
                packet = bytes.subarray(startIndex, endIndex);
                type = probe.ts.parseType(packet, pmt.pid);
                switch (type) {
                  case "pes":
                    pesType = probe.ts.parsePesType(packet, pmt.table);
                    pusi = probe.ts.parsePayloadUnitStartIndicator(packet);
                    if (pesType === "video" && pusi) {
                      parsed = probe.ts.parsePesTime(packet);
                      if (parsed) {
                        parsed.type = "video";
                        result.video.push(parsed);
                        endLoop = true;
                      }
                    }
                    break;
                  default:
                    break;
                }
                if (endLoop) {
                  break;
                }
                startIndex -= MP2T_PACKET_LENGTH;
                endIndex -= MP2T_PACKET_LENGTH;
                continue;
              }
              startIndex--;
              endIndex--;
            }
          };
          var adjustTimestamp_ = function (segmentInfo, baseTimestamp) {
            if (segmentInfo.audio && segmentInfo.audio.length) {
              var audioBaseTimestamp = baseTimestamp;
              if (typeof audioBaseTimestamp === "undefined") {
                audioBaseTimestamp = segmentInfo.audio[0].dts;
              }
              segmentInfo.audio.forEach(function (info) {
                info.dts = handleRollover(info.dts, audioBaseTimestamp);
                info.pts = handleRollover(info.pts, audioBaseTimestamp);
                info.dtsTime = info.dts / PES_TIMESCALE;
                info.ptsTime = info.pts / PES_TIMESCALE;
              });
            }
            if (segmentInfo.video && segmentInfo.video.length) {
              var videoBaseTimestamp = baseTimestamp;
              if (typeof videoBaseTimestamp === "undefined") {
                videoBaseTimestamp = segmentInfo.video[0].dts;
              }
              segmentInfo.video.forEach(function (info) {
                info.dts = handleRollover(info.dts, videoBaseTimestamp);
                info.pts = handleRollover(info.pts, videoBaseTimestamp);
                info.dtsTime = info.dts / PES_TIMESCALE;
                info.ptsTime = info.pts / PES_TIMESCALE;
              });
              if (segmentInfo.firstKeyFrame) {
                var frame = segmentInfo.firstKeyFrame;
                frame.dts = handleRollover(frame.dts, videoBaseTimestamp);
                frame.pts = handleRollover(frame.pts, videoBaseTimestamp);
                frame.dtsTime = frame.dts / PES_TIMESCALE;
                frame.ptsTime = frame.dts / PES_TIMESCALE;
              }
            }
          };
          var inspectAac_ = function (bytes) {
            var endLoop = false,
              audioCount = 0,
              sampleRate = null,
              timestamp = null,
              frameSize = 0,
              byteIndex = 0,
              packet;
            while (bytes.length - byteIndex >= 3) {
              var type = probe.aac.parseType(bytes, byteIndex);
              switch (type) {
                case "timed-metadata":
                  if (bytes.length - byteIndex < 10) {
                    endLoop = true;
                    break;
                  }
                  frameSize = probe.aac.parseId3TagSize(bytes, byteIndex);
                  if (frameSize > bytes.length) {
                    endLoop = true;
                    break;
                  }
                  if (timestamp === null) {
                    packet = bytes.subarray(byteIndex, byteIndex + frameSize);
                    timestamp = probe.aac.parseAacTimestamp(packet);
                  }
                  byteIndex += frameSize;
                  break;
                case "audio":
                  if (bytes.length - byteIndex < 7) {
                    endLoop = true;
                    break;
                  }
                  frameSize = probe.aac.parseAdtsSize(bytes, byteIndex);
                  if (frameSize > bytes.length) {
                    endLoop = true;
                    break;
                  }
                  if (sampleRate === null) {
                    packet = bytes.subarray(byteIndex, byteIndex + frameSize);
                    sampleRate = probe.aac.parseSampleRate(packet);
                  }
                  audioCount++;
                  byteIndex += frameSize;
                  break;
                default:
                  byteIndex++;
                  break;
              }
              if (endLoop) {
                return null;
              }
            }
            if (sampleRate === null || timestamp === null) {
              return null;
            }
            var audioTimescale = PES_TIMESCALE / sampleRate;
            var result = {
              audio: [
                { type: "audio", dts: timestamp, pts: timestamp },
                {
                  type: "audio",
                  dts: timestamp + audioCount * 1024 * audioTimescale,
                  pts: timestamp + audioCount * 1024 * audioTimescale,
                },
              ],
            };
            return result;
          };
          var inspectTs_ = function (bytes) {
            var pmt = { pid: null, table: null };
            var result = {};
            parsePsi_(bytes, pmt);
            for (var pid in pmt.table) {
              if (pmt.table.hasOwnProperty(pid)) {
                var type = pmt.table[pid];
                switch (type) {
                  case StreamTypes.H264_STREAM_TYPE:
                    result.video = [];
                    parseVideoPes_(bytes, pmt, result);
                    if (result.video.length === 0) {
                      delete result.video;
                    }
                    break;
                  case StreamTypes.ADTS_STREAM_TYPE:
                    result.audio = [];
                    parseAudioPes_(bytes, pmt, result);
                    if (result.audio.length === 0) {
                      delete result.audio;
                    }
                    break;
                  default:
                    break;
                }
              }
            }
            return result;
          };
          var inspect = function (bytes, baseTimestamp) {
            var isAacData = isLikelyAacData(bytes);
            var result;
            if (isAacData) {
              result = inspectAac_(bytes);
            } else {
              result = inspectTs_(bytes);
            }
            if (!result || (!result.audio && !result.video)) {
              return null;
            }
            adjustTimestamp_(result, baseTimestamp);
            return result;
          };
          module.exports = { inspect: inspect };
        },
        {
          "../aac/probe.js": 38,
          "../m2ts/probe.js": 51,
          "../m2ts/stream-types.js": 52,
          "../m2ts/timestamp-rollover-stream.js": 53,
        },
      ],
      59: [
        function (require, module, exports) {
          var ONE_SECOND_IN_TS = 90000,
            secondsToVideoTs,
            secondsToAudioTs,
            videoTsToSeconds,
            audioTsToSeconds,
            audioTsToVideoTs,
            videoTsToAudioTs;
          secondsToVideoTs = function (seconds) {
            return seconds * ONE_SECOND_IN_TS;
          };
          secondsToAudioTs = function (seconds, sampleRate) {
            return seconds * sampleRate;
          };
          videoTsToSeconds = function (timestamp) {
            return timestamp / ONE_SECOND_IN_TS;
          };
          audioTsToSeconds = function (timestamp, sampleRate) {
            return timestamp / sampleRate;
          };
          audioTsToVideoTs = function (timestamp, sampleRate) {
            return secondsToVideoTs(audioTsToSeconds(timestamp, sampleRate));
          };
          videoTsToAudioTs = function (timestamp, sampleRate) {
            return secondsToAudioTs(videoTsToSeconds(timestamp), sampleRate);
          };
          module.exports = {
            secondsToVideoTs: secondsToVideoTs,
            secondsToAudioTs: secondsToAudioTs,
            videoTsToSeconds: videoTsToSeconds,
            audioTsToSeconds: audioTsToSeconds,
            audioTsToVideoTs: audioTsToVideoTs,
            videoTsToAudioTs: videoTsToAudioTs,
          };
        },
        {},
      ],
      60: [
        function (require, module, exports) {
          "use strict";
          var ExpGolomb;
          ExpGolomb = function (workingData) {
            var workingBytesAvailable = workingData.byteLength,
              workingWord = 0,
              workingBitsAvailable = 0;
            this.length = function () {
              return 8 * workingBytesAvailable;
            };
            this.bitsAvailable = function () {
              return 8 * workingBytesAvailable + workingBitsAvailable;
            };
            this.loadWord = function () {
              var position = workingData.byteLength - workingBytesAvailable,
                workingBytes = new Uint8Array(4),
                availableBytes = Math.min(4, workingBytesAvailable);
              if (availableBytes === 0) {
                throw new Error("no bytes available");
              }
              workingBytes.set(workingData.subarray(position, position + availableBytes));
              workingWord = new DataView(workingBytes.buffer).getUint32(0);
              workingBitsAvailable = availableBytes * 8;
              workingBytesAvailable -= availableBytes;
            };
            this.skipBits = function (count) {
              var skipBytes;
              if (workingBitsAvailable > count) {
                workingWord <<= count;
                workingBitsAvailable -= count;
              } else {
                count -= workingBitsAvailable;
                skipBytes = Math.floor(count / 8);
                count -= skipBytes * 8;
                workingBytesAvailable -= skipBytes;
                this.loadWord();
                workingWord <<= count;
                workingBitsAvailable -= count;
              }
            };
            this.readBits = function (size) {
              var bits = Math.min(workingBitsAvailable, size),
                valu = workingWord >>> (32 - bits);
              workingBitsAvailable -= bits;
              if (workingBitsAvailable > 0) {
                workingWord <<= bits;
              } else if (workingBytesAvailable > 0) {
                this.loadWord();
              }
              bits = size - bits;
              if (bits > 0) {
                return (valu << bits) | this.readBits(bits);
              }
              return valu;
            };
            this.skipLeadingZeros = function () {
              var leadingZeroCount;
              for (leadingZeroCount = 0; leadingZeroCount < workingBitsAvailable; ++leadingZeroCount) {
                if ((workingWord & (0x80000000 >>> leadingZeroCount)) !== 0) {
                  workingWord <<= leadingZeroCount;
                  workingBitsAvailable -= leadingZeroCount;
                  return leadingZeroCount;
                }
              }
              this.loadWord();
              return leadingZeroCount + this.skipLeadingZeros();
            };
            this.skipUnsignedExpGolomb = function () {
              this.skipBits(1 + this.skipLeadingZeros());
            };
            this.skipExpGolomb = function () {
              this.skipBits(1 + this.skipLeadingZeros());
            };
            this.readUnsignedExpGolomb = function () {
              var clz = this.skipLeadingZeros();
              return this.readBits(clz + 1) - 1;
            };
            this.readExpGolomb = function () {
              var valu = this.readUnsignedExpGolomb();
              if (0x01 & valu) {
                return (1 + valu) >>> 1;
              }
              return -1 * (valu >>> 1);
            };
            this.readBoolean = function () {
              return this.readBits(1) === 1;
            };
            this.readUnsignedByte = function () {
              return this.readBits(8);
            };
            this.loadWord();
          };
          module.exports = ExpGolomb;
        },
        {},
      ],
      61: [
        function (require, module, exports) {
          "use strict";
          var Stream = function () {
            this.init = function () {
              var listeners = {};
              this.on = function (type, listener) {
                if (!listeners[type]) {
                  listeners[type] = [];
                }
                listeners[type] = listeners[type].concat(listener);
              };
              this.off = function (type, listener) {
                var index;
                if (!listeners[type]) {
                  return false;
                }
                index = listeners[type].indexOf(listener);
                listeners[type] = listeners[type].slice();
                listeners[type].splice(index, 1);
                return index > -1;
              };
              this.trigger = function (type) {
                var callbacks, i, length, args;
                callbacks = listeners[type];
                if (!callbacks) {
                  return;
                }
                if (arguments.length === 2) {
                  length = callbacks.length;
                  for (i = 0; i < length; ++i) {
                    callbacks[i].call(this, arguments[1]);
                  }
                } else {
                  args = [];
                  i = arguments.length;
                  for (i = 1; i < arguments.length; ++i) {
                    args.push(arguments[i]);
                  }
                  length = callbacks.length;
                  for (i = 0; i < length; ++i) {
                    callbacks[i].apply(this, args);
                  }
                }
              };
              this.dispose = function () {
                listeners = {};
              };
            };
          };
          Stream.prototype.pipe = function (destination) {
            this.on("data", function (data) {
              destination.push(data);
            });
            this.on("done", function (flushSource) {
              destination.flush(flushSource);
            });
            return destination;
          };
          Stream.prototype.push = function (data) {
            this.trigger("data", data);
          };
          Stream.prototype.flush = function (flushSource) {
            this.trigger("done", flushSource);
          };
          module.exports = Stream;
        },
        {},
      ],
      62: [
        function (require, module, exports) {
          (function (root) {
            var URLToolkit = {
              buildAbsoluteURL: function (baseURL, relativeURL) {
                relativeURL = relativeURL.trim();
                if (/^[a-z]+:/i.test(relativeURL)) {
                  return relativeURL;
                }
                var relativeURLQuery = null;
                var relativeURLHash = null;
                var relativeURLHashSplit = /^([^#]*)(.*)$/.exec(relativeURL);
                if (relativeURLHashSplit) {
                  relativeURLHash = relativeURLHashSplit[2];
                  relativeURL = relativeURLHashSplit[1];
                }
                var relativeURLQuerySplit = /^([^\?]*)(.*)$/.exec(relativeURL);
                if (relativeURLQuerySplit) {
                  relativeURLQuery = relativeURLQuerySplit[2];
                  relativeURL = relativeURLQuerySplit[1];
                }
                var baseURLHashSplit = /^([^#]*)(.*)$/.exec(baseURL);
                if (baseURLHashSplit) {
                  baseURL = baseURLHashSplit[1];
                }
                var baseURLQuerySplit = /^([^\?]*)(.*)$/.exec(baseURL);
                if (baseURLQuerySplit) {
                  baseURL = baseURLQuerySplit[1];
                }
                var baseURLDomainSplit = /^(([a-z]+:)?\/\/[^:\/]+(:[0-9]+)?)?(\/?.*)$/i.exec(baseURL);
                if (!baseURLDomainSplit) {
                  throw new Error("Error trying to parse base URL.");
                }
                var baseURLProtocol = baseURLDomainSplit[2] || "";
                var baseURLProtocolDomain = baseURLDomainSplit[1] || "";
                var baseURLPath = baseURLDomainSplit[4];
                if (baseURLPath.indexOf("/") !== 0 && baseURLProtocolDomain !== "") {
                  baseURLPath = "/" + baseURLPath;
                }
                var builtURL = null;
                if (/^\/\//.test(relativeURL)) {
                  builtURL = baseURLProtocol + "//" + URLToolkit.buildAbsolutePath("", relativeURL.substring(2));
                } else if (/^\//.test(relativeURL)) {
                  builtURL = baseURLProtocolDomain + "/" + URLToolkit.buildAbsolutePath("", relativeURL.substring(1));
                } else {
                  builtURL = URLToolkit.buildAbsolutePath(baseURLProtocolDomain + baseURLPath, relativeURL);
                }
                if (relativeURLQuery) {
                  builtURL += relativeURLQuery;
                }
                if (relativeURLHash) {
                  builtURL += relativeURLHash;
                }
                return builtURL;
              },
              buildAbsolutePath: function (basePath, relativePath) {
                var sRelPath = relativePath;
                var nUpLn,
                  sDir = "",
                  sPath = basePath.replace(/[^\/]*$/, sRelPath.replace(/(\/|^)(?:\.?\/+)+/g, "$1"));
                for (var nEnd, nStart = 0; (nEnd = sPath.indexOf("/../", nStart)), nEnd > -1; nStart = nEnd + nUpLn) {
                  nUpLn = /^\/(?:\.\.\/)*/.exec(sPath.slice(nEnd))[0].length;
                  sDir = (sDir + sPath.substring(nStart, nEnd)).replace(new RegExp("(?:\\/+[^\\/]*){0," + (nUpLn - 1) / 3 + "}$"), "/");
                }
                return sDir + sPath.substr(nStart);
              },
            };
            if (typeof exports === "object" && typeof module === "object") module.exports = URLToolkit;
            else if (typeof define === "function" && define.amd)
              define([], function () {
                return URLToolkit;
              });
            else if (typeof exports === "object") exports["URLToolkit"] = URLToolkit;
            else root["URLToolkit"] = URLToolkit;
          })(this);
        },
        {},
      ],
      63: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            var _globalWindow = require("global/window");
            var _globalWindow2 = _interopRequireDefault(_globalWindow);
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var deprecateOldCue = function deprecateOldCue(cue) {
              Object.defineProperties(cue.frame, {
                id: {
                  get: function get() {
                    _videoJs2["default"].log.warn("cue.frame.id is deprecated. Use cue.value.key instead.");
                    return cue.value.key;
                  },
                },
                value: {
                  get: function get() {
                    _videoJs2["default"].log.warn("cue.frame.value is deprecated. Use cue.value.data instead.");
                    return cue.value.data;
                  },
                },
                privateData: {
                  get: function get() {
                    _videoJs2["default"].log.warn("cue.frame.privateData is deprecated. Use cue.value.data instead.");
                    return cue.value.data;
                  },
                },
              });
            };
            var durationOfVideo = function durationOfVideo(duration) {
              var dur = undefined;
              if (isNaN(duration) || Math.abs(duration) === Infinity) {
                dur = Number.MAX_VALUE;
              } else {
                dur = duration;
              }
              return dur;
            };
            var addTextTrackData = function addTextTrackData(sourceHandler, captionArray, metadataArray) {
              var Cue = _globalWindow2["default"].WebKitDataCue || _globalWindow2["default"].VTTCue;
              if (captionArray) {
                captionArray.forEach(function (caption) {
                  this.inbandTextTrack_.addCue(new Cue(caption.startTime + this.timestampOffset, caption.endTime + this.timestampOffset, caption.text));
                }, sourceHandler);
              }
              if (metadataArray) {
                (function () {
                  var videoDuration = durationOfVideo(sourceHandler.mediaSource_.duration);
                  metadataArray.forEach(function (metadata) {
                    var time = metadata.cueTime + this.timestampOffset;
                    metadata.frames.forEach(function (frame) {
                      var cue = new Cue(time, time, frame.value || frame.url || frame.data || "");
                      cue.frame = frame;
                      cue.value = frame;
                      deprecateOldCue(cue);
                      this.metadataTrack_.addCue(cue);
                    }, this);
                  }, sourceHandler);
                  if (sourceHandler.metadataTrack_ && sourceHandler.metadataTrack_.cues && sourceHandler.metadataTrack_.cues.length) {
                    (function () {
                      var cues = sourceHandler.metadataTrack_.cues;
                      var cuesArray = [];
                      for (var i = 0; i < cues.length; i++) {
                        if (cues[i]) {
                          cuesArray.push(cues[i]);
                        }
                      }
                      var cuesGroupedByStartTime = cuesArray.reduce(function (obj, cue) {
                        var timeSlot = obj[cue.startTime] || [];
                        timeSlot.push(cue);
                        obj[cue.startTime] = timeSlot;
                        return obj;
                      }, {});
                      var sortedStartTimes = Object.keys(cuesGroupedByStartTime).sort(function (a, b) {
                        return Number(a) - Number(b);
                      });
                      sortedStartTimes.forEach(function (startTime, idx) {
                        var cueGroup = cuesGroupedByStartTime[startTime];
                        var nextTime = Number(sortedStartTimes[idx + 1]) || videoDuration;
                        cueGroup.forEach(function (cue) {
                          cue.endTime = nextTime;
                        });
                      });
                    })();
                  }
                })();
              }
            };
            exports["default"] = {
              addTextTrackData: addTextTrackData,
              durationOfVideo: durationOfVideo,
            };
            module.exports = exports["default"];
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        { "global/window": 31 },
      ],
      64: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var removeExistingTrack = function removeExistingTrack(player, kind, label) {
            var tracks = player.remoteTextTracks() || [];
            for (var i = 0; i < tracks.length; i++) {
              var track = tracks[i];
              if (track.kind === kind && track.label === label) {
                player.removeRemoteTextTrack(track);
              }
            }
          };
          exports.removeExistingTrack = removeExistingTrack;
          var cleanupTextTracks = function cleanupTextTracks(player) {
            removeExistingTrack(player, "captions", "cc1");
            removeExistingTrack(player, "metadata", "Timed Metadata");
          };
          exports.cleanupTextTracks = cleanupTextTracks;
        },
        {},
      ],
      65: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var isAudioCodec = function isAudioCodec(codec) {
            return /mp4a\.\d+.\d+/i.test(codec);
          };
          var isVideoCodec = function isVideoCodec(codec) {
            return /avc1\.[\da-f]+/i.test(codec);
          };
          var parseContentType = function parseContentType(type) {
            var object = { type: "", parameters: {} };
            var parameters = type.trim().split(";");
            object.type = parameters.shift().trim();
            parameters.forEach(function (parameter) {
              var pair = parameter.trim().split("=");
              if (pair.length > 1) {
                var _name = pair[0].replace(/"/g, "").trim();
                var value = pair[1].replace(/"/g, "").trim();
                object.parameters[_name] = value;
              }
            });
            return object;
          };
          var translateLegacyCodecs = function translateLegacyCodecs(codecs) {
            return codecs.map(function (codec) {
              return codec.replace(/avc1\.(\d+)\.(\d+)/i, function (orig, profile, avcLevel) {
                var profileHex = ("00" + Number(profile).toString(16)).slice(-2);
                var avcLevelHex = ("00" + Number(avcLevel).toString(16)).slice(-2);
                return "avc1." + profileHex + "00" + avcLevelHex;
              });
            });
          };
          exports["default"] = {
            isAudioCodec: isAudioCodec,
            parseContentType: parseContentType,
            isVideoCodec: isVideoCodec,
            translateLegacyCodecs: translateLegacyCodecs,
          };
          module.exports = exports["default"];
        },
        {},
      ],
      66: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var _cleanupTextTracks = require("./cleanup-text-tracks");
          var createTextTracksIfNecessary = function createTextTracksIfNecessary(sourceBuffer, mediaSource, segment) {
            var player = mediaSource.player_;
            if (segment.captions && segment.captions.length && !sourceBuffer.inbandTextTrack_) {
              (0, _cleanupTextTracks.removeExistingTrack)(player, "captions", "cc1");
              sourceBuffer.inbandTextTrack_ = player.addRemoteTextTrack({ kind: "captions", label: "cc1" }, false).track;
              player.tech_.trigger({ type: "usage", name: "hls-608" });
            }
            if (segment.metadata && segment.metadata.length && !sourceBuffer.metadataTrack_) {
              (0, _cleanupTextTracks.removeExistingTrack)(player, "metadata", "Timed Metadata", true);
              sourceBuffer.metadataTrack_ = player.addRemoteTextTrack({ kind: "metadata", label: "Timed Metadata" }, false).track;
              sourceBuffer.metadataTrack_.inBandMetadataTrackDispatchType = segment.metadata.dispatchType;
            }
          };
          exports["default"] = createTextTracksIfNecessary;
          module.exports = exports["default"];
        },
        { "./cleanup-text-tracks": 64 },
      ],
      67: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var flashConstants = {
            TIME_BETWEEN_CHUNKS: 1,
            BYTES_PER_CHUNK: 1024 * 32,
          };
          exports["default"] = flashConstants;
          module.exports = exports["default"];
        },
        {},
      ],
      68: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            var _createClass = (function () {
              function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ("value" in descriptor) descriptor.writable = true;
                  Object.defineProperty(target, descriptor.key, descriptor);
                }
              }
              return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
              };
            })();
            var _get = function get(_x, _x2, _x3) {
              var _again = true;
              _function: while (_again) {
                var object = _x,
                  property = _x2,
                  receiver = _x3;
                _again = false;
                if (object === null) object = Function.prototype;
                var desc = Object.getOwnPropertyDescriptor(object, property);
                if (desc === undefined) {
                  var parent = Object.getPrototypeOf(object);
                  if (parent === null) {
                    return undefined;
                  } else {
                    _x = parent;
                    _x2 = property;
                    _x3 = receiver;
                    _again = true;
                    desc = parent = undefined;
                    continue _function;
                  }
                } else if ("value" in desc) {
                  return desc.value;
                } else {
                  var getter = desc.get;
                  if (getter === undefined) {
                    return undefined;
                  }
                  return getter.call(receiver);
                }
              }
            };
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            function _classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            function _inherits(subClass, superClass) {
              if (typeof superClass !== "function" && superClass !== null) {
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
              }
              subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                  value: subClass,
                  enumerable: false,
                  writable: true,
                  configurable: true,
                },
              });
              if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
            }
            var _globalDocument = require("global/document");
            var _globalDocument2 = _interopRequireDefault(_globalDocument);
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var _flashSourceBuffer = require("./flash-source-buffer");
            var _flashSourceBuffer2 = _interopRequireDefault(_flashSourceBuffer);
            var _flashConstants = require("./flash-constants");
            var _flashConstants2 = _interopRequireDefault(_flashConstants);
            var _codecUtils = require("./codec-utils");
            var _cleanupTextTracks = require("./cleanup-text-tracks");
            var FlashMediaSource = (function (_videojs$EventTarget) {
              _inherits(FlashMediaSource, _videojs$EventTarget);
              function FlashMediaSource() {
                var _this = this;
                _classCallCheck(this, FlashMediaSource);
                _get(Object.getPrototypeOf(FlashMediaSource.prototype), "constructor", this).call(this);
                this.sourceBuffers = [];
                this.readyState = "closed";
                this.on(["sourceopen", "webkitsourceopen"], function (event) {
                  _this.swfObj = _globalDocument2["default"].getElementById(event.swfId);
                  _this.player_ = (0, _videoJs2["default"])(_this.swfObj.parentNode);
                  _this.tech_ = _this.swfObj.tech;
                  _this.readyState = "open";
                  _this.tech_.on("seeking", function () {
                    var i = _this.sourceBuffers.length;
                    while (i--) {
                      _this.sourceBuffers[i].abort();
                    }
                  });
                  if (_this.tech_.hls) {
                    _this.tech_.hls.on("dispose", function () {
                      (0, _cleanupTextTracks.cleanupTextTracks)(_this.player_);
                    });
                  }
                  if (_this.swfObj) {
                    _this.swfObj.vjs_load();
                  }
                });
              }
              _createClass(FlashMediaSource, [
                {
                  key: "addSeekableRange_",
                  value: function addSeekableRange_() {},
                },
                {
                  key: "addSourceBuffer",
                  value: function addSourceBuffer(type) {
                    var parsedType = (0, _codecUtils.parseContentType)(type);
                    var sourceBuffer = undefined;
                    if (parsedType.type === "video/mp2t" || parsedType.type === "audio/mp2t") {
                      sourceBuffer = new _flashSourceBuffer2["default"](this);
                    } else {
                      throw new Error("NotSupportedError (Video.js)");
                    }
                    this.sourceBuffers.push(sourceBuffer);
                    return sourceBuffer;
                  },
                },
                {
                  key: "endOfStream",
                  value: function endOfStream(error) {
                    if (error === "network") {
                      this.tech_.error(2);
                    } else if (error === "decode") {
                      this.tech_.error(3);
                    }
                    if (this.readyState !== "ended") {
                      this.readyState = "ended";
                      this.swfObj.vjs_endOfStream();
                    }
                  },
                },
              ]);
              return FlashMediaSource;
            })(_videoJs2["default"].EventTarget);
            exports["default"] = FlashMediaSource;
            try {
              Object.defineProperty(FlashMediaSource.prototype, "duration", {
                get: function get() {
                  if (!this.swfObj) {
                    return NaN;
                  }
                  return this.swfObj.vjs_getProperty("duration");
                },
                set: function set(value) {
                  var i = undefined;
                  var oldDuration = this.swfObj.vjs_getProperty("duration");
                  this.swfObj.vjs_setProperty("duration", value);
                  if (value < oldDuration) {
                    for (i = 0; i < this.sourceBuffers.length; i++) {
                      this.sourceBuffers[i].remove(value, oldDuration);
                    }
                  }
                  return value;
                },
              });
            } catch (e) {
              FlashMediaSource.prototype.duration = NaN;
            }
            for (var property in _flashConstants2["default"]) {
              FlashMediaSource[property] = _flashConstants2["default"][property];
            }
            module.exports = exports["default"];
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        {
          "./cleanup-text-tracks": 64,
          "./codec-utils": 65,
          "./flash-constants": 67,
          "./flash-source-buffer": 69,
          "global/document": 30,
        },
      ],
      69: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            var _createClass = (function () {
              function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ("value" in descriptor) descriptor.writable = true;
                  Object.defineProperty(target, descriptor.key, descriptor);
                }
              }
              return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
              };
            })();
            var _get = function get(_x, _x2, _x3) {
              var _again = true;
              _function: while (_again) {
                var object = _x,
                  property = _x2,
                  receiver = _x3;
                _again = false;
                if (object === null) object = Function.prototype;
                var desc = Object.getOwnPropertyDescriptor(object, property);
                if (desc === undefined) {
                  var parent = Object.getPrototypeOf(object);
                  if (parent === null) {
                    return undefined;
                  } else {
                    _x = parent;
                    _x2 = property;
                    _x3 = receiver;
                    _again = true;
                    desc = parent = undefined;
                    continue _function;
                  }
                } else if ("value" in desc) {
                  return desc.value;
                } else {
                  var getter = desc.get;
                  if (getter === undefined) {
                    return undefined;
                  }
                  return getter.call(receiver);
                }
              }
            };
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            function _classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            function _inherits(subClass, superClass) {
              if (typeof superClass !== "function" && superClass !== null) {
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
              }
              subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                  value: subClass,
                  enumerable: false,
                  writable: true,
                  configurable: true,
                },
              });
              if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
            }
            var _globalWindow = require("global/window");
            var _globalWindow2 = _interopRequireDefault(_globalWindow);
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var _muxJsLibFlv = require("mux.js/lib/flv");
            var _muxJsLibFlv2 = _interopRequireDefault(_muxJsLibFlv);
            var _removeCuesFromTrack = require("./remove-cues-from-track");
            var _removeCuesFromTrack2 = _interopRequireDefault(_removeCuesFromTrack);
            var _createTextTracksIfNecessary = require("./create-text-tracks-if-necessary");
            var _createTextTracksIfNecessary2 = _interopRequireDefault(_createTextTracksIfNecessary);
            var _addTextTrackData = require("./add-text-track-data");
            var _flashTransmuxerWorker = require("./flash-transmuxer-worker");
            var _flashTransmuxerWorker2 = _interopRequireDefault(_flashTransmuxerWorker);
            var _webworkify = require("webworkify");
            var _webworkify2 = _interopRequireDefault(_webworkify);
            var _flashConstants = require("./flash-constants");
            var _flashConstants2 = _interopRequireDefault(_flashConstants);
            var scheduleTick = function scheduleTick(func) {
              _globalWindow2["default"].setTimeout(func, _flashConstants2["default"].TIME_BETWEEN_CHUNKS);
            };
            var generateRandomString = function generateRandomString() {
              return Math.random().toString(36).slice(2, 8);
            };
            var toDecimalPlaces = function toDecimalPlaces(num, places) {
              if (typeof places !== "number" || places < 0) {
                places = 0;
              }
              var scale = Math.pow(10, places);
              return Math.round(num * scale) / scale;
            };
            var FlashSourceBuffer = (function (_videojs$EventTarget) {
              _inherits(FlashSourceBuffer, _videojs$EventTarget);
              function FlashSourceBuffer(mediaSource) {
                var _this = this;
                _classCallCheck(this, FlashSourceBuffer);
                _get(Object.getPrototypeOf(FlashSourceBuffer.prototype), "constructor", this).call(this);
                var encodedHeader = undefined;
                this.chunkSize_ = _flashConstants2["default"].BYTES_PER_CHUNK;
                this.buffer_ = [];
                this.bufferSize_ = 0;
                this.basePtsOffset_ = NaN;
                this.mediaSource_ = mediaSource;
                this.audioBufferEnd_ = NaN;
                this.videoBufferEnd_ = NaN;
                this.updating = false;
                this.timestampOffset_ = 0;
                encodedHeader = _globalWindow2["default"].btoa(String.fromCharCode.apply(null, Array.prototype.slice.call(_muxJsLibFlv2["default"].getFlvHeader())));
                var safePlayerId = this.mediaSource_.player_.id().replace(/[^a-zA-Z0-9]/g, "_");
                this.flashEncodedHeaderName_ = "vjs_flashEncodedHeader_" + safePlayerId + generateRandomString();
                this.flashEncodedDataName_ = "vjs_flashEncodedData_" + safePlayerId + generateRandomString();
                _globalWindow2["default"][this.flashEncodedHeaderName_] = function () {
                  delete _globalWindow2["default"][_this.flashEncodedHeaderName_];
                  return encodedHeader;
                };
                this.mediaSource_.swfObj.vjs_appendChunkReady(this.flashEncodedHeaderName_);
                this.transmuxer_ = (0, _webworkify2["default"])(_flashTransmuxerWorker2["default"]);
                this.transmuxer_.postMessage({ action: "init", options: {} });
                this.transmuxer_.onmessage = function (event) {
                  if (event.data.action === "data") {
                    _this.receiveBuffer_(event.data.segment);
                  }
                };
                this.one("updateend", function () {
                  _this.mediaSource_.tech_.trigger("loadedmetadata");
                });
                Object.defineProperty(this, "timestampOffset", {
                  get: function get() {
                    return this.timestampOffset_;
                  },
                  set: function set(val) {
                    if (typeof val === "number" && val >= 0) {
                      this.timestampOffset_ = val;
                      this.mediaSource_.swfObj.vjs_discontinuity();
                      this.basePtsOffset_ = NaN;
                      this.audioBufferEnd_ = NaN;
                      this.videoBufferEnd_ = NaN;
                      this.transmuxer_.postMessage({ action: "reset" });
                    }
                  },
                });
                Object.defineProperty(this, "buffered", {
                  get: function get() {
                    if (!this.mediaSource_ || !this.mediaSource_.swfObj || !("vjs_getProperty" in this.mediaSource_.swfObj)) {
                      return _videoJs2["default"].createTimeRange();
                    }
                    var buffered = this.mediaSource_.swfObj.vjs_getProperty("buffered");
                    if (buffered && buffered.length) {
                      buffered[0][0] = toDecimalPlaces(buffered[0][0], 3);
                      buffered[0][1] = toDecimalPlaces(buffered[0][1], 3);
                    }
                    return _videoJs2["default"].createTimeRanges(buffered);
                  },
                });
                this.mediaSource_.player_.on("seeked", function () {
                  (0, _removeCuesFromTrack2["default"])(0, Infinity, _this.metadataTrack_);
                  (0, _removeCuesFromTrack2["default"])(0, Infinity, _this.inbandTextTrack_);
                });
                this.mediaSource_.player_.tech_.hls.on("dispose", function () {
                  _this.transmuxer_.terminate();
                });
              }
              _createClass(FlashSourceBuffer, [
                {
                  key: "appendBuffer",
                  value: function appendBuffer(bytes) {
                    var error = undefined;
                    if (this.updating) {
                      error = new Error("SourceBuffer.append() cannot be called " + "while an update is in progress");
                      error.name = "InvalidStateError";
                      error.code = 11;
                      throw error;
                    }
                    this.updating = true;
                    this.mediaSource_.readyState = "open";
                    this.trigger({ type: "update" });
                    this.transmuxer_.postMessage(
                      {
                        action: "push",
                        data: bytes.buffer,
                        byteOffset: bytes.byteOffset,
                        byteLength: bytes.byteLength,
                      },
                      [bytes.buffer]
                    );
                    this.transmuxer_.postMessage({ action: "flush" });
                  },
                },
                {
                  key: "abort",
                  value: function abort() {
                    this.buffer_ = [];
                    this.bufferSize_ = 0;
                    this.mediaSource_.swfObj.vjs_abort();
                    if (this.updating) {
                      this.updating = false;
                      this.trigger({ type: "updateend" });
                    }
                  },
                },
                {
                  key: "remove",
                  value: function remove(start, end) {
                    (0, _removeCuesFromTrack2["default"])(start, end, this.metadataTrack_);
                    (0, _removeCuesFromTrack2["default"])(start, end, this.inbandTextTrack_);
                    this.trigger({ type: "update" });
                    this.trigger({ type: "updateend" });
                  },
                },
                {
                  key: "receiveBuffer_",
                  value: function receiveBuffer_(segment) {
                    var _this2 = this;
                    (0, _createTextTracksIfNecessary2["default"])(this, this.mediaSource_, segment);
                    (0, _addTextTrackData.addTextTrackData)(this, segment.captions, segment.metadata);
                    scheduleTick(function () {
                      var flvBytes = _this2.convertTagsToData_(segment);
                      if (_this2.buffer_.length === 0) {
                        scheduleTick(_this2.processBuffer_.bind(_this2));
                      }
                      if (flvBytes) {
                        _this2.buffer_.push(flvBytes);
                        _this2.bufferSize_ += flvBytes.byteLength;
                      }
                    });
                  },
                },
                {
                  key: "processBuffer_",
                  value: function processBuffer_() {
                    var _this3 = this;
                    var chunkSize = _flashConstants2["default"].BYTES_PER_CHUNK;
                    if (!this.buffer_.length) {
                      if (this.updating !== false) {
                        this.updating = false;
                        this.trigger({ type: "updateend" });
                      }
                      return;
                    }
                    var chunk = this.buffer_[0].subarray(0, chunkSize);
                    if (chunk.byteLength < chunkSize || this.buffer_[0].byteLength === chunkSize) {
                      this.buffer_.shift();
                    } else {
                      this.buffer_[0] = this.buffer_[0].subarray(chunkSize);
                    }
                    this.bufferSize_ -= chunk.byteLength;
                    var binary = [];
                    var length = chunk.byteLength;
                    for (var i = 0; i < length; i++) {
                      binary.push(String.fromCharCode(chunk[i]));
                    }
                    var b64str = _globalWindow2["default"].btoa(binary.join(""));
                    _globalWindow2["default"][this.flashEncodedDataName_] = function () {
                      scheduleTick(_this3.processBuffer_.bind(_this3));
                      delete _globalWindow2["default"][_this3.flashEncodedDataName_];
                      return b64str;
                    };
                    this.mediaSource_.swfObj.vjs_appendChunkReady(this.flashEncodedDataName_);
                  },
                },
                {
                  key: "convertTagsToData_",
                  value: function convertTagsToData_(segmentData) {
                    var segmentByteLength = 0;
                    var tech = this.mediaSource_.tech_;
                    var videoTargetPts = 0;
                    var segment = undefined;
                    var videoTags = segmentData.tags.videoTags;
                    var audioTags = segmentData.tags.audioTags;
                    if (isNaN(this.basePtsOffset_) && (videoTags.length || audioTags.length)) {
                      var firstVideoTag = videoTags[0] || { pts: Infinity };
                      var firstAudioTag = audioTags[0] || { pts: Infinity };
                      this.basePtsOffset_ = Math.min(firstAudioTag.pts, firstVideoTag.pts);
                    }
                    if (tech.seeking()) {
                      this.videoBufferEnd_ = NaN;
                      this.audioBufferEnd_ = NaN;
                    }
                    if (isNaN(this.videoBufferEnd_)) {
                      if (tech.buffered().length) {
                        videoTargetPts = tech.buffered().end(0) - this.timestampOffset;
                      }
                      if (tech.seeking()) {
                        videoTargetPts = Math.max(videoTargetPts, tech.currentTime() - this.timestampOffset);
                      }
                      videoTargetPts *= 1e3;
                      videoTargetPts += this.basePtsOffset_;
                    } else {
                      videoTargetPts = this.videoBufferEnd_ + 0.1;
                    }
                    var currentIndex = videoTags.length;
                    if (currentIndex && videoTags[currentIndex - 1].pts >= videoTargetPts) {
                      while (--currentIndex) {
                        var currentTag = videoTags[currentIndex];
                        if (currentTag.pts > videoTargetPts) {
                          continue;
                        }
                        if (currentTag.keyFrame || currentTag.metaDataTag) {
                          break;
                        }
                      }
                      while (currentIndex) {
                        var nextTag = videoTags[currentIndex - 1];
                        if (!nextTag.metaDataTag) {
                          break;
                        }
                        currentIndex--;
                      }
                    }
                    var filteredVideoTags = videoTags.slice(currentIndex);
                    var audioTargetPts = undefined;
                    if (isNaN(this.audioBufferEnd_)) {
                      audioTargetPts = videoTargetPts;
                    } else {
                      audioTargetPts = this.audioBufferEnd_ + 0.1;
                    }
                    if (filteredVideoTags.length) {
                      audioTargetPts = Math.min(audioTargetPts, filteredVideoTags[0].pts);
                    }
                    currentIndex = 0;
                    while (currentIndex < audioTags.length) {
                      if (audioTags[currentIndex].pts >= audioTargetPts) {
                        break;
                      }
                      currentIndex++;
                    }
                    var filteredAudioTags = audioTags.slice(currentIndex);
                    if (filteredAudioTags.length) {
                      this.audioBufferEnd_ = filteredAudioTags[filteredAudioTags.length - 1].pts;
                    }
                    if (filteredVideoTags.length) {
                      this.videoBufferEnd_ = filteredVideoTags[filteredVideoTags.length - 1].pts;
                    }
                    var tags = this.getOrderedTags_(filteredVideoTags, filteredAudioTags);
                    if (tags.length === 0) {
                      return;
                    }
                    if (tags[0].pts < videoTargetPts && tech.seeking()) {
                      var fudgeFactor = 1 / 30;
                      var currentTime = tech.currentTime();
                      var diff = (videoTargetPts - tags[0].pts) / 1e3;
                      var adjustedTime = currentTime - diff;
                      if (adjustedTime < fudgeFactor) {
                        adjustedTime = 0;
                      }
                      try {
                        this.mediaSource_.swfObj.vjs_adjustCurrentTime(adjustedTime);
                      } catch (e) {}
                    }
                    for (var i = 0; i < tags.length; i++) {
                      segmentByteLength += tags[i].bytes.byteLength;
                    }
                    segment = new Uint8Array(segmentByteLength);
                    for (var i = 0, j = 0; i < tags.length; i++) {
                      segment.set(tags[i].bytes, j);
                      j += tags[i].bytes.byteLength;
                    }
                    return segment;
                  },
                },
                {
                  key: "getOrderedTags_",
                  value: function getOrderedTags_(videoTags, audioTags) {
                    var tag = undefined;
                    var tags = [];
                    while (videoTags.length || audioTags.length) {
                      if (!videoTags.length) {
                        tag = audioTags.shift();
                      } else if (!audioTags.length) {
                        tag = videoTags.shift();
                      } else if (audioTags[0].dts < videoTags[0].dts) {
                        tag = audioTags.shift();
                      } else {
                        tag = videoTags.shift();
                      }
                      tags.push(tag);
                    }
                    return tags;
                  },
                },
              ]);
              return FlashSourceBuffer;
            })(_videoJs2["default"].EventTarget);
            exports["default"] = FlashSourceBuffer;
            module.exports = exports["default"];
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        {
          "./add-text-track-data": 63,
          "./create-text-tracks-if-necessary": 66,
          "./flash-constants": 67,
          "./flash-transmuxer-worker": 70,
          "./remove-cues-from-track": 72,
          "global/window": 31,
          "mux.js/lib/flv": 45,
          webworkify: 76,
        },
      ],
      70: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var _createClass = (function () {
            function defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            return function (Constructor, protoProps, staticProps) {
              if (protoProps) defineProperties(Constructor.prototype, protoProps);
              if (staticProps) defineProperties(Constructor, staticProps);
              return Constructor;
            };
          })();
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          var _globalWindow = require("global/window");
          var _globalWindow2 = _interopRequireDefault(_globalWindow);
          var _muxJsLibFlv = require("mux.js/lib/flv");
          var _muxJsLibFlv2 = _interopRequireDefault(_muxJsLibFlv);
          var wireTransmuxerEvents = function wireTransmuxerEvents(transmuxer) {
            transmuxer.on("data", function (segment) {
              _globalWindow2["default"].postMessage({
                action: "data",
                segment: segment,
              });
            });
            transmuxer.on("done", function (data) {
              _globalWindow2["default"].postMessage({ action: "done" });
            });
          };
          var MessageHandlers = (function () {
            function MessageHandlers(options) {
              _classCallCheck(this, MessageHandlers);
              this.options = options || {};
              this.init();
            }
            _createClass(MessageHandlers, [
              {
                key: "init",
                value: function init() {
                  if (this.transmuxer) {
                    this.transmuxer.dispose();
                  }
                  this.transmuxer = new _muxJsLibFlv2["default"].Transmuxer(this.options);
                  wireTransmuxerEvents(this.transmuxer);
                },
              },
              {
                key: "push",
                value: function push(data) {
                  var segment = new Uint8Array(data.data, data.byteOffset, data.byteLength);
                  this.transmuxer.push(segment);
                },
              },
              {
                key: "reset",
                value: function reset() {
                  this.init();
                },
              },
              {
                key: "flush",
                value: function flush() {
                  this.transmuxer.flush();
                },
              },
            ]);
            return MessageHandlers;
          })();
          var FlashTransmuxerWorker = function FlashTransmuxerWorker(self) {
            self.onmessage = function (event) {
              if (event.data.action === "init" && event.data.options) {
                this.messageHandlers = new MessageHandlers(event.data.options);
                return;
              }
              if (!this.messageHandlers) {
                this.messageHandlers = new MessageHandlers();
              }
              if (event.data && event.data.action && event.data.action !== "init") {
                if (this.messageHandlers[event.data.action]) {
                  this.messageHandlers[event.data.action](event.data);
                }
              }
            };
          };
          exports["default"] = function (self) {
            return new FlashTransmuxerWorker(self);
          };
          module.exports = exports["default"];
        },
        { "global/window": 31, "mux.js/lib/flv": 45 },
      ],
      71: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            var _createClass = (function () {
              function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ("value" in descriptor) descriptor.writable = true;
                  Object.defineProperty(target, descriptor.key, descriptor);
                }
              }
              return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
              };
            })();
            var _get = function get(_x, _x2, _x3) {
              var _again = true;
              _function: while (_again) {
                var object = _x,
                  property = _x2,
                  receiver = _x3;
                _again = false;
                if (object === null) object = Function.prototype;
                var desc = Object.getOwnPropertyDescriptor(object, property);
                if (desc === undefined) {
                  var parent = Object.getPrototypeOf(object);
                  if (parent === null) {
                    return undefined;
                  } else {
                    _x = parent;
                    _x2 = property;
                    _x3 = receiver;
                    _again = true;
                    desc = parent = undefined;
                    continue _function;
                  }
                } else if ("value" in desc) {
                  return desc.value;
                } else {
                  var getter = desc.get;
                  if (getter === undefined) {
                    return undefined;
                  }
                  return getter.call(receiver);
                }
              }
            };
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            function _classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            function _inherits(subClass, superClass) {
              if (typeof superClass !== "function" && superClass !== null) {
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
              }
              subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                  value: subClass,
                  enumerable: false,
                  writable: true,
                  configurable: true,
                },
              });
              if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
            }
            var _globalWindow = require("global/window");
            var _globalWindow2 = _interopRequireDefault(_globalWindow);
            var _globalDocument = require("global/document");
            var _globalDocument2 = _interopRequireDefault(_globalDocument);
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var _virtualSourceBuffer = require("./virtual-source-buffer");
            var _virtualSourceBuffer2 = _interopRequireDefault(_virtualSourceBuffer);
            var _addTextTrackData = require("./add-text-track-data");
            var _codecUtils = require("./codec-utils");
            var _cleanupTextTracks = require("./cleanup-text-tracks");
            var HtmlMediaSource = (function (_videojs$EventTarget) {
              _inherits(HtmlMediaSource, _videojs$EventTarget);
              function HtmlMediaSource() {
                var _this = this;
                _classCallCheck(this, HtmlMediaSource);
                _get(Object.getPrototypeOf(HtmlMediaSource.prototype), "constructor", this).call(this);
                var property = undefined;
                this.nativeMediaSource_ = new _globalWindow2["default"].MediaSource();
                for (property in this.nativeMediaSource_) {
                  if (!(property in HtmlMediaSource.prototype) && typeof this.nativeMediaSource_[property] === "function") {
                    this[property] = this.nativeMediaSource_[property].bind(this.nativeMediaSource_);
                  }
                }
                this.duration_ = NaN;
                Object.defineProperty(this, "duration", {
                  get: function get() {
                    if (this.duration_ === Infinity) {
                      return this.duration_;
                    }
                    return this.nativeMediaSource_.duration;
                  },
                  set: function set(duration) {
                    this.duration_ = duration;
                    if (duration !== Infinity) {
                      this.nativeMediaSource_.duration = duration;
                      return;
                    }
                  },
                });
                Object.defineProperty(this, "seekable", {
                  get: function get() {
                    if (this.duration_ === Infinity) {
                      return _videoJs2["default"].createTimeRanges([[0, this.nativeMediaSource_.duration]]);
                    }
                    return this.nativeMediaSource_.seekable;
                  },
                });
                Object.defineProperty(this, "readyState", {
                  get: function get() {
                    return this.nativeMediaSource_.readyState;
                  },
                });
                Object.defineProperty(this, "activeSourceBuffers", {
                  get: function get() {
                    return this.activeSourceBuffers_;
                  },
                });
                this.sourceBuffers = [];
                this.activeSourceBuffers_ = [];
                this.updateActiveSourceBuffers_ = function () {
                  _this.activeSourceBuffers_.length = 0;
                  if (_this.sourceBuffers.length === 1) {
                    var sourceBuffer = _this.sourceBuffers[0];
                    sourceBuffer.appendAudioInitSegment_ = true;
                    sourceBuffer.audioDisabled_ = !sourceBuffer.audioCodec_;
                    _this.activeSourceBuffers_.push(sourceBuffer);
                    return;
                  }
                  var disableCombined = false;
                  var disableAudioOnly = true;
                  for (var i = 0; i < _this.player_.audioTracks().length; i++) {
                    var track = _this.player_.audioTracks()[i];
                    if (track.enabled && track.kind !== "main") {
                      disableCombined = true;
                      disableAudioOnly = false;
                      break;
                    }
                  }
                  _this.sourceBuffers.forEach(function (sourceBuffer) {
                    sourceBuffer.appendAudioInitSegment_ = true;
                    if (sourceBuffer.videoCodec_ && sourceBuffer.audioCodec_) {
                      sourceBuffer.audioDisabled_ = disableCombined;
                    } else if (sourceBuffer.videoCodec_ && !sourceBuffer.audioCodec_) {
                      sourceBuffer.audioDisabled_ = true;
                      disableAudioOnly = false;
                    } else if (!sourceBuffer.videoCodec_ && sourceBuffer.audioCodec_) {
                      sourceBuffer.audioDisabled_ = disableAudioOnly;
                      if (disableAudioOnly) {
                        return;
                      }
                    }
                    _this.activeSourceBuffers_.push(sourceBuffer);
                  });
                };
                this.onPlayerMediachange_ = function () {
                  _this.sourceBuffers.forEach(function (sourceBuffer) {
                    sourceBuffer.appendAudioInitSegment_ = true;
                  });
                };
                ["sourceopen", "sourceclose", "sourceended"].forEach(function (eventName) {
                  this.nativeMediaSource_.addEventListener(eventName, this.trigger.bind(this));
                }, this);
                this.on("sourceopen", function (event) {
                  var video = _globalDocument2["default"].querySelector('[src="' + _this.url_ + '"]');
                  if (!video) {
                    return;
                  }
                  _this.player_ = (0, _videoJs2["default"])(video.parentNode);
                  if (_this.player_.audioTracks && _this.player_.audioTracks()) {
                    _this.player_.audioTracks().on("change", _this.updateActiveSourceBuffers_);
                    _this.player_.audioTracks().on("addtrack", _this.updateActiveSourceBuffers_);
                    _this.player_.audioTracks().on("removetrack", _this.updateActiveSourceBuffers_);
                  }
                  _this.player_.on("mediachange", _this.onPlayerMediachange_);
                });
                this.on("sourceended", function (event) {
                  var duration = (0, _addTextTrackData.durationOfVideo)(_this.duration);
                  for (var i = 0; i < _this.sourceBuffers.length; i++) {
                    var sourcebuffer = _this.sourceBuffers[i];
                    var cues = sourcebuffer.metadataTrack_ && sourcebuffer.metadataTrack_.cues;
                    if (cues && cues.length) {
                      cues[cues.length - 1].endTime = duration;
                    }
                  }
                });
                this.on("sourceclose", function (event) {
                  this.sourceBuffers.forEach(function (sourceBuffer) {
                    if (sourceBuffer.transmuxer_) {
                      sourceBuffer.transmuxer_.terminate();
                    }
                  });
                  this.sourceBuffers.length = 0;
                  if (!this.player_) {
                    return;
                  }
                  (0, _cleanupTextTracks.cleanupTextTracks)(this.player_);
                  if (this.player_.audioTracks && this.player_.audioTracks()) {
                    this.player_.audioTracks().off("change", this.updateActiveSourceBuffers_);
                    this.player_.audioTracks().off("addtrack", this.updateActiveSourceBuffers_);
                    this.player_.audioTracks().off("removetrack", this.updateActiveSourceBuffers_);
                  }
                  if (this.player_.el_) {
                    this.player_.off("mediachange", this.onPlayerMediachange_);
                  }
                });
              }
              _createClass(HtmlMediaSource, [
                {
                  key: "addSeekableRange_",
                  value: function addSeekableRange_(start, end) {
                    var error = undefined;
                    if (this.duration !== Infinity) {
                      error = new Error("MediaSource.addSeekableRange() can only be invoked " + "when the duration is Infinity");
                      error.name = "InvalidStateError";
                      error.code = 11;
                      throw error;
                    }
                    if (end > this.nativeMediaSource_.duration || isNaN(this.nativeMediaSource_.duration)) {
                      this.nativeMediaSource_.duration = end;
                    }
                  },
                },
                {
                  key: "addSourceBuffer",
                  value: function addSourceBuffer(type) {
                    var buffer = undefined;
                    var parsedType = (0, _codecUtils.parseContentType)(type);
                    if (/^(video|audio)\/mp2t$/i.test(parsedType.type)) {
                      var codecs = [];
                      if (parsedType.parameters && parsedType.parameters.codecs) {
                        codecs = parsedType.parameters.codecs.split(",");
                        codecs = (0, _codecUtils.translateLegacyCodecs)(codecs);
                        codecs = codecs.filter(function (codec) {
                          return (0, _codecUtils.isAudioCodec)(codec) || (0, _codecUtils.isVideoCodec)(codec);
                        });
                      }
                      if (codecs.length === 0) {
                        codecs = ["avc1.4d400d", "mp4a.40.2"];
                      }
                      buffer = new _virtualSourceBuffer2["default"](this, codecs);
                      if (this.sourceBuffers.length !== 0) {
                        this.sourceBuffers[0].createRealSourceBuffers_();
                        buffer.createRealSourceBuffers_();
                        this.sourceBuffers[0].audioDisabled_ = true;
                      }
                    } else {
                      buffer = this.nativeMediaSource_.addSourceBuffer(type);
                    }
                    this.sourceBuffers.push(buffer);
                    return buffer;
                  },
                },
              ]);
              return HtmlMediaSource;
            })(_videoJs2["default"].EventTarget);
            exports["default"] = HtmlMediaSource;
            module.exports = exports["default"];
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        {
          "./add-text-track-data": 63,
          "./cleanup-text-tracks": 64,
          "./codec-utils": 65,
          "./virtual-source-buffer": 75,
          "global/document": 30,
          "global/window": 31,
        },
      ],
      72: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var removeCuesFromTrack = function removeCuesFromTrack(start, end, track) {
            var i = undefined;
            var cue = undefined;
            if (!track) {
              return;
            }
            if (!track.cues) {
              return;
            }
            i = track.cues.length;
            while (i--) {
              cue = track.cues[i];
              if (cue.startTime <= end && cue.endTime >= start) {
                track.removeCue(cue);
              }
            }
          };
          exports["default"] = removeCuesFromTrack;
          module.exports = exports["default"];
        },
        {},
      ],
      73: [
        function (require, module, exports) {
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          var _createClass = (function () {
            function defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            return function (Constructor, protoProps, staticProps) {
              if (protoProps) defineProperties(Constructor.prototype, protoProps);
              if (staticProps) defineProperties(Constructor, staticProps);
              return Constructor;
            };
          })();
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          var _globalWindow = require("global/window");
          var _globalWindow2 = _interopRequireDefault(_globalWindow);
          var _muxJsLibMp4 = require("mux.js/lib/mp4");
          var _muxJsLibMp42 = _interopRequireDefault(_muxJsLibMp4);
          var wireTransmuxerEvents = function wireTransmuxerEvents(transmuxer) {
            transmuxer.on("data", function (segment) {
              var initArray = segment.initSegment;
              segment.initSegment = {
                data: initArray.buffer,
                byteOffset: initArray.byteOffset,
                byteLength: initArray.byteLength,
              };
              var typedArray = segment.data;
              segment.data = typedArray.buffer;
              _globalWindow2["default"].postMessage(
                {
                  action: "data",
                  segment: segment,
                  byteOffset: typedArray.byteOffset,
                  byteLength: typedArray.byteLength,
                },
                [segment.data]
              );
            });
            if (transmuxer.captionStream) {
              transmuxer.captionStream.on("data", function (caption) {
                _globalWindow2["default"].postMessage({
                  action: "caption",
                  data: caption,
                });
              });
            }
            transmuxer.on("done", function (data) {
              _globalWindow2["default"].postMessage({ action: "done" });
            });
          };
          var MessageHandlers = (function () {
            function MessageHandlers(options) {
              _classCallCheck(this, MessageHandlers);
              this.options = options || {};
              this.init();
            }
            _createClass(MessageHandlers, [
              {
                key: "init",
                value: function init() {
                  if (this.transmuxer) {
                    this.transmuxer.dispose();
                  }
                  this.transmuxer = new _muxJsLibMp42["default"].Transmuxer(this.options);
                  wireTransmuxerEvents(this.transmuxer);
                },
              },
              {
                key: "push",
                value: function push(data) {
                  var segment = new Uint8Array(data.data, data.byteOffset, data.byteLength);
                  this.transmuxer.push(segment);
                },
              },
              {
                key: "reset",
                value: function reset() {
                  this.init();
                },
              },
              {
                key: "setTimestampOffset",
                value: function setTimestampOffset(data) {
                  var timestampOffset = data.timestampOffset || 0;
                  this.transmuxer.setBaseMediaDecodeTime(Math.round(timestampOffset * 90000));
                },
              },
              {
                key: "setAudioAppendStart",
                value: function setAudioAppendStart(data) {
                  this.transmuxer.setAudioAppendStart(Math.ceil(data.appendStart * 90000));
                },
              },
              {
                key: "flush",
                value: function flush(data) {
                  this.transmuxer.flush();
                },
              },
            ]);
            return MessageHandlers;
          })();
          var TransmuxerWorker = function TransmuxerWorker(self) {
            self.onmessage = function (event) {
              if (event.data.action === "init" && event.data.options) {
                this.messageHandlers = new MessageHandlers(event.data.options);
                return;
              }
              if (!this.messageHandlers) {
                this.messageHandlers = new MessageHandlers();
              }
              if (event.data && event.data.action && event.data.action !== "init") {
                if (this.messageHandlers[event.data.action]) {
                  this.messageHandlers[event.data.action](event.data);
                }
              }
            };
          };
          exports["default"] = function (self) {
            return new TransmuxerWorker(self);
          };
          module.exports = exports["default"];
        },
        { "global/window": 31, "mux.js/lib/mp4": 54 },
      ],
      74: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            var _globalWindow = require("global/window");
            var _globalWindow2 = _interopRequireDefault(_globalWindow);
            var _flashMediaSource = require("./flash-media-source");
            var _flashMediaSource2 = _interopRequireDefault(_flashMediaSource);
            var _htmlMediaSource = require("./html-media-source");
            var _htmlMediaSource2 = _interopRequireDefault(_htmlMediaSource);
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var urlCount = 0;
            var defaults = { mode: "auto" };
            _videoJs2["default"].mediaSources = {};
            var open = function open(msObjectURL, swfId) {
              var mediaSource = _videoJs2["default"].mediaSources[msObjectURL];
              if (mediaSource) {
                mediaSource.trigger({ type: "sourceopen", swfId: swfId });
              } else {
                throw new Error("Media Source not found (Video.js)");
              }
            };
            var supportsNativeMediaSources = function supportsNativeMediaSources() {
              return (
                !!_globalWindow2["default"].MediaSource &&
                !!_globalWindow2["default"].MediaSource.isTypeSupported &&
                _globalWindow2["default"].MediaSource.isTypeSupported('video/mp4;codecs="avc1.4d400d,mp4a.40.2"')
              );
            };
            var MediaSource = function MediaSource(options) {
              var settings = _videoJs2["default"].mergeOptions(defaults, options);
              this.MediaSource = {
                open: open,
                supportsNativeMediaSources: supportsNativeMediaSources,
              };
              if (settings.mode === "html5" || (settings.mode === "auto" && supportsNativeMediaSources())) {
                return new _htmlMediaSource2["default"]();
              } else if (_videoJs2["default"].getTech("Flash")) {
                return new _flashMediaSource2["default"]();
              }
              throw new Error("Cannot use Flash or Html5 to create a MediaSource for this video");
            };
            exports.MediaSource = MediaSource;
            MediaSource.open = open;
            MediaSource.supportsNativeMediaSources = supportsNativeMediaSources;
            var URL = {
              createObjectURL: function createObjectURL(object) {
                var objectUrlPrefix = "blob:vjs-media-source/";
                var url = undefined;
                if (object instanceof _htmlMediaSource2["default"]) {
                  url = _globalWindow2["default"].URL.createObjectURL(object.nativeMediaSource_);
                  object.url_ = url;
                  return url;
                }
                if (!(object instanceof _flashMediaSource2["default"])) {
                  url = _globalWindow2["default"].URL.createObjectURL(object);
                  object.url_ = url;
                  return url;
                }
                url = objectUrlPrefix + urlCount;
                urlCount++;
                _videoJs2["default"].mediaSources[url] = object;
                return url;
              },
            };
            exports.URL = URL;
            _videoJs2["default"].MediaSource = MediaSource;
            _videoJs2["default"].URL = URL;
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        {
          "./flash-media-source": 68,
          "./html-media-source": 71,
          "global/window": 31,
        },
      ],
      75: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            var _createClass = (function () {
              function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ("value" in descriptor) descriptor.writable = true;
                  Object.defineProperty(target, descriptor.key, descriptor);
                }
              }
              return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
              };
            })();
            var _get = function get(_x, _x2, _x3) {
              var _again = true;
              _function: while (_again) {
                var object = _x,
                  property = _x2,
                  receiver = _x3;
                _again = false;
                if (object === null) object = Function.prototype;
                var desc = Object.getOwnPropertyDescriptor(object, property);
                if (desc === undefined) {
                  var parent = Object.getPrototypeOf(object);
                  if (parent === null) {
                    return undefined;
                  } else {
                    _x = parent;
                    _x2 = property;
                    _x3 = receiver;
                    _again = true;
                    desc = parent = undefined;
                    continue _function;
                  }
                } else if ("value" in desc) {
                  return desc.value;
                } else {
                  var getter = desc.get;
                  if (getter === undefined) {
                    return undefined;
                  }
                  return getter.call(receiver);
                }
              }
            };
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            function _classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            function _inherits(subClass, superClass) {
              if (typeof superClass !== "function" && superClass !== null) {
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
              }
              subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                  value: subClass,
                  enumerable: false,
                  writable: true,
                  configurable: true,
                },
              });
              if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
            }
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var _createTextTracksIfNecessary = require("./create-text-tracks-if-necessary");
            var _createTextTracksIfNecessary2 = _interopRequireDefault(_createTextTracksIfNecessary);
            var _removeCuesFromTrack = require("./remove-cues-from-track");
            var _removeCuesFromTrack2 = _interopRequireDefault(_removeCuesFromTrack);
            var _addTextTrackData = require("./add-text-track-data");
            var _webworkify = require("webworkify");
            var _webworkify2 = _interopRequireDefault(_webworkify);
            var _transmuxerWorker = require("./transmuxer-worker");
            var _transmuxerWorker2 = _interopRequireDefault(_transmuxerWorker);
            var _codecUtils = require("./codec-utils");
            var makeWrappedSourceBuffer = function makeWrappedSourceBuffer(mediaSource, mimeType) {
              var sourceBuffer = mediaSource.addSourceBuffer(mimeType);
              var wrapper = Object.create(null);
              wrapper.updating = false;
              wrapper.realBuffer_ = sourceBuffer;
              var _loop = function (key) {
                if (typeof sourceBuffer[key] === "function") {
                  wrapper[key] = function () {
                    return sourceBuffer[key].apply(sourceBuffer, arguments);
                  };
                } else if (typeof wrapper[key] === "undefined") {
                  Object.defineProperty(wrapper, key, {
                    get: function get() {
                      return sourceBuffer[key];
                    },
                    set: function set(v) {
                      return (sourceBuffer[key] = v);
                    },
                  });
                }
              };
              for (var key in sourceBuffer) {
                _loop(key);
              }
              return wrapper;
            };
            var VirtualSourceBuffer = (function (_videojs$EventTarget) {
              _inherits(VirtualSourceBuffer, _videojs$EventTarget);
              function VirtualSourceBuffer(mediaSource, codecs) {
                var _this = this;
                _classCallCheck(this, VirtualSourceBuffer);
                _get(Object.getPrototypeOf(VirtualSourceBuffer.prototype), "constructor", this).call(this, _videoJs2["default"].EventTarget);
                this.timestampOffset_ = 0;
                this.pendingBuffers_ = [];
                this.bufferUpdating_ = false;
                this.mediaSource_ = mediaSource;
                this.codecs_ = codecs;
                this.audioCodec_ = null;
                this.videoCodec_ = null;
                this.audioDisabled_ = false;
                this.appendAudioInitSegment_ = true;
                var options = { remux: false };
                this.codecs_.forEach(function (codec) {
                  if ((0, _codecUtils.isAudioCodec)(codec)) {
                    _this.audioCodec_ = codec;
                  } else if ((0, _codecUtils.isVideoCodec)(codec)) {
                    _this.videoCodec_ = codec;
                  }
                });
                this.transmuxer_ = (0, _webworkify2["default"])(_transmuxerWorker2["default"]);
                this.transmuxer_.postMessage({
                  action: "init",
                  options: options,
                });
                this.transmuxer_.onmessage = function (event) {
                  if (event.data.action === "data") {
                    return _this.data_(event);
                  }
                  if (event.data.action === "done") {
                    return _this.done_(event);
                  }
                };
                Object.defineProperty(this, "timestampOffset", {
                  get: function get() {
                    return this.timestampOffset_;
                  },
                  set: function set(val) {
                    if (typeof val === "number" && val >= 0) {
                      this.timestampOffset_ = val;
                      this.appendAudioInitSegment_ = true;
                      this.transmuxer_.postMessage({
                        action: "setTimestampOffset",
                        timestampOffset: val,
                      });
                    }
                  },
                });
                Object.defineProperty(this, "appendWindowStart", {
                  get: function get() {
                    return (this.videoBuffer_ || this.audioBuffer_).appendWindowStart;
                  },
                  set: function set(start) {
                    if (this.videoBuffer_) {
                      this.videoBuffer_.appendWindowStart = start;
                    }
                    if (this.audioBuffer_) {
                      this.audioBuffer_.appendWindowStart = start;
                    }
                  },
                });
                Object.defineProperty(this, "updating", {
                  get: function get() {
                    return !!(this.bufferUpdating_ || (!this.audioDisabled_ && this.audioBuffer_ && this.audioBuffer_.updating) || (this.videoBuffer_ && this.videoBuffer_.updating));
                  },
                });
                Object.defineProperty(this, "buffered", {
                  get: function get() {
                    var start = null;
                    var end = null;
                    var arity = 0;
                    var extents = [];
                    var ranges = [];
                    if (!this.videoBuffer_ && !this.audioBuffer_) {
                      return _videoJs2["default"].createTimeRange();
                    }
                    if (!this.videoBuffer_) {
                      return this.audioBuffer_.buffered;
                    }
                    if (!this.audioBuffer_) {
                      return this.videoBuffer_.buffered;
                    }
                    if (this.audioDisabled_) {
                      return this.videoBuffer_.buffered;
                    }
                    if (this.videoBuffer_.buffered.length === 0 && this.audioBuffer_.buffered.length === 0) {
                      return _videoJs2["default"].createTimeRange();
                    }
                    var videoBuffered = this.videoBuffer_.buffered;
                    var audioBuffered = this.audioBuffer_.buffered;
                    var count = videoBuffered.length;
                    while (count--) {
                      extents.push({
                        time: videoBuffered.start(count),
                        type: "start",
                      });
                      extents.push({
                        time: videoBuffered.end(count),
                        type: "end",
                      });
                    }
                    count = audioBuffered.length;
                    while (count--) {
                      extents.push({
                        time: audioBuffered.start(count),
                        type: "start",
                      });
                      extents.push({
                        time: audioBuffered.end(count),
                        type: "end",
                      });
                    }
                    extents.sort(function (a, b) {
                      return a.time - b.time;
                    });
                    for (count = 0; count < extents.length; count++) {
                      if (extents[count].type === "start") {
                        arity++;
                        if (arity === 2) {
                          start = extents[count].time;
                        }
                      } else if (extents[count].type === "end") {
                        arity--;
                        if (arity === 1) {
                          end = extents[count].time;
                        }
                      }
                      if (start !== null && end !== null) {
                        ranges.push([start, end]);
                        start = null;
                        end = null;
                      }
                    }
                    return _videoJs2["default"].createTimeRanges(ranges);
                  },
                });
              }
              _createClass(VirtualSourceBuffer, [
                {
                  key: "data_",
                  value: function data_(event) {
                    var segment = event.data.segment;
                    segment.data = new Uint8Array(segment.data, event.data.byteOffset, event.data.byteLength);
                    segment.initSegment = new Uint8Array(segment.initSegment.data, segment.initSegment.byteOffset, segment.initSegment.byteLength);
                    (0, _createTextTracksIfNecessary2["default"])(this, this.mediaSource_, segment);
                    this.pendingBuffers_.push(segment);
                    return;
                  },
                },
                {
                  key: "done_",
                  value: function done_(event) {
                    if (this.mediaSource_.readyState === "closed") {
                      this.pendingBuffers_.length = 0;
                      return;
                    }
                    this.processPendingSegments_();
                    return;
                  },
                },
                {
                  key: "createRealSourceBuffers_",
                  value: function createRealSourceBuffers_() {
                    var _this2 = this;
                    var types = ["audio", "video"];
                    types.forEach(function (type) {
                      if (!_this2[type + "Codec_"]) {
                        return;
                      }
                      if (_this2[type + "Buffer_"]) {
                        return;
                      }
                      var buffer = null;
                      if (_this2.mediaSource_[type + "Buffer_"]) {
                        buffer = _this2.mediaSource_[type + "Buffer_"];
                        buffer.updating = false;
                      } else {
                        var codecProperty = type + "Codec_";
                        var mimeType = type + '/mp4;codecs="' + _this2[codecProperty] + '"';
                        buffer = makeWrappedSourceBuffer(_this2.mediaSource_.nativeMediaSource_, mimeType);
                        _this2.mediaSource_[type + "Buffer_"] = buffer;
                      }
                      _this2[type + "Buffer_"] = buffer;
                      ["update", "updatestart", "updateend"].forEach(function (event) {
                        buffer.addEventListener(event, function () {
                          if (type === "audio" && _this2.audioDisabled_) {
                            return;
                          }
                          if (event === "updateend") {
                            _this2[type + "Buffer_"].updating = false;
                          }
                          var shouldTrigger = types.every(function (t) {
                            if (t === "audio" && _this2.audioDisabled_) {
                              return true;
                            }
                            if (type !== t && _this2[t + "Buffer_"] && _this2[t + "Buffer_"].updating) {
                              return false;
                            }
                            return true;
                          });
                          if (shouldTrigger) {
                            return _this2.trigger(event);
                          }
                        });
                      });
                    });
                  },
                },
                {
                  key: "appendBuffer",
                  value: function appendBuffer(segment) {
                    this.bufferUpdating_ = true;
                    if (this.audioBuffer_ && this.audioBuffer_.buffered.length) {
                      var audioBuffered = this.audioBuffer_.buffered;
                      this.transmuxer_.postMessage({
                        action: "setAudioAppendStart",
                        appendStart: audioBuffered.end(audioBuffered.length - 1),
                      });
                    }
                    this.transmuxer_.postMessage(
                      {
                        action: "push",
                        data: segment.buffer,
                        byteOffset: segment.byteOffset,
                        byteLength: segment.byteLength,
                      },
                      [segment.buffer]
                    );
                    this.transmuxer_.postMessage({ action: "flush" });
                  },
                },
                {
                  key: "remove",
                  value: function remove(start, end) {
                    if (this.videoBuffer_) {
                      this.videoBuffer_.updating = true;
                      this.videoBuffer_.remove(start, end);
                    }
                    if (!this.audioDisabled_ && this.audioBuffer_) {
                      this.audioBuffer_.updating = true;
                      this.audioBuffer_.remove(start, end);
                    }
                    (0, _removeCuesFromTrack2["default"])(start, end, this.metadataTrack_);
                    (0, _removeCuesFromTrack2["default"])(start, end, this.inbandTextTrack_);
                  },
                },
                {
                  key: "processPendingSegments_",
                  value: function processPendingSegments_() {
                    var sortedSegments = {
                      video: { segments: [], bytes: 0 },
                      audio: { segments: [], bytes: 0 },
                      captions: [],
                      metadata: [],
                    };
                    sortedSegments = this.pendingBuffers_.reduce(function (segmentObj, segment) {
                      var type = segment.type;
                      var data = segment.data;
                      var initSegment = segment.initSegment;
                      segmentObj[type].segments.push(data);
                      segmentObj[type].bytes += data.byteLength;
                      segmentObj[type].initSegment = initSegment;
                      if (segment.captions) {
                        segmentObj.captions = segmentObj.captions.concat(segment.captions);
                      }
                      if (segment.info) {
                        segmentObj[type].info = segment.info;
                      }
                      if (segment.metadata) {
                        segmentObj.metadata = segmentObj.metadata.concat(segment.metadata);
                      }
                      return segmentObj;
                    }, sortedSegments);
                    if (!this.videoBuffer_ && !this.audioBuffer_) {
                      if (sortedSegments.video.bytes === 0) {
                        this.videoCodec_ = null;
                      }
                      if (sortedSegments.audio.bytes === 0) {
                        this.audioCodec_ = null;
                      }
                      this.createRealSourceBuffers_();
                    }
                    if (sortedSegments.audio.info) {
                      this.mediaSource_.trigger({
                        type: "audioinfo",
                        info: sortedSegments.audio.info,
                      });
                    }
                    if (sortedSegments.video.info) {
                      this.mediaSource_.trigger({
                        type: "videoinfo",
                        info: sortedSegments.video.info,
                      });
                    }
                    if (this.appendAudioInitSegment_) {
                      if (!this.audioDisabled_ && this.audioBuffer_) {
                        sortedSegments.audio.segments.unshift(sortedSegments.audio.initSegment);
                        sortedSegments.audio.bytes += sortedSegments.audio.initSegment.byteLength;
                      }
                      this.appendAudioInitSegment_ = false;
                    }
                    if (this.videoBuffer_) {
                      sortedSegments.video.segments.unshift(sortedSegments.video.initSegment);
                      sortedSegments.video.bytes += sortedSegments.video.initSegment.byteLength;
                      this.concatAndAppendSegments_(sortedSegments.video, this.videoBuffer_);
                      (0, _addTextTrackData.addTextTrackData)(this, sortedSegments.captions, sortedSegments.metadata);
                    }
                    if (!this.audioDisabled_ && this.audioBuffer_) {
                      this.concatAndAppendSegments_(sortedSegments.audio, this.audioBuffer_);
                    }
                    this.pendingBuffers_.length = 0;
                    this.bufferUpdating_ = false;
                  },
                },
                {
                  key: "concatAndAppendSegments_",
                  value: function concatAndAppendSegments_(segmentObj, destinationBuffer) {
                    var offset = 0;
                    var tempBuffer = undefined;
                    if (segmentObj.bytes) {
                      tempBuffer = new Uint8Array(segmentObj.bytes);
                      segmentObj.segments.forEach(function (segment) {
                        tempBuffer.set(segment, offset);
                        offset += segment.byteLength;
                      });
                      try {
                        destinationBuffer.updating = true;
                        destinationBuffer.appendBuffer(tempBuffer);
                      } catch (error) {
                        if (this.mediaSource_.player_) {
                          this.mediaSource_.player_.error({
                            code: -3,
                            type: "APPEND_BUFFER_ERR",
                            message: error.message,
                            originalError: error,
                          });
                        }
                      }
                    }
                  },
                },
                {
                  key: "abort",
                  value: function abort() {
                    if (this.videoBuffer_) {
                      this.videoBuffer_.abort();
                    }
                    if (!this.audioDisabled_ && this.audioBuffer_) {
                      this.audioBuffer_.abort();
                    }
                    if (this.transmuxer_) {
                      this.transmuxer_.postMessage({ action: "reset" });
                    }
                    this.pendingBuffers_.length = 0;
                    this.bufferUpdating_ = false;
                  },
                },
              ]);
              return VirtualSourceBuffer;
            })(_videoJs2["default"].EventTarget);
            exports["default"] = VirtualSourceBuffer;
            module.exports = exports["default"];
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        {
          "./add-text-track-data": 63,
          "./codec-utils": 65,
          "./create-text-tracks-if-necessary": 66,
          "./remove-cues-from-track": 72,
          "./transmuxer-worker": 73,
          webworkify: 76,
        },
      ],
      76: [
        function (require, module, exports) {
          var bundleFn = arguments[3];
          var sources = arguments[4];
          var cache = arguments[5];
          var stringify = JSON.stringify;
          module.exports = function (fn) {
            var keys = [];
            var wkey;
            var cacheKeys = Object.keys(cache);
            for (var i = 0, l = cacheKeys.length; i < l; i++) {
              var key = cacheKeys[i];
              if (cache[key].exports === fn) {
                wkey = key;
                break;
              }
            }
            if (!wkey) {
              wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
              var wcache = {};
              for (var i = 0, l = cacheKeys.length; i < l; i++) {
                var key = cacheKeys[i];
                wcache[key] = key;
              }
              sources[wkey] = [Function(["require", "module", "exports"], "(" + fn + ")(self)"), wcache];
            }
            var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
            var scache = {};
            scache[wkey] = wkey;
            sources[skey] = [Function(["require"], "require(" + stringify(wkey) + ")(self)"), scache];
            var src =
              "(" +
              bundleFn +
              ")({" +
              Object.keys(sources)
                .map(function (key) {
                  return stringify(key) + ":[" + sources[key][0] + "," + stringify(sources[key][1]) + "]";
                })
                .join(",") +
              "},{},[" +
              stringify(skey) +
              "])";
            var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
            return new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
          };
        },
        {},
      ],
      77: [
        function (require, module, exports) {
          (function (global) {
            "use strict";
            var _createClass = (function () {
              function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ("value" in descriptor) descriptor.writable = true;
                  Object.defineProperty(target, descriptor.key, descriptor);
                }
              }
              return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
              };
            })();
            var _get = function get(_x4, _x5, _x6) {
              var _again = true;
              _function: while (_again) {
                var object = _x4,
                  property = _x5,
                  receiver = _x6;
                _again = false;
                if (object === null) object = Function.prototype;
                var desc = Object.getOwnPropertyDescriptor(object, property);
                if (desc === undefined) {
                  var parent = Object.getPrototypeOf(object);
                  if (parent === null) {
                    return undefined;
                  } else {
                    _x4 = parent;
                    _x5 = property;
                    _x6 = receiver;
                    _again = true;
                    desc = parent = undefined;
                    continue _function;
                  }
                } else if ("value" in desc) {
                  return desc.value;
                } else {
                  var getter = desc.get;
                  if (getter === undefined) {
                    return undefined;
                  }
                  return getter.call(receiver);
                }
              }
            };
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : { default: obj };
            }
            function _classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            function _inherits(subClass, superClass) {
              if (typeof superClass !== "function" && superClass !== null) {
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
              }
              subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                  value: subClass,
                  enumerable: false,
                  writable: true,
                  configurable: true,
                },
              });
              if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
            }
            var _globalDocument = require("global/document");
            var _globalDocument2 = _interopRequireDefault(_globalDocument);
            var _playlistLoader = require("./playlist-loader");
            var _playlistLoader2 = _interopRequireDefault(_playlistLoader);
            var _playlist = require("./playlist");
            var _playlist2 = _interopRequireDefault(_playlist);
            var _xhr = require("./xhr");
            var _xhr2 = _interopRequireDefault(_xhr);
            var _aesDecrypter = require("aes-decrypter");
            var _binUtils = require("./bin-utils");
            var _binUtils2 = _interopRequireDefault(_binUtils);
            var _videojsContribMediaSources = require("videojs-contrib-media-sources");
            var _m3u8Parser = require("m3u8-parser");
            var _m3u8Parser2 = _interopRequireDefault(_m3u8Parser);
            var _videoJs = typeof window !== "undefined" ? window["videojs"] : typeof global !== "undefined" ? global["videojs"] : null;
            var _videoJs2 = _interopRequireDefault(_videoJs);
            var _masterPlaylistController = require("./master-playlist-controller");
            var _config = require("./config");
            var _config2 = _interopRequireDefault(_config);
            var _renditionMixin = require("./rendition-mixin");
            var _renditionMixin2 = _interopRequireDefault(_renditionMixin);
            var _globalWindow = require("global/window");
            var _globalWindow2 = _interopRequireDefault(_globalWindow);
            var _playbackWatcher = require("./playback-watcher");
            var _playbackWatcher2 = _interopRequireDefault(_playbackWatcher);
            var _reloadSourceOnError = require("./reload-source-on-error");
            var _reloadSourceOnError2 = _interopRequireDefault(_reloadSourceOnError);
            var _playlistSelectorsJs = require("./playlist-selectors.js");
            var Hls = {
              PlaylistLoader: _playlistLoader2["default"],
              Playlist: _playlist2["default"],
              Decrypter: _aesDecrypter.Decrypter,
              AsyncStream: _aesDecrypter.AsyncStream,
              decrypt: _aesDecrypter.decrypt,
              utils: _binUtils2["default"],
              STANDARD_PLAYLIST_SELECTOR: _playlistSelectorsJs.lastBandwidthSelector,
              INITIAL_PLAYLIST_SELECTOR: _playlistSelectorsJs.lowestBitrateCompatibleVariantSelector,
              comparePlaylistBandwidth: _playlistSelectorsJs.comparePlaylistBandwidth,
              comparePlaylistResolution: _playlistSelectorsJs.comparePlaylistResolution,
              xhr: (0, _xhr2["default"])(),
            };
            var INITIAL_BANDWIDTH = 4194304;
            [
              "GOAL_BUFFER_LENGTH",
              "MAX_GOAL_BUFFER_LENGTH",
              "GOAL_BUFFER_LENGTH_RATE",
              "BUFFER_LOW_WATER_LINE",
              "MAX_BUFFER_LOW_WATER_LINE",
              "BUFFER_LOW_WATER_LINE_RATE",
              "BANDWIDTH_VARIANCE",
            ].forEach(function (prop) {
              Object.defineProperty(Hls, prop, {
                get: function get() {
                  _videoJs2["default"].log.warn("using Hls." + prop + " is UNSAFE be sure you know what you are doing");
                  return _config2["default"][prop];
                },
                set: function set(value) {
                  _videoJs2["default"].log.warn("using Hls." + prop + " is UNSAFE be sure you know what you are doing");
                  if (typeof value !== "number" || value < 0) {
                    _videoJs2["default"].log.warn("value of Hls." + prop + " must be greater than or equal to 0");
                    return;
                  }
                  _config2["default"][prop] = value;
                },
              });
            });
            var handleHlsMediaChange = function handleHlsMediaChange(qualityLevels, playlistLoader) {
              var newPlaylist = playlistLoader.media();
              var selectedIndex = -1;
              for (var i = 0; i < qualityLevels.length; i++) {
                if (qualityLevels[i].id === newPlaylist.uri) {
                  selectedIndex = i;
                  break;
                }
              }
              qualityLevels.selectedIndex_ = selectedIndex;
              qualityLevels.trigger({
                selectedIndex: selectedIndex,
                type: "change",
              });
            };
            var handleHlsLoadedMetadata = function handleHlsLoadedMetadata(qualityLevels, hls) {
              hls.representations().forEach(function (rep) {
                qualityLevels.addQualityLevel(rep);
              });
              handleHlsMediaChange(qualityLevels, hls.playlists);
            };
            Hls.canPlaySource = function () {
              return _videoJs2["default"].log.warn("HLS is no longer a tech. Please remove it from " + "your player's techOrder.");
            };
            Hls.supportsNativeHls = (function () {
              var video = _globalDocument2["default"].createElement("video");
              if (!_videoJs2["default"].getTech("Html5").isSupported()) {
                return false;
              }
              var canPlay = ["application/vnd.apple.mpegurl", "audio/mpegurl", "audio/x-mpegurl", "application/x-mpegurl", "video/x-mpegurl", "video/mpegurl", "application/mpegurl"];
              return canPlay.some(function (canItPlay) {
                return /maybe|probably/i.test(video.canPlayType(canItPlay));
              });
            })();
            Hls.isSupported = function () {
              return _videoJs2["default"].log.warn("HLS is no longer a tech. Please remove it from " + "your player's techOrder.");
            };
            var USER_AGENT = (_globalWindow2["default"].navigator && _globalWindow2["default"].navigator.userAgent) || "";
            Hls.supportsAudioInfoChange_ = function () {
              if (_videoJs2["default"].browser.IS_FIREFOX) {
                var firefoxVersionMap = /Firefox\/([\d.]+)/i.exec(USER_AGENT);
                var version = parseInt(firefoxVersionMap[1], 10);
                return version >= 49;
              }
              return true;
            };
            var Component = _videoJs2["default"].getComponent("Component");
            var HlsHandler = (function (_Component) {
              _inherits(HlsHandler, _Component);
              function HlsHandler(source, tech, options) {
                var _this = this;
                _classCallCheck(this, HlsHandler);
                _get(Object.getPrototypeOf(HlsHandler.prototype), "constructor", this).call(this, tech, options.hls);
                if (tech.options_ && tech.options_.playerId) {
                  var _player = (0, _videoJs2["default"])(tech.options_.playerId);
                  if (!_player.hasOwnProperty("hls")) {
                    Object.defineProperty(_player, "hls", {
                      get: function get() {
                        _videoJs2["default"].log.warn("player.hls is deprecated. Use player.tech_.hls instead.");
                        tech.trigger({
                          type: "usage",
                          name: "hls-player-access",
                        });
                        return _this;
                      },
                    });
                  }
                }
                this.tech_ = tech;
                this.source_ = source;
                this.stats = {};
                this.ignoreNextSeekingEvent_ = false;
                this.setOptions_();
                if (this.options_.overrideNative && (tech.featuresNativeVideoTracks || tech.featuresNativeAudioTracks)) {
                  throw new Error("Overriding native HLS requires emulated tracks. " + "See https://git.io/vMpjB");
                }
                this.on(_globalDocument2["default"], ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"], function (event) {
                  var fullscreenElement =
                    _globalDocument2["default"].fullscreenElement ||
                    _globalDocument2["default"].webkitFullscreenElement ||
                    _globalDocument2["default"].mozFullScreenElement ||
                    _globalDocument2["default"].msFullscreenElement;
                  if (fullscreenElement && fullscreenElement.contains(_this.tech_.el())) {
                    _this.masterPlaylistController_.fastQualityChange_();
                  }
                });
                this.on(this.tech_, "seeking", function () {
                  if (this.ignoreNextSeekingEvent_) {
                    this.ignoreNextSeekingEvent_ = false;
                    return;
                  }
                  this.setCurrentTime(this.tech_.currentTime());
                });
                this.on(this.tech_, "error", function () {
                  if (this.masterPlaylistController_) {
                    this.masterPlaylistController_.pauseLoading();
                  }
                });
                this.audioTrackChange_ = function () {
                  _this.masterPlaylistController_.setupAudio();
                  _this.tech_.trigger({
                    type: "usage",
                    name: "hls-audio-change",
                  });
                };
                this.textTrackChange_ = function () {
                  _this.masterPlaylistController_.setupSubtitles();
                };
                this.on(this.tech_, "play", this.play);
              }
              _createClass(HlsHandler, [
                {
                  key: "setOptions_",
                  value: function setOptions_() {
                    var _this2 = this;
                    this.options_.withCredentials = this.options_.withCredentials || false;
                    if (typeof this.options_.blacklistDuration !== "number") {
                      this.options_.blacklistDuration = 5 * 60;
                    }
                    if (typeof this.options_.bandwidth !== "number") {
                      this.options_.bandwidth = INITIAL_BANDWIDTH;
                    }
                    this.options_.enableLowInitialPlaylist = this.options_.enableLowInitialPlaylist && this.options_.bandwidth === INITIAL_BANDWIDTH;
                    ["withCredentials", "bandwidth"].forEach(function (option) {
                      if (typeof _this2.source_[option] !== "undefined") {
                        _this2.options_[option] = _this2.source_[option];
                      }
                    });
                    this.bandwidth = this.options_.bandwidth;
                  },
                },
                {
                  key: "src",
                  value: function src(_src) {
                    var _this3 = this;
                    if (!_src) {
                      return;
                    }
                    this.setOptions_();
                    this.options_.url = this.source_.src;
                    this.options_.tech = this.tech_;
                    this.options_.externHls = Hls;
                    this.masterPlaylistController_ = new _masterPlaylistController.MasterPlaylistController(this.options_);
                    this.playbackWatcher_ = new _playbackWatcher2["default"](
                      _videoJs2["default"].mergeOptions(this.options_, {
                        seekable: function seekable() {
                          return _this3.seekable();
                        },
                      })
                    );
                    this.masterPlaylistController_.on("error", function () {
                      var player = _videoJs2["default"].players[_this3.tech_.options_.playerId];
                      player.error(_this3.masterPlaylistController_.error);
                    });
                    this.masterPlaylistController_.selectPlaylist = this.selectPlaylist ? this.selectPlaylist.bind(this) : Hls.STANDARD_PLAYLIST_SELECTOR.bind(this);
                    this.masterPlaylistController_.selectInitialPlaylist = Hls.INITIAL_PLAYLIST_SELECTOR.bind(this);
                    this.playlists = this.masterPlaylistController_.masterPlaylistLoader_;
                    this.mediaSource = this.masterPlaylistController_.mediaSource;
                    Object.defineProperties(this, {
                      selectPlaylist: {
                        get: function get() {
                          return this.masterPlaylistController_.selectPlaylist;
                        },
                        set: function set(selectPlaylist) {
                          this.masterPlaylistController_.selectPlaylist = selectPlaylist.bind(this);
                        },
                      },
                      throughput: {
                        get: function get() {
                          return this.masterPlaylistController_.mainSegmentLoader_.throughput.rate;
                        },
                        set: function set(throughput) {
                          this.masterPlaylistController_.mainSegmentLoader_.throughput.rate = throughput;
                          this.masterPlaylistController_.mainSegmentLoader_.throughput.count = 1;
                        },
                      },
                      bandwidth: {
                        get: function get() {
                          return this.masterPlaylistController_.mainSegmentLoader_.bandwidth;
                        },
                        set: function set(bandwidth) {
                          this.masterPlaylistController_.mainSegmentLoader_.bandwidth = bandwidth;
                          this.masterPlaylistController_.mainSegmentLoader_.throughput = {
                            rate: 0,
                            count: 0,
                          };
                        },
                      },
                      systemBandwidth: {
                        get: function get() {
                          var invBandwidth = 1 / (this.bandwidth || 1);
                          var invThroughput = undefined;
                          if (this.throughput > 0) {
                            invThroughput = 1 / this.throughput;
                          } else {
                            invThroughput = 0;
                          }
                          var systemBitrate = Math.floor(1 / (invBandwidth + invThroughput));
                          return systemBitrate;
                        },
                        set: function set() {
                          _videoJs2["default"].log.error('The "systemBandwidth" property is read-only');
                        },
                      },
                    });
                    Object.defineProperties(this.stats, {
                      bandwidth: {
                        get: function get() {
                          return _this3.bandwidth || 0;
                        },
                        enumerable: true,
                      },
                      mediaRequests: {
                        get: function get() {
                          return _this3.masterPlaylistController_.mediaRequests_() || 0;
                        },
                        enumerable: true,
                      },
                      mediaRequestsAborted: {
                        get: function get() {
                          return _this3.masterPlaylistController_.mediaRequestsAborted_() || 0;
                        },
                        enumerable: true,
                      },
                      mediaRequestsTimedout: {
                        get: function get() {
                          return _this3.masterPlaylistController_.mediaRequestsTimedout_() || 0;
                        },
                        enumerable: true,
                      },
                      mediaRequestsErrored: {
                        get: function get() {
                          return _this3.masterPlaylistController_.mediaRequestsErrored_() || 0;
                        },
                        enumerable: true,
                      },
                      mediaTransferDuration: {
                        get: function get() {
                          return _this3.masterPlaylistController_.mediaTransferDuration_() || 0;
                        },
                        enumerable: true,
                      },
                      mediaBytesTransferred: {
                        get: function get() {
                          return _this3.masterPlaylistController_.mediaBytesTransferred_() || 0;
                        },
                        enumerable: true,
                      },
                      mediaSecondsLoaded: {
                        get: function get() {
                          return _this3.masterPlaylistController_.mediaSecondsLoaded_() || 0;
                        },
                        enumerable: true,
                      },
                    });
                    this.tech_.one("canplay", this.masterPlaylistController_.setupFirstPlay.bind(this.masterPlaylistController_));
                    this.masterPlaylistController_.on("sourceopen", function () {
                      _this3.tech_.audioTracks().addEventListener("change", _this3.audioTrackChange_);
                      _this3.tech_.remoteTextTracks().addEventListener("change", _this3.textTrackChange_);
                    });
                    this.masterPlaylistController_.on("selectedinitialmedia", function () {
                      (0, _renditionMixin2["default"])(_this3);
                    });
                    this.masterPlaylistController_.on("audioupdate", function () {
                      _this3.tech_.clearTracks("audio");
                      _this3.masterPlaylistController_.activeAudioGroup().forEach(function (audioTrack) {
                        _this3.tech_.audioTracks().addTrack(audioTrack);
                      });
                    });
                    this.on(this.masterPlaylistController_, "progress", function () {
                      this.tech_.trigger("progress");
                    });
                    this.on(this.masterPlaylistController_, "firstplay", function () {
                      this.ignoreNextSeekingEvent_ = true;
                    });
                    this.tech_.ready(function () {
                      return _this3.setupQualityLevels_();
                    });
                    if (!this.tech_.el()) {
                      return;
                    }
                    this.tech_.src(_videoJs2["default"].URL.createObjectURL(this.masterPlaylistController_.mediaSource));
                  },
                },
                {
                  key: "setupQualityLevels_",
                  value: function setupQualityLevels_() {
                    var _this4 = this;
                    var player = _videoJs2["default"].players[this.tech_.options_.playerId];
                    if (player && player.qualityLevels) {
                      this.qualityLevels_ = player.qualityLevels();
                      this.masterPlaylistController_.on("selectedinitialmedia", function () {
                        handleHlsLoadedMetadata(_this4.qualityLevels_, _this4);
                      });
                      this.playlists.on("mediachange", function () {
                        handleHlsMediaChange(_this4.qualityLevels_, _this4.playlists);
                      });
                    }
                  },
                },
                {
                  key: "activeAudioGroup_",
                  value: function activeAudioGroup_() {
                    return this.masterPlaylistController_.activeAudioGroup();
                  },
                },
                {
                  key: "play",
                  value: function play() {
                    this.masterPlaylistController_.play();
                  },
                },
                {
                  key: "setCurrentTime",
                  value: function setCurrentTime(currentTime) {
                    this.masterPlaylistController_.setCurrentTime(currentTime);
                  },
                },
                {
                  key: "duration",
                  value: function duration() {
                    return this.masterPlaylistController_.duration();
                  },
                },
                {
                  key: "seekable",
                  value: function seekable() {
                    return this.masterPlaylistController_.seekable();
                  },
                },
                {
                  key: "dispose",
                  value: function dispose() {
                    if (this.playbackWatcher_) {
                      this.playbackWatcher_.dispose();
                    }
                    if (this.masterPlaylistController_) {
                      this.masterPlaylistController_.dispose();
                    }
                    if (this.qualityLevels_) {
                      this.qualityLevels_.dispose();
                    }
                    this.tech_.audioTracks().removeEventListener("change", this.audioTrackChange_);
                    this.tech_.remoteTextTracks().removeEventListener("change", this.textTrackChange_);
                    _get(Object.getPrototypeOf(HlsHandler.prototype), "dispose", this).call(this);
                  },
                },
              ]);
              return HlsHandler;
            })(Component);
            var HlsSourceHandler = function HlsSourceHandler(mode) {
              return {
                canHandleSource: function canHandleSource(srcObj) {
                  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
                  var localOptions = _videoJs2["default"].mergeOptions(_videoJs2["default"].options, options);
                  if (localOptions.hls && localOptions.hls.mode && localOptions.hls.mode !== mode) {
                    return false;
                  }
                  return HlsSourceHandler.canPlayType(srcObj.type, localOptions);
                },
                handleSource: function handleSource(source, tech) {
                  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
                  var localOptions = _videoJs2["default"].mergeOptions(_videoJs2["default"].options, options, {
                    hls: { mode: mode },
                  });
                  if (mode === "flash") {
                    tech.setTimeout(function () {
                      tech.trigger("loadstart");
                    }, 1);
                  }
                  tech.hls = new HlsHandler(source, tech, localOptions);
                  tech.hls.xhr = (0, _xhr2["default"])();
                  tech.hls.src(source.src);
                  return tech.hls;
                },
                canPlayType: function canPlayType(type) {
                  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
                  var localOptions = _videoJs2["default"].mergeOptions(_videoJs2["default"].options, options);
                  if (HlsSourceHandler.canPlayType(type, localOptions)) {
                    return "maybe";
                  }
                  return "";
                },
              };
            };
            HlsSourceHandler.canPlayType = function (type, options) {
              if (_videoJs2["default"].browser.IE_VERSION && _videoJs2["default"].browser.IE_VERSION <= 10) {
                return false;
              }
              var mpegurlRE = /^(audio|video|application)\/(x-|vnd\.apple\.)?mpegurl/i;
              if (!options.hls.overrideNative && Hls.supportsNativeHls) {
                return false;
              }
              return mpegurlRE.test(type);
            };
            if (typeof _videoJs2["default"].MediaSource === "undefined" || typeof _videoJs2["default"].URL === "undefined") {
              _videoJs2["default"].MediaSource = _videojsContribMediaSources.MediaSource;
              _videoJs2["default"].URL = _videojsContribMediaSources.URL;
            }
            var flashTech = _videoJs2["default"].getTech("Flash");
            if (_videojsContribMediaSources.MediaSource.supportsNativeMediaSources()) {
              _videoJs2["default"].getTech("Html5").registerSourceHandler(HlsSourceHandler("html5"), 0);
            }
            if (_globalWindow2["default"].Uint8Array && flashTech) {
              flashTech.registerSourceHandler(HlsSourceHandler("flash"));
            }
            _videoJs2["default"].HlsHandler = HlsHandler;
            _videoJs2["default"].HlsSourceHandler = HlsSourceHandler;
            _videoJs2["default"].Hls = Hls;
            if (!_videoJs2["default"].use) {
              _videoJs2["default"].registerComponent("Hls", Hls);
            }
            _videoJs2["default"].m3u8 = _m3u8Parser2["default"];
            _videoJs2["default"].options.hls = _videoJs2["default"].options.hls || {};
            if (_videoJs2["default"].registerPlugin) {
              _videoJs2["default"].registerPlugin("reloadSourceOnError", _reloadSourceOnError2["default"]);
            } else {
              _videoJs2["default"].plugin("reloadSourceOnError", _reloadSourceOnError2["default"]);
            }
            module.exports = {
              Hls: Hls,
              HlsHandler: HlsHandler,
              HlsSourceHandler: HlsSourceHandler,
            };
          }.call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}));
        },
        {
          "./bin-utils": 2,
          "./config": 3,
          "./master-playlist-controller": 5,
          "./playback-watcher": 7,
          "./playlist": 10,
          "./playlist-loader": 8,
          "./playlist-selectors.js": 9,
          "./reload-source-on-error": 12,
          "./rendition-mixin": 13,
          "./xhr": 20,
          "aes-decrypter": 24,
          "global/document": 30,
          "global/window": 31,
          "m3u8-parser": 32,
          "videojs-contrib-media-sources": 74,
        },
      ],
    },
    {},
    [77]
  )(77);
});
