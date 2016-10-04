/*global window, document*/
(function () {
  'use strict';

  var jsonAttr = /['"](.*?)['"]:/gi;
  var jsonVal = /:['"](.*?)['"]/gi;

  var handleOrientation = function (elementId, cb) {
    var currentRotation = 0;
    var origin = [
      'webkitTransformOrigin',
      'mozTransformOrigin',
      'msTransformOrigin',
      'oTransformOrigin',
      'transformOrigin'
    ];
    var styles = [
      'webkitTransform',
      'mozTransform',
      'msTransform',
      'oTransform',
      'transform'
    ];
    var transition = [
      'webkitTransition',
      'mozTransition',
      'msTransition',
      'oTransition',
      'transition'
    ];
    var rotationTranslations = {
      '0': {
        origin: 'center center',
        transform: 'rotate(0deg)'
      },
      '90': {
        origin: 'left top',
        transform: 'rotate(90deg) translateY(-100%)'
      },
      '180': {
        origin: 'center center',
        transform: 'rotate(180deg)'
      },
      '270': {
        origin: 'bottom left',
        transform: 'rotate(270deg) translateX(-50%) translateY(100%)'
      },
      '-90': {
        origin: 'left top',
        transform: 'rotate(-90deg) translateX(-100%)'
      },
      '-180': {
        origin: 'center center',
        transform: 'rotate(-180deg)'
      },
      '-270': {
        origin: 'top left',
        transform: 'rotate(-270deg) translateY(-100%)'
      }
    };

    function applyOrientation (value) {
      if (currentRotation === value) {
        return;
      }
      var vid = document.getElementById(elementId);
      if (vid) {
        var i, length = styles.length;
        var translations = rotationTranslations[value.toString()];
        for(i = 0; i < length; i++) {
          vid.style[origin[i]] = translations.origin;
          vid.style[styles[i]] = translations.transform;
          vid.style[transition[i]] = 'transform 0.3s linear';
        }
      }

      if (cb) {
        cb();
      }
    }

    return applyOrientation;
  };

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

  window.onOrientation = function(player, elementId, callback) {
    var cb = handleOrientation(elementId, callback);
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
          var cues;
          // Mostly Chrome.
          if (cueChangeEvent && cueChangeEvent.currentTarget) {
            cues = cueChangeEvent.currentTarget.cues;
          }
          // Mostly Firefox & Safari.
          cues = cues && cues.length > 0 ? cues : this.activeCues;
          // Mostly failure.
          cues = cues || [];
          for(var i = 0; i < cues.length; i++) {
            var data = cues[i];
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
