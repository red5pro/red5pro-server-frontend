/* global window, document, navigator, Promise, $ */
(function (window, document, red5prosdk) {
  'use strict';

  red5prosdk.setLogLevel('debug');
  var isMoz = !!navigator.mozGetUserMedia;
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
    return protocol === 'http' ? {protocol: 'ws', port: 8081} : {protocol: 'wss', port: 8083};
  }

  var streamNameField = document.getElementById('stream-name-field');
  var enableRecordField = document.getElementById('enable-record-field');
  var statusField = document.getElementById('status-field');
  var statisticsField = document.getElementById('statistics-field');
  var eventLogField = document.getElementById('event-log-field');
  var clearLogButton = document.getElementById('clear-log-button');
  var startStopButton = document.getElementById('start-stop-button');
  var cameraSelect = document.getElementById('camera-select-field');
  var publisher;
  var isPublishing = false;

  var forceQuality = {
    audio: true,
    video: isMoz ? true : forceVideo
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
    iceServers: iceServers,
    bandwidth: desiredBandwidth,
    mediaConstraints: forceQuality
  };
  var rtcConfig = {
    protocol: getSocketLocationFromProtocol(protocol).protocol,
    port: getSocketLocationFromProtocol(protocol).port
  };
  var rtmpConfig = {
    protocol: 'rtmp',
    port: 1935,
    embedWidth: '100%',
    embedHeight: 405,
    backgroundColor: '#000000',
    swf: 'lib/red5pro/red5pro-publisher.swf',
    swfobjectURL: 'lib/swfobject/swfobject.js',
    productInstallURL: 'lib/swfobject/playerProductInstall.swf'
  };

  var targetViewTech = window.r5proViewTech;
  var publishOrder = targetViewTech ? [targetViewTech] : ['rtc', 'rtmp'];

  function getPublishMode () {
    return enableRecordField.checked ? 'record' : 'live';
  }

  function getStreamName () {
    return streamNameField.value;
  }

  function onCameraSelect (deviceId) {
    baseConfiguration.mediaConstraints.video = Object.assign({}, baseConfiguration.mediaConstraints.video, {
      deviceId: { exact: deviceId }
    });
  }

  function showOrHideCameraSelect (thePublisher) {
    if (thePublisher && thePublisher.getType() === 'RTC') {
      enableCameraSelect();
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

  function enableCameraSelect () {
    navigator.mediaDevices.enumerateDevices()
      .then(function (devices) {
        showCameraSelect();
        var videoCameras = devices.filter(function (item) {
          return item.kind === 'videoinput';
        })
        var cameras = [].concat(videoCameras);
        var options = cameras.map(function (camera, index) {
          return '<option value="' + camera.deviceId + '">' + (camera.label || 'camera ' + index) + '</option>';
        });
        cameraSelect.innerHTML = options.join(' ');
        cameraSelect.addEventListener('change', function () {
          onCameraSelect(cameraSelect.value);
        });
        if (cameras && cameras.length > 0) {
          onCameraSelect(cameras[0].deviceId);
        }
      })
      .catch(function (error) {
        console.log('Could not enumeration devices: ' + error);
      });
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
        .then(function () {
          updateStartStopButtonState({
            enabled: true,
            label: 'Stop Broadcast'
          });
          hideCameraSelect()
        })
        .catch(function (error) { // eslint-disable-line no-unused-vars
          updateStartStopButtonState({
            enabled: true,
            label: 'Start Broadcast'
          });
          showOrHideCameraSelect(publisher);
        });
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

  clearLogButton.addEventListener('click', function () {
    while (eventLogField.children.length > 1) {
      eventLogField.removeChild(eventLogField.lastChild);
    }
  });

  function onBitrateUpdate (bitrate, packets) {
    statisticsField.innerText = 'Bitrate: ' + Math.floor(bitrate) + '. Packets Sent: ' + packets + '.';
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

  function addObjectLog (object, offset) {
    offset = offset || 10;
    var p;
    var c = addEventLog('{');
    c.style.paddingLeft = offset + 'px';
    Object.keys(object).forEach(function(key) {
      if (typeof object[key] === 'undefined') {
        return;
      }
      if (object[key].toString() === '[object Object]') {
        p = addEventLog(key + ': ');
        p.style.paddingLeft = (offset+10) + 'px';
        addObjectLog(object[key], offset + 10);
      }
      else {
        p = addEventLog(key + ': ' + object[key]);
        p.style.paddingLeft = (offset+10) + 'px';
      }
    });
    c = addEventLog('}');
    c.style.paddingLeft = offset + 'px';
  }

  function showPublisherImplStatus (publisher) {
    var type = publisher ? publisher.getType().toLowerCase() : undefined;
    switch (type) {
      case 'rtc':
        updateStatus('Using WebRTC-based Publisher!');
        break;
      case 'rtmp':
        updateStatus('Failover to use Flash-based Publisher.');
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

  function determinePublisher () {
    return promisify(function (resolve, reject) {
      var publisher = new red5prosdk.Red5ProPublisher();
      publisher.on('*', onPublisherEvent);

      var config = {
        rtc: Object.assign({}, baseConfiguration, rtcConfig),
        rtmp: Object.assign({}, baseConfiguration, rtmpConfig)
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
    return promisify(function (resolve, reject) {

      var mode = getPublishMode();
      var streamName = getStreamName();
      var isRTC = publisher.getType().toLowerCase() === 'rtc';
      publisher.overlayOptions({
        host: window.targetHost,
        streamMode: mode,
        streamName: streamName
      });
      console.log('[live]:: Publish options:\r\n' + JSON.stringify(publisher._options, null, 2));

      showPublisherImplStatus(publisher);
      addEventLog('[Red5ProPublisher] configuration ->');
      addObjectLog(publisher.getOptions());
      publisher.on('*', onPublisherEvent);
      publisher.publish()
        .then(function () {
          isPublishing = true;
          if (isRTC) {
             window.trackBitrate(publisher.getPeerConnection(), onBitrateUpdate);
             //             console.log('[live]:: Publish dimensions (' + view.view.videoWidth + ', ' + view.view.videoHeight + ').');
          }
          hideCameraSelect();
          resolve();
        })
        .catch(function (error) {
          isPublishing = false;
          console.error('[live]:: Error in publish request: ' + error);
          reject(error);
        });

    });
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
  restart();

  function handleBroadcastIpChange (value) {
    window.targetHost = value;
    baseConfiguration.host = window.targetHost;
  }
  window.r5pro_registerIpChangeListener(handleBroadcastIpChange);
  window.addEventListener('beforeunload', function () {
    unpublish()
      .then(function() {
        tearDownPublisher();
      });
    window.untrackBitrate(onBitrateUpdate);
  });

  window.publisherLog = function (message) {
    console.log('[RTMP PUBLISHER]:: ' + message);
  };

})(this, document, window.red5prosdk);
