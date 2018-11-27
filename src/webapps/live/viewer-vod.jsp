<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<%
    String app = "live";
    String host="127.0.0.1";
    String stream="myStream";
    String buffer="2";
    String width="100%";
    String height="100%";
    String ice=null;
    String tech=null;

    if (request.getParameter("app") != null) {
      app = request.getParameter("app");
    }

    if (request.getParameter("host") != null) {
      host = request.getParameter("host");
    }

    if (request.getParameter("stream") != null) {
      stream = request.getParameter("stream");
    }

    if (request.getParameter("buffer") != null) {
      buffer = request.getParameter("buffer");
    }

    if (request.getParameter("view") != null) {
      tech = request.getParameter("view");
    }

    if (request.getParameter("ice") != null) {
      ice = request.getParameter("ice");
    }
%>
<!doctype html>
<html lang="eng">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Welcome to the Red5 Pro Server Pages!">
        <link rel="stylesheet" href="css/main.css">
        <link href="https://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet" type="text/css">
        <title>VOD Playback of <%= stream %></title>
    <link href="//vjs.zencdn.net/5.19/video-js.min.css" rel="stylesheet">
    <script src="//unpkg.com/video.js/dist/video.js"></script>
    <script src="//unpkg.com/videojs-contrib-hls/dist/videojs-contrib-hls.js"></script>
    <script src="//unpkg.com/videojs-flash/dist/videojs-flash.js"></script>
    <script src="//webrtchacks.github.io/adapter/adapter-latest.js"></script>
    <script src="lib/screenfull/screenfull.min.js"></script>
    <link href="lib/red5pro/red5pro-media.css" rel="stylesheet">
        <style>
          object:focus {
            outline:none;
          }

          #video-holder, .video-element {
            width: <%=width%>;
            height: <%=height%>;
          }

          #video-holder {
            max-width: 600px;
            margin: 0 auto;
          }

          #video-container {
            border-radius: 5px;
            background-color: #e3e3e3;
            padding: 10px;
          }

          #status-field {
            text-align: center;
            padding: 10px;
            color: #fff;
            margin: 10px 0;
          }

          .status-alert {
            background-color: rgb(227, 25, 0);
          }

          .status-message {
            background-color: #aaa;
          }

          #event-log-field {
            background-color: #c0c0c0;
            border-radius: 6px;
            padding: 10px;
            margin: 14px;
          }

      .red5pro-media-control-bar {
        min-height: 40px;
      }
        </style>
    </head>
    <body>
    <template id="flash-playback">
      <object type="application/x-shockwave-flash" id="red5pro-subscriber" name="red5pro-subscriber" align="middle" data="lib/red5pro/red5pro-subscriber.swf" width="100%" height="100%" class="red5pro-media-background red5pro-media">
        <param name="quality" value="high">
        <param name="wmode" value="opaque">
        <param name="bgcolor" value="#000000">
        <param name="allowscriptaccess" value="always">
        <param name="allowfullscreen" value="true">
        <param name="allownetworking" value="all">
      </object>
    </template>
      <div id="video-container">
            <div id="video-holder">
              <video id="red5pro-subscriber"
                      controls autoplay playsinline
                      class="red5pro-media red5pro-media-background">
              </video>
            </div>
            <div id="status-field" class="status-message"></div>
            <div id="event-log-field" class="event-log-field">
              <div style="padding: 10px 0">
                <p><span style="float: left;">Event Log:</span><button id="clear-log-button" style="float: right;">clear</button></p>
                <div style="clear: both;"></div>
              </div>
            </div>
      </div>
      <script src="lib/es6/es6-array.js"></script>
      <script src="lib/es6/es6-bind.js"></script>
      <script src="lib/es6/es6-fetch.js"></script>
      <script src="lib/es6/es6-object-assign.js"></script>
      <script src="lib/es6/es6-promise.min.js"></script>
      <script src="lib/jquery-1.12.4.min.js"></script>
      <script src="lib/red5pro/red5pro-sdk.min.js"></script>
      <script src="script/r5pro-ice-utils.js"></script>
        <script>
          // Access selected data from the `opener` window.
          var opener = window.opener;
          if (opener) {
            var json = opener.streamdata;
            var streamDataStr = decodeURIComponent(json);
            var streamData = JSON.parse(streamDataStr);
            console.log('Stream data:\r\n' + JSON.stringify(streamData, null, 2));
            window.streamData = streamData;
          }

          // writing params to global.
          window.targetHost = "<%=host%>";
          window.r5proApp = "<%=app%>";
          window.r5proStreamName = "<%=stream%>";
          window.r5proBuffer = Number("<%=buffer%>");
          window.r5proVideoWidth = "<%=width%>";
          window.r5proVideoHeight = "<%=height%>";
          window.r5proAutosubscribe = true;
          window.r5proIce = window.determineIceServers('<%=ice%>');

          var viewTech = "<%=tech%>";
          if (viewTech && viewTech !== 'null') {
            window.r5proViewTech = viewTech;
          }
        </script>
      <script src="script/r5pro-viewer-vod-failover.js"></script>
    </body>
</html>
