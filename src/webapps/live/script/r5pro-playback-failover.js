/* global document, Promise, jQuery */
(function(window, document, $, red5prosdk) {
  'use strict';

  red5prosdk.setLogLevel('debug');

  var iceServers = window.r5proIce;
  // For IE support.
  var vidTemplateHTML = '<div id="video-container">' +
          '<div id="video-holder">' +
            '<video id="red5pro-subscriber" controls autoplay playsinline class="red5pro-media red5pro-media-background">' +
            '</video>' +
          '</div>' +
          '<div id="status-field" class="status-message"></div>' +
          '<div id="event-log-field" class="event-log-field">' +
            '<div style="padding: 10px 0">' +
              '<p><span style="float: left;">Event Log:</span><button id="clear-log-button" style="float: right;">clear</button></p>' +
              '<div style="clear: both;"></div>' +
            '</div>' +
          '</div>'
        '</div>';
  var flashTemplateHTML = '<div id="video-container">' +
            '<div id="video-holder" style="height:405px;">' +
              '<object type="application/x-shockwave-flash" id="red5pro-subscriber" name="red5pro-subscriber" align="middle" data="lib/red5pro/red5pro-subscriber.swf" width="100%" height="100%" class="red5pro-media-background red5pro-media">' +
                '<param name="quality" value="high">' +
                '<param name="wmode" value="opaque">' +
                '<param name="bgcolor" value="#000000">' +
                '<param name="allowscriptaccess" value="always">' +
                '<param name="allowfullscreen" value="true">' +
                '<param name="allownetworking" value="all">' +
            '</object>' +
          '</div>' +
      '</div>';

  var subscriber;
  var streamDataModel;

  var host = window.targetHost;
  var buffer = window.r5proBuffer;
  var protocol = window.location.protocol;
  var port = window.location.port ? window.location.port : (protocol === 'http' ? 80 : 443);
  protocol = protocol.substring(0, protocol.lastIndexOf(':'));
  function getSocketLocationFromProtocol (protocol) {
    return protocol === 'http' ? {protocol: 'ws', port: 5080} : {protocol: 'wss', port: 443};
  }

  var $videoTemplate = document.getElementById('video-playback');
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
    swf: 'lib/red5pro/red5pro-subscriber.swf',
    swfobjectURL: 'lib/swfobject/swfobject.js',
    productInstallURL: 'lib/swfobject/playerProductInstall.swf'
  };
  var hlsConfig = {
    protocol: protocol,
    port: port,
    mimeType: 'application/x-mpegURL',
    swfobjectURL: 'lib/swfobject/swfobject.js',
    productInstallURL: 'lib/swfobject/playerProductInstall.swf'
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
    console.log(eventLog);
    addEventLogToField(document.getElementById('event-log-field'), eventLog);
    if (event.type === 'Subscribe.Metadata') {
      var value = event.data.orientation; // eslint-disable-line no-unused-vars
      if (subscriber.getType().toLowerCase() === 'hls' ||
          subscriber.getType().toLowerCase() === 'rtc') {
        var container = document.getElementById('video-holder');
        var element = document.getElementById('red5pro-subscriber'); // eslint-disable-line no-unused-vars
        if (container) {
          //          container.style.height = value % 180 != 0 ? element.offsetWidth + 'px' : element.offsetHeight + 'px';
          //          if (subscriber.getType().toLowerCase() === 'hls') {
          //            element.style.height = '100%'
          //          }
        }
      }
    }
  }

  function addPlayer(tmpl, container, html) {
    var $el = templateContent(tmpl, html);
    container.appendChild($el);
    return $el;
  }

  function teardown () {
    var videoContainer = document.getElementById('video-container');
    unsubscribe()
      .then(function () {
        if (videoContainer && videoContainer.parentNode) {
          videoContainer.parentNode.removeChild(videoContainer);
        }
      })
  }

  function setup (dataStreamName, template, html) {
    var parentContainer = $('li[data-stream="' + dataStreamName + '"]').get(0);
    if (parentContainer) {
      addPlayer(template, parentContainer, html);
    }
    var clearLogButton = document.getElementById('clear-log-button');
    var eventLogField = document.getElementById('event-log-field');
    if (clearLogButton) {
      clearLogButton.addEventListener('click', function () {
        while (eventLogField.children.length > 1) {
          eventLogField.removeChild(eventLogField.lastChild);
        }
      });
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

  function useFLVFallback (streamName) {
    teardown();
    var container = document.getElementById('video-container')
    if (container) {
      container.remove();
    }
    setup(streamName, $flashTemplate, flashTemplateHTML);
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
    setup(streamName, $videoTemplate, vidTemplateHTML);
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

  function handleHostIpChange (value) {
    host = baseConfiguration.host = value;
    if (streamDataModel && hasEstablishedSubscriber()) {
      teardown();
      startSubscription(streamDataModel);
    }
  }

  var viewHandler = function viewStream (value) {
    var dataString = decodeURIComponent($('li[data-stream="' + value + '"]').data('streamitem'));
    var streamData = JSON.parse(dataString);
    console.log('[playback]:: Selected stream data -\r\n' + JSON.stringify(streamData, null, 2));

    streamDataModel = streamData;

    teardown();
    startSubscription(streamData);
  };

  var viewPageHandler = function viewPageStream (value) {
    var json = $('li[data-stream="' + value + '"]').data('streamitem');
    var streamDataStr = decodeURIComponent(json);
    var streamData = JSON.parse(streamDataStr);
    console.log('Stream data:\r\n' + JSON.stringify(streamData, null, 2));

    window.streamdata = json;
    var pageUrl = 'viewer-vod.jsp?host=' + window.targetHost + '&stream=' + streamData.name;
    if (targetViewTech) {
      pageUrl += '&view=' + targetViewTech;
    }
    window.open(pageUrl);
  };

  function templateContent(template, templateHTML) {
    if("content" in document.createElement("template")) {
      return document.importNode(template.content, true);
    }
    else {
      var div = document.createElement('div');
      div.innerHTML = templateHTML;
      return div;
    }
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
      var subscriber = new red5prosdk.Red5ProSubscriber();
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

  window.r5pro_registerIpChangeListener(handleHostIpChange);
  window.invokeViewStream = viewHandler;
  window.invokeViewPageStream = viewPageHandler;
  window.addEventListener('beforeunload', function () {
    unsubscribe();
  });

  window.subscriberLog = function (message) {
    console.log('[RTMP SUBSCRIBER]:: ' + message);
  };

 }(this, document, jQuery.noConflict(), this.red5prosdk));
