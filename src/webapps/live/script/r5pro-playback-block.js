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

  function getVideoElementId (streamName) {
    return ['red5pro-subscriber', streamName].join('-');
  }

  function generateVideoSection (streamName) {
    var videoContainer = document.createElement('div');
    var statsField = document.createElement('div');
    var playbackButton = document.createElement('div');
    var playbackLabel = document.createTextNode('watch');
    var videoHolder = document.createElement('div');
    var video = document.createElement('video');
    playbackButton.appendChild(playbackLabel);
    videoContainer.appendChild(statsField);
    videoContainer.appendChild(videoHolder);
    videoContainer.appendChild(playbackButton);
    videoHolder.appendChild(video);
    statsField.classList.add('statistics-field');
    videoContainer.classList.add('video-container');
    videoHolder.classList.add('video-holder');
    video.classList.add('red5pro-subscriber');
    video.classList.add('red5pro-media');
    video.classList.add('red5pro-media-background');
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
    var eventTitle = document.createElement('span');
    var clearButton = document.createElement('button');
    eventHeader.appendChild(eventTitle);
    eventHeader.appendChild(clearButton);
    eventField.appendChild(eventHeader);
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
    parent.classList.add('broadcast-section');
    return parent;
  }

  function PlaybackBlock (title, streamName, location, externalLink) {
    this.title = title;
    this.streamName = streamName;
    this.streamLocation = location;
    this.externalLink = externalLink;
    this.elementNode = undefined;
    this.subscriber = undefined;
    this.isHalted = false;
    this.playbackOrder = undefined;
    this.configuration = undefined;
    this.subscriberEventsHandler = this.subscriberEventsHandler.bind(this);
  }

  PlaybackBlock.prototype.subscriberEventsHandler = function (event) {
    var eventLog = '[Red5ProSubscriber] ' + event.type + '.';
    if (event.type !== 'Subscribe.Time.Update') {
      console.log(eventLog);
      this.addEventLog($(this.getElement()).find('.event-log-field').get(0), event.type);
    }
  }

  PlaybackBlock.prototype.addEventLog = function (element, log) {
    var p = document.createElement('p');
    var t = document.createTextNode(log);
    p.appendChild(t);
    element.appendChild(p);
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

  PlaybackBlock.prototype.handleExternalLink = function () {

  }

  PlaybackBlock.prototype.handleClearLog = function () {
    console.log('CLEAR');
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
    console.log(JSON.stringify(configuration, null, 2));
    new red5pro.Red5ProSubscriber()
      .setPlaybackOrder(playbackOrder)
      .init(configuration)
      .then(function (subscriber) {
        self.subscriber = subscriber;
        self.subscriber.on('*', self.subscriberEventsHandler);
        self.setActive(true);
        if (self.isHalted) {
          self.stop();
          return true;
        } else {
          return subscriber.subscribe();
        }
      })
      .catch(function (error) {
        console.error(error);
      });
    return this;
  }

  PlaybackBlock.prototype.stop = function () {
    this.collapse();
    this.isHalted = true;
    if (this.subscriber) {
      this.subscriber.unsubscribe();
      this.subscriber = undefined;
      this.setActive(false);
      this.isHalted = false;
    }
    return this;
  }

  PlaybackBlock.prototype.expand = function () {
    this.getElement().parentNode.classList.add('stream-menu-listing-active');
    $(this.getElement()).find('.video-container').get(0).classList.add('video-container-active');
  }

  PlaybackBlock.prototype.collapse = function () {
    this.getElement().parentNode.classList.remove('stream-menu-listing-active');
    $(this.getElement()).find('.video-container').get(0).classList.remove('video-container-active');
  }

  PlaybackBlock.prototype.getSubscriber = function () {
    return this.subscriber;
  }

  PlaybackBlock.prototype.getElement = function () {
    return this.elementNode;
  }

  window.R5PlaybackBlock = PlaybackBlock;

})(window, document, window.promisify, jQuery.noConflict(), window.red5prosdk);
