/* global document, navigator, Promise, jQuery */
(function(window, document, $, red5pro) {
  'use strict';

  var isMoz = !!navigator.mozGetUserMedia;
  var iceServers = window.r5proIce && window.r5proIce === 'red5pro'
    ? [{url: 'stun:50.56.81.179:3478'}]
    : undefined;

  var subscriber;
  var view;

  var host = window.targetHost;
  var buffer = window.r5proBuffer;
  var protocol = window.location.protocol;
  var port = window.location.port ? window.location.port : 5080;
  protocol = protocol.substring(0, protocol.lastIndexOf(':'));
  function getSocketLocationFromProtocol (protocol) {
    return protocol === 'http' ? {protocol: 'ws', port: 8081} : {protocol: 'wss', port: 8083};
  }

  var $videoTemplate = document.getElementById('video-playback');
  var baseConfiguration = {
    host: host,
    app: 'live',
    buffer: isNaN(buffer) ? 2 : buffer,
    iceServers: iceServers || (isMoz
      ? [{urls: 'stun:stun.services.mozilla.com:3478'}]
      : [{urls: 'stun:stun2.l.google.com:19302'}])
  };
  var rtcConfig = {
    protocol: getSocketLocationFromProtocol(protocol).protocol,
    port: getSocketLocationFromProtocol(protocol).port,
    subscriptionId: 'subscriber-' + Math.floor(Math.random() * 0x10000).toString(16),
    bandwidth: {
      audio: 50,
      video: 256,
      data: 30 * 1000 * 1000
    }
  };
  var rtmpConfig = {
    protocol: 'rtmp',
    port: 1935,
    mimeType: 'rtmp/flv',
    useVideoJS: false,
    width: 640,
    height: 480,
    embedWidth: '100%',
    embedHeight: '100%',
    swf: 'lib/red5pro/red5pro-subscriber.swf',
    swfobjectURL: 'lib/swfobject/swfobject.js',
    productInstallURL: 'lib/swfobject/playerProductInstall.swf'
  };
  var hlsConfig = {
    protocol: protocol,
    port: port,
    mimeType: 'application/x-mpegURL',
    swf: 'lib/red5pro/red5pro-video-js.swf',
    swfobjectURL: 'lib/swfobject/swfobject.js',
    productInstallURL: 'lib/swfobject/playerProductInstall.swf'
  };

  var targetViewTech = window.r5proViewTech;
  var playbackOrder = targetViewTech ? [targetViewTech] : ['rtc', 'rtmp', 'hls'];

  function hasEstablishedSubscriber () {
    return typeof subscriber !== 'undefined';
  }

  function updateStatusField (element, message) {
    element.innerText = message;
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
      default:
        updateStatusField(statusField, 'No suitable Publisher found. WebRTC, Flash and HLS are not supported.');
        break;
    }
  }

  function onSubscribeStart (subscriber) {
    if (subscriber.getType().toLowerCase() === 'hls') {
      window.onOrientation(subscriber.getPlayer(), 'red5pro-subscriber-video', function (value) {
        var container = document.getElementById('video-holder');
        var element = document.getElementById('red5pro-subscriber-video');
        if (container) {
          container.style.height = value % 180 != 0 ? element.offsetWidth + 'px' : element.offsetHeight + 'px';
        }
      });
    }
  }

  function onSubscriberEvent (event) {
    var eventLog = '[Red5ProSubscriber] ' + event.type + '.';
    console.log(eventLog);
    addEventLogToField(document.getElementById('event-log-field'), eventLog);
  }

  function addPlayer(tmpl, container) {
    var $el = document.importNode(tmpl.content, true);
    container.appendChild($el);
    return $el;
  }

  function teardown () {
    var videoContainer = document.getElementById('video-container');
    unsubscribe()
      .then(function () {
        if (videoContainer) {
          videoContainer.remove();
        }
      })
  }

  function setup (dataStreamName) {
    var parentContainer = $('li[data-stream=' + dataStreamName + ']').get(0);
    if (parentContainer) {
      addPlayer($videoTemplate, parentContainer);
    }
    var clearLogButton = document.getElementById('clear-log-button');
    var eventLogField = document.getElementById('event-log-field');
    clearLogButton.addEventListener('click', function () {
      while (eventLogField.children.length > 1) {
        eventLogField.removeChild(eventLogField.lastChild);
      }
    });
  }

  function startSubscription (streamName) {
    baseConfiguration.streamName = streamName;
    setup(streamName);
    determineSubscriber()
      .then(preview)
      .then(subscribe)
      .catch(function (error) {
        var errorStr = typeof error === 'string' ? error : JSON.stringify(error, null, 2);
        console.error('[subscriber]:: Error in subscribing to stream - ' + errorStr);
       });
  }

  function handleHostIpChange (value) {
    host = baseConfiguration.host = value;
    teardown();
    startSubscription();
  }

  var viewHandler = function viewStream (value) {
    teardown();
    startSubscription(value);
  };

  function determineSubscriber () {
    return new Promise(function (resolve, reject) {
      var subscriber = new red5pro.Red5ProSubscriber();
      subscriber.on('*', onSubscriberEvent);

      var config = {
        rtc: Object.assign({}, baseConfiguration, rtcConfig),
        rtmp: Object.assign({}, baseConfiguration, rtmpConfig),
        hls: Object.assign({}, baseConfiguration, hlsConfig)
      };
      console.log('[subscriber]:: Configuration\r\n' + JSON.stringify(config, null, 2));

      subscriber.setPlaybackOrder(playbackOrder)
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
    return new Promise(function (resolve, reject) {

      subscriber = selectedSubscriber;
      view = new red5pro.PlaybackView('red5pro-subscriber-video');
      view.attachSubscriber(subscriber);

      var type = selectedSubscriber.getType().toLowerCase();
      switch (type) {
        case 'rtc':
          resolve({
            subscriber: subscriber,
            view: view
          });
          break;
        case 'rtmp':
        case 'livertmp':
        case 'rtmp - videojs':
          var holder = document.getElementById('video-holder');
          holder.style.height = '405px';
          resolve({
            subscriber: subscriber,
            view: view
          });
          break;
        case 'hls':
          view.view.classList.add('video-js', 'vjs-default-skin')
          view.view.height = 300;
          resolve({
            subscriber: subscriber,
            view: view
          });
          break;
        default:
          reject('View not available for ' + type + '.');
      }

    });
  }

  function subscribe () {
    return new Promise(function (resolve, reject) {
      subscriber.on('*', onSubscriberEvent);
      subscriber.play()
        .then(function () {
          onSubscribeStart(subscriber);
          resolve();
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }

  function unsubscribe () {
    return new Promise(function (resolve, reject) {
      if (hasEstablishedSubscriber()) {
        subscriber.stop()
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

  window.r5pro_registerIpChangeListener(handleHostIpChange);
  window.invokeViewStream = viewHandler;
  window.addEventListener('beforeunload', function () {
    unsubscribe();
  });

  window.subscriberLog = function (message) {
    console.log('[RTMP SUBSCRIBER]:: ' + message);
  };

 }(this, document, jQuery.noConflict(), this.red5prosdk));
