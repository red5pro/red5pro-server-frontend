{{> jsp_header }}
<%
  String host = ip;
  String ice = null;
  String tech = null;
  Integer framerateMin = 8;
  Integer framerateMax = 24;
  Integer audioBandwidth = 56;
  Integer videoBandwidth = 750;
  Integer videoWidthMin = 640;
  Integer videoWidthMax = 640;
  Integer videoHeightMin = 480;
  Integer videoHeightMax = 480;
  Integer signalSocketOnly = 1;
  Integer whipwhep = 1;

  if (request.getParameter("view") != null) {
    tech = request.getParameter("view");
  }

  if (request.getParameter("ice") != null) {
    ice = request.getParameter("ice");
  }

  if (request.getParameter("framerateMin") != null) {
    framerateMin = Integer.parseInt(request.getParameter("framerateMin"));
  }

  if (request.getParameter("framerateMax") != null) {
    framerateMax = Integer.parseInt(request.getParameter("framerateMax"));
  }

  if (request.getParameter("audioBW") != null) {
    audioBandwidth = Integer.parseInt(request.getParameter("audioBW"));
  }

  if (request.getParameter("videoBW") != null) {
    videoBandwidth = Integer.parseInt(request.getParameter("videoBW"));
  }

  if (request.getParameter("videoWidthMin") != null) {
    videoWidthMin = Integer.parseInt(request.getParameter("videoWidthMin"));
  }
  if (request.getParameter("videoWidthMax") != null) {
    videoWidthMax = Integer.parseInt(request.getParameter("videoWidthMax"));
  }
  if (request.getParameter("videoHeightMin") != null) {
    videoHeightMin = Integer.parseInt(request.getParameter("videoHeightMin"));
  }
  if (request.getParameter("videoHeightMax") != null) {
    videoHeightMax = Integer.parseInt(request.getParameter("videoHeightMax"));
  }
  if (request.getParameter("dc") != null) {
    signalSocketOnly =  Integer.parseInt(request.getParameter("dc")) == 0 ? 0 : 1;
  }
  if (request.getParameter("whipwhep") != null) {
    whipwhep =  Integer.parseInt(request.getParameter("whipwhep")) == 0 ? 0 : 1;
  }


%>
<!doctype html>
{{> license}}
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Stream Broadcasting with the Red5 Pro Server</title>
    <script src="//webrtchacks.github.io/adapter/adapter-latest.js"></script>
    <script src="lib/screenfull/screenfull.min.js"></script>
    <link rel="stylesheet" href="lib/red5pro/red5pro-media.css"></script>
    <link rel="stylesheet" href="css/broadcast.css"></script>
  </head>
  <body>
    {{> top-bar }}
    <div class="main-container container">
      <div id="menu-section">
        {{> menu }}
      </div>
      <div id="content-section">
        <div id="subcontent-section">
          <div id="subcontent-section-text">
            <h1>Live Broadcast For Any Screen</h1>
            {{> header }}
            <hr class="top-padded-rule">
            <p class="heading-title">To start a Broadcast:
              <ol>
                <li>Allow browser access to device(s)</li>
                <li>Provide a <span class="bold">Stream Name</span></li>
                <li>Select any additional broadcast options</li>
                <li>Click <span class="bold">Start Broadcast</span></li>
              </ol>
            </p>
            <p>Select <span class="bold">Enable Recording</span> to save your broadcast for Video on Demand playback!<br/><span class="small-font-size">To view the current Video On Demand (VOD) files on your server, visit the <a class="card-link card-link_page" href="playback.jsp" target="_blank">Playback</a> page.</span></p>
          </div>
        </div>
        <% if (is_stream_manager) { %>
          <p class="stream-manager-notification">USING STREAM MANAGER</p>
          <hr class="top-padded-rule" style="margin-top: 0">
        <% } %>
        <div class="broadcast-section">
          <div id="video-container">
            <div class="status-message">
              <p id="status-field"></p>
              <button id="log-toggle-button">Logs</button>
            </div>
            <div id="stream-manager-info" class="status-message hidden">Using Stream Manager Proxy.</div>
            <div id="statistics-field" class="statistics-field hidden"></div>
            <div id="video-holder">
              <video id="red5pro-publisher"
                      muted autoplay playsinline
                      class="video-element">
              </video>
            </div>
            <div id="video-form">
              <p class="video-form-item hidden">
                <label for="camera-select">Select Camera:</label>
                <select name="camera-select" id="camera-select-field"></select>
              </p>
              <p class="video-form-item">
                <label for="stream-name-field">Stream Name:</label>
                <input name="stream-name-field" id="stream-name-field" style="min-width: 200px"></input>
              </p>
              <p class="video-form-item">
                <label for="enable-record-field">Enable Recording:</label>
                <input type="checkbox" name="enable-record-field" id="enable-record-field"></input>
              </p>
            </div>
            <div>
              <button id="start-stop-button" class="start-stop-button button-disabled">Start Broadcast</button>
            </div>
          </div>
          <div id="event-container" class="hidden">
            <div id="event-log-field" class="event-log-field">
              <div>
                <div class="event-header">
                  <p>Event Log</p>
                  <button id="clear-log-button" class="hidden">clear</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {{> additional_info }}
      </div>
    </div>
    {{> es6-script-includes }}
    {{> stream_manager_script }}
    <script src="script/r5pro-ice-utils.js"></script>
    <script>
      function assignIfDefined (value, prop) {
        if (value !== 'null') {
          window[prop] = value;
        }
      }
      assignIfDefined("<%=tech%>", 'r5proViewTech');
      assignIfDefined(<%=framerateMin%>, 'r5proFramerateMin');
      assignIfDefined(<%=framerateMax%>, 'r5proFramerateMax');
      assignIfDefined(<%=audioBandwidth%>, 'r5proAudioBandwidth');
      assignIfDefined(<%=videoBandwidth%>, 'r5proVideoBandwidth');
      assignIfDefined(<%=videoWidthMin%>, 'r5proVideoWidthMin');
      assignIfDefined(<%=videoWidthMax%>, 'r5proVideoWidthMax');
      assignIfDefined(<%=videoHeightMin%>, 'r5proVideoHeightMin');
      assignIfDefined(<%=videoHeightMax%>, 'r5proVideoHeightMax');
      assignIfDefined(<%=signalSocketOnly%>, 'r5proSignalSocketOnly');
      assignIfDefined(<%=whipwhep%>, 'r5proWhipWhep');

      window.targetHost = '<%=ip%>';
      window.r5proIce = window.determineIceServers('<%=ice%>');
    </script>
    <script src="lib/red5pro/red5pro-sdk.min.js"></script>
    <script src="script/r5pro-utils.js"></script>
    <script src="script/r5pro-sm-utils.js"></script>
    <script src="script/r5pro-publisher-failover.js"></script>
    <!-- {{> footer }} -->
   </body>
</html>
