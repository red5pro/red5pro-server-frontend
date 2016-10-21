/* global window, document, navigator, Promise */
(function (window, document, red5pro) {
  'use strict';

  var isMoz =!!navigator.mozGetUserMedia;

  var streamNameField = document.getElementById('stream-name-field');
  var enableRecordField = document.getElementById('enable-record-field');
  var statusField = document.getElementById('status-field');
  var startStopButton = document.getElementById('start-stop-button');

  var publisher;
  var view;
  var isPublishing = false;

  var baseConfiguration = {
    host: window.targetHost,
    app: 'live',
    iceServers: isMoz
      ? [{urls: 'stun:stun.services.mozilla.com:3478'}]
      : [{urls: 'stun:stun2.l.google.com:19302'}]
  };
  var rtcConfig = {
    protocol: 'ws',
    port: 8081
  };
  var rtmpConfig = {
    protocol: 'rtmp',
    port: 1935,
    width: 540,
    height: 405,
    swf: 'lib/red5pro/red5pro-publisher.swf',
    swfobjectURL: 'lib/swfobject/swfobject.js',
    productInstallURL: 'lib/swfobject/playerProductInstall.swf'
  };

  function getPublishMode () {
    return enableRecordField.checked ? 'record' : 'live';
  };

  function getStreamName () {
    return streamNameField.value;
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
        })
        .catch(function () {
          updateStartStopButtonState({
            enabled: true,
            label: 'Start Broadcast'
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
        })
        .catch(function () {
          updateStartStopButtonState({
            enabled: true,
            label: 'Start Broadcast'
          });
        });
    }
  });

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

  function showPublisherImplStatus (publisher) {
    var type = publisher ? publisher.getType().toLowerCase() : undefined;
    switch (type) {
      case 'rtc':
        updateStatus('Using WebRTC-based Publisher!');
        break;
      case 'rtmp':
        updateStatus('Failover to use Flash-based Publisher');
        break;
      default:
        updateStatus('No suitable Publisher found. WebRTC & Flash not supported.');
        break;
    }
  }

  function onPublisherEvent (event) {
    console.log('[Red5ProPublisher] ' + event.type + '.');
  }

  function determinePublisher () {
    return new Promise(function (resolve, reject) {
      var publisher = new red5pro.Red5ProPublisher();
      publisher.on('*', onPublisherEvent);

      var config = {
        rtc: Object.assign({}, baseConfiguration, rtcConfig),
        rtmp: Object.assign({}, baseConfiguration, rtmpConfig)
      };
      console.log('Configuration:\r\n' + JSON.stringify(config, null, 2));

      publisher.setPublishOrder(['rtc', 'rtmp'])
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

  function preview (selectedPublisher) {

    return new Promise(function (resolve, reject) {

      var requiresGUM = selectedPublisher.getType().toLowerCase() === 'rtc';
      publisher = selectedPublisher;
      view = new red5pro.PublisherView('red5pro-publisher-video');
      view.attachPublisher(publisher);

      if (requiresGUM) {
        var nav = navigator.mediaDevice || navigator;
        nav.getUserMedia({
            audio: true,
            video: true
        }, function (media) {
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
        resolve({
          publisher: publisher,
          view: view
        })
      }

    });

  }

  function publish () {
    return new Promise(function (resolve, reject) {

      var mode = getPublishMode();
      var streamName = getStreamName();
      publisher.overlayOptions({
        host: window.targetHost,
        streamMode: mode,
        streamName: streamName
      });
      console.log('Publish options:\r\n' + JSON.stringify(publisher._options, null, 2))

      publisher.publish(streamName)
        .then(function () {
          isPublishing = true;
          resolve();
        })
        .catch(function (error) {
          isPublishing = false;
          console.error('Error in publish request: ' + error);
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
            // tearDownPublisher();
            resolve();
          })
          .catch(function (error) {
            isPublishing = false;
            // tearDownPublisher();
            console.error('Error in unpublish request: ' + error);
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
      publisher.off('*', onPublisherEvent);
      publisher = undefined;
    }
  }

  determinePublisher()
    .then(preview)
    .catch(function (error) {
      var errorStr = typeof error === 'string' ? error : JSON.stringify(error, null, 2);
      console.error('Could not determine and preview publisher: ' + errorStr);
    });

  function handleBroadcastIpChange (value) {
    window.targetHost = value;
    baseConfiguration.host = window.targetHost;
  }
  window.r5pro_registerIpChangeListener(handleBroadcastIpChange);
  window.addEventListener('beforeunload', tearDownPublisher);


})(this, document, window.red5prosdk);
