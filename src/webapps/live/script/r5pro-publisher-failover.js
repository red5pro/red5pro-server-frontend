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
/* global window, document, navigator*/
(function (window, document, promisify, red5prosdk) {
  'use strict';

  red5prosdk.setLogLevel('debug');
  var isMoz = !!navigator.mozGetUserMedia;
  var isEdge = navigator.userAgent.indexOf('Edge') > -1;
  var qFramerateMin = window.r5proFramerateMin || 8;
  var qFramerateMax = window.r5proFramerateMax || 24;
  var qVideoWidthMin = window.r5proVideoWidthMin || 640;
  var qVideoWidthMax = window.r5proVideoWidthMax || 640;
  var qVideoHeightMin = window.r5proVideoHeightMin || 480;
  var qVideoHeightMax = window.r5proVideoHeightMax || 480;
  var qAudioBW = window.r5proAudioBandwidth || 56;
  var qVideoBW = window.r5proVideoBandwidth || 750;
  var forceVideo = {
    width: {
      min: qVideoWidthMin,
      max: qVideoWidthMax
    },
    height: {
      min: qVideoHeightMin,
      max: qVideoHeightMax
    },
    frameRate: {
      min: qFramerateMin,
      max: qFramerateMax
    }
  };
  var iceServers = window.r5proIce;

  var protocol = window.location.protocol;
  protocol = protocol.substring(0, protocol.lastIndexOf(':'));
  function getSocketLocationFromProtocol (protocol) {
    return protocol === 'http' ? {protocol: 'ws', port: 5080} : {protocol: 'wss', port: 443};
  }

  var streamNameField = document.getElementById('stream-name-field');
  var enableRecordField = document.getElementById('enable-record-field');
  var statusField = document.getElementById('status-field');
  var streamManagerInfo = document.getElementById('stream-manager-info');
  var statisticsField = document.getElementById('statistics-field');
  var eventLogField = document.getElementById('event-log-field');
  var clearLogButton = document.getElementById('clear-log-button');
  var startStopButton = document.getElementById('start-stop-button');
  var cameraSelect = document.getElementById('camera-select-field');
  cameraSelect.addEventListener('change', function () {
    onCameraSelect(cameraSelect.value, true);
  });

  var publisher;
  var isPublishing = false;
  var targetViewTech = window.r5proViewTech;
  var publishOrder = targetViewTech ? [targetViewTech] : ['rtc', 'rtmp'];

  var forceQuality = {
    audio: true,
    video: (isMoz || isEdge) ? true : forceVideo
  };

  var desiredBandwidth = (function() {
    var bw;
    if (qAudioBW != -1 || qVideoBW != -1) {
      bw = {};
      if (qAudioBW != -1) {
        bw.audio = qAudioBW;
      }
      if (qVideoBW != -1) {
        bw.video = qVideoBW;
      }
    }
    return bw;
  })();

  var baseConfiguration = {
    host: window.targetHost,
    app: 'live',
    rtcConfiguration: {
      iceServers: iceServers,
      iceCandidatePoolSize: 2,
      bundlePolicy: 'max-bundle'
    },
    bandwidth: desiredBandwidth,
    mediaConstraints: forceQuality
  };

  var rtcConfig = Object.assign({}, baseConfiguration, {
    protocol: getSocketLocationFromProtocol(protocol).protocol,
    port: getSocketLocationFromProtocol(protocol).port,
    onGetUserMedia: function () {
      return promisify(function (resolve, reject) {
        if (publisher && publisher.getMediaStream()) {
          var stream = publisher.getMediaStream();
          stream.getTracks().forEach(function(track) {
            track.stop();
          });
        }
        var stream;
        navigator.mediaDevices.getUserMedia(baseConfiguration.mediaConstraints)
          .then(function (mediastream) {
            stream = mediastream
            return navigator.mediaDevices.enumerateDevices()
          })
          .then(function (devices) {
            enableCameraSelect(devices);
            stream.getVideoTracks().forEach(function (track) {
              cameraSelect.value = track.getSettings().deviceId;
            });
            resolve(stream);
          })
          .catch(function (error) {
            reject(error);
          });
      });
    }
  });

  var rtmpConfig = Object.assign({}, baseConfiguration, {
    protocol: 'rtmp',
    port: 1935,
    embedWidth: '100%',
    embedHeight: 360,
    backgroundColor: '#000000',
    swf: 'lib/red5pro/red5pro-publisher.swf',
    swfobjectURL: 'lib/swfobject/swfobject.js',
    productInstallURL: 'lib/swfobject/playerProductInstall.swf'
  });

  function updateConfigurationsForStreamManager (serverJSON, publisher) {
    var host = serverJSON.serverAddress;
    var app = serverJSON.scope;
    var isRTC = publisher.getType().toLowerCase() === 'rtc';
    if (isRTC) {
      publisher.overlayOptions({
        host: window.targetHost,
        app: 'streammanager',
        connectionParams: {
          host: host,
          app: app
        }
      });
    } else {
      publisher.overlayOptions({
        host: host,
        app: app
      });
    }
  }

  function getPublishMode () {
    return enableRecordField.checked ? 'record' : 'live';
  }

  function getStreamName () {
    return streamNameField.value;
  }

  function onCameraSelect (deviceId, andRestart) {
    baseConfiguration.mediaConstraints.video = { deviceId: { exact: deviceId } };
    if (andRestart) {
      unpublish().then(restart).catch(restart);
    }
  }

  function showOrHideCameraSelect (thePublisher) {
    if (thePublisher && thePublisher.getType() === 'RTC') {
      navigator.mediaDevices.enumerateDevices().then(enableCameraSelect);
      showCameraSelect();
    }
    else {
      hideCameraSelect();
    }
  }

  function showCameraSelect () {
    cameraSelect.parentNode.classList.remove('hidden');
  }

  function hideCameraSelect () {
    cameraSelect.parentNode.classList.add('hidden');
  }

  function enableCameraSelect (devices) {
    var currentValue = cameraSelect.value;
    while (cameraSelect.firstChild) {
      cameraSelect.removeChild(cameraSelect.firstChild);
    }
    var videoCameras = devices.filter(function (item) {
      return item.kind === 'videoinput';
    });
    var i, length = videoCameras.length;
    var camera, option;
    for (i = 0; i < length; i++) {
      camera = videoCameras[i];
      option = document.createElement('option');
      option.value = camera.deviceId;
      option.text = camera.label || 'camera ' + i;
      cameraSelect.appendChild(option);
      if (camera.deviceId === currentValue) {
        cameraSelect.value = camera.deviceId;
      }
    }
  }

  streamNameField.addEventListener('input', function () {
    if (streamNameField.value
        && streamNameField.value.length > 0
        && hasEstablishedPublisher()) {
      updateStartStopButtonState({
        enabled: true,
        label: 'Start Broadcast'
      });
    }
    else {
      updateStartStopButtonState({
        enabled: false,
        label: 'Start Broadcast'
      });
    }
  });

  startStopButton.addEventListener('click', function () {
    var isIdle = !isPublishing;
    updateStartStopButtonState({
      enabled: false,
      label: 'pending...'
    });

    if (isIdle && hasEstablishedPublisher()) {
      publish()
    }
    else if (hasEstablishedPublisher()) {
      unpublish()
        .then(function () {
          updateStartStopButtonState({
            enabled: true,
            label: 'Start Broadcast'
          });
          showOrHideCameraSelect(publisher);
        })
        .catch(function (error) { // eslint-disable-line no-unused-vars
          updateStartStopButtonState({
            enabled: true,
            label: 'Start Broadcast'
          });
          showOrHideCameraSelect(publisher);
        });
    }
  });

  clearLogButton.addEventListener('click', clearLog);

  function clearLog () {
    while (eventLogField.children.length > 1) {
      eventLogField.removeChild(eventLogField.lastChild);
    }
  }

  function onBitrateUpdate (bitrate, packets) {
    statisticsField.classList.remove('hidden');
    statisticsField.innerText = 'Bitrate: ' + (bitrate === 0 ? 'N/A' : Math.floor(bitrate)) + '.   Packets Sent: ' + packets + '.';
  }

  function hasEstablishedPublisher () {
    return typeof publisher !== 'undefined'
  }

  function updateStartStopButtonState (state) {
    if (state.enabled) {
      startStopButton.classList.remove('button-disabled');
      startStopButton.classList.add('button-enabled');
    }
    else {
      startStopButton.classList.add('button-disabled');
      startStopButton.classList.remove('button-enabled');
    }
    startStopButton.innerText = state.label;
  }

  function updateStatus (message) {
    statusField.innerText = message;
  }

  function addEventLog (eventLog) {
    var p = document.createElement('p');
    var text = document.createTextNode(eventLog);
    p.appendChild(text);
    eventLogField.appendChild(p);
    return p;
  }

  function showPublisherImplStatus (publisher) {
    var type = publisher ? publisher.getType().toLowerCase() : undefined;
    switch (type) {
      case 'rtc':
        updateStatus('Using WebRTC Publisher');
        break;
      case 'rtmp':
        updateStatus('Using Flash Publisher.');
        break;
      default:
        updateStatus('No suitable Publisher found. WebRTC & Flash not supported.');
        break;
    }
  }

  function onPublisherEvent (event) {
    var eventLog = '[Red5ProPublisher] ' + event.type + '.';
    console.log(eventLog);
    addEventLog(eventLog);
    if (event.type === 'Connect.Success' && publisher) {
      showPublisherImplStatus(publisher);
    }
    if (event.type === 'Publisher.Connection.Closed') {
      window.untrackBitrate();
      updateStatus('Connection has been Closed!');
      isPublishing = false;
      unpublish()
        .then(function () {
          updateStartStopButtonState({
            enabled: true,
            label: 'Start Broadcast'
          });
        })
        .catch(function () {
          updateStartStopButtonState({
            enabled: true,
            label: 'Start Broadcast'
          });
        });
    }
  }

  function determinePublisher () {
    return promisify(function (resolve, reject) {

      var publisher = new red5prosdk.Red5ProPublisher();
      publisher.on('*', onPublisherEvent);

      var config = {
        rtc: rtcConfig,
        rtmp: rtmpConfig
      };
      console.log('[live]:: Configuration:\r\n' + JSON.stringify(config, null, 2));

      publisher.setPublishOrder(publishOrder)
        .init(config)
        .then(function (selectedPublisher) {
          publisher.off('*', onPublisherEvent);
          showPublisherImplStatus(selectedPublisher);
          showOrHideCameraSelect(selectedPublisher);
          resolve(selectedPublisher);
        })
        .catch(function (error) {
          publisher.off('*', onPublisherEvent);
          showPublisherImplStatus(null);
          reject(error);
        });

    });

  }

  function publish () {
    clearLog();
    var fn = startPublisher;
    window.r5pro_isStreamManager()
      .then(function () {
        window.r5pro_requestOrigin('live', getStreamName())
          .then(function (origin) {
            updateConfigurationsForStreamManager(origin, publisher);
            streamManagerInfo.classList.remove('hidden');
            streamManagerInfo.innerText = 'Using Stream Manager Origin at: ' + origin.serverAddress + '.';
            fn();
          })
          .catch(function (error) {
            var jsonError = typeof error === 'string' ? error : error.message;
            console.error('[live]:: Error in publish request: ' + jsonError);
            updateStatus(jsonError);
            updateStartStopButtonState({
              enabled: true,
              label: 'Start Broadcast'
            });
            showOrHideCameraSelect(null);
          });
      })
      .catch(fn);
  }

  function unpublish () {
    return promisify(function (resolve, reject) {

      if (hasEstablishedPublisher() && isPublishing) {
        publisher.unpublish()
          .then(function () {
            isPublishing = false;
            publisher.off('*', onPublisherEvent);
            resolve();
          })
          .catch(function (error) {
            isPublishing = false;
            publisher.off('*', onPublisherEvent);
            console.error('[live]:: Error in unpublish request: ' + error);
            reject(error);
          });
      }
      else {
        isPublishing = false;
        // tearDownPublisher();
        resolve();
      }

      window.untrackBitrate(onBitrateUpdate);

    });
  }

  function tearDownPublisher () {
    if (publisher) {
      publisher.setView(undefined);
      publisher = undefined;
    }
  }

  function startPublisher () {

    var onSuccess = function () {
      updateStartStopButtonState({
        enabled: true,
        label: 'Stop Broadcast'
      });
      hideCameraSelect()
    };
    var onFailure = function () {
      updateStartStopButtonState({
        enabled: true,
        label: 'Start Broadcast'
      });
      showOrHideCameraSelect(publisher);
    };

    var mode = getPublishMode();
    var streamName = getStreamName();
    var isRTC = publisher.getType().toLowerCase() === 'rtc';
    publisher.overlayOptions({
      streamMode: mode,
      streamName: streamName
    });
    console.log('[live]:: Publish options:\r\n' + JSON.stringify(publisher.getOptions(), null, 2));

    showPublisherImplStatus(publisher);
    publisher.on('*', onPublisherEvent);
    publisher.publish()
      .then(function () {
        isPublishing = true;
        if (isRTC) {
           window.trackBitrate(publisher.getPeerConnection(), onBitrateUpdate);
           //             console.log('[live]:: Publish dimensions (' + view.view.videoWidth + ', ' + view.view.videoHeight + ').');
        }
        hideCameraSelect();
        onSuccess();
      })
      .catch(function (error) {
        isPublishing = false;
        console.error('[live]:: Error in publish request: ' + error);
        onFailure();
      });

  }

  function restart() {

    determinePublisher()
      .then(function (selectedPublisher) {
        publisher = selectedPublisher;
      })
      .catch(function (error) {
        var errorStr = typeof error === 'string' ? error : JSON.stringify(error, null, 2);
        console.error('[live]:: Could not determine and preview publisher: ' + errorStr);
      });

  }

  // Kick off.
  restart();

  function handleBroadcastIpChange (value) {
    window.targetHost = value;
    baseConfiguration.host = window.targetHost;
  }

  window.r5pro_registerIpChangeListener(handleBroadcastIpChange);

  var shuttingDown = false;
  function shutdown () {
    if (shuttingDown) return;
    shuttingDown = true;
    unpublish()
      .then(function() {
        tearDownPublisher();
      });
    window.untrackBitrate(onBitrateUpdate);
  }
  window.addEventListener('pagehide', shutdown);
  window.addEventListener('beforeunload', shutdown);

  window.publisherLog = function (message) {
    console.log('[RTMP PUBLISHER]:: ' + message);
  };



})(window, document, window.promisify, window.red5prosdk);
