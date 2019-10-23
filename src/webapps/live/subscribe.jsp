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
  port = port == -1 ? (protocol == "https" ? 443 : 80) : port;

  String tech=null;
  String ice=null;
  String buffer = "0.5";
  Integer audioBandwidth = -1;
  Integer videoBandwidth = -1;

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

  ApplicationContext appCtx = (ApplicationContext) application.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
  LiveStreamListService service = (LiveStreamListService)appCtx.getBean("streams");
  List<String> names = new ArrayList<String>();
  names.add("one");
  names.add("two");
  names.add("three");// service.getLiveStreams();

  StringBuffer ret = new StringBuffer();
  String baseUrl = protocol + "://" + ip + ":" + port;
  if(names.size() > 0) {
    for(String streamName:names) {
      String streamLocation =  baseUrl + "/live/" + streamName;
      String pageLocation = baseUrl + "/live/viewer.jsp?host=" + ip + "&stream=" + streamName;
      if (tech != null) {
        pageLocation += "&view=" + tech;
      }
      ret.append("<div class=\"stream-menu-listing\" data-streamName=\"" + streamName + "\" data-streamLocation=\"" + streamLocation + "\" data-pageLocation=\"" + pageLocation + "\"></div>\r\n");
    }
  }
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
    <script>
      // Shim so we can style in IE6/7/8
      document.createElement('template');
    </script>
  </head>
  <body>
    <template id="video-playback">
      <div class="broadcast-section">
        <div id="video-container">
          <div id="statistics-field" class="statistics-field hidden"></div>
          <div id="video-holder">
            <video id="red5pro-subscriber"
                    controls autoplay playsinline
                    class="red5pro-media red5pro-media-background">
            </video>
          </div>
        </div>
        <div id="event-container">
          <div id="status-field" class="status-message"></div>
          <div id="stream-manager-info" class="status-message hidden">Using Stream Manager Proxy.</div>
          <div id="event-log-field" class="event-log-field">
            <div>
              <div class="event-header">
                <span>Event Log:</span>
                <button id="clear-log-button">clear</button>
              </div>
              <hr class="event-hr">
            </div>
          </div>
        </div>
      </div>
    </template>
    {{> top-bar }}
    {{> navigation }}
    {{> header }}
    <div class="main-container">
      <div id="menu-section">
        {{> menu }}
      </div>
      <div id="content-section">
        <div id="subcontent-section">
          <div id="subcontent-section-text">
            <h1 class="red-text">Live Subscribing For Any Screen</h1>
            <p class="heading-title">Below you will find the list of current live streams to subscribe to.
          </div>
          <div id="subcontent-section-image">
            <img class="image-block" width="424" src="images/red5pro_live_streaming.png">
          </div>
        </div>
        <hr class="top-padded-rule">
        <div class="content-section-story">
          <% if (names.size() <= 0) { %>
            <p class="no-streams-entry">No streams found</p>
            <p style="margin-top: 20px;">You can begin a Broadcast session by visiting the <a class="broadcast-link link" href="broadcast.jsp?host=<%= ip %>" target="_blank">Broadcast page</a>.</p>
            <p class="small-font-size">Once a Broadcast session is started, return to this page to see the stream name listed.</p>
          <% } else { %>
            <div class="stream-menu-content">
              <%=ret.toString()%>
            </div>
          <% } %>
        </div>
        <hr class="top-padded-rule" />
        {{> web-applications }}
        <hr class="top-padded-rule">
        {{> mobile-applications }}
        <hr class="top-padded-rule" />
        {{> additional_info }}
      </div>
    </div>
    {{> es6-script-includes }}
    <script src="script/r5pro-ice-utils.js"></script>
    <script>
      function assignIfDefined (value, prop) {
        if (value && value !== 'null') {
          window[prop] = value;
        }
      }
      assignIfDefined("<%=tech%>", 'r5proViewTech');
      assignIfDefined(<%=audioBandwidth%>, 'r5proAudioBandwidth');
      assignIfDefined(<%=videoBandwidth%>, 'r5proVideoBandwidth');

      window.targetHost = "<%=ip%>";
      window.r5proIce = window.determineIceServers('<%=ice%>');
      window.r5proBuffer = Number("<%=buffer%>");
    </script>
    <script src="lib/red5pro/red5pro-sdk.min.js"></script>
    <script src="script/r5pro-utils.js"></script>
    <script src="script/r5pro-sm-utils.js"></script>
    <script src="script/r5pro-autoplay-utils.js"></script>
    <script src="script/r5pro-playback-block.js"></script>
    <script src="script/r5pro-subscriber-failover.js"></script>
    {{> footer }}
  </body>
</html>
