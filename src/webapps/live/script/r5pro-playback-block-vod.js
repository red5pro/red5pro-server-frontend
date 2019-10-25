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
(function (window, document, $, R5PlaybackBlock) {
  'use strict';

  var originalStart = R5PlaybackBlock.prototype.start;
  var originalHandleStartError = R5PlaybackBlock.prototype.handleStartError;

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

  R5PlaybackBlock.prototype.startVideoJSPlayback = function (url) {
    console.log('[' + this.streamName + '] :: Defaulting to VideoJS Playback.');
    var $element = $(this.getElement());
    var video = $element.find('#' + this.getVideoElementId(this.streamName)).get(0);
    video.classList.add('video-js');
    var source = document.createElement('source');
    source.type = 'application/x-mpegURL';
    source.src = url.indexOf('.m3u8') === -1 ? url + '.m3u8' : url;
    video.appendChild(source);
    new window.videojs(video, {
      techOrder: ['html5', 'flash']
    }, function () {
      // success.
    });
    this.updateStatusFieldWithType('videojs');
  }

  R5PlaybackBlock.prototype.startMP4Playback = function (url) {
    console.log('[' + this.streamName + '] :: Defaulting to MP4 Playback.');
    if (url.indexOf('streams/') === -1) {
      var paths = url.split('/');
      paths.splice(paths.length - 1, 0, 'streams');
      url = paths.join('/');
    }
    var $element = $(this.getElement());
    var video = $element.find('#' + this.getVideoElementId(this.streamName)).get(0);
    var source = document.createElement('source');
    source.type = 'video/mp4;codecs="avc1.42E01E, mp4a.40.2"';
    source.src = url;
    video.appendChild(source);
    this.updateStatusFieldWithType('mp4');
    this.setActive(true);
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
      originalStart.call(this, Object.assign({}, configuration, {hls:hlsConfig}), playbackOrder);
    } else if (isFLVFile(this.streamData)) {
      this.useFailover = true;
      originalStart.call(this, configuration, playbackOrder);
    } else {
      this.useFailover = true;
      originalStart.call(this, configuration, playbackOrder);
    }
  }

  R5PlaybackBlock.prototype.handleStartError = function (error) {
    if (this.useFailover && isHLSFile(this.streamData)) {
      this.startVideoJSPlayback(this.streamData.urls.hls);
    } else {
      originalHandleStartError.call(this, error);
    }
  }

  R5PlaybackBlock.prototype.setVODData = function (data, forceFlashPlayback) {
    this.streamData = data;
    this.forceFlashPlayback = forceFlashPlayback;
  }

})(window, document, jQuery.noConflict(), window.R5PlaybackBlock);
