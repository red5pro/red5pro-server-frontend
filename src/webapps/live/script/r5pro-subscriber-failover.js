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
  protocol = protocol.substring(0, protocol.lastIndexOf(':'));
  var port = window.location.port ? window.location.port : (protocol === 'http' ? 80 : 443);
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
    height: 480,
    embedWidth: '100%',
    embedHeight: 480,
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
      playbackBlock.getElement().parentNode.classList.add('stream-menu-listing-active');
    },
    onPlaybackBlockStop: function (playbackBlock) {
      playbackBlock.getElement().parentNode.classList.add('stream-menu-listing-active');
    }
  }

  // See r5pro-filter-input.js
  var handleFilteredItems = function (items) {
    var findPlaybackBlock = function (streamname) {
      var index = playbackBlocks.length;
      while (--index > -1) {
        if (playbackBlocks[index].getStreamName() === streamname) {
          return playbackBlocks[index];
        }
      }
    }
    var i = items.length;
    var item;
    while (--i > -1) {
      item = findPlaybackBlock(items[i].getAttribute('data-streamname'));
      if (item) {
        item.stop();
      }
    }
  }
  if (window.r5pro_addFilterCallback) {
    window.r5pro_addFilterCallback(handleFilteredItems);
  }

  function generatePlaybackBlocks () {
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
        $item.appendChild(block.create().getElement());
        block.init(Object.assign({}, baseConfiguration, {
          rtc: Object.assign({}, baseConfiguration, rtcConfiguration),
          rtmp: Object.assign({}, baseConfiguration, rtmpConfiguration),
          hls: Object.assign({}, baseConfiguration, hlsConfiguration)
        }), playbackOrder, true);
        playbackBlocks.push(block);
      }
    }
  }

  generatePlaybackBlocks();

  // If hosted on a stream manager, access and replace.
  window.r5pro_isStreamManager()
    .then(function () {
      return window.r5pro_requestLiveStreams('live');
    })
    .then(function (streamList) {
      var menuContent = document.getElementsByClassName('stream-menu-content')[0];
      var elements = streamList.map(function (streamData) {
        var name = streamData.name;
        var streamLocation = 'http://' + streamData.serverAddress + ':' + port + '/' + streamData.scope + '/' + name;
        var pageLocation = protocol + '://' + host + ':' + port + '/live/viewer.jsp?host=' + host + '&stream=' + name;
        var div = document.createElement('div');
        div.classList.add('stream-menu-listing');
        div.setAttribute('data-streamName', name);
        div.setAttribute('data-streamLocation', streamLocation);
        div.setAttribute('data-pageLocation', pageLocation);
        return div;
      });
      if (menuContent) {
        while (menuContent.hasChildNodes()) {
          menuContent.removeChild(menuContent.lastChild);
        }
        if (elements.length > 0) {
          for (var i = 0; i < elements.length; i++) {
            menuContent.appendChild(elements[i]);
          }
        } else {
          menuContent.innerHTML = '<p class="no-streams-entry">No streams found</p>' +
            '<p style="margin-top: 20px;">You can begin a Broadcast session by visiting the <a class="broadcast-link link" href="broadcast.jsp?host=' + host + '" target="_blank">Broadcast page</a>.</p>';

        }
      }
      generatePlaybackBlocks();
      window.r5pro_initializeFilter();
    })
    .catch(function (error) { // eslint-disable-line no-unused-vars
      // console.log('Host is Stream Manager? (' + error + ')');
      // Else, if not on stream manager host, most likely was populated
      //  on page creation.
    });

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
