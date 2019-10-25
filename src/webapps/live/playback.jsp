{{> jsp_header }}
<%@ page import="org.springframework.context.ApplicationContext,
          com.red5pro.server.secondscreen.net.NetworkUtil,
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
  String playlistFlag = "0";

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
    <link href="//vjs.zencdn.net/5.19/video-js.min.css" rel="stylesheet">
    <script src="//unpkg.com/video.js/dist/video.js"></script>
    <script src="//unpkg.com/videojs-contrib-hls/dist/videojs-contrib-hls.js"></script>
    <script src="//unpkg.com/videojs-flash/dist/videojs-flash.js"></script>
    <script src="//webrtchacks.github.io/adapter/adapter-latest.js"></script>
    <script src="lib/screenfull/screenfull.min.js"></script>
    <link href="lib/red5pro/red5pro-media.css" rel="stylesheet"></script>
    <link rel="stylesheet" href="css/playback.css">
    <script>
      // Shim so we can style in IE6/7/8
      document.createElement('template');
    </script>
  </head>
  <body>
    <template id="flash-playback">
      <div class="video-container">
            <div class="video-holder">
              <object type="application/x-shockwave-flash" id="red5pro-subscriber" name="red5pro-subscriber" class="red5pro-subscriber" align="middle" data="lib/red5pro/red5pro-subscriber.swf" width="100%" height="100%" class="red5pro-media-background red5pro-media">
                <param name="quality" value="high">
                <param name="wmode" value="opaque">
                <param name="bgcolor" value="#000000">
                <param name="allowscriptaccess" value="always">
                <param name="allowfullscreen" value="true">
                <param name="allownetworking" value="all">
            </object>
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
            <h1 class="red-text">Video on Demand For Any Screen</h1>
            <p class="heading-title">Below you will find the list of recorded streams to playback.
          </div>
          <div id="subcontent-section-image">
            <img class="image-block" width="424" src="images/red5pro_live_streaming.png">
          </div>
        </div>
        <hr class="top-padded-rule">
        <div class="content-section-story">
          <p class="notify-callout">You can record a Broadcast session by visiting the <a class="broadcast-link link" href="broadcast.jsp?host=<%=ip%>" target="_blank">Broadcast page</a> and checking the <span class="bold">Enable Recording button.</span><br/><span class="small-font-size">After the Broadcast is started and stopped, the Video On Demand (VOD) recording will be available. Return to this page to see the stream name listed.</span></p>
          <hr class="top-padded-rule" style="margin-top: 0">
          <div class="stream-menu-content">
            <p class="no-streams-entry">Requesting files...</p>
          </div>
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
    <script src="script/r5pro-playback-block.js"></script>
    <script src="script/r5pro-playback-block-vod.js"></script>
    <script src="script/r5pro-playback-failover.js"></script>
    {{> footer }}
  </body>
</html>
