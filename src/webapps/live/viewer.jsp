{{> jsp_header }}
<%
    String app = "live";
    String ice = null;
    String host="127.0.0.1";
    String stream="myStream";
    String buffer="0.5";
    String width="100%";
    String height="480";
    String tech=null;
    String protocol=null;
    String port=null;
    Integer audioBandwidth = -1;
    Integer videoBandwidth = -1;
    Integer enableAnalytics = 0;

    String analytics_protocol = null;
    String analytics_host = null;
    String analytics_port = null;

  if (request.getParameter("analyze") != null) {
    enableAnalytics = 1;
  }

  if (request.getParameter("analytics_protocol") != null) {
    analytics_protocol = request.getParameter("analytics_protocol");
  }

  if (request.getParameter("analytics_host") != null) {
    analytics_host = request.getParameter("analytics_host");
  }

  if (request.getParameter("analytics_port") != null) {
    analytics_port = request.getParameter("analytics_port");
  }

  if (request.getParameter("view") != null) {
    tech = request.getParameter("view");
  }

  if (request.getParameter("protocol") != null) {
    protocol = request.getParameter("protocol");
  }

  if (request.getParameter("port") != null) {
    port = request.getParameter("port");
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
{{> license}}
<html lang="eng">
    <head>
      {{> head_meta }}
      {{> resources }}
      <title>Subscribing to <%= stream %></title>
      <script src="//webrtchacks.github.io/adapter/adapter-latest.js"></script>
      <script src="lib/screenfull/screenfull.min.js"></script>
      <link rel="stylesheet" href="lib/red5pro/red5pro-media.css">
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
            <h1 class="red-text subviewer-title">Live Subscribing to <span style="text-transform: none;"><%=stream%></span></h1>
          </div>
        </div>
        <div class="content-section-story">
          <div id="id-container"><p>I AM ID</p></div>
          <div class="subscribe-section">
            <div class="video-container">
              <div class="statistics-field">Bitrate: 0. 0x0.</div>
              <div class="video-holder">
                <video id="red5pro-subscriber"
                      controls="controls" autoplay="autoplay" playsinline muted
                      class="red5pro-subscriber red5pro-media red5pro-media-background">
                </video>
              </div>
              <div id="show-hide-reports-btn" class="hidden">Show Live Reports</div>
            </div>
            <div id="report-container" class="reports-container hidden">
              <div class="report-field">
                <div id="video-report_stats" class="statistics-field"></div>
                <div class="report-field_header">Video</div>
                <div id="video-report" class="report"></div>
              </div>
              <div class="report-field">
                <div id="audio-report_stats" class="statistics-field"></div>
                <div class="report-field_header">Audio</div>
                <div id="audio-report" class="report"></div>
              </div>
            </div>
          </div>
          <div class="event-container">
            <div class="status-field status-message"></div>
            <div class="stream-manager-info status-message hidden"></div>
            <div class="event-log-field">
              <div class="event-header">
                <span>Event Log:</span>
                <button class="event-clear-button">clear</button>
              </div>
              <hr class="event-rule">
              <div class="event-log">
            </div>
          </div>
        </div>
      </div>
      {{> es6-script-includes }}
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
          assignIfDefined("<%=port%>", 'targetPort');
          assignIfDefined("<%=protocol%>", 'targetProtocol');
          assignIfDefined(<%=audioBandwidth%>, 'r5proAudioBandwidth');
          assignIfDefined(<%=videoBandwidth%>, 'r5proVideoBandwidth');

          if (<%=enableAnalytics%>) {
              assignIfDefined("<%=analytics_protocol%>", 'analytics_protocol');
              assignIfDefined("<%=analytics_host%>", 'analytics_host');
              assignIfDefined("<%=analytics_port%>", 'analytics_port');

              var script = document.createElement('script');
              script.src = 'script/r5pro-analytics-plugin.js';
              document.head.appendChild(script);
          }
        </script>
      <script src="lib/red5pro/red5pro-sdk.min.js"></script>
      <script src="script/r5pro-utils.js"></script>
      <script src="script/r5pro-sm-utils.js"></script>
      <script src="script/r5pro-autoplay-utils.js"></script>
      <script src="script/r5pro-playback-block.js"></script>
      <script src="script/r5pro-viewer-failover.js"></script>
      {{> footer }}
    </body>
</html>
