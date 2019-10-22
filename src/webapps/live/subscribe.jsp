{{> jsp_header }}
<%@ page import="org.springframework.context.ApplicationContext,
          org.springframework.web.context.WebApplicationContext,
          com.infrared5.red5pro.live.LiveStreamListService,
          java.util.List"%>
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
  List<String> names = service.getLiveStreams();

  StringBuffer ret = new StringBuffer();
  String baseUrl = protocol + "://" + ip + ":" + port;
  if(names.size() > 0) {
    ret.append("<ul class=\"stream-menu-listing\">\r\n");
    for(String streamName:names) {
      String rtspLocation = "rtsp://" + ip + ":8554/live/" + streamName;
      String streamLocation =  baseUrl + "/live/" + streamName;
      String hlsLocation =  streamLocation + ".m3u8";
      String pageLocation = baseUrl + "/live/viewer.jsp?host=" + ip + "&stream=" + streamName;
      if (tech != null) {
        pageLocation += "&view=" + tech;
      }
      String listEntry = "<li data-stream=\"" + streamName + "\" class=\"stream-listing\">\r\n" +
        "<div>\r\n" +
          "<h2 class=\"stream-header\">" + streamName + "</h2>\r\n" +
          "<a class=\"medium-font-size subscriber-link link red-text\" style=\"cursor: pointer; text-decoration: underline;\" onclick=\"invokeViewStream('" + streamName + "'); return false;\">View</a>\r\n" +
          "<hr class=\"stream-rule\" />\r\n" +
          "<p>\r\n" +
            "<a class=\"link red-text\" href=\"" + pageLocation + "\" target=\"_blank\">" + streamLocation + "</a></span>\r\n" +
          "</p>\r\n" +
        "</div>\r\n" +
       "</li>\r\n";
      ret.append(listEntry);
    }
    ret.append("</ul>\r\n");
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
    <script src="lib/jquery-1.12.4.min.js"></script>
    <link rel="stylesheet" href="lib/red5pro/red5pro-media.css"></script>
    <style>
      object:focus {
        outline:none;
      }

      .no-streams-entry {
        padding: 20px;
        color: #db1f26;
        font-size: 20px;
        font-weight: 500;
        text-transform: uppercase;
        background-color: #dbdbdb;
      }

      .stream-menu-listing {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .stream-listing {
        border-bottom: 1px solid #e3e3e3;
      }

      .stream-menu-listing li {
        background: #dbdbdb;
        padding: 20px 20px 20px 20px;
      }
      .stream-menu-listing li:nth-child(even) { 
        background: #ebebeb;
      }

      .stream-header {
        margin: 10px 10px 10px 0;
        display: inline-block;
      }

      .stream-rule {
        display: block;
        height: 1px;
        border: 0;
        border-top: 1px solid #999999;
        margin-bottom: 20px;
      }

      .stream-container {
        margin-top: 20px;
        text-align: center;
        background-color: rgb(239, 239, 239);
        border: 1px solid #e3e3e3;
        border-radius: 4px;
      }

      .container-hidden {
        width: 0px;
        height: 0px;
        visibility: hidden;
        margin-top: 0px;
      }

      .container-padding {
        padding: 10px 0 20px 0;
      }

      .download-link {
        padding-top: 20px;
      }

      #video-container, #event-container {
        flex: 1;
      }

      #video-container {
        background-color: #999999;
        height: 100%;
      }

      #event-container {
        margin-left: 10px;
        height: 100%;
        border: #3b3b3b solid 1px;
        background-color: #fff;
      }

      #video-holder {
        line-height: 0px;
      }

      #status-field {
        text-align: center;
        padding: 10px;
        color: #fff;
        background-color: #999;
      }

      #stream-manager-info {
        padding: 10px;
        background-color: #dbdbdb;
      }

      #statistics-field {
        text-align: center;
        padding: 10px;
        background-color: #3b3b3b;
        color: #dbdbdb;
      }

      #video-holder, #red5pro-subscriber {
        width: 100%;
      }

      .red5pro-media-control-bar {
        min-height: 40px;
      }

      #event-log-field {
        padding: 10px;
      }

      .event-header {
        display: flex;
        justify-content: space-between;
      }

      .event-hr {
        display: block;
        height: 1px;
        border: 0;
        border-top: 1px solid #dbdbdb;
      }

      @media (max-width: 767px) {
        #event-container {
          margin-left: 0;
          margin-top: 20px;
        }
      }

      template {
        display: none;
      }
    </style>
    <script>
      // Shim so we can style in IE6/7/8
      document.createElement('template');
    </script>
  </head>
  <body>
    {{> top-bar }}
    {{> navigation }}
    <template id="video-playback">
      <div class="broadcast-section">
        <div id="video-container">
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
            <div class="streaming-menu-content">
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
    <script src="script/r5pro-subscriber-failover.js"></script>
    {{> footer }}
  </body>
</html>
