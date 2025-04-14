{{> jsp_header }}
<%@ page import="org.springframework.context.ApplicationContext,
          org.springframework.web.context.WebApplicationContext,
          com.infrared5.red5pro.live.LiveStreamListService,
          java.util.Map.Entry,
          java.util.Map,
          java.util.Iterator"%>
<%
  //VOD streams list
  String host = ip;
  String protocol = request.getScheme();
  String ice = null;
  String tech = null;
  String playlistFlag = "1";

  if (request.getParameter("view") != null) {
    tech = request.getParameter("view");
  }
  if (request.getParameter("ice") != null) {
    ice = request.getParameter("ice");
  }
  if (request.getParameter("playlists") != null) {
    playlistFlag = request.getParameter("playlists");
  }

  ApplicationContext appCtx = (ApplicationContext) application.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
  String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
%>
<!doctype html>
{{> license}}
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Video On Demand Playback with the Red5 Pro Server</title>
    <script src="//cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <script src="//webrtchacks.github.io/adapter/adapter-latest.js"></script>
    <script src="lib/screenfull/screenfull.min.js"></script>
    <link href="lib/red5pro/red5pro-media.css" rel="stylesheet"></script>
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
            <h1>Video on Demand For Any Screen</h1>
            {{> header }}
            <hr class="top-padded-rule">
            <p class="heading-title">Below you will find the list of recorded streams to playback.</p>
            <p class="notify-callout">You can record a Broadcast session by visiting the <a class="card-link card-link_page" href="broadcast.jsp?host=<%=ip%>" target="_blank">Broadcast page</a> and checking the <span class="bold">Enable Recording</span> button.<br/><span class="small-font-size">After the Broadcast is started and stopped, the Video On Demand (VOD) recording will be available. Return to this page to see the stream name listed.</span></p>
            <p class="small-font-size"><strong>Note:</strong> Due to the sunsetting of Flash Player in browsers, playback of FLV files is now limited to copying links for the Flash-based files in order to playback videos in your preferred supported software (e.g., <span><a href="https://www.videolan.org/vlc/" target="_blank" class="link">VLC</a></span>). Note that the "Copy to Clipboard" function below requires a secure page.</p>
          </div>
        </div>
        <% if (is_stream_manager) { %>
          <p class="stream-manager-notification">USIN STREAM MANAGER</p>
        <% } %>
        <div class="subscribe-section">
          {{> filter-section target='stream-menu-content'}}
          <div class="stream-menu-content">
            <p class="no-streams-entry">Requesting files...</p>
          </div>
        </div>
        <div class="content-section-story">
          {{> web-applications }}
          {{> mobile-applications }}
        </div>
        <hr class="top-padded-rule" />
        {{> additional_info }}
      </div>
    </div>
    {{> es6-script-includes }}
    {{> stream_manager_script }}
    <script src="script/r5pro-ice-utils.js"></script>
    <script>
      // Put server vars globally.
      var viewTech = "<%=tech%>";
      if (viewTech && viewTech !== 'null') {
        window.r5proViewTech = viewTech;
      }
      window.targetProtocol = "<%=protocol%>";
      window.targetHost = "<%=ip%>";
      window.requestPlaylists = (parseInt("<%=playlistFlag%>") === 1);
    </script>
    <script src="lib/red5pro/red5pro-sdk.min.js"></script>
    <script src="script/r5pro-utils.js"></script>
    <script src="script/r5pro-sm-utils.js"></script>
    <script src="script/r5pro-autoplay-utils.js"></script>
    <script src="script/r5pro-filter-input.js"></script>
    <script src="script/r5pro-playback-block.js"></script>
    <script src="script/r5pro-playback-block-vod.js"></script>
    <script src="script/r5pro-playback-failover.js"></script>
    {{> footer }}
  </body>
</html>
