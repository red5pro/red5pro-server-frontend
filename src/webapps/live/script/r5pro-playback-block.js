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
(function (window, document, promisify, $, red5pro) {
  'use strict';

  var requestFrame = (function (time) {
    return window.requestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function (fn) {
           return window.setTimeout(fn, time)
         }
  })(2000);

  function getVideoElementId (streamName) {
    return ['red5pro-subscriber', streamName].join('-');
  }

  function generateVideoSection (streamName) {
    var videoContainer = document.createElement('div');
    var statsField = document.createElement('div');
    var playbackButton = document.createElement('div');
    var playbackLabel = document.createTextNode('watch');
    var videoHolder = document.createElement('div');
    var frame = document.createElement('canvas');
    var video = document.createElement('video');
    playbackButton.appendChild(playbackLabel);
    videoContainer.appendChild(statsField);
    videoContainer.appendChild(videoHolder);
    videoContainer.appendChild(playbackButton);
    videoHolder.appendChild(frame);
    videoHolder.appendChild(video);
    statsField.classList.add('statistics-field');
    videoContainer.classList.add('video-container');
    videoHolder.classList.add('video-holder');
    frame.classList.add('video-frame');
    video.classList.add('red5pro-subscriber');
    video.classList.add('red5pro-media');
    video.classList.add('red5pro-media-background');
    video.classList.add('hidden');
    video.controls = true;
    video.autoplay = true;
    video.setAttribute('playsinline', 'playsinline');
    video.id = getVideoElementId(streamName);
    playbackButton.classList.add('stream-playback-button');
    return videoContainer;
  }

  function generateEventSection () {
    var eventContainer = document.createElement('div');
    var statusField = document.createElement('div');
    var smField = document.createElement('div');
    var eventField = document.createElement('div');
    var eventHeader = document.createElement('div');
    var eventRule = document.createElement('hr');
    var eventLog = document.createElement('div');
    var eventTitle = document.createElement('span');
    var clearButton = document.createElement('button');
    eventHeader.appendChild(eventTitle);
    eventHeader.appendChild(clearButton);
    eventField.appendChild(eventHeader);
    eventField.appendChild(eventRule);
    eventField.appendChild(eventLog);
    eventContainer.appendChild(statusField);
    eventContainer.appendChild(smField);
    eventContainer.appendChild(eventField);
    eventContainer.classList.add('event-container');
    statusField.classList.add('status-field');
    statusField.classList.add('status-message');
    smField.classList.add('stream-manager-info');
    smField.classList.add('status-message');
    smField.classList.add('hidden');
    eventField.classList.add('event-log-field');
    eventRule.classList.add('stream-rule');
    eventLog.classList.add('event-log');
    eventHeader.classList.add('event-header');
    clearButton.classList.add('event-clear-button');
    eventTitle.innerText = 'Event Log:';
    clearButton.innerText = 'clear';
    statusField.innerText = 'Determining Player...';
    return eventContainer;
  }

  function generateBroadcastSection (streamName)  {
    var parent = document.createElement('div');
    var videoSection = generateVideoSection(streamName);
    var eventSection = generateEventSection();
    parent.appendChild(videoSection);
    parent.appendChild(eventSection);
    eventSection.classList.add('hidden'); // Only shown when viewing.
    parent.classList.add('subscribe-section');
    return parent;
  }

  function PlaybackBlock (title, streamName, location, externalLink) {
    this.title = title;
    this.streamName = streamName;
    this.streamLocation = location;
    this.externalLink = externalLink;
    this.elementNode = undefined;
    this.subscriber = undefined;
    this.videoElement = undefined;
    this.isHalted = false;
    this.playbackOrder = undefined;
    this.configuration = undefined;
    this.client = undefined;
    this.subscriberEventsHandler = this.subscriberEventsHandler.bind(this);
    this.handleBitrateReport = this.handleBitrateReport.bind(this);
  }

  PlaybackBlock.prototype.subscriberEventsHandler = function (event) {
    var eventLog = '[Red5ProSubscriber] ' + event.type + '.';
    if (event.type !== 'Subscribe.Time.Update') {
      console.log(eventLog);
      this.addEventLog(event.type);
    }
  }

  PlaybackBlock.prototype.addEventLog = function (log) {
    var element = $(this.getElement()).find('.event-log').get(0)
    var p = document.createElement('p');
    var t = document.createTextNode(log);
    p.appendChild(t);
    element.appendChild(p);
  }

  PlaybackBlock.prototype.clearEventLog = function () {
    var element = $(this.getElement()).find('.event-log').get(0);
    while (element.children.length > 0) {
      element.removeChild(element.lastChild);
    }
  }

  PlaybackBlock.prototype.updateStatisticsField = function (message) {
      var $el = $(this.getElement());
      var $reportField = $el.find('.statistics-field');
      $reportField.text(message);
  }

  PlaybackBlock.prototype.updateStatusFieldWithType = function (subscriberType) {
    var typeMap = {
      rtc: 'WebRTC',
      rtmp: 'Flash',
      hls: 'HLS'
    }
    var message = subscriberType
                  ? 'Using ' + typeMap[subscriberType.toLowerCase()] + ' Playback' 
                  : 'Could not determine playback option.';
    $(this.getElement()).find('.status-field').text(message);
  }

  PlaybackBlock.prototype.updateConfigurationsForStreamManager = function (serverJSON) {
    var host = serverJSON.serverAddress;
    var app = serverJSON.scope;
    var streamName = serverJSON.name;
    this.configuration.rtc = Object.assign({}, this.configuration.rtc || {}, {
      host: window.targetHost,
      app: 'streammanager',
      streamName: streamName,
      connectionParams: {
        host: host,
        app: app
      }
    });
    this.configuration.rtmp = Object.assign({}, this.configuration.rtmp || {}, {
      host: host,
      app: app
    });
    this.configuration.hls = Object.assign({}, this.configuration.hls || {}, {
      host: host,
      app: app
    });
  }

  PlaybackBlock.prototype.assignStreamAttributesToPlaybackConfigurations = function (streamName, elementId) {
    this.configuration.rtc = Object.assign({}, this.configuration.rtc || {}, {
      streamName: streamName,
      mediaElementId: elementId
    });
    this.configuration.rtmp = Object.assign({}, this.configuration.rtmp || {}, {
      streamName: streamName,
      mediaElementId: elementId
    });
    this.configuration.hls = Object.assign({}, this.configuration.hls || {}, {
      streamName: streamName,
      mediaElementId: elementId
    });
  }

  // eslint-disable-next-line no-unused-vars
  PlaybackBlock.prototype.handleBitrateReport = function (type, report, bitrate, packetsLastSent) {
    var video = this.getVideoElement();
    this.updateStatisticsField('Bitrate: ' + Math.floor(bitrate) + '. ' + video.videoWidth + 'x' + video.videoHeight + '.');
  }

  PlaybackBlock.prototype.handleExternalLink = function () {

  }

  PlaybackBlock.prototype.handleClearLog = function () {
    this.clearEventLog();
  }

  PlaybackBlock.prototype.handleWatchToggle = function () {
    if (!this.subscriber) {
      this.start(this.configuration, this.playbackOrder);
    } else {
      this.stop();
    }
  }

  PlaybackBlock.prototype.setActive = function (isActive) {
    if (isActive) {
      $(this.getElement()).find('.event-container').get(0).classList.remove('hidden');
      $(this.getElement()).find('.stream-playback-button').get(0).innerText = 'stop';
    } else {
      $(this.getElement()).find('.event-container').get(0).classList.add('hidden');
      $(this.getElement()).find('.stream-playback-button').get(0).innerText = 'watch';
    }
  }

  PlaybackBlock.prototype.addUIDelegates = function (element) {
    var $el = $(element);
    var $clearButton = $el.find('.event-clear-button');
    var $watchButton = $el.find('.stream-playback-button');
    $clearButton.on('click', this.handleClearLog.bind(this));
    $watchButton.on('click', this.handleWatchToggle.bind(this));
  }

  PlaybackBlock.prototype.create = function () {
    var div = document.createElement('div');
    var title = document.createElement('h2');
    var rule = document.createElement('hr');
    var linkParent = document.createElement('p');
    var link = document.createElement('a');
    var titleText = document.createTextNode(this.title);
    var linkText = document.createTextNode(this.streamLocation);
    var broadcastSection = generateBroadcastSection(this.streamName);
    title.appendChild(titleText);
    link.appendChild(linkText);
    linkParent.appendChild(link);
    div.appendChild(title);
    div.appendChild(broadcastSection);
    div.appendChild(rule);
    div.appendChild(linkParent);
    div.classList.add('playback-block-listing');
    title.classList.add('stream-header');
    rule.classList.add('stream-rule');
    link.href = this.externalLink;
    link.target = '_blank';
    link.classList.add('link');
    link.classList.add('red-text');
    linkParent.classList.add('stream-link');
    link.addEventListener('click', this.handleExternalLink.bind(this));
    this.elementNode = div;
    this.addUIDelegates(this.elementNode);
    return this;
  }

  PlaybackBlock.prototype.init = function (configuration, playbackOrder, checkStreamManager) {
    checkStreamManager = checkStreamManager || false;
    this.configuration = configuration;
    this.playbackOrder = playbackOrder;
    this.assignStreamAttributesToPlaybackConfigurations(this.streamName, getVideoElementId(this.streamName));
    if (checkStreamManager) {
      var self = this;
      window.r5pro_isStreamManager()
        .then(function () {
          window.r5pro_requestEdge(this.configuration.app, this.streamName)
            .then(function (origin) {
              var streamManagerInfo = $(self.getElement()).find('.stream-manager-info');
              self.updateConfigurationsForStreamManager(origin);
              streamManagerInfo.classList.remove('hidden');
              streamManagerInfo.innerText = 'Using Stream Manager Origin at: ' + origin.serverAddress + '.';
            })
            .catch(function () { /* catch means not exists. ok. */ });
        })
        .catch(function () { /* catch means not exists. ok. */ });
    }
    return this;
  }

  PlaybackBlock.prototype.start = function (configuration, playbackOrder) {
    this.expand();
    var self = this;
    this.isHalted = false;
    console.log(JSON.stringify(configuration, null, 2));
    if (this.client) {
      this.client.onPlaybackBlockStart(this);
    }
    new red5pro.Red5ProSubscriber()
      .setPlaybackOrder(playbackOrder)
      .init(configuration)
      .then(function (subscriber) {
        self.subscriber = subscriber;
        self.subscriber.on('*', self.subscriberEventsHandler);
        self.setActive(true);
        self.updateStatusFieldWithType(subscriber.getType())
        if (self.isHalted) {
          self.stop();
          return true;
        } else {
          return subscriber.subscribe();
        }
      })
      .then(function (subscriber) {
        if (subscriber.getType().toUpperCase() === 'RTC') {
          try {
            window.trackBitrate(subscriber.getPeerConnection(), self.handleBitrateReport)
          } catch (e) {
            // nada.
          }
        }
      })
      .catch(function (error) {
        console.error(error);
        self.updateStatusFieldWithType(null)
      });
    return this;
  }

  PlaybackBlock.prototype.stop = function () {
    this.isHalted = true;
    this.capture();
    if (this.client) {
      this.client.onPlaybackBlockStop(this);
    }
    if (this.subscriber) {
      this.subscriber.unsubscribe();
      this.subscriber = undefined;
      this.videoElement = undefined;
      this.setActive(false);
      this.isHalted = false;
    }
    try {
      window.untrackBitrate(this.handleBitrateReport);
    } catch (e) { /* nada */ }
    this.collapse();
    this.clearEventLog();
    this.updateStatisticsField('');
    return this;
  }

  PlaybackBlock.prototype.capture = function () {
    var $el = $(this.getElement());
    var frame = $el.find('.video-frame').get(0);
    var video = $el.find('.red5pro-subscriber').get(0);
    var context = frame.getContext('2d');
    context.clearRect(0, 0, frame.width, frame.height);
    frame.classList.remove('hidden');
    //    console.log(video.clientWidth, video.clientHeight, frame.clientWidth, frame.clientHeight);
    //    var wPerc = frame.clientWidth / video.clientWidth;
    //    var hPerc = frame.clientHeight / video.clientHeight;
    context.drawImage(video, 
      0, 0, video.clientWidth, video.clientHeight,
      //      (video.clientWidth - frame.clientWidth) * 0.5, (video.clientHeight - frame.clientHeight) * 0.5,
      0, 0,
      frame.width, frame.height);
  }

  PlaybackBlock.prototype.expand = function () {
    var $el = $(this.getElement());
    this.getElement().parentNode.classList.add('stream-menu-listing-active');
    $el.find('.video-container').get(0).classList.add('video-container-active');
    $el.find('.red5pro-subscriber').get(0).classList.remove('hidden');
    $el.find('.video-frame').get(0).classList.add('hidden');
    requestFrame(function () {
      window.scrollTo(0, $el.get(0).offsetTop);
    });
  }

  PlaybackBlock.prototype.collapse = function () {
    var $el = $(this.getElement());
    this.getElement().parentNode.classList.remove('stream-menu-listing-active');
    $(this.getElement()).find('.video-container').get(0).classList.remove('video-container-active');
    $el.find('.red5pro-subscriber').get(0).classList.add('hidden');
    $el.find('.video-frame').get(0).classList.remove('hidden');
  }

  PlaybackBlock.prototype.getSubscriber = function () {
    return this.subscriber;
  }

  PlaybackBlock.prototype.getElement = function () {
    return this.elementNode;
  }

  PlaybackBlock.prototype.getVideoElement = function () {
    if (this.videoElement === undefined) {
      var $el = $(this.getElement());
      var video = $el.find('#' + getVideoElementId(this.streamName)).get(0);
      this.videoElement = video;
    }
    return this.videoElement;
  }

  PlaybackBlock.prototype.setClient = function (client) {
    this.client = client;
    return this;
  }

  window.R5PlaybackBlock = PlaybackBlock;

})(window, document, window.promisify, jQuery.noConflict(), window.red5prosdk);
