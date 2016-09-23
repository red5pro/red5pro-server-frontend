<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%
    String url = request.getParameter("url");
    String stream = request.getParameter("streamName");
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
    <head>
        <title>Subscribing to <%= stream %></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="google" value="notranslate" />
        <style type="text/css" media="screen">
            html, body  { height:100%; }
            body {
              margin:0;
              padding:0;
              overflow:auto;
              text-align:center;
              background-color: #ffffff;
            }
        </style>
        <link href="videojs/video-js.min.css" rel="stylesheet">
    </head>
    <body>
      <video id=red5pro-video width=600 height=300 class="video-js vjs-default-skin" controls></video>
      <script src="videojs/video.min.js"></script>
      <script src="videojs/videojs-media-sources.min.js"></script>
      <script src="videojs/videojs.hls.min.js"></script>
      <script>
        (function () {

          var jsonAttr = /['"](.*?)['"]:/gi;
          var jsonVal = /:['"](.*?)['"]/gi;
          var currentRotation = 0;

          function readUTF (data,start,len) {
            var result = '',offset = start, end = start + len;
            do {
              result += String.fromCharCode(data[offset++]);
            } while(offset < end);
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

          function applyOrientation (value) {
            if (currentRotation === value) {
              return;
            }
            console.log('NEED TO APPLY ROTATION: ' + value);
          }

          var player = videojs('red5pro-video');
          player.src({
                  src: "<%=url%>",
                  type: "application/x-mpegURL",
                  useCueTags: true
              });

          var textTracks = player.textTracks();
          if (textTracks) {

            player.addTextTrack('metadata');

            textTracks.addEventListener('addtrack', function (addTrackEvent) {

              var track = addTrackEvent.track;
              var cue = new VTTCue(1.0, 0, 'Testing');
              cue.id = 1;
              cue.pauseOnExit = false;
              track.addCue(cue);

              track.addEventListener('cuechange', function (cueChangeEvent) {
                for(var i = 0; i < cueChangeEvent.currentTarget.cues.length; i++) {
                  var data = cueChangeEvent.currentTarget.cues[i];
                  if (data.value) {
                    var text = readUTF( data.value.data , 0 , data.size);
                    var orientation = parseJSONForOrientation(text);
                    if (orientation !== undefined) {
                      applyOrientation(orientation);
                      break;
                    }
                  }
                }
              });

            });

            player.play();
          }
        })();
      </script>
  </body>
</html>

