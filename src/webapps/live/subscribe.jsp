{{> jsp_header }}
<%@ page import="org.springframework.context.ApplicationContext,
          org.springframework.web.context.WebApplicationContext,
          com.infrared5.red5pro.live.LiveStreamListService,
          java.util.List, java.util.ArrayList"%>
<%
  //LIVE streams page.
  String host = ip;
  String protocol = request.getScheme();
  Integer port = request.getServerPort();
  port = port == -1 ? (protocol == "https" ? 443 : 5080) : port;
  String tech=null;
  String ice=null;
  String buffer = "0.5";
  Integer audioBandwidth = -1;
  Integer videoBandwidth = -1;
  Integer signalSocketOnly = 1;
  Integer whipwhep = 1;

  if (request.getParameter("buffer") != null) {
    buffer = request.getParameter("buffer");
  }
  if (request.getParameter("ice") != null) {
    ice = request.getParameter("ice");
  }

  if (request.getParameter("view") != null) {
    tech = request.getParameter("view");
  }

  if (request.getParameter("audioBW") != null) {
    audioBandwidth = Integer.parseInt(request.getParameter("audioBW"));
  }

  if (request.getParameter("videoBW") != null) {
    videoBandwidth = Integer.parseInt(request.getParameter("videoBW"));
  }
  if (request.getParameter("dc") != null) {
    signalSocketOnly =  Integer.parseInt(request.getParameter("dc")) == 0 ? 0 : 1;
  }
  if (request.getParameter("whipwhep") != null) {
    whipwhep =  Integer.parseInt(request.getParameter("whipwhep")) == 0 ? 0 : 1;
  }

  /*
  ApplicationContext appCtx = (ApplicationContext) application.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
  LiveStreamListService service = (LiveStreamListService)appCtx.getBean("streams");
  List<String> names = service.getLiveStreams();
  StringBuffer ret = new StringBuffer();
  String baseUrl = protocol + "://" + ip + ":" + port;
  // is_stream_manager determined in jsp_header.
  if(!is_stream_manager && names.size() > 0) {
    for(String streamName:names) {
      String streamLocation =  baseUrl + "/live/" + streamName;
      String pageLocation = baseUrl + "/live/viewer.jsp?host=" + ip + "&stream=" + streamName;
      if (tech != null) {
        pageLocation += "&view=" + tech;
      }
      ret.append("<div class=\"stream-menu-listing\" data-streamName=\"" + streamName + "\" data-streamLocation=\"" + streamLocation + "\" data-pageLocation=\"" + pageLocation + "\"></div>\r\n");
    }
  }
  */
%>
<!doctype html>
{{> license}}
<html>
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Stream Subscription with the Red5 Pro Server</title>
    <script src="//webrtchacks.github.io/adapter/adapter-latest.js"></script>
    <script src="lib/screenfull/screenfull.min.js"></script>
    <link rel="stylesheet" href="lib/red5pro/red5pro-media.css">
    <link rel="stylesheet" href="css/playback.css">
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
            <h1>Live Playback For Any Screen</h1>
            <p class="heading-title">Below you will find the list of current live streams to subscribe to.
          </div>
        </div>
        {{> header }}
        <% if (is_stream_manager) { %>
          <p class="stream-manager-notification">USING STREAM MANAGER</p>
        <% } %>
        <div class="subscribe-section">
          {{> filter-section target='stream-menu-content'}}
          <div class="stream-menu-content">
            <h2 class="red-text">No streams found</h2>
            <hr class="top-padded-rule">
            <p style="margin-top: 20px;">You can begin a Broadcast session by visiting the <a class="broadcast-link card-link card-link_page" href="broadcast.jsp?host=<%= ip %>" target="_blank">Broadcast page</a>.</p>
            <p class="heading-title small-font-size">Once a Broadcast session is started, return to this page to see the stream name listed.</p>
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
      assignIfDefined(<%=audioBandwidth%>, 'r5proAudioBandwidth');
      assignIfDefined(<%=videoBandwidth%>, 'r5proVideoBandwidth');
      assignIfDefined(<%=signalSocketOnly%>, 'r5proSignalSocketOnly');
      assignIfDefined(<%=whipwhep%>, 'r5proWhipWhep');

      window.targetHost = "<%=ip%>";
      window.r5proIce = window.determineIceServers('<%=ice%>');
      window.r5proBuffer = Number("<%=buffer%>");
    </script>
    <script src="lib/red5pro/red5pro-sdk.min.js"></script>
    <script src="script/r5pro-utils.js"></script>
    <script src="script/r5pro-sm-utils.js"></script>
    <script src="script/r5pro-autoplay-utils.js"></script>
    <script src="script/r5pro-filter-input.js"></script>
    <script src="script/r5pro-playback-block.js"></script>
    <script src="script/r5pro-subscriber-failover.js"></script>
    <!-- {{> footer }} -->
  </body>
</html>
