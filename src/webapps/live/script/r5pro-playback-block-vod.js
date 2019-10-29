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
(function (window, document, $, videojs, R5PlaybackBlock) {
  'use strict';

  var originalStart = R5PlaybackBlock.prototype.start;
  var originalStop = R5PlaybackBlock.prototype.stop;
  var originalHandleStartError = R5PlaybackBlock.prototype.handleStartError;

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

  var isHLSFile = function (data) {
    return (data.urls && data.urls.hasOwnProperty('hls'));
  }

  var isFLVFile = function (data) {
    if (data.urls && data.urls.hasOwnProperty('rtmp')) {
      return data.urls.rtmp.indexOf('flv') !== -1;
    }
    return false;
  }

  var isMP4File = function (data) {
    if (data.urls && data.urls.hasOwnProperty('rtmp')) {
      return data.urls.rtmp.indexOf('mp4') !== -1;
    }
    return false;
  }

  R5PlaybackBlock.prototype.startFlashEmbedPlayback = function () {
    console.log('[' + this.streamName + '] :: Defaulting to Flash Embed Playback.');
    var video = this.getVideoElement();
    var parent = video.parentNode;
    parent.removeChild(video);
    var flashElement = generateFlashEmbedObject(this.getVideoElementId(this.streamName));
    var flashvars = document.createElement('param');
    flashvars.name = 'flashvars';
    flashvars.value = 'stream='+this.streamName+'&'+
                      'app='+this.configuration.rtmp.app+'&'+
                      'host='+this.configuration.rtmp.host+'&'+
                      'muted=false&'+
                      'autoplay=true&'+
                      'backgroundColor=#000000&'+
                      'buffer=0.5&'+
                      'autosize=true';
    flashElement.appendChild(flashvars);
    parent.appendChild(flashElement);
    this.updateStatusFieldWithType('rtmp');
    this.setActive(true);
    this.subscriber = {
      unsubscribe: function () {
        try {
          flashElement.stop();
        } catch (e) {
          console.log(e.message);
        }
      }
    }
  }

  R5PlaybackBlock.prototype.startVideoJSPlayback = function (url) {
    console.log('[' + this.streamName + '] :: Defaulting to VideoJS Playback.');
    var video = this.getVideoElement();
    var parent = video.parentNode;
    var videoElementClone = video.cloneNode(true);
    video.classList.add('video-js');
    var source = document.createElement('source');
    source.type = 'application/x-mpegURL';
    source.src = url.indexOf('.m3u8') === -1 ? url + '.m3u8' : url;
    video.appendChild(source);
    new videojs(video, {
      techOrder: ['html5', 'flash']
    }, function () {
      // success.
    });
    this.updateStatusFieldWithType('videojs');
    this.setActive(true);
    this.subscriber = {
      unsubscribe: function () {
        var player = videojs.getPlayer(video);
        if (player) {
          player.dispose();
          parent.appendChild(videoElementClone);
        }
      }
    }
  }

  R5PlaybackBlock.prototype.startMP4Playback = function (url) {
    console.log('[' + this.streamName + '] :: Defaulting to MP4 Playback.');
    if (url.indexOf('streams/') === -1) {
      var paths = url.split('/');
      paths.splice(paths.length - 1, 0, 'streams');
      url = paths.join('/');
    }
    var video = this.getVideoElement();
    var appendSource = function () {
      var source = document.createElement('source');
      source.type = 'video/mp4;codecs="avc1.42E01E, mp4a.40.2"';
      source.src = url;
      video.appendChild(source);
    }
    if (video.children.length > 0) {
      var hasSource = $(video).find('source').get(0);
      if (!hasSource) {
        appendSource();
      } else {
        try {
          video.play();
        } catch (e) {
          console.log(e.message);
        }
      }
    } else {
      appendSource();
    }
    this.updateStatusFieldWithType('mp4');
    this.setActive(true);
    this.subscriber = {
      unsubscribe: function () {
        video.pause();
      }
    }
  }

  R5PlaybackBlock.prototype.start = function (configuration, playbackOrder) {
    console.log('[playback, ' + this.streamName + '] stream data: ' + JSON.stringify(this.streamData, null, 2));
    // Force MP4 Playback.
    if (!this.forceFlashPlayback && isMP4File(this.streamData)) {
      try {
        this.expand();
        this.isHalted = false;
        if (this.client) {
          this.client.onPlaybackBlockStart(this);
        }
        this.startMP4Playback(this.streamData.urls.rtmp)
      } catch (error) {
          console.error(error);
          this.handleStartError(error);
      }
    } else if (isHLSFile(this.streamData)) {
      var hlsConfig = Object.assign({}, configuration.hls, {
        streamName: configuration.hls.streamName.split('.m3u8')[0]
      });
      this.useFailover = true;
      originalStart.call(this, Object.assign({}, configuration, {hls:hlsConfig}), ['hls']);
    } else {
      this.useFailover = true;
      originalStart.call(this, configuration, playbackOrder);
    }
  }

  R5PlaybackBlock.prototype.stop = function () {
    this.useFailover = false;
    originalStop.call(this);
  }

  R5PlaybackBlock.prototype.handleStartError = function (error) {
    if (this.useFailover && isHLSFile(this.streamData)) {
      this.useFailover = false;
      try {
        this.expand();
        this.isHalted = false;
        if (this.client) {
          this.client.onPlaybackBlockStart(this);
        }
        this.startVideoJSPlayback(this.streamData.urls.hls);
      } catch (error) {
        console.error(error);
        this.handleStartError(error);
      }
    } else if (this.useFailover && isFLVFile(this.streamData)) {
      this.useFailover = false;
      try {
        this.expand();
        this.isHalted = false;
        if (this.client) {
          this.client.onPlaybackBlockStart(this);
        }
        this.startFlashEmbedPlayback();
      } catch (error) {
        console.error(error);
        this.handleStartError(error);
      }
    } else {
      originalHandleStartError.call(this, error);
    }
  }

  R5PlaybackBlock.prototype.handleExternalLink = function () {
    var json = this.getElement().parentNode.getAttribute('data-stream');
    if (json) {
      window.streamdata = json;
    }
  }

  R5PlaybackBlock.prototype.setVODData = function (data, forceFlashPlayback) {
    this.streamData = data;
    this.forceFlashPlayback = forceFlashPlayback;
  }

})(window, document, jQuery.noConflict(), window.videojs, window.R5PlaybackBlock);
