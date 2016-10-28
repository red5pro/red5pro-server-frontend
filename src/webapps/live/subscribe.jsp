{{> jsp_header }}
<%@ page import="org.springframework.context.ApplicationContext,
          org.springframework.web.context.WebApplicationContext,
          com.infrared5.red5pro.examples.service.LiveStreamListService,
          java.util.List"%>
<%
  //LIVE streams page.
  String host = ip;
  String protocol = request.getScheme();

  String tech=null;
  String buffer = "2";

  if (request.getParameter("buffer") != null) {
    buffer = request.getParameter("buffer");
  }

  if (request.getParameter("view") != null) {
    tech = request.getParameter("view");
  }

  ApplicationContext appCtx = (ApplicationContext) application.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
  LiveStreamListService service = (LiveStreamListService)appCtx.getBean("streams");
  List<String> names = service.getLiveStreams();

  StringBuffer ret = new StringBuffer();
  String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
  if(names.size() == 0) {
    ret.append("<div class=\"menu-content streaming-menu-content\">\r\n");
    ret.append("<h3 class=\"no-streams-entry\">No streams found</h3>\r\n");
    ret.append("</div>\r\n");
    ret.append("<p>You can begin a Broadcast session by visiting the <a class=\"broadcast-link link\" href=\"broadcast.jsp?host=" + ip + "\" target=\"_blank\">Broadcast page</a>.</p>\r\n");
    ret.append("<p><em>Once a Broadcast session is started, return to this page to see the stream name listed.</em></p>");
  }
  else {
    ret.append("<div class=\"menu-content streaming-menu-content\">\r\n");
    ret.append("<ul class=\"stream-menu-listing\">\r\n");
    for(String streamName:names) {
      String rtspLocation = "rtsp://" + ip + ":8554/live/" + streamName;
      String hlsLocation = protocol + "://" + ip + ":5080" + "/live/" + streamName + ".m3u8";
      String pageLocation = protocol + "://" + ip + ":5080" + "/live/viewer.jsp?host=" + ip + "&stream=" + streamName;
      if (tech != null) {
        pageLocation += "&view=" + tech;
      }
      String listEntry = "<li data-stream=\"" + streamName + "\" class=\"stream-listing\">\r\n" +
        "<h2 class=\"stream-header\">" + streamName + "</h2>\r\n" +
          "<p>\r\n" +
            "<a class=\"medium-font-size subscriber-link link red-text\" style=\"cursor: pointer;\" onclick=\"invokeViewStream('" + streamName + "'); return false;\">\r\n" +
              "View <strong>" + streamName + "</strong>'s stream on this page." +
            "</a>\r\n" +
          "</p>\r\n" +
          "<hr>\r\n" +
          "<p>\r\n" +
            "<span class=\"black-text\">Open in another window: <a class=\"subscriber-link link red-text\" href=\"" + pageLocation + "\" target=\"_blank\">" + pageLocation + "</a></span>\r\n" +
          "</p>\r\n" +
          "<p>\r\n" +
            "<span class=\"black-text\">Open RTSP link (<em>or right-click and Copy Address</em>): <a class=\"subscriber-link link red-text\" href=\"" + rtspLocation + "\">" + rtspLocation + "</a></span>\r\n" +
          "</p>\r\n" +
       "</li>\r\n";
      ret.append(listEntry);
    }
    ret.append("</ul>\r\n");
    ret.append("</div>\r\n");
    ret.append("<p>To begin your own Broadcast session, visit the <a class=\"broadcast-link link\" href=\"broadcast.jsp?host=" + ip + "\">Broadcast page</a>!</p>\r\n");
  }
