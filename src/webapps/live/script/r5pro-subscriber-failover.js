/*
Copyright © 2015 Infrared5, Inc. All rights reserved.

The accompanying code comprising examples for use solely in conjunction with Red5 Pro (the "Example Code") 
is  licensed  to  you  by  Infrared5  Inc.  in  consideration  of  your  agreement  to  the  following  
license terms  and  conditions.  Access,  use,  modification,  or  redistribution  of  the  accompanying  
code  constitutes your acceptance of the following license terms and conditions.

Permission is hereby granted, free of charge, to you to use the Example Code and associated documentation 
files (collectively, the "Software") without restriction, including without limitation the rights to use, 
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit 
persons to whom the Software is furnished to do so, subject to the following conditions:

The Software shall be used solely in conjunction with Red5 Pro. Red5 Pro is licensed under a separate end 
user  license  agreement  (the  "EULA"),  which  must  be  executed  with  Infrared5,  Inc.   
An  example  of  the EULA can be found on our website at: https://account.red5pro.com/assets/LICENSE.txt.

The above copyright notice and this license shall be included in all copies or portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,  INCLUDING  BUT  
NOT  LIMITED  TO  THE  WARRANTIES  OF  MERCHANTABILITY, FITNESS  FOR  A  PARTICULAR  PURPOSE  AND  
NONINFRINGEMENT.   IN  NO  EVENT  SHALL INFRARED5, INC. BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN  AN  ACTION  OF  CONTRACT,  TORT  OR  OTHERWISE,  ARISING  FROM,  OUT  OF  OR  IN CONNECTION 
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/* global window, document, jQuery */
(function(window, document, $, promisify, red5pro) {
  'use strict';

  red5pro.setLogLevel('debug');
  var iceServers = window.r5proIce;
  // For IE support.
  var templateHTML = '<div class="broadcast-section">' +
        '<div id="video-container">' +
          '<div id="video-holder">' +
            '<video id="red5pro-subscriber" controls autoplay playsinline class="red5pro-media red5pro-media-background">' +
            '</video>' +
          '</div>' +
        '</div>' +
        '<div id="event-container">' +
          '<div id="status-field" class="status-message"></div>' +
          '<div id="stream-manager-info" class="status-message hidden">Using Stream Manager Proxy.</div>' +
          '<div id="event-log-field" class="event-log-field">' +
            '<div>' +
              '<div class="event-header">' +
                '<span>Event Log:</span>' +
                '<button id="clear-log-button">clear</button>' +
              '</div>' +
              '<hr class="event-hr">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

  var subscriber;

  var host = window.targetHost;
  var buffer = window.r5proBuffer;
  var protocol = window.location.protocol;
  var port = window.location.port ? window.location.port : (protocol === 'http' ? 80 : 443);
  protocol = protocol.substring(0, protocol.lastIndexOf(':'));
  function getSocketLocationFromProtocol (protocol) {
    return protocol === 'http' ? {protocol: 'ws', port: 5080} : {protocol: 'wss', port: 443};
  }

  var streamManagerInfo = document.getElementById('stream-manager-info');
  var $videoTemplate = document.getElementById('video-playback');

  var baseConfiguration = {
    host: host,
    app: 'live'
  };
  var rtcConfig = {
    protocol: getSocketLocationFromProtocol(protocol).protocol,
    port: getSocketLocationFromProtocol(protocol).port,
    rtcConfiguration: {
      iceServers: iceServers,
      iceCandidatePoolSize: 2,
      bundlePolicy: 'max-bundle'
    }
  };
  var rtmpConfig = {
    protocol: 'rtmp',
    port: 1935,
    width: 640,
    height: 360,
    embedWidth: '100%',
    embedHeight: '100%',
    backgroundColor: '#000000',
    swf: 'lib/red5pro/red5pro-subscriber.swf',
    swfobjectURL: 'lib/swfobject/swfobject.js',
    productInstallURL: 'lib/swfobject/playerProductInstall.swf',
    buffer: isNaN(buffer) ? 2 : buffer,    
  };
  var hlsConfig = {
    protocol: protocol,
    port: port,
    mimeType: 'application/x-mpegURL',
    swfobjectURL: 'lib/swfobject/swfobject.js',
    productInstallURL: 'lib/swfobject/playerProductInstall.swf'
  };

  function updateConfigurationsForStreamManager (serverJSON) {
    var host = serverJSON.serverAddress;
    var app = serverJSON.scope;
    var streamName = serverJSON.name;
    rtcConfig = Object.assign({}, rtcConfig, {
      host: window.targetHost,
      app: 'streammanager',
      streamName: streamName,
      connectionParams: {
        host: host,
        app: app
      }
    });
    rtmpConfig = Object.assign({}, rtmpConfig, {
      host: host,
      app: app
    });
    hlsConfig = Object.assign({}, hlsConfig, {
      host: host,
      app: app
    });
  }

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
      default:
        updateStatusField(statusField, 'No suitable Publisher found. WebRTC, Flash and HLS are not supported.');
        break;
    }
  }

  function onSubscribeStart (subscriber) {
    console.log('[subscriber]:: Subscriber started - ' + subscriber.getType());
  }

  function onSubscriberEvent (event) {
    var eventLog = '[Red5ProSubscriber] ' + event.type + '.';
    console.log(eventLog);
    if (event.type !== 'Subscribe.Time.Update') {
      addEventLogToField(document.getElementById('event-log-field'), eventLog);
    }
    if (event.type === 'Subscriber.Connection.Closed') {
      updateStatusField(document.getElementById('status-field'), 'Connection has been Closed.');
    }
  }

  function handleHostIpChange (value) {
    host = baseConfiguration.host = value;
    if (hasEstablishedSubscriber()) {
      teardown();
      doSubscribe(baseConfiguration.streamName);
    }
  }

  function queryExists (elements) {
    return elements && elements.length > 0;
  }

  var toggleSelectedPlayback = function viewStream (streamName) {
    var currentPlayback = $('li[data-active="true"]');
    var targetPlayback = $('li[data-stream="' + streamName + '"]');
    teardown();
    if (!queryExists(currentPlayback) || 
        (queryExists(targetPlayback) && currentPlayback.get(0) != targetPlayback.get(0))) {
      doSubscribe(streamName);
    }
  };

  function addPlayer(tmpl, container) {
    var $el = templateContent(tmpl);
    container.appendChild($el);
    return $el;
  }

  function teardown () {
    var currentPlayback = $('li[data-active="true"]');
    var removePlayback = function () {
      if (queryExists(currentPlayback)) {
        currentPlayback.attr('data-active', 'false');
        var openLink = currentPlayback.find('.subscriber-link');
        var videoContainer = currentPlayback.find('.broadcast-section');
        if (queryExists(openLink)) {
          openLink.text('View');
        }
        if (queryExists(videoContainer)) {
          videoContainer.remove();
        }
      }
    }
    unsubscribe().then(removePlayback).catch(removePlayback)
  }

  function setup (streamName) {
    var parentContainer = $('li[data-stream=' + streamName + ']');
    if (queryExists(parentContainer)) {
      var openLink = parentContainer.find('.subscriber-link');
      addPlayer($videoTemplate, parentContainer.get(0));
      parentContainer.attr('data-active', true);
      if (queryExists(openLink)) {
        openLink.text('Close');
      }
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

  function doSubscribe (streamName) {
    baseConfiguration.streamName = streamName;
    setup(streamName);
    var fn = startSubscription;
    window.r5pro_isStreamManager()
      .then(function () {
        window.r5pro_requestEdge('live', streamName)
          .then(function (origin) {
            updateConfigurationsForStreamManager(origin);
            streamManagerInfo.classList.remove('hidden');
            streamManagerInfo.innerText = 'Using Stream Manager Origin at: ' + origin.serverAddress + '.';
            fn();
          })
          .catch(fn);
      })
      .catch(fn);
  }

  function startSubscription () {
    determineSubscriber()
      .then(preview)
      .then(subscribe)
      .catch(function (error) {
        var errorStr = typeof error === 'string' ? error : JSON.stringify(error, null, 2);
        console.error('[subscriber]:: Error in subscribing to stream - ' + errorStr);
       });
  }

  function determineSubscriber () {
    return promisify(function (resolve, reject) {
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
    return promisify(function (resolve, reject) {

      subscriber = selectedSubscriber
      var type = selectedSubscriber.getType().toLowerCase();
      switch (type) {
        case 'rtc':
        case 'hls':
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

  function templateContent(template) {
    if("content" in document.createElement("template")) {
      return document.importNode(template.content, true);
    }
    else {
      var div = document.createElement('div');
      div.innerHTML = templateHTML;
      return div;
    }
  }

  function subscribe (subscriber) {
    return promisify(function (resolve, reject) {
      if (window.trackAutoplayRestrictions) {
        window.trackAutoplayRestrictions(subscriber);
      }
      subscriber.on('*', onSubscriberEvent);
      subscriber.subscribe()
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
    return promisify(function (resolve, reject) {
      if (hasEstablishedSubscriber()) {
        subscriber.unsubscribe()
          .then(function() {
            if (window.untrackAutoplayRestrictions) {
              window.untrackAutoplayRestrictions(subscriber);
            }
            subscriber.off('*', onSubscriberEvent);
            subscriber = undefined;
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
  window.invokeViewStream = toggleSelectedPlayback;

  var shuttingDown = false;
  function shutdown () {
    if (shuttingDown) return;
    shuttingDown = true;
    unsubscribe();
  }
  window.addEventListener('pagehide', shutdown);
  window.addEventListener('beforeunload', shutdown);

  window.subscriberLog = function (message) {
    console.log('[RTMP SUBSCRIBER]:: ' + message);
  };

 })(window, document, jQuery.noConflict(), window.promisify, window.red5prosdk);
