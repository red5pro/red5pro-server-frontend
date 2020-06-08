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
(function (window, document, $, promisify, red5pro) {
  'use strict';

  red5pro.setLogLevel('debug');

  var loadingIcon = document.getElementsByClassName('loading-icon')[0];
  var statusField = document.getElementsByClassName('status-field')[0];
  var statsField = document.getElementsByClassName('statistics-field')[0];
  var streamManagerInfo = document.getElementsByClassName('stream-manager-info')[0];
  var eventLogField = document.getElementsByClassName('event-log-field')[0];
  var clearLogButton = document.getElementById('clear-log-button');
  var idContainer = document.getElementById('id-container');
  var videoReportElement = document.getElementById('video-report');
  var audioReportElement = document.getElementById('audio-report');
  var reportContainer = document.getElementById('report-container');
  var showHideReportsButton = document.getElementById('show-hide-reports-btn');
  if (reportContainer && showHideReportsButton) {
    showHideReportsButton.addEventListener('click', function () {
      var isHidden = reportContainer.classList.contains('hidden');
      if (isHidden) {
        reportContainer.classList.remove('hidden');
        showHideReportsButton.innerText = 'Hide Live Reports';
      } else {
        reportContainer.classList.add('hidden');
        showHideReportsButton.innerText = 'Show Live Reports';
      }
    })
  }

  var subscriptionId = 'subscriber-' + Math.floor(Math.random() * 0x10000).toString(16);
  var subscriber;

  var iceServers = window.r5proIce;
  var protocol = window.location.protocol;
  protocol = protocol.substring(0, protocol.lastIndexOf(':'));
  var port = window.location.port ? window.location.port : (protocol === 'http' ? 80 : 443);
  function getSocketLocationFromProtocol (protocol) {
    return protocol === 'http' ? {protocol: 'ws', port: 5080} : {protocol: 'wss', port: 443};
  }
  var targetViewTech = window.r5proViewTech;
  var playbackOrder = targetViewTech ? [targetViewTech] : ['rtc', 'rtmp', 'hls'];

  var baseConfiguration = {
    host: window.targetHost,
    app: window.r5proApp,
    streamName: window.r5proStreamName
  };
  var rtcConfig = {
    protocol: window.targetProtocol ? window.targetProtocol : getSocketLocationFromProtocol(protocol).protocol,
    port: window.targetPort ? window.targetPort : getSocketLocationFromProtocol(protocol).port,
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
    height: 480,
    backgroundColor: '#000000',
    embedWidth: window.r5proVideoWidth,
    embedHeight: window.r5proVideoHeight,
    buffer: isNaN(window.r5proBuffer) ? 2 : window.r5proBuffer
  };
  var hlsConfig = {
    protocol: protocol,
    port: port
  };

  function updateConfigurationsForStreamManager (serverJSON) {
    var host = serverJSON.serverAddress;
    var app = serverJSON.scope;
    rtcConfig = Object.assign({}, rtcConfig, {
      host: window.targetHost,
      app: 'streammanager',
      connectionParams: {
        host: host,
        app: app
      }
    });
    rtmpConfig = Object.assign({}, rtmpConfig, {
      host: host,
      app: app
    });
  }

  clearLogButton.addEventListener('click', clearLog);

  function clearLog () {
    while (eventLogField.children.length > 1) {
      eventLogField.removeChild(eventLogField.lastChild);
    }
  }

  function generateReportBlock (key, value, $parent) {
    var $el = $parent.find('.' + key);
    if ($el.length > 0) {
      $el.text(value);
    } else {
      $parent.append('<p><span class="report_key">' + key + '</span>:<span class="report_value ' + key + '">' + value + '</span></p>');
    }
  }

  function generateReportStats (bitrate, packets, $parent) {
    var $b = $parent.find('.bitrate');
    var $p = $parent.find('.packets');
    if ($b.length > 0 && $p.length > 0) {
      $b.text(bitrate);
      $p.text(packets);
    } else {
    $parent.append('<span>Bitrate: </span><span class="bold bitrate">' + bitrate + '</span>' +
                    '<span>. Packets Received: </span><span class="bold packets">' + packets + '</span>' + 
                    '<span>.</span>');
    }
  }

  function toggleReportTracking (subscriber, turnOn) {
    if (subscriber && turnOn) {
      var $audio = $(audioReportElement);
      var $video = $(videoReportElement);
      var $audioStats = $('#audio-report_stats');
      var $videoStats = $('#video-report_stats');
      var videoElement = document.getElementById('red5pro-subscriber');
      statsField.classList.remove('hidden');
      try {
        window.trackBitrate(subscriber.getPeerConnection(), function (type, report, bitrate, packetsLastSent) {
          statsField.innerText = 'Bitrate: ' + parseInt(bitrate, 10) + '. ' + videoElement.videoWidth + 'x' + videoElement.videoHeight;
          videoElement.style['max-height'] = videoElement.videoHeight + 'px';
          generateReportStats(parseInt(bitrate, 10), packetsLastSent, type === 'video' ? $videoStats : $audioStats);
          Object.keys(report).forEach(function(key) {
            generateReportBlock(key, report[key], type === 'video' ? $video : $audio);
          });
          // with &analyze.
          if (window.r5pro_ws_send) {
            var clientId =  window.adapter.browserDetails.browser + '+' + subscriptionId;
            if (idContainer && idContainer.classList && idContainer.classList.contains('hidden')) {
              idContainer.classList.remove('hidden');
              idContainer.innerText = clientId
            }
            window.r5pro_ws_send(clientId, type, 'bitrate=' + parseInt(bitrate, 10) +
              '|last_packets_in=' + packetsLastSent +
              '|lost_packets=' + report.packetsLost);
          }
        }); // eslint-disable-line no-unused-vars
      } catch (e) {
        //
      }
    } else {
      window.untrackBitrate();
      statsField.classList.add('hidden');
    }
  }

  function hasEstablishedSubscriber () {
    return typeof subscriber !== 'undefined';
  }

  function updateStatus (message) {
    statusField.innerText = message;
  }

  function addEventLog (eventLog) {
    var p = document.createElement('p');
    var text = document.createTextNode(eventLog);
    p.appendChild(text);
    eventLogField.appendChild(p);
  }

  function showSubscriberImplStatus (subscriber) {
    var type = subscriber ? subscriber.getType().toLowerCase() : undefined;
    switch (type) {
      case 'rtc':
        updateStatus('Using WebRTC Playback');
        break;
      case 'rtmp':
        updateStatus('Using Flash Playback');
        break;
      case 'hls':
        updateStatus('Using HLS Playback');
        break;
      default:
        updateStatus('No suitable Subscriber found. WebRTC, Flash and HLS are not supported.');
        break;
    }
  }

  function onSubscriberEvent (event) {
    var eventLog = '[Red5ProSubscriber] ' + event.type + '.';
    if (event.type !== 'Subscribe.Time.Update') {
      console.log(eventLog);
      addEventLog(eventLog);
      if (event.type === 'Subscribe.Metadata') {
        if (event.data.streamingMode && event.data.streamingMode === 'Audio') {
          // If audio only broadcast, `canplay` event can come in on the video element before Subscribe.Start.
          removeLoadingIcon();
        }
      }
    }
  }

  function trackLoadingIcon (elementId) {
    document.getElementById(elementId).oncanplay = removeLoadingIcon;
  }

  function removeLoadingIcon () {
    if (loadingIcon && loadingIcon.parentNode) {
      loadingIcon.parentNode.removeChild(loadingIcon);
    }
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
      console.log('[viewer]:: Configuration\r\n' + JSON.stringify(config, null, 2));

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
      if (window.trackAutoplayRestrictions) {
        window.trackAutoplayRestrictions(subscriber);
      }
      subscriber.subscribe()
      .then(function () {
          console.log('[subscriber]:: Subscriber started - ' + subscriber.getType());
          if (subscriber.getType().toLowerCase() === 'rtc') {
            trackLoadingIcon(subscriber.getOptions().mediaElementId);
            toggleReportTracking(subscriber, true);
            showHideReportsButton.classList.remove('hidden');
          } else {
            removeLoadingIcon();
          }
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

  function start () {
    clearLog();
    var fn = function () {
      determineSubscriber()
        .then(preview)
        .then(subscribe)
        .catch(function (error) {
          removeLoadingIcon();
          var errorStr = typeof error === 'string' ? error : JSON.stringify(error, null, 2);
          console.error('[viewer]:: Error in subscribing to stream - ' + errorStr);
        });
    }
    window.r5pro_isStreamManager()
      .then(function () {
        window.r5pro_requestEdge('live', baseConfiguration.streamName)
          .then(function (origin) {
            updateConfigurationsForStreamManager(origin);
            streamManagerInfo.classList.remove('hidden');
            streamManagerInfo.innerText = 'Using Stream Manager Edge at: ' + origin.serverAddress + '.';
            fn();
          })
          .catch(function (error) {
            streamManagerInfo.classList.remove('hidden');
            streamManagerInfo.innerText = 'Error accessing Edge: ' + (error.message || error) + '.';
            removeLoadingIcon();
          });
      })
      .catch(fn);
  }

  start();

  var shuttingDown = false;
  function shutdown () {
    if (shuttingDown) return;
    shuttingDown = true;
    window.untrackBitrate();
    unsubscribe();
  }
  window.addEventListener('pagehide', shutdown);
  window.addEventListener('beforeunload', shutdown);

  window.subscriberLog = function (message) {
    console.log('[RTMP SUBSCRIBER]:: ' + message);
  };

})(window, document, jQuery.noConflict(), window.promisify, window.red5prosdk);

