/*global window*/
(function () {
  'use strict';

  var jsonAttr = /['"](.*?)['"]:/gi;
  var jsonVal = /:['"](.*?)['"]/gi;

  function readUTF (data,start,len) {
    var result = '',offset = start, end = start + len;
    do {
      result += String.fromCharCode(data[offset++]);
    }
    while(offset < end);
    return result;
  }

  function parseJSONForOrientation (text) {
    try {
      var value = JSON.parse(text);
      if (value.hasOwnProperty('orientation')) {
        return parseInt(value.orientation);
      }
      return undefined;
    }
    catch (e) {
      var match = jsonAttr.exec(text);
      var match2;
      if (match && match.length > 1) {
        match2 = jsonVal.exec(text);
        if (match[1] === 'orientation' && match2 && match2.length > 1) {
          return parseInt(match2[1]);
        }
      }
      return undefined;
    }
    return undefined;
  }

  window.onOrientation = function(player, cb) {
    var textTracks = typeof player.textTracks === 'function' ? player.textTracks() : player.textTracks;
    if (textTracks) {

      player.addTextTrack('metadata');

      textTracks.addEventListener('addtrack', function (addTrackEvent) {

        var track = addTrackEvent.track;
        track.mode = 'hidden';
        /**
        var cue = new VTTCue(1.0, 0, 'Testing');
        cue.id = 1;
        cue.pauseOnExit = false;
        track.addCue(cue);
        */

        track.addEventListener('cuechange', function (cueChangeEvent) {
          for(var i = 0; i < cueChangeEvent.currentTarget.cues.length; i++) {
            var data = cueChangeEvent.currentTarget.cues[i];
            if (data.value) {
              var text = typeof data.value.data === 'string' ? data.value.data : readUTF( data.value.data , 0 , data.size);
              var orientation = parseJSONForOrientation(text);
              if (orientation !== undefined) {
                cb(orientation);
                break;
              }
            }
          }
        });

      });

    }
  };

})();
