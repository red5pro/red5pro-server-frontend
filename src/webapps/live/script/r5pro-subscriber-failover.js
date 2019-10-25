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
(function(window, document, $, promisify, red5pro, R5PlaybackBlock) {
  'use strict';

  red5pro.setLogLevel('debug');
  var iceServers = window.r5proIce;

  var host = window.targetHost;
  var buffer = window.r5proBuffer;
  var targetViewTech = window.r5proViewTech;
  var playbackOrder = targetViewTech ? [targetViewTech] : ['rtc', 'rtmp', 'hls'];
  var protocol = window.location.protocol;
  var port = window.location.port ? window.location.port : (protocol === 'http' ? 80 : 443);
  protocol = protocol.substring(0, protocol.lastIndexOf(':'));
  function getSocketLocationFromProtocol (protocol) {
    return protocol === 'http' ? {protocol: 'ws', port: 5080} : {protocol: 'wss', port: 443};
  }

  var baseConfiguration = {
    host: host,
    app: 'live'
  };
  var rtcConfiguration = {
    protocol: getSocketLocationFromProtocol(protocol).protocol,
    port: getSocketLocationFromProtocol(protocol).port,
    rtcConfiguration: {
      iceServers: iceServers,
      iceCandidatePoolSize: 2,
      bundlePolicy: 'max-bundle'
    }
  };
  var rtmpConfiguration = {
    protocol: 'rtmp',
    port: 1935,
    width: 640,
    height: 360,
    embedWidth: '100%',
    embedHeight: '100%',
    backgroundColor: '#000000',
    buffer: isNaN(buffer) ? 2 : buffer
  };
  var hlsConfiguration = {
    protocol: protocol,
    port: port
  };

  var playbackBlocks = [];
  var playbackBlockClient = {
    onPlaybackBlockStart: function (playbackBlock) {
      var i = playbackBlocks.length;
      while( --i > -1) {
        if (playbackBlocks[i] !== playbackBlock) {
          playbackBlocks[i].stop();
        }
      }
    },
    onPlaybackBlockStop: function (playbackBlock) {
      console.log(playbackBlock);
    }
  }
  var $listing = $('.stream-menu-listing');
  if ($listing && $listing.length > 0) {
    var i = 0, length = $listing.length;
    for (i; i < length; i++) {
      var $item = $listing[i];
      var name = $item.getAttribute('data-streamName');
      var page = $item.getAttribute('data-pageLocation');
      var location = $item.getAttribute('data-streamLocation');
      var block = new R5PlaybackBlock(name, name, location, page);
      block.setClient(playbackBlockClient);
      $item.append(block.create().getElement());
      (function (b, delay) {
        var t = setTimeout(function () {
          clearTimeout(t);
          b.init(Object.assign({}, baseConfiguration, {
            rtc: Object.assign({}, baseConfiguration, rtcConfiguration),
            rtmp: Object.assign({}, baseConfiguration, rtmpConfiguration),
            hls: Object.assign({}, baseConfiguration, hlsConfiguration)
          }), playbackOrder, true);
        }, delay)
      })(block, i * 1000);
      playbackBlocks.push(block);
    }
  }

  var shuttingDown = false;
  function shutdown () {
    if (shuttingDown) return;
    shuttingDown = true;
    while(playbackBlocks.length > 0) {
      playbackBlocks.shift().setClient(undefined).stop();
    }
  }
  window.addEventListener('pagehide', shutdown);
  window.addEventListener('beforeunload', shutdown);

  window.subscriberLog = function (message) {
    console.log('[RTMP SUBSCRIBER]:: ' + message);
  };

 })(window, document, jQuery.noConflict(), window.promisify, window.red5prosdk, window.R5PlaybackBlock);
