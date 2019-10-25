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

  // For IE support.
  var vidTemplateHTML ='<div class="broadcast-section">' +
        '<div id="video-container">' +
          '<div id="statistics-field" class="statistics-field hidden"></div>' +
          '<div id="video-holder">' +
            '<video id="red5pro-subscriber" controls autoplay playsinline class="red5pro-media red5pro-media-background">' +
            '</video>' +
          '</div>' +
        '</div>' +
        '<div id="event-container">' +
          '<div id="status-field" class="status-message"></div>' +
          '<div id="stream-manager-info" class="status-message hidden">Using Stream Manager Proxy.</div>' +
          '<div id="event-log-field" class="event-log-field">' +
            '<div>' +
              '<div class="event-header">' +
                '<span>Event Log:</span>' +
                '<button id="clear-log-button">clear</button>' +
              '</div>' +
              '<hr class="event-hr">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  var flashTemplateHTML = '<div class="broadcast-section">' +
        '<div id="video-container">' +
            '<div id="video-holder" style="height:405px;">' +
              '<object type="application/x-shockwave-flash" id="red5pro-subscriber" name="red5pro-subscriber" align="middle" data="lib/red5pro/red5pro-subscriber.swf" width="100%" height="100%" class="red5pro-media-background red5pro-media">' +
                '<param name="quality" value="high">' +
                '<param name="wmode" value="opaque">' +
                '<param name="bgcolor" value="#000000">' +
                '<param name="allowscriptaccess" value="always">' +
                '<param name="allowfullscreen" value="true">' +
                '<param name="allownetworking" value="all">' +
              '</object>' +
            '</div>' +
          '</div>' +
        '</div>';

  var subscriber;

  var $videoTemplate = document.getElementById('video-playback');
  var $flashTemplate = document.getElementById('flash-playback');

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

  function hasEstablishedSubscriber () {
    return typeof subscriber !== 'undefined';
  }

  function updateStatusField (element, message) {
    if (element) {
      element.innerText = message;
    }
  }

  function addEventLogToField (element, eventLog) {
    var p = document.createElement('p');
    var text = document.createTextNode(eventLog);
    p.appendChild(text);
    element.appendChild(p);
  }

  function showSubscriberImplStatus (subscriber) {
    var statusField = document.getElementById('status-field');
    var type = subscriber ? subscriber.getType().toLowerCase() : undefined;
    switch (type) {
      case 'rtmp':
      case 'livertmp':
      case 'rtmp - videojs':
        updateStatusField(statusField, 'Failover to use Flash-based Playback.');
        break;
      case 'hls':
        updateStatusField(statusField, 'Failover to use HLS-based Playback.');
        break;
       case 'mp4':
        updateStatusField(statusField, 'Failover to MP4 playback in video element.');
        break;
       case 'flv':
        updateStatusField(statusField, 'Attempting force of Flash embed for FLV playback.');
        break;
      case 'videojs':
        updateStatusField(statusField, 'Attempting force of HLS playback using VideoJS.');
        break;
     default:
        updateStatusField(statusField, 'No suitable Subscriber found. WebRTC, Flash and HLS are not supported.');
        break;
    }
  }

  function onSubscriberEvent (event) {
    var eventLog = '[Red5ProSubscriber] ' + event.type + '.';
    if (event.type !== 'Subscribe.Time.Update') {
      console.log(eventLog);
      addEventLogToField(document.getElementById('event-log-field'), eventLog);
    }
  }

  function addPlayer(tmpl, container, html) {
    var $el = templateContent(tmpl, html);
    container.appendChild($el);
    return $el;
  }

  function queryExists (elements) {
    return elements && elements.length > 0;
  }

  var toggleSelectedPlayback = function viewStream (streamName) {
    var currentPlayback = $('li[data-active="true"]');
    var targetPlayback = $('li[data-stream="' + streamName + '"]');
    var dataString = decodeURIComponent(targetPlayback.data('streamitem'));
    var streamData = JSON.parse(dataString);
    console.log('[playback]:: Selected stream data -\r\n' + JSON.stringify(streamData, null, 2));
    teardown();
    if (!queryExists(currentPlayback) || 
        (queryExists(targetPlayback) && currentPlayback.get(0) != targetPlayback.get(0))) {
      startSubscription(streamData);
    }
  };

  function teardown () {
    var videoContainer = document.getElementById('video-container');
    unsubscribe()
      .then(function () {
        if (videoContainer && videoContainer.parentNode) {
          videoContainer.parentNode.removeChild(videoContainer);
        }
      })
  }

  function setup (dataStreamName, template, html) {
    var parentContainer = $('li[data-stream="' + dataStreamName + '"]').get(0);
    if (parentContainer) {
      addPlayer(template, parentContainer, html);
    }
    var clearLogButton = document.getElementById('clear-log-button');
    var eventLogField = document.getElementById('event-log-field');
    if (clearLogButton) {
      clearLogButton.addEventListener('click', function () {
        while (eventLogField.children.length > 1) {
          eventLogField.removeChild(eventLogField.lastChild);
        }
      });
    }
  }

  function useMP4Fallback (src) {
    var element = document.getElementById('red5pro-subscriber');
    var source = document.createElement('source');
    source.type = 'video/mp4;codecs="avc1.42E01E, mp4a.40.2"';
    source.src = src;
    element.appendChild(source);
    showSubscriberImplStatus({
      getType: function() {
        return 'mp4';
      }
    });
  }

  function useFLVFallback (streamName) {
    teardown();
    var container = document.getElementById('video-container')
    if (container) {
      container.remove();
    }
    setup(streamName, $flashTemplate, flashTemplateHTML);
    var flashObject = document.getElementById('red5pro-subscriber');
      var flashvars = document.createElement('param');
      flashvars.name = 'flashvars';
      flashvars.value = 'stream='+streamName+'&'+
                        'app='+baseConfiguration.app+'&'+
                        'host='+baseConfiguration.host+'&'+
                        'muted=false&'+
                        'autoplay=true&'+
                        'backgroundColor=#000000&'+
                        'buffer=0.5&'+
                        'autosize=true';
    flashObject.appendChild(flashvars);
    showSubscriberImplStatus({
      getType: function() {
        return 'flv';
      }
    });
  }

  function useVideoJSFallback (url) {
    var videoElement = document.getElementById('red5pro-subscriber');
    videoElement.classList.add('video-js');
    var source = document.createElement('source');
    source.type = 'application/x-mpegURL';
    source.src = url;
    videoElement.appendChild(source);
    new window.videojs(videoElement, {
      techOrder: ['html5', 'flash']
    }, function () {
      // success.
    });
    showSubscriberImplStatus({
      getType: function() {
        return 'videojs';
      }
    });
  }

  function startSubscription (streamData) {
    var streamName = streamData.name;
    baseConfiguration.streamName = streamName;
    setup(streamName, $videoTemplate, vidTemplateHTML);
    // Unless `view=rtmp` is set in the query params, default to MP4 playback if MP4 file.
    if (targetViewTech !== 'rtmp') {
      if (streamData.urls && streamData.urls.rtmp) {
        if (streamData.urls.rtmp.indexOf('mp4') !== -1) {
          useMP4Fallback(streamData.urls.rtmp);
          return;
        }
      }
    }

    // Else, proceed to establish a Subscriber through the SDK.
    determineSubscriber(Object.keys(streamData.urls))
      .then(preview)
      .then(subscribe)
      .catch(function (error) {
        var errorStr = typeof error === 'string' ? error : JSON.stringify(error, null, 2);
        console.error('[viewer]:: Error in subscribing to stream - ' + errorStr);
        if (streamData.urls && streamData.urls.rtmp) {
          if (streamData.urls.rtmp.indexOf('mp4') !== -1) {
            useMP4Fallback(streamData.urls.rtmp)
          }
          else {
            useFLVFallback(streamData.name)
          }
        }
        else if (streamData.urls && streamData.urls.hls) {
          useVideoJSFallback(streamData.urls.hls);
        }
       });
  }

  var viewPageHandler = function viewPageStream (value) {
    var json = $('li[data-stream="' + value + '"]').data('streamitem');
    var streamDataStr = decodeURIComponent(json);
    var streamData = JSON.parse(streamDataStr);
    console.log('Stream data:\r\n' + JSON.stringify(streamData, null, 2));

    window.streamdata = json;
    var pageUrl = 'viewer-vod.jsp?host=' + window.targetHost + '&stream=' + streamData.name;
    if (targetViewTech) {
      pageUrl += '&view=' + targetViewTech;
    }
    window.location = pageUrl;
    //    window.open(pageUrl);
  };

  function templateContent(template, templateHTML) {
    if("content" in document.createElement("template")) {
      return document.importNode(template.content, true);
    }
    else {
      var div = document.createElement('div');
      div.innerHTML = templateHTML;
      return div;
    }
  }

  function determineSubscriber (types) {
    console.log('[playback]:: Available types - ' + types + '.');
    return promisify(function (resolve, reject) {
      var subscriber = new red5prosdk.Red5ProSubscriber();
      subscriber.on('*', onSubscriberEvent);

      var typeConfig = {
        rtmp: rtmpConfiguration,
        hls: hlsConfiguration
      };
      var key;
      var config = {};
      for (key in typeConfig) {
        if (types.indexOf(key) > -1) {
          config[key] = Object.assign({}, baseConfiguration, typeConfig[key]);
        }
        if (key === 'hls' && config.hasOwnProperty('hls') && config[key].streamName) {
          config[key].streamName = config[key].streamName.substring(0, config[key].streamName.indexOf('.'));
        }
      }
      var order = playbackOrder;
      var index = order.length;
      while (--index > -1) {
        if (types.indexOf(order[index]) === -1) {
          order.splice(index, 1);
        }
      }
      console.log('[playback]:: Playback Order - ' + order + '.');
      console.log('[viewer]:: Configuration\r\n' + JSON.stringify(config, null, 2));

      if (order.length === 0) {
        var error = 'Cannot start playback. No available playback options.';
        console.error(error);
        throw new Error(error);
        return;
      }

      subscriber.setPlaybackOrder(order)
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
          var holder = document.getElementById('video-holder');
          holder.style.height = '405px';
          resolve(subscriber);
          break;
        default:
          reject('View not available for ' + type + '.');
      }

    });
  }

  function subscribe (subscriber) {
    return promisify(function (resolve, reject) {
      if (window.trackAutoplayRestrictions) {
        window.trackAutoplayRestrictions(subscriber);
      }
      subscriber.on('*', onSubscriberEvent);
      subscriber.subscribe()
        .then(function () {
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

  window.invokeViewStream = toggleSelectedPlayback;
  window.invokeViewPageStream = viewPageHandler;

  var $streamMenu = $('.stream-menu-content');
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

    if (innerContent.length > 0) {
      $streamMenu.html(innerContent);
      generatePlaybackBlocks();
    } else {
      $streamMenu.html('<p class="no-streams-entry">No recordings found.</p>');
    }
  };

  getMediafiles(store, function(data) {
    getPlaylists(data, function(data) {
      populateListing(data);
    });
  });

 }(window, document, window.promisify, jQuery.noConflict(), window.red5prosdk, window.R5PlaybackBlock));
