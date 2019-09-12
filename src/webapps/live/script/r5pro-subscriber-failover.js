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
/* global document, Promise, jQuery */
(function(window, document, $, red5pro) {
  'use strict';

  red5pro.setLogLevel('debug');
  var iceServers = window.r5proIce;
  // For IE support.
  var templateHTML = '<div id="video-holder">' +
            '<video id="red5pro-subscriber" controls autoplay playsinline class="red5pro-media red5pro-media-background">' +
            '</video>' +
          '</div>' +
          '<div id="status-field" class="status-message"></div>' +
          '<div id="event-log-field" class="event-log-field">' +
            '<div style="padding: 10px 0">' +
              '<p><span style="float: left;">Event Log:</span><button id="clear-log-button" style="float: right;">clear</button></p>' +
              '<div style="clear: both;"></div>' +
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

  var $videoTemplate = document.getElementById('video-playback');
  var baseConfiguration = {
    host: host,
    app: 'live',
    buffer: isNaN(buffer) ? 2 : buffer,
    rtcConfiguration: {
      iceServers: iceServers,
      iceCandidatePoolSize: 2,
      bundlePolicy: 'max-bundle'
    }
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
    width: 640,
    height: 480,
    embedWidth: '100%',
    embedHeight: '100%',
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
    console.log('[subscriber]:: Subscriber started - ' + subscriber.getType());
  }

  function onSubscriberEvent (event) {
    var eventLog = '[Red5ProSubscriber] ' + event.type + '.';
    console.log(eventLog);
    if (event.type !== 'Subscribe.Time.Update') {
      addEventLogToField(document.getElementById('event-log-field'), eventLog);
    }

    if (event.type === 'Subscribe.Metadata') {
      if (event.data.hasOwnProperty('orientation')) {
        var value = event.data.orientation; // eslint-disable-line no-unused-vars
        if (subscriber.getType().toLowerCase() === 'hls' ||
            subscriber.getType().toLowerCase() === 'rtc') {
          var container = document.getElementById('video-holder');
          var element = document.getElementById('red5pro-subscriber');  // eslint-disable-line no-unused-vars
          if (container) {
            //            container.style.height = value % 180 != 0 ? element.offsetWidth + 'px' : element.offsetHeight + 'px';
            //            if (subscriber.getType().toLowerCase() === 'hls') {
            //              element.style.height = '100%'
            //            }
          }
        }
      }
    }
    else if (event.type === 'Subscriber.Connection.Closed') {
      updateStatusField(document.getElementById('status-field'), 'Connection has been Closed!');
    }
  }

  function addPlayer(tmpl, container) {
    var $el = templateContent(tmpl);
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

  function setup (dataStreamName) {
    var parentContainer = $('li[data-stream=' + dataStreamName + ']').get(0);
    if (parentContainer) {
      addPlayer($videoTemplate, parentContainer);
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
    if (hasEstablishedSubscriber()) {
      teardown();
      startSubscription();
    }
  }

  var viewHandler = function viewStream (value) {
    teardown();
    startSubscription(value);
  };

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

 }(this, document, jQuery.noConflict(), this.red5prosdk));
