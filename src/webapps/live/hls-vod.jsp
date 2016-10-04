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
      <script src="http://webrtc.github.io/adapter/adapter-latest.js"></script>
      <script src="videojs/video.min.js"></script>
      <script src="videojs/videojs-media-sources.min.js"></script>
      <script src="videojs/videojs.hls.min.js"></script>
      <script src="script/hls-metadata.js"></script>
      <script>
        (function () {

          var player = videojs('red5pro-video');
          player.src({
                  src: "<%=url%>",
                  type: "application/x-mpegURL",
                  useCueTags: true
              });

          window.onOrientation(player, 'red5pro-video');

          player.play();

        })();
      </script>
  </body>
</html>

