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
/* global window, document, jQuery*/
(function(window, document, $, promisify, fetch, red5pro) {
  'use strict';

  red5pro.setLogLevel('debug');

  var eventLogField = document.getElementsByClassName('event-log-field')[0];
  var statusField = document.getElementsByClassName('status-field')[0];

  var subscriber;

  var host = window.targetHost;
  var buffer = window.r5proBuffer;
  var protocol = window.location.protocol;
  protocol = protocol.substring(0, protocol.lastIndexOf(':'));
  var port = window.location.port ? window.location.port : (protocol === 'http' ? 80 : 443);
  var baseUrl = protocol + '://' + host + ':' + port + '/live';
  var mediafilesServletURL = [baseUrl, 'mediafiles'].join('/');
  var playlistServletURL = [baseUrl, 'playlists'].join('/');

  var baseConfiguration = {
    host: host,
    app: 'live',
  };
  var rtmpConfig = {
    protocol: 'rtmp',
    port: 1935,
    mimeType: 'rtmp/flv',
    width: '640',
    height: '480',
    embedWidth: '100%',
    embedHeight: '480',
    backgroundColor: '#000000',
    buffer: isNaN(buffer) ? 2 : buffer
  };
  var hlsConfig = {
    protocol: protocol,
    port: port
  };

  var targetViewTech = window.r5proViewTech;
  var playbackOrder = targetViewTech ? [targetViewTech] : ['rtmp', 'hls'];

  var generateFlashEmbedObject = function (id) {
    return $('<object type="application/x-shockwave-flash" id="' + id + '" name="' + id + '" align="middle" data="lib/red5pro/red5pro-subscriber.swf" width="100%" height="480" class="red5pro-subscriber red5pro-media-background red5pro-media">' +
              '<param name="quality" value="high">' +
              '<param name="wmode" value="opaque">' +
              '<param name="bgcolor" value="#000000">' +
              '<param name="allowscriptaccess" value="always">' +
              '<param name="allowfullscreen" value="true">' +
              '<param name="allownetworking" value="all">' +
            '</object>').get(0);
  }

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
    var type = subscriber ? subscriber.getType().toLowerCase() : undefined;
    switch (type) {
      case 'rtmp':
        updateStatusField(statusField, 'Using Flash Playback');
        break;
      case 'hls':
        updateStatusField(statusField, 'Using HLS Playback');
        break;
      case 'mp4':
        updateStatusField(statusField, 'Using MP4 Playback');
        break;
      case 'flv':
        updateStatusField(statusField, 'Using Flash Playback');
        break;
      case 'videojs':
        updateStatusField(statusField, 'Using VideoJS Playback');
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
      addEventLogToField(eventLogField, eventLog);
    }
  }

  function useMP4Fallback (url) {
    if (url.indexOf('streams/') === -1) {
      var paths = url.split('/');
      paths.splice(paths.length - 1, 0, 'streams');
      url = paths.join('/');
    }
    var element = document.getElementById('red5pro-subscriber');
    var source = document.createElement('source');
    source.type = 'video/mp4;codecs="avc1.42E01E, mp4a.40.2"';
    source.src = url;
    element.appendChild(source);
    showSubscriberImplStatus({
      getType: function() {
        return 'mp4';
      }
    });
  }

  function useFLVFallback (streamName) {
    var container = document.getElementById('red5pro-subscriber')
    var parent = container.parentNode;
    if (container && parent) {
      parent.removeChild(container);
    }
    var flashElement = generateFlashEmbedObject('red5pro-subscriber');
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
    flashElement.appendChild(flashvars);
    parent.appendChild(flashElement);
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
    /**
     * streamData format:
     * {
     *    "name": "webrtc2",
     *    "urls": {
     *      "rtmp": "http://10.0.0.10:5080/live/webrtc2.flv"
     *    }
     *  }
     */
    var streamName = streamData.name;
    baseConfiguration.streamName = streamName;

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

  function getStreamData (name, url, type, format) {
    var httpRegex = /^http/i;
    var parseItem = function (item) {
      var itemName = item.name;
      var itemUrl = httpRegex.test(item.url) ? item.url : [baseUrl, item.url].join('/');
      return {
        name: itemName,
        url: itemUrl
      };
    }
    var findDataInList = function (list, name) {
      var data = {name: name, urls: {}};
      var item, i = list.length;
      while(--i > -1) {
        item = parseItem(list[i]);
        if (item.name === name) {
          data.name = item.name;
          data.urls[format] = item.url
          return data;
        }
      }
      return null;
    }
    return window.promisify(function (resolve, reject) {
      window.r5pro_isStreamManager()
              .then(function () {
                window.r5pro_requestVODStreams('live', type)
                  .then(function (list) {
                    var data = findDataInList(list, name);
                    if (data) {
                      resolve(data);
                      return true;
                    }
                    throw new Error('Could not locate on Stream Manager the VOD file by name ' + name);
                })
              .catch(function (error) {
                reject(error.message || error);
              });
              return true
            })
            .catch(function() {
              fetch(url)
                .then(function (res) {
                  if (res.headers.get("content-type") &&
                    res.headers.get("content-type").toLowerCase().indexOf("application/json") >= 0) {
                    return res.json();
                  } else {
                    throw new TypeError('Could not properly parse response.');
                  }
                })
                .then(function (json) {
                  if (json.errorMessage) {
                    throw new Error(json.errorMessage);
                  }
                  var data = findDataInList(json[type], name);
                  if (data) {
                    resolve(data);
                    return true;
                  } else {
                    throw new TypeError('Could not properly parse response.');
                  }
                })
                .catch(reject);
            });
    });
  }

  function determineSubscriber (types) {
    console.log('[playback]:: Available types - ' + types + '.');
    return promisify(function (resolve, reject) {

      var subscriber = new red5pro.Red5ProSubscriber();
      subscriber.on('*', onSubscriberEvent);

      var typeConfig = {
        rtmp: rtmpConfig,
        hls: hlsConfig
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
        case 'rtmp':
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

  var shuttingDown = false;
  function shutdown () {
    if (shuttingDown) return;
    shuttingDown = true;
    unsubscribe();
  }
  window.addEventListener('pagehide', shutdown);
  window.addEventListener('beforeunload', shutdown);

  window.subscriberLog = function (message) {
    console.log('[RTMP SUBSCRIBER]:: ' + message);
  };

  if (window.streamData) {
    startSubscription(window.streamData);
  } else {
    console.warn('This VOD page should be opened from playback.jsp links.');
    var streamName = window.getParameterByName('stream');
    var isHLS = streamName.match(/.m3u8/)
    var url = isHLS ? playlistServletURL : mediafilesServletURL;
    var type = isHLS ? 'playlists' : 'mediafiles';
    var format = isHLS ? 'hls' : 'rtmp';

    getStreamData(streamName, url, type, format)
      .then(function (data) {
        startSubscription(data);
      })
      .catch(function (error) {
        console.error(error);
        addEventLogToField(eventLogField, error);
      });
  }

 }(window, document, jQuery.noConflict(), window.promisify, window.fetch, window.red5prosdk));
