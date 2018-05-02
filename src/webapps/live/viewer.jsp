<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="UTF-8"%>
<%
    String app = "live";
    String ice = null;
    String host="127.0.0.1";
    String stream="myStream";
    String buffer="2";
    String width="100%";
    String height="100%";
    String tech=null;
    Integer audioBandwidth = -1;
    Integer videoBandwidth = -1;

   if (request.getParameter("view") != null) {
    tech = request.getParameter("view");
  }

  if (request.getParameter("ice") != null) {
    ice = request.getParameter("ice");
  }

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

    if (request.getParameter("audioBW") != null) {
      audioBandwidth = Integer.parseInt(request.getParameter("audioBW"));
    }

    if (request.getParameter("videoBW") != null) {
      videoBandwidth = Integer.parseInt(request.getParameter("videoBW"));
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
        <title>Subscribing to <%= stream %></title>
      <script src="//webrtc.github.io/adapter/adapter-latest.js"></script>
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
            max-width: 640px;
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
          // writing params to global.
          window.targetHost = "<%=host%>";
          window.r5proApp = "<%=app%>";
          window.r5proStreamName = "<%=stream%>";
          window.r5proBuffer = Number("<%=buffer%>");
          window.r5proVideoWidth = "<%=width%>";
          window.r5proVideoHeight = "<%=height%>";
          window.r5proIce = window.determineIceServers('<%=ice%>');
          window.r5proAutosubscribe = true;

          function assignIfDefined (value, prop) {
            if (value && value !== 'null') {
              window[prop] = value;
            }
          }
          assignIfDefined("<%=tech%>", 'r5proViewTech');
          assignIfDefined(<%=audioBandwidth%>, 'r5proAudioBandwidth');
          assignIfDefined(<%=videoBandwidth%>, 'r5proVideoBandwidth');
        </script>
      <script src="script/r5pro-viewer-failover.js"></script>
    </body>
</html>
