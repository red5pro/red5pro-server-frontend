/* global window, document, navigator, Promise */
(function (window, document, red5pro) {
  'use strict';

  var isMoz = !!navigator.mozGetUserMedia;
  var iceServers = window.r5proIce && window.r5proIce === 'red5pro'
    ? [{url: 'stun:50.56.81.179:3478'}]
    : undefined;

  var protocol = window.location.protocol;
  protocol = protocol.substring(0, protocol.lastIndexOf(':'));
  function getSocketLocationFromProtocol (protocol) {
    return protocol === 'http' ? {protocol: 'ws', port: 8081} : {protocol: 'wss', port: 8083};
  }

  var streamNameField = document.getElementById('stream-name-field');
  var enableRecordField = document.getElementById('enable-record-field');
  var statusField = document.getElementById('status-field');
  var eventLogField = document.getElementById('event-log-field');
  var clearLogButton = document.getElementById('clear-log-button');
  var startStopButton = document.getElementById('start-stop-button');
  var qualityHighSelect = document.getElementById('quality-high-select');
  var qualityMidSelect = document.getElementById('quality-mid-select');
  var qualityLowSelect = document.getElementById('quality-low-select');
  var qualityGroup = [qualityHighSelect, qualityMidSelect, qualityLowSelect];
  qualityGroup.forEach(function (el) {
    if (el) {
      el.addEventListener('change', onQualitySelectChange);
    }
  });

  var mediaStream;
  var publisher;
  var view;
  var isPublishing = false;
  var selectedQuality = 'mid';
  var qualityUM = {
    high: {
      audio: true,
      video: {
        width: 1280,
        height: 720
      }
    },
    mid: {
      audio: true,
      video: {
        width: 640,
        height: 480
      }
    },
    low: {
      audio: true,
      video: {
        width: 320,
        height: 240
      }
    }
  };

  var baseConfiguration = {
    host: window.targetHost,
    app: 'live',
    iceServers: iceServers || (isMoz
      ? [{urls: 'stun:stun.services.mozilla.com:3478'}]
      : [{urls: 'stun:stun2.l.google.com:19302'}])
  };
  var rtcConfig = {
    protocol: getSocketLocationFromProtocol(protocol).protocol,
    port: getSocketLocationFromProtocol(protocol).port,
  };
  var rtmpConfig = {
    protocol: 'rtmp',
    port: 1935,
    width: 640,
    height: 480,
    embedWidth: '100%',
    embedHeight: 405,
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

  function getQuality () {
    return selectedQuality;
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
    updateStreamFormState({
      enabled: false
    });
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
        })
        .catch(function () {
          updateStartStopButtonState({
            enabled: true,
            label: 'Start Broadcast'
          });
          updateStreamFormState({
            enabled: true
          });
        });
    }
    else if (hasEstablishedPublisher()) {
      unpublish()
        .then(function () {
          updateStartStopButtonState({
            enabled: true,
            label: 'Start Broadcast'
          });
          updateStreamFormState({
            enabled: true
          });
        })
        .catch(function () {
          updateStartStopButtonState({
            enabled: true,
            label: 'Start Broadcast'
          });
          updateStreamFormState({
            enabled: true
          });
        });
    }
  });

  clearLogButton.addEventListener('click', function () {
    while (eventLogField.children.length > 1) {
      eventLogField.removeChild(eventLogField.lastChild);
    }
  });

  function onQualitySelectChange (event) {
    selectedQuality = event.target.value;
    console.log('[live]:: quality change to `' + selectedQuality + '`.');
    if (hasEstablishedPublisher) {
      view.view.src = '';
      preview(publisher, true);
    }
  }

  function hasEstablishedPublisher () {
    return typeof publisher !== 'undefined'
  }

  function updateStreamFormState (state) {
    var elements = qualityGroup.concat([streamNameField, enableRecordField]);
    var element;
    var add = state.enabled ? 'button-enabled' : 'button-disabled';
    var remove = state.enabled ? 'button-disabled' : 'button.enabled';
    while (elements.length > 0) {
      element = elements.pop();
      element.classList.remove(remove);
      element.classList.add(add);
    }
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
  }

  function determinePublisher () {
    return new Promise(function (resolve, reject) {
      var publisher = new red5pro.Red5ProPublisher();
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
          resolve(selectedPublisher);
        })
        .catch(function (error) {
          publisher.off('*', onPublisherEvent);
          showPublisherImplStatus(null);
          reject(error);
        });

    });

  }

  function preview (selectedPublisher, reset) {

    return new Promise(function (resolve, reject) {

      var requiresGUM = selectedPublisher.getType().toLowerCase() === 'rtc';
      var quality = qualityUM[getQuality()];
      publisher = selectedPublisher;

      if (!reset) {
        view = new red5pro.PublisherView('red5pro-publisher-video');
        view.attachPublisher(publisher);
      }

      if (requiresGUM) {
        var nav = navigator;
        if (mediaStream) {
          mediaStream.getTracks().forEach(function(track) {
            track.stop();
          });
        }
        nav.getUserMedia({
          audio: quality.audio,
          video: {
            width: {
              exact: quality.video.width
            },
            height: {
              exact: quality.video.height
            }
          }
        }, function (media) {
          mediaStream = media;
          publisher.attachStream(media);
          view.preview(media, true);
          resolve({
            publisher: publisher,
            view: view
          });
        }, function (error) {
          reject(error);
        });
      }
      else {
        publisher.setMediaQuality(quality);
        resolve({
          publisher: publisher,
          view: view
        });
      }

    });

  }

  function publish () {
    return new Promise(function (resolve, reject) {

      var mode = getPublishMode();
      var streamName = getStreamName();
      var quality = qualityUM[getQuality()];
      publisher.overlayOptions({
        host: window.targetHost,
        streamMode: mode,
        streamName: streamName,
        width: quality.width,
        height: quality.height
      });
      console.log('[live]:: Publish options:\r\n' + JSON.stringify(publisher._options, null, 2))

      publisher.on('*', onPublisherEvent);
      publisher.publish(streamName)
        .then(function () {
          isPublishing = true;
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
    return new Promise(function (resolve, reject) {

      if (hasEstablishedPublisher()) {
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

    });
  }

  function tearDownPublisher () {
    if (view) {
      view.view.src = '';
      view = undefined;
    }
    if (publisher) {
      publisher.setView(undefined);
      publisher = undefined;
    }
  }

  determinePublisher()
    .then(preview)
    .catch(function (error) {
      var errorStr = typeof error === 'string' ? error : JSON.stringify(error, null, 2);
      console.error('[live]:: Could not determine and preview publisher: ' + errorStr);
    });

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
  });

  window.publisherLog = function (message) {
    console.log('[RTMP PUBLISHER]:: ' + message);
  };

})(this, document, window.red5prosdk);
