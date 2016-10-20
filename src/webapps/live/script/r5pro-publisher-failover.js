/* global window, navigator, Promise */
(function (window, red5pro) {
  'use strict';

  var isMoz =!!navigator.mozGetUserMedia;
  var publisher;
  var view;

  var baseConfiguration = {
    host: window.targetHost,
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

  function onPublisherEvent (event) {
    console.log('[Red5ProPublisher] ' + event.type + '.');
  }

  function determinePublisher () {
    return new Promise(function (resolve, reject) {
      var publisher = new red5pro.Red5ProPublisher();
      publisher.on('*', onPublisherEvent);

      publisher.setPublishOrder(['rtc', 'rtmp'])
        .init({
          rtc: Object.assign({}, baseConfiguration, rtcConfig),
          rtmp: Object.assign({}, baseConfiguration, rtmpConfig)
        })
        .then(function (selectedPublisher) {
          publisher.off('*', onPublisherEvent);
          resolve(selectedPublisher);
        })
        .catch(function (error) {
          publisher.off('*', onPublisherEvent);
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


})(this, window.red5prosdk);
