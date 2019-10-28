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
/* global window, document */
(function (window, document, promisify, red5pro) {
  'use strict';

  red5pro.setLogLevel('debug');
  var iceServers = window.r5proIce;

  var protocol = window.location.protocol;
  var port = window.location.port ? window.location.port : (protocol === 'http' ? 80 : 443);
  protocol = protocol.substring(0, protocol.lastIndexOf(':'));
  function getSocketLocationFromProtocol (protocol) {
    return protocol === 'http' ? {protocol: 'ws', port: 5080} : {protocol: 'wss', port: 443};
  }

  var statusField = document.getElementsByClassName('status-field')[0];
  var eventLogField = document.getElementsByClassName('event-log-field')[0];
  //  var clearLogButton = document.getElementById('clear-log-button');
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
  var view;

  var baseConfiguration = {
    host: window.targetHost,
    app: window.r5proApp,
    streamName: window.r5proStreamName,
    buffer: isNaN(window.r5proBuffer) ? 2 : window.r5proBuffer,
    rtcConfiguration: {
      iceServers: iceServers,
      iceCandidatePoolSize: 2,
      bundlePolicy: 'max-bundle'
    }
  };
  var rtcConfig = {
    protocol: window.targetProtocol ? window.targetProtocol : getSocketLocationFromProtocol(protocol).protocol,
    port: window.targetPort ? window.targetPort : getSocketLocationFromProtocol(protocol).port,
    subscriptionId: subscriptionId
  };
  var rtmpConfig = {
    protocol: 'rtmp',
    port: 1935,
    width: 640,
    height: 480,
    backgroundColor: '#000000',
    embedWidth: window.r5proVideoWidth,
    embedHeight: window.r5proVideoHeight,
    mimeType: 'rtmp/flv'
  };
  var hlsConfig = {
    protocol: protocol,
    port: port,
    mimeType: 'application/x-mpegURL'
  };

  var targetViewTech = window.r5proViewTech;
  var playbackOrder = targetViewTech ? [targetViewTech] : ['rtc', 'rtmp', 'hls'];
  /*
  clearLogButton.addEventListener('click', function () {
    while (eventLogField.children.length > 1) {
      eventLogField.removeChild(eventLogField.lastChild);
    }
  });
  */
  function onSubscribeStart (subscriber) {
    console.log('[subscriber]:: Subscriber started - ' + subscriber.getType());
    if (subscriber.getType().toLowerCase() === 'rtc') {
      try {
        window.trackBitrate(subscriber.getPeerConnection(), function (type, report, bitrate, packetsLastSent) {
          var el = document.getElementById(type + '-report_stats');
          if (el) {
            el.innerHTML = '<span>Bitrate: <strong>' + parseInt(bitrate, 10) + '</strong>. Packets Last: <strong>' + packetsLastSent + '<strong>.</span>';
          }
          if (videoReportElement && type === 'video') {
            videoReportElement.innerText = JSON.stringify(report, null, 2);
          }
          if (audioReportElement && type === 'audio') {
            audioReportElement.innerText = JSON.stringify(report, null, 2);
          }
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
        updateStatus('Using WebRTC-based Playback!');
        break;
      case 'rtmp':
      case 'livertmp':
      case 'rtmp - videojs':
        updateStatus('Failover to use Flash-based Playback.');
        break;
      case 'hls':
        updateStatus('Failover to use HLS-based Playback.');
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
    }

    if (event.type === 'Subscribe.Metadata') {
      var value = event.data.orientation; // eslint-disable-line no-unused-vars
      if (subscriber.getType().toLowerCase() === 'hls' ||
          subscriber.getType().toLowerCase() === 'rtc') {
        var container = document.getElementById('video-holder');
        var element = document.getElementById('red5pro-subscriber'); // eslint-disable-line no-unused-vars
        if (container) {
          // container.style.height = value % 180 != 0 ? element.offsetWidth + 'px' : element.offsetHeight + 'px';
        }
      }
    } else if (event.type === red5pro.SubscriberEventTypes.AUTO_PLAYBACK_FAILURE) {
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

  function tearDownSubscriber () {
    if (view) {
      view.view.src = '';
      view = undefined;
    }
    if (subscriber) {
      subscriber.setView(undefined);
      subscriber = undefined;
    }
  }

  determineSubscriber()
    .then(preview)
    .then(subscribe)
    .catch(function (error) {
      var errorStr = typeof error === 'string' ? error : JSON.stringify(error, null, 2);
      console.error('[viewer]:: Error in subscribing to stream - ' + errorStr);
    });

  var shuttingDown = false;
  function shutdown () {
    if (shuttingDown) return;
    shuttingDown = true;
    unsubscribe()
      .then(function () {
        tearDownSubscriber();
      });
  }
  window.addEventListener('pagehide', shutdown);
  window.addEventListener('beforeunload', shutdown);

  window.subscriberLog = function (message) {
    console.log('[RTMP SUBSCRIBER]:: ' + message);
  };

})(window, document, window.promisify, window.red5prosdk);

