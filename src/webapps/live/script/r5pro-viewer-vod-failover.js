/* global document, Promise, $ */
(function(window, document, red5pro) {
  'use strict';

 red5pro.setLogLevel('debug');
  var iceServers = window.r5proIce;
  var subscriber;

  var host = window.targetHost;
  var buffer = window.r5proBuffer;
  var protocol = window.location.protocol;
  var port = window.location.port ? window.location.port : (protocol === 'http' ? 80 : 443);
  protocol = protocol.substring(0, protocol.lastIndexOf(':'));
  function getSocketLocationFromProtocol (protocol) {
    return protocol === 'http' ? {protocol: 'ws', port: 5080} : {protocol: 'wss', port: 443};
  }

  var $flashTemplate = document.getElementById('flash-playback');

  var baseConfiguration = {
    host: host,
    app: 'live',
    buffer: isNaN(buffer) ? 2 : buffer,
    embedWidth: '100%',
    embedHeight: '100%',
    iceServers: iceServers // will override the rtcConfiguration.iceServers
  };
  var rtcConfig = {
    protocol: getSocketLocationFromProtocol(protocol).protocol,
    port: getSocketLocationFromProtocol(protocol).port,
    subscriptionId: 'subscriber-' + Math.floor(Math.random() * 0x10000).toString(16)
  };
  var rtmpConfig = {
    protocol: 'rtmp',
    port: 1935,
    mimeType: 'rtmp/flv',
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  };
  var hlsConfig = {
    protocol: protocol,
    port: port,
    mimeType: 'application/x-mpegURL'
  };

  var targetViewTech = window.r5proViewTech;
  var playbackOrder = targetViewTech ? [targetViewTech] : ['rtc', 'rtmp', 'hls'];

  function hasEstablishedSubscriber () {
    return typeof subscriber !== 'undefined';
  }

  function updateStatusField (element, message) {
    if (element) {
      element.innerText = message;
    }
  }

  function addEventLogToField (element, eventLog) {
    var p = document.createElement('p');
    var text = document.createTextNode(eventLog);
    p.appendChild(text);
    element.appendChild(p);
  }

  function showSubscriberImplStatus (subscriber) {
    var statusField = document.getElementById('status-field');
    var type = subscriber ? subscriber.getType().toLowerCase() : undefined;
    switch (type) {
      case 'rtc':
        updateStatusField(statusField, 'Using WebRTC-based Playback!');
        break;
      case 'rtmp':
      case 'livertmp':
      case 'rtmp - videojs':
        updateStatusField(statusField, 'Failover to use Flash-based Playback.');
        break;
      case 'hls':
        updateStatusField(statusField, 'Failover to use HLS-based Playback.');
        break;
      case 'mp4':
        updateStatusField(statusField, 'Failover to MP4 playback in video element.');
        break;
      case 'flv':
        updateStatusField(statusField, 'Attempting force of Flash embed for FLV playback.');
        break;
      case 'videojs':
        updateStatusField(statusField, 'Attempting force of HLS playback using VideoJS.');
        break;
      default:
        updateStatusField(statusField, 'No suitable Subscriber found. WebRTC, Flash and HLS are not supported.');
        break;
    }
  }

  function onSubscriberEvent (event) {
    var eventLog = '[Red5ProSubscriber] ' + event.type + '.';
    if (event.type !== 'Subscribe.Time.Update') {
      console.log(eventLog);
      addEventLogToField(document.getElementById('event-log-field'), eventLog);
    }
    if (event.type === 'Subscribe.Metadata') {
      var value = event.data.orientation; // eslint-disable-line no-unused-vars
      if (subscriber.getType().toLowerCase() === 'hls' ||
           subscriber.getType().toLowerCase() === 'rtc') {
        var container = document.getElementById('video-holder');
        var element = document.getElementById('red5pro-subscriber-video'); // eslint-disable-line no-unused-vars
        if (container) {
          // container.style.height = value % 180 != 0 ? element.offsetWidth + 'px' : element.offsetHeight + 'px';
        }
      }
    }
  }

  function useMP4Fallback (src) {
    var vid = src.split('/');
    var len = vid.length;
    vid.splice(len - 1, 0, 'streams');
    var loc = vid.join('/');

    var element = document.getElementById('red5pro-subscriber');
    var source = document.createElement('source');
    source.type = 'video/mp4;codecs="avc1.42E01E, mp4a.40.2"';
    source.src = loc;
    element.appendChild(source);
    showSubscriberImplStatus({
      getType: function() {
        return 'mp4';
      }
    });
  }

  function addPlayer(tmpl, container) {
    var $el = document.importNode(tmpl.content, true);
    container.appendChild($el);
    return $el;
  }

  function useFLVFallback (streamName) {
    var container = document.getElementById('red5pro-subscriber')
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    addPlayer($flashTemplate, document.getElementById('video-holder'));
    var flashObject = document.getElementById('red5pro-subscriber');
      var flashvars = document.createElement('param');
      flashvars.name = 'flashvars';
      flashvars.value = 'stream='+streamName+'&'+
                        'app='+baseConfiguration.app+'&'+
                        'host='+baseConfiguration.host+'&'+
                        'muted=false&'+
                        'autoplay=true&'+
                        'backgroundColor=#000000&'+
                        'buffer=0.5&'+
                        'autosize=true';
    flashObject.appendChild(flashvars);
    showSubscriberImplStatus({
      getType: function() {
        return 'flv';
      }
    });
  }

  function useVideoJSFallback (url) {
    var videoElement = document.getElementById('red5pro-subscriber');
    videoElement.classList.add('video-js');
    var source = document.createElement('source');
    source.type = 'application/x-mpegURL';
    source.src = url;
    videoElement.appendChild(source);
    new window.videojs(videoElement, {
      techOrder: ['html5', 'flash']
    }, function () {
      // success.
    });
    showSubscriberImplStatus({
      getType: function() {
        return 'videojs';
      }
    });
  }

  function startSubscription (streamData) {
    /**
     * streamData format:
     * {
     *    "name": "webrtc2",
     *    "urls": {
     *      "rtmp": "http://10.0.0.10:5080/live/webrtc2.flv"
     *    }
     *  }
     */
    var streamName = streamData.name;
    baseConfiguration.streamName = streamName;
    determineSubscriber(Object.keys(streamData.urls))
      .then(preview)
      .then(subscribe)
      .catch(function (error) {
        var errorStr = typeof error === 'string' ? error : JSON.stringify(error, null, 2);
        console.error('[viewer]:: Error in subscribing to stream - ' + errorStr);
        if (streamData.urls && streamData.urls.rtmp) {
          if (streamData.urls.rtmp.indexOf('mp4') !== -1) {
            useMP4Fallback(streamData.urls.rtmp)
          }
          else {
            useFLVFallback(streamData.name)
          }
        }
        else if (streamData.urls && streamData.urls.hls) {
          useVideoJSFallback(streamData.urls.hls);
        }
       });
  }

  function promisify (fn) {
    if (window.Promise) {
      return new Promise(fn);
    }
    var d = new $.Deferred();
    fn(d.resolve, d.reject);
    var promise = d.promise();
    promise.catch = promise.fail;
    return promise;
  }

  function determineSubscriber (types) {
    console.log('[playback]:: Available types - ' + types + '.');
    return promisify(function (resolve, reject) {
      var subscriber = new red5pro.Red5ProSubscriber();
      subscriber.on('*', onSubscriberEvent);

      var typeConfig = {
        rtc: rtcConfig,
        rtmp: rtmpConfig,
        hls: hlsConfig
      };
      var key;
      var config = {};
      for (key in typeConfig) {
        if (types.indexOf(key) > -1) {
          config[key] = Object.assign({}, baseConfiguration, typeConfig[key]);
        }
        if (key === 'hls' && config.hasOwnProperty('hls') && config[key].streamName) {
          config[key].streamName = config[key].streamName.substring(0, config[key].streamName.indexOf('.'));
        }
      }
      var order = playbackOrder;
      var index = order.length;
      while (--index > -1) {
        if (types.indexOf(order[index]) === -1) {
          order.splice(index, 1);
        }
      }
      console.log('[playback]:: Playback Order - ' + order + '.');
      console.log('[viewer]:: Configuration\r\n' + JSON.stringify(config, null, 2));

      if (order.length === 0) {
        var error = 'Cannot start playback. No available playback options.';
        console.error(error);
        throw new Error(error);
        return;
      }

      subscriber.setPlaybackOrder(order)
        .init(config)
        .then(function (selectedSubscriber) {
          subscriber.off('*', onSubscriberEvent);
          showSubscriberImplStatus(selectedSubscriber);
          resolve(selectedSubscriber);
        })
        .catch(function (error) {
          subscriber.off('*', onSubscriberEvent);
          showSubscriberImplStatus(null);
          reject(error);
        });

    });
  }

  function preview (selectedSubscriber) {
    return promisify(function (resolve, reject) {

      subscriber = selectedSubscriber;
      var type = selectedSubscriber.getType().toLowerCase();
      switch (type) {
        case 'hls':
        case 'rtc':
          resolve(subscriber);
          break;
        case 'rtmp':
        case 'livertmp':
        case 'rtmp - videojs':
          var holder = document.getElementById('video-holder');
          holder.style.height = '405px';
          resolve(subscriber);
          break;
        default:
          reject('View not available for ' + type + '.');
      }

    });
  }

  function subscribe (subscriber) {
    return promisify(function (resolve, reject) {
      subscriber.on('*', onSubscriberEvent);
      subscriber.subscribe()
        .then(function () {
          resolve();
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }

  function unsubscribe () {
    return promisify(function (resolve, reject) {
      if (hasEstablishedSubscriber()) {
        subscriber.unsubscribe()
          .then(function() {
            subscriber.off('*', onSubscriberEvent);
            resolve();
          })
          .catch(function (error) {
            reject(error);
          });
      }
      else {
        resolve();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    unsubscribe();
  });

  window.subscriberLog = function (message) {
    console.log('[RTMP SUBSCRIBER]:: ' + message);
  };

  if (window.streamData) {
    startSubscription(window.streamData);
  }

 }(this, document, this.red5prosdk));