%>
<!doctype html>
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Stream Subscription with the Red5 Pro Server!</title>
    <style>
      object:focus {
        outline:none;
      }

      #live-page-subcontent {
        text-align: center;
        position: relative;
        width: 100%;
        height: 230px;
        overflow: hidden;
      }

      #live-container {
        position: absolute;
      }

      #live-image-container {
        width: 540px;
      }

      #live-page-img {
        width: 100%;
      }

      .stream-menu-listing {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .no-streams-entry {
        padding-left: 20px;
      }

      .streaming-menu-content {
        margin-top: 30px;
        margin-bottom: 30px;
      }

      .stream-listing {
        padding: 0 20px 20px 20px;
        border-bottom: 1px solid #e3e3e3;
      }

      .stream-header {
        margin: 10px 0;
      }

      .stream-container {
        margin-top: 20px;
        text-align: center;
        background-color: rgb(239, 239, 239);
        border: 1px solid #e3e3e3;
        border-radius: 4px;
      }

      .stream-header {
        margin-top: 8px;
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

      #video-holder, #red5pro-subscriber-video {
        width: 100%;
      }
    </style>
    <link href="lib/videojs/video-js.min.css" rel="stylesheet">
    <script src="lib/webrtc/adapter.js"></script>
    <script src="lib/videojs/video.min.js"></script>
    <script src="lib/videojs/videojs-media-sources.min.js"></script>
    <script src="lib/videojs/videojs.hls.min.js"></script>
  </head>
  <body>
    <template id="video-playback">
      <div id="video-container">
            <div id="video-holder">
              <video id="red5pro-subscriber-video" controls autoplay class="video-element"></video>
            </div>
            <div id="status-field" class="status-message"></div>
            <div id="event-log-field" class="event-log-field">
              <div style="padding: 10px 0">
                <p><span style="float: left;">Event Log:</span><button id="clear-log-button" style="float: right;">clear</button></p>
                <div style="clear: both;"></div>
              </div>
            </div>
      </div>
    </template>
    {{> header }}
    <div class="container main-container clear-fix">
      <div id="menu-section">
        {{> menu }}
      </div>
      <div id="content-section">
        <div>
          <div class="clear-fix">
            <p class="left">
                <a class="red5pro-header-link" href="/">
                  <img class="red5pro-logo-page" src="images/red5pro_logo.svg">
               </a>
            </p>
          </div>
          <h2 class="tag-line">LIVE SUBSCRIBING FOR ANY SCREEN</h2>
        </div>
        <div id="live-page-subcontent" class="clear-fix">
          <div id="live-image-container">
            <img id="live-page-img" src="images/red5pro_live_streaming.png">
          </div>
        </div>
        <div class="content-section-story">
          <div>
            <p>Below you will find the list of current live streams to subscribe to.</p>
            <p>If a stream is available to subscribe to, you can select to view in browser on this page or a seperate window using the <strong>Red5 Pro HTML SDK</strong> or you can view by opening the <strong>RTSP</strong> link.</p>
            <%=ret.toString()%>
          </div>
          <hr class="top-padded-rule" />
          <h3><a class="link" href="http://red5pro.com/docs/streaming/overview/" target="_blank">Streaming SDKs</a></h3>
          <p>You can download the Streaming SDKs from your <a class="link" href="http://account.red5pro.com/download" target="_blank">Red5 Pro Accounts</a> page.</p>
          <p>Please visit the online <a class="link" href="http://red5pro.com/docs/streaming/overview/" target="_blank">Red5 Pro Documentation</a> for further information about integrating the streaming SDKs into your own native application!</p>
          <hr class="top-padded-rule" />
          {{> applications }}
          <hr class="top-padded-rule" />
          {{> additional_info }}
        </div>
      </div>
    </div>
    {{> footer }}
    {{> es6-script-includes }}
    <script src="lib/jquery-1.12.4.min.js"></script>
    <script src="lib/red5pro/red5pro-sdk.js"></script>
    <script src="script/hls-metadata.js"></script>
    <script>
      // Put server vars globally.
      var viewTech = "<%=tech%>";
      if (viewTech && viewTech !== 'null') {
        window.r5proViewTech = viewTech;
      }
      window.targetHost = "<%=ip%>";
      window.r5proBuffer = Number("<%=buffer%>");
    </script>
    <script src="script/r5pro-subscriber-failover.js"></script>
  </body>
</html>