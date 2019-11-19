{{> jsp_header }}
<%
    String app = "live";
    String host="127.0.0.1";
    String stream="myStream";
    String buffer="2";
    String width="100%";
    String height="480";
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
{{> license}}
<html lang="eng">
    <head>
      {{> head_meta }}
      {{> resources }}
      <title>VOD Playback of <%= stream %></title>
      <link href="//vjs.zencdn.net/5.19/video-js.min.css" rel="stylesheet">
      <script src="//unpkg.com/video.js/dist/video.js"></script>
      <script src="//unpkg.com/videojs-contrib-hls/dist/videojs-contrib-hls.js"></script>
      <script src="//unpkg.com/videojs-flash/dist/videojs-flash.js"></script>
      <script src="//webrtchacks.github.io/adapter/adapter-latest.js"></script>
      <script src="lib/screenfull/screenfull.min.js"></script>
      <link href="lib/red5pro/red5pro-media.css" rel="stylesheet">
      <link rel="stylesheet" href="css/playback.css">
      <link rel="stylesheet" href="css/viewer.css">
    </head>
    <body>
      {{> top-bar }}
      {{> navigation }}
      {{> header }}
      <div id="viewer-section">
        <div id="subviewer-section">
          <div id="subviewer-section-text">
            <h1 class="red-text subviewer-title">VOD Subscribing to <span style="text-transform: none;"><%=stream%></span></h1>
          </div>
        </div>
        <div class="content-section-story">
          <% if (is_stream_manager) { %>
            <p class="stream-manager-notification">USING STREAM MANAGER</p>
          <% } %>
          <div class="subscribe-section">
            <div class="video-container">
              <div class="video-holder">
                <video id="red5pro-subscriber"
                      controls="controls" autoplay="autoplay" playsinline muted
                      class="red5pro-subscriber red5pro-media red5pro-media-background">
                </video>
              </div>
            </div>
          </div>
          <div class="event-container">
            <div class="status-field status-message"></div>
            <div class="stream-manager-info status-message hidden"></div>
            <div class="event-log-field">
              <div class="event-header">
                <span>Event Log:</span>
                <button id="clear-log-button" class="event-clear-button">clear</button>
              </div>
              <hr class="event-rule">
              <div class="event-log">
            </div>
          </div>
        </div>
      </div>
      {{> es6-script-includes }}
      {{> stream_manager_script }}
      <script src="script/r5pro-ice-utils.js"></script>
      <script>
          // Access selected data from the `opener` window.
          var opener = window.opener;
          if (opener && opener.streamdata) {
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
      <script src="lib/red5pro/red5pro-sdk.min.js"></script>
      <script src="script/r5pro-utils.js"></script>
      <script src="script/r5pro-autoplay-utils.js"></script>
      <script src="script/r5pro-viewer-vod-failover.js"></script>
      {{> footer }}
    </body>
</html>
