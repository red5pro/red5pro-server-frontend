(function (window) {
  'use strict';

  var bitrateInterval = 0;

  // Based on https://github.com/webrtc/samples/blob/gh-pages/src/content/peerconnection/bandwidth/js/main.js
  window.trackBitrate = function (connection, cb, resolutionCb) {
    window.untrackBitrate(cb);
    //    var lastResult;
    var lastOutboundVideoResult;
    var lastInboundVideoResult;
    var lastInboundAudioResult;
    bitrateInterval = setInterval(function () {
      connection.getStats(null).then(function(res) {
        res.forEach(function(report) {
          var bytes;
          var packets;
          var now = report.timestamp;
          if ((report.type === 'outboundrtp') ||
              (report.type === 'outbound-rtp') ||
              (report.type === 'ssrc' && report.bytesSent)) {
            bytes = report.bytesSent;
            packets = report.packetsSent;
            if ((report.mediaType === 'video' || report.id.match(/VideoStream/))) {
              if (lastOutboundVideoResult && lastOutboundVideoResult.get(report.id)) {
                // calculate bitrate
                var bitrate = 8 * (bytes - lastOutboundVideoResult.get(report.id).bytesSent) /
                    (now - lastOutboundVideoResult.get(report.id).timestamp);

                cb(bitrate, packets);

              }
              lastOutboundVideoResult = res;
            }
          }
          // playback.
          else if ((report.type === 'inboundrtp') ||
              (report.type === 'inbound-rtp') ||
              (report.type === 'ssrc' && report.bytesReceived)) {
            bytes = report.bytesReceived;
            packets = report.packetsReceived;
            if ((report.mediaType === 'video' || report.id.match(/VideoStream/))) {
              if (lastInboundVideoResult && lastInboundVideoResult.get(report.id)) {
                // calculate bitrate
                bitrate = 8 * (bytes - lastInboundVideoResult.get(report.id).bytesReceived) /
                  (now - lastInboundVideoResult.get(report.id).timestamp);

                cb('video', report, bitrate, packets - lastInboundVideoResult.get(report.id).packetsReceived);
              }
              lastInboundVideoResult = res;
            }
            else if ((report.mediaType === 'audio' || report.id.match(/AudioStream/))) {
              if (lastInboundAudioResult && lastInboundAudioResult.get(report.id)) {
                // calculate bitrate
                bitrate = 8 * (bytes - lastInboundAudioResult.get(report.id).bytesReceived) /
                  (now - lastInboundAudioResult.get(report.id).timestamp);

                cb('audio', report, bitrate, packets - lastInboundVideoResult.get(report.id).packetsReceived);
              }
              lastInboundAudioResult = res;
            }
          }
          else if (resolutionCb && report.type === 'track' && report.kind === 'video') {
            resolutionCb(report.frameWidth, report.frameHeight);
          }
        });
      });
    }, 1000);
  }

  window.untrackBitrate = function() {
    clearInterval(bitrateInterval);
  }

})(this);
