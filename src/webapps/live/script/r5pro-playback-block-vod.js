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
/* global window, document, navigator, jQuery */
;(function (window, document, navigator, $, videojs, R5PlaybackBlock) {
  'use strict'

  //  var originalCreate = R5PlaybackBlock.prototype.create;
  var originalStart = R5PlaybackBlock.prototype.start
  var originalStop = R5PlaybackBlock.prototype.stop
  var originalHandleStartError = R5PlaybackBlock.prototype.handleStartError

  function getVideoElementId(streamName) {
    return ['red5pro-subscriber', streamName.split('.').join('-')].join('-')
  }

  function generateVideoSection(streamName) {
    var videoContainer = document.createElement('div')
    var statsField = document.createElement('div')
    var videoHolder = document.createElement('div')
    var frameHolder = document.createElement('div')
    var frame = document.createElement('canvas')
    var video = document.createElement('video')
    var playButton = document.createElement('img')
    // var stopButton = document.createElement('button')
    // var stopButtonLabel = document.createTextNode('Stop & Close')
    // stopButton.appendChild(stopButtonLabel)
    videoContainer.appendChild(statsField)
    videoContainer.appendChild(videoHolder)
    // videoContainer.appendChild(stopButton)
    frameHolder.appendChild(frame)
    frameHolder.appendChild(playButton)
    videoHolder.appendChild(frameHolder)
    videoHolder.appendChild(video)
    statsField.classList.add('statistics-field')
    statsField.classList.add('hidden')
    videoContainer.classList.add('video-container')
    videoHolder.classList.add('video-holder')
    frameHolder.classList.add('frame-holder')
    frame.classList.add('video-frame')
    video.classList.add('red5pro-subscriber')
    video.classList.add('red5pro-media')
    video.classList.add('red5pro-media-background')
    video.classList.add('hidden')
    video.controls = true
    video.autoplay = true
    video.setAttribute('playsinline', 'playsinline')
    video.id = getVideoElementId(streamName)
    playButton.src = 'images/play_circle.svg'
    playButton.classList.add('stream-play-button')
    // stopButton.classList.add('ui-button')
    // stopButton.classList.add('stop-button')
    // stopButton.classList.add('hidden')
    return videoContainer
  }

  function generateBroadcastSection(streamName) {
    var parent = document.createElement('div')
    var stopButton = document.createElement('button')
    var stopButtonLabel = document.createTextNode('Stop & Close')
    stopButton.appendChild(stopButtonLabel)
    stopButton.classList.add('ui-button')
    stopButton.classList.add('stop-button')
    stopButton.classList.add('hidden')
    var videoSection = generateVideoSection(streamName)
    parent.appendChild(videoSection)
    parent.appendChild(stopButton)
    parent.classList.add('subscribe-section')
    return parent
  }

  function generateLinks(urls, linkOut, cb) {
    var keys = Object.keys(urls)
    keys = keys.filter(function (k) {
      return k !== 'rtmp' && k !== 'flv'
    })
    var i,
      length = keys.length
    var links = []
    for (i = 0; i < length; i++) {
      var url = urls[keys[i]]
      var linkParse = linkOut.split('&stream=')
      var streamEnd = url.substr(url.lastIndexOf('/') + 1, url.length)
      var href = [linkParse[0], streamEnd].join('&stream=')
      var linkParent = document.createElement('p')
      var link = document.createElement('a')
      var linkText = document.createTextNode(url)
      link.appendChild(linkText)
      linkParent.appendChild(link)
      link.href = href
      link.target = '_blank'
      linkParent.classList.add('stream-link')
      link.addEventListener('click', cb)
      links.push(linkParent)
    }
    return links
  }

  function generateFlashLink(url) {
    var container = document.createElement('div')
    var flvSpan = document.createElement('p')
    var flvText = document.createTextNode('FLV available:')
    flvSpan.appendChild(flvText)
    var urlContainer = document.createElement('p')
    var urlSpan = document.createElement('span')
    urlSpan.innerText = url + '\u00A0\u00A0|\u00A0\u00A0'
    var link = document.createElement('span')
    var linkText = document.createTextNode('Copy to Clipboard')
    link.classList.add('copy-clipboard')
    container.classList.add('stream-link')
    link.appendChild(linkText)
    urlContainer.appendChild(urlSpan)
    urlContainer.appendChild(link)
    container.appendChild(flvSpan)
    container.appendChild(urlContainer)
    link.addEventListener('click', function () {
      navigator.clipboard.writeText(url).then(
        function () {
          console.log('Async: Copying to clipboard was successful!')
        },
        function (err) {
          console.error('Async: Could not copy text: ', err)
        }
      )
    })
    return container
  }

  var isHLSFile = function (data) {
    return data.urls && data.urls.hasOwnProperty('hls')
  }

  var isFLVFile = function (data) {
    if (data.urls && data.urls.hasOwnProperty('rtmp')) {
      return data.urls.rtmp.indexOf('flv') !== -1
    }
    return false
  }

  var isMP4File = function (data) {
    return data.urls && data.urls.hasOwnProperty('mp4')
  }

  R5PlaybackBlock.prototype.startHlsJSPlayback = function (url) {
    console.log('[' + this.streamName + '] :: Defaulting to HLS.js Playback.')
    var video = this.getVideoElement()
    var hls = new Hls({ debug: true, backBufferLength: 0 })
    hls.loadSource(url.indexOf('.m3u8') === -1 ? url + '.m3u8' : url)
    hls.attachMedia(video)
    this.updateStatusFieldWithType('videojs')
    this.setActive(true)
    this.subscriber = {
      unsubscribe: function () {
        hls.detachMedia()
      },
    }
  }

  R5PlaybackBlock.prototype.startMP4Playback = function (url) {
    console.log('[' + this.streamName + '] :: Defaulting to MP4 Playback.')
    if (url.indexOf('streams/') === -1) {
      var paths = url.split('/')
      paths.splice(paths.length - 1, 0, 'streams')
      url = paths.join('/')
    }
    var video = this.getVideoElement()
    var appendSource = function () {
      var source = document.createElement('source')
      source.type = 'video/mp4;codecs="avc1.42E01E, mp4a.40.2"'
      source.src = url
      video.appendChild(source)
    }
    if (video.children.length > 0) {
      var hasSource = $(video).find('source').get(0)
      if (!hasSource) {
        appendSource()
      } else {
        try {
          video.play()
        } catch (e) {
          console.log(e.message)
        }
      }
    } else {
      appendSource()
    }
    this.updateStatusFieldWithType('mp4')
    this.setActive(true)
    this.subscriber = {
      unsubscribe: function () {
        video.pause()
      },
    }
  }

  R5PlaybackBlock.prototype.create = function () {
    var urls = Object.keys(this.streamData.urls)
    var div = document.createElement('div')
    var title = document.createElement('h2')
    var rule = document.createElement('hr')
    var titleText = document.createTextNode(this.title)
    title.appendChild(titleText)
    div.appendChild(title)
    if (urls.length === 1 && urls[0] === 'rtmp') {
      // skip adding playback
    } else {
      var broadcastSection = generateBroadcastSection(this.streamName)
      div.appendChild(broadcastSection)
      div.appendChild(rule)
      var links = generateLinks(
        this.streamData.urls,
        this.externalLink,
        this.handleExternalLink.bind(this)
      )
      for (var i = 0; i < links.length; i++) {
        div.appendChild(links[i])
      }
    }
    if (this.streamData.urls && this.streamData.urls.hasOwnProperty('rtmp')) {
      var ruleDupe = rule.cloneNode()
      var flashLink = generateFlashLink(this.streamData.urls.rtmp)
      ruleDupe.classList.add('stream-rule')
      div.append(ruleDupe)
      div.append(flashLink)
    }
    div.classList.add('playback-block-listing')
    title.classList.add('stream-header')
    rule.classList.add('stream-rule')
    this.elementNode = div
    this.addUIDelegates(this.elementNode)
    return this
  }

  R5PlaybackBlock.prototype.start = function (configuration, playbackOrder) {
    console.log(
      '[playback, ' +
        this.streamName +
        '] stream data: ' +
        JSON.stringify(this.streamData, null, 2)
    )
    // Force MP4 Playback.
    if (this.canPlayMP4 && isMP4File(this.streamData)) {
      try {
        this.expand()
        this.isHalted = false
        if (this.client) {
          this.client.onPlaybackBlockStart(this)
        }
        this.startMP4Playback(this.streamData.urls.mp4)
      } catch (error) {
        console.error(error)
        this.handleStartError(error)
      }
    } else if (isHLSFile(this.streamData)) {
      var hlsConfig = Object.assign({}, configuration.hls, {
        streamName: configuration.hls.streamName.split('.m3u8')[0],
      })
      this.useFailover = true
      originalStart.call(
        this,
        Object.assign({}, configuration, { hls: hlsConfig }),
        ['hls']
      )
    } else {
      this.useFailover = true
      originalStart.call(this, configuration, playbackOrder)
    }
  }

  R5PlaybackBlock.prototype.stop = function () {
    this.useFailover = false
    originalStop.call(this)
  }

  R5PlaybackBlock.prototype.handleStartError = function (error) {
    if (this.useFailover && isHLSFile(this.streamData)) {
      this.useFailover = false
      try {
        this.expand()
        this.isHalted = false
        if (this.client) {
          this.client.onPlaybackBlockStart(this)
        }
        this.startHlsJSPlayback(this.streamData.urls.hls)
      } catch (error) {
        console.error(error)
        this.handleStartError(error)
      }
    } else if (this.useFailover && isFLVFile(this.streamData)) {
      this.useFailover = false
      try {
        this.expand()
        this.isHalted = false
        if (this.client) {
          this.client.onPlaybackBlockStart(this)
        }
        this.startFlashEmbedPlayback()
      } catch (error) {
        console.error(error)
        this.handleStartError(error)
      }
    } else {
      originalHandleStartError.call(this, error)
    }
  }

  R5PlaybackBlock.prototype.handleExternalLink = function () {
    var json = this.getElement().parentNode.getAttribute('data-stream')
    if (json) {
      window.streamdata = json
    }
  }

  R5PlaybackBlock.prototype.setVODData = function (
    data,
    forceFlashPlayback,
    canPlayMP4
  ) {
    this.isVOD = true
    this.streamData = data
    this.forceFlashPlayback = !!forceFlashPlayback
    this.canPlayMP4 = !!canPlayMP4
  }
})(
  window,
  document,
  navigator,
  jQuery.noConflict(),
  window.videojs,
  window.R5PlaybackBlock
)
