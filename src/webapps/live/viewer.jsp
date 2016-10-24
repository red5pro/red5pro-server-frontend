<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%
    String app = "live";
    String host="127.0.0.1";
    String stream="myStream";
    String buffer="2";
    String width="100%";
    String height="100%";

    if(request.getParameter("app") != null) {
      app = request.getParameter("app");
    }

    if(request.getParameter("host") != null) {
      host = request.getParameter("host");
    }

    if(request.getParameter("stream") != null) {
      stream = request.getParameter("stream");
    }

    if(request.getParameter("buffer") != null) {
      buffer = request.getParameter("buffer");
    }
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
    <head>
        <title>Subscribing to <%= stream %></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="google" value="notranslate" />
        <script>
          // writing params to global.
          window.targetHost = "<%=host%>";
          window.r5proApp = "<%=app%>";
          window.r5proStreamName = "<%=stream%>";
          window.r5proBuffer = "<%=buffer%>";
          window.r5proVideoWidth = "<%=width%>";
          window.r5proVideoHeight = "<%=height%>";
          window.r5proAutosubscribe = true;
        </script>
        <link rel="stylesheet" href="lib/videojs/video-js.min.css">
        <script src="lib/webrtc/adapter.js"></script>
        <script src="lib/videojs/video.min.js"></script>
        <script src="lib/videojs/videojs-media-sources.min.js"></script>
        <script src="lib/videojs/videojs.hls.min.js"></script>
        <style>
          object:focus {
            outline:none;
          }

          #video-holder, .video-element {
            width: <%=width%>;
            height: <%=height%>;
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
        </style>
    </head>
    <body>
      <div id="video-container">
            <div id="video-holder">
              <video id="red5pro-subscriber-video" controls class="video-element"></video>
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
      <script src="lib/red5pro/red5pro-sdk.js"></script>
      <script src="script/r5pro-viewer-failover.js"></script>
      </script>
    </body>
</html>
