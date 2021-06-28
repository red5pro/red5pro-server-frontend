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
/*global window */
(window => {

  window.getParameterByName = (name, url) => { // eslint-disable-line no-unused-vars
    if (!url) {
      url = window.location.href
    }
    name = name.replace(/[[\]]/g, "\\$&")
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, " "))
  }

  const vRegex = /VideoStream/
  const aRegex = /AudioStream/

  // ticket system
  let bitrateTickets = []
  let BitrateTicket = function (connection, cb) {
    this.connection = connection
    this.cb = cb
    this.bitrateInterval = 0
  }
  BitrateTicket.prototype.start = function () {
    let lastResult
    const connection = this.connection
    const cb = this.cb
    // Based on https://github.com/webrtc/samples/blob/gh-pages/src/content/peerconnection/bandwidth/js/main.js
    this.bitrateInterval = setInterval(function () {
      connection.getStats(null).then(function(res) {
        res.forEach(function(report) {
          const {
            type,
            bytesSent,
            bytesReceived,
            mediaType
          } = report
          let bytes
          let bitrate
          let now = report.timestamp
          if ((type === 'outboundrtp') ||
              (type === 'outbound-rtp') ||
              (type === 'ssrc' && bytesSent)) {
            bytes = bytesSent
            if (mediaType === 'video' || report.id.match(vRegex)) {
              if (lastResult && lastResult.get(report.id)) {
                // calculate bitrate
                bitrate = 8 * (bytes - lastResult.get(report.id).bytesSent) /
                    (now - lastResult.get(report.id).timestamp)
                cb(bitrate, report, 'video')
              }
            }
          }
          // playback.
          else if ((type === 'inboundrtp') ||
              (type === 'inbound-rtp') ||
              (type === 'ssrc' && bytesReceived)) {
            bytes = bytesReceived
            if (mediaType === 'audio' || report.id.match(aRegex)) {
              if (lastResult && lastResult.get(report.id)) {
                // calculate bitrate
                bitrate = 8 * (bytes - lastResult.get(report.id).bytesReceived) /
                  (now - lastResult.get(report.id).timestamp)
                cb(bitrate, report, 'audio')
              }
            }
            else if (mediaType === 'video' || report.id.match(vRegex)) {
              if (lastResult && lastResult.get(report.id)) {
                // calculate bitrate
                bitrate = 8 * (bytes - lastResult.get(report.id).bytesReceived) /
                  (now - lastResult.get(report.id).timestamp)
                cb(bitrate, report, 'video')
              }
            }
          } else {
            cb(0, report, 'n/a')
          }
        })
        lastResult = res
      })
    }, 1000)
  }
  BitrateTicket.prototype.stop = function  () {
    clearInterval(this.bitrateInterval)
  }

  window.trackBitrate = (connection, cb) => {
    let t = new BitrateTicket(connection, cb)
    t.start()
    bitrateTickets.push(t)
    return t
  }

  window.untrackBitrate = ticket => {
    bitrateTickets.forEach((t, i) => {
      if (t === ticket) {
        t.stop()
        bitrateTickets.splice(i, 1)
      }
    })
  } 
})(window)
