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
/* global window, document, jQuery, XMLHttpRequest */
(function(window, document, promisify, $, red5prosdk, R5PlaybackBlock) {
  'use strict';

  red5prosdk.setLogLevel('debug');
  var host = window.targetHost;
  var buffer = window.r5proBuffer;
  var targetViewTech = window.r5proViewTech;
  var playbackOrder = targetViewTech ? [targetViewTech] : ['rtmp', 'hls'];
  var protocol = window.location.protocol;
  var port = window.location.port ? window.location.port : (protocol === 'http' ? 80 : 443);
  protocol = protocol.substring(0, protocol.lastIndexOf(':'));

  var baseConfiguration = {
    host: host,
    app: 'live'
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

  var $contentSection = $('.content-section-story');
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
    // eslint-disable-next-line no-unused-vars
    onPlaybackBlockStop: function (playbackBlock) {
      // console.log(playbackBlock);
    }
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
        var data = $item.getAttribute('data-stream');
        var dataString = decodeURIComponent(data);
        var streamData = JSON.parse(dataString);
        var block = new R5PlaybackBlock(name, name, location, page);
        block.setVODData(streamData, (targetViewTech === 'rtmp'));
        block.setClient(playbackBlockClient);
        $item.append(block.create().getElement());
        block.init(Object.assign({}, baseConfiguration, {
          rtmp: Object.assign({}, baseConfiguration, rtmpConfiguration),
          hls: Object.assign({}, baseConfiguration, hlsConfiguration)
        }), playbackOrder, false);
        playbackBlocks.push(block);
      }
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

  var protocol = window.targetProtocol;
  var doIncludePlaylists = window.requestPlaylists;
  var port = window.location.port ? window.location.port : (protocol === 'https' ? 443 : 80);

  var httpRegex = /^http/i;
  var baseUrl = protocol + '://' + host + ':' + port + '/live';
  var mediafilesServletURL = [baseUrl, 'mediafiles'].join('/');
  var playlistServletURL = [baseUrl, 'playlists'].join('/');
  var store = {}; // name: {name:string, url:string, formats:[hls|flv]}

  var parseItem = function (item) {
    var itemName = item.name; // item.name.substring(0, item.name.lastIndexOf('.'));
    var itemUrl = httpRegex.test(item.url) ? item.url : [baseUrl, item.url].join('/');
    return {
      name: itemName,
      url: itemUrl
    };
  }

  var getItemList = function (data, url, listProperty, formatType, cb) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status >= 200 && this.status < 400) {
          var response = JSON.parse(this.response);
          console.log("Response: " + JSON.stringify(response, null, 2));
          var list = response.hasOwnProperty(listProperty) ? response[listProperty] : [];
          var i, item, length = list.length;
          for (i = 0; i < length; i++) {
            item = parseItem(list[i]);
            if (!data.hasOwnProperty(item.name)) {
              data[item.name] = {
                name: item.name,
                urls: {}
              };
            }
            data[item.name].urls[formatType] = item.url;
          }
          cb(data);
        } else if (this.status === 0 || this.status > 400) {
          cb(data);
        }
      }
    }
    req.onerror = function () {
      cb(data);
    }
    req.timeout = 60000 * 5; // 5 minutes
    req.open('GET', url, true);
    req.send();
  }

  var getMediafiles = function (data, cb) {
    getItemList(data, mediafilesServletURL, 'mediafiles', 'rtmp', cb);
  }

  var getPlaylists = function (data, cb) {
    if (doIncludePlaylists) {
      getItemList(data, playlistServletURL, 'playlists', 'hls', cb);
    } else {
      cb(data);
    }
  }

  var populateListing = function (data) {
    console.log("Store:\r\n" + JSON.stringify(data, null, 2));
    var innerContent = '';
    var getStreamListItem = function (item) {
      var json = encodeURIComponent(JSON.stringify(item));
      var streamName = item.name;
      var urls = item.urls;
      var type = item.name.split('.')[1] === 'm3u8' ? 'hls' : 'rtmp';
      var baseUrl = protocol + "://" + host + (port === 443 ? "" : ":" + port);
      var streamLocation =  urls[type];
      var pageLocation = baseUrl + "/live/viewer-vod.jsp?host=" + host + "&stream=" + streamName;
      if (targetViewTech) {
        pageLocation += '&view=' + targetViewTech;
      }
      var listing = "<div class=\"stream-menu-listing\"" +
        "data-streamName=\"" + streamName + "\" " +
        "data-streamLocation=\"" + streamLocation + "\" " +
        "data-pageLocation=\"" + pageLocation + "\" " +
        "data-stream=\"" + json + "\">" +
        "</div>";
      return listing;
    }

    for (var key in data) {
      innerContent += getStreamListItem(data[key]);
    }

    var $streamMenu = $('.stream-menu-content');
    // If no streamMenu already exists, we need to empty the container and generate one.
    if ($streamMenu && $streamMenu.length === 0) {
      $contentSection.empty();
      $contentSection.append('<div class="stream-menu-content"></div>');
      $streamMenu = $('.stream-menu-content');
    } else {
      $streamMenu.empty();
    }

    if (innerContent.length > 0) {
      $streamMenu.html(innerContent);
      generatePlaybackBlocks();
    } else {
      $contentSection.empty();
      $contentSection.append('<p class="no-streams-entry">No recordings found.</p>');
      $contentSection.append('<p style="margin-top: 20px;">You can begin a Broadcast session by visiting the <a class="broadcast-link link" href="broadcast.jsp?host=<%= ip %>" target="_blank">Broadcast page</a>.</p>');
    }
  };

  getMediafiles(store, function(data) {
    getPlaylists(data, function(data) {
      populateListing(data);
    });
  });

 }(window, document, window.promisify, jQuery.noConflict(), window.red5prosdk, window.R5PlaybackBlock));
