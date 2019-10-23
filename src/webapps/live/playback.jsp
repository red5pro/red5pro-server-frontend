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

      .notify-callout {
        margin: 0px;
        padding: 26px 26px;
        background-color: #dbdbdb
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
                <span style="float: left;">Event Log:</span>
                <button id="clear-log-button" style="float: right;">clear</button>
              </div>
              <hr class="event-hr">
            </div>
          </div>
        </div>
      </div>
    </template>
    <template id="flash-playback">
      <div id="video-container">
            <div id="video-holder" style="height:405px;">
              <object type="application/x-shockwave-flash" id="red5pro-subscriber" name="red5pro-subscriber" align="middle" data="lib/red5pro/red5pro-subscriber.swf" width="100%" height="100%" class="red5pro-media-background red5pro-media">
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
          <div id="available-streams-listing" class="menu-content streaming-menu-content">
            <h3 class="no-streams-entry">Requesting files...</h3>
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
      window.targetHost = "<%=ip%>";
      window.r5proIce = window.determineIceServers('<%=ice%>');
    </script>
    <script src="lib/red5pro/red5pro-sdk.min.js"></script>
    <script src="script/r5pro-utils.js"></script>
    <script src="script/r5pro-sm-utils.js"></script>
    <script src="script/r5pro-autoplay-utils.js"></script>
    <script src="script/r5pro-playback-failover.js"></script>
    <script>
      // Filtering HLS playback using servlet.
      (function (window, document, $) {
       'use strict';

       var protocol = "<%=protocol%>";
       var ip = "<%=ip%>";
       var port = window.location.port ? window.location.port : (protocol === 'https' ? 443 : 80);

       var httpRegex = /^http/i;
       var baseUrl = protocol + '://' + ip + ':' + port + '/live';
       var mediafilesServletURL = [baseUrl, 'mediafiles'].join('/');
       var playlistServletURL = [baseUrl, 'playlists'].join('/');
       var store = {}; // name: {name:string, url:string, formats:[hls|flv]}

       var parseItem = function (item) {
          var itemName = item.name; // item.name.substring(0, item.name.lastIndexOf('.'));
          var itemUrl = httpRegex.test(item.url) ? item.url : [baseUrl, item.url].join('/');
          return {
            name: itemName,
            url: itemUrl
          };
       }

       var getItemList = function (data, url, listProperty, formatType, cb) {
       var req = new XMLHttpRequest();
       req.onreadystatechange = function () {
           if (this.readyState === 4) {
             if (this.status >= 200 && this.status < 400) {
                var response = JSON.parse(this.response);
                console.log("Response: " + JSON.stringify(response, null, 2));
                var list = response.hasOwnProperty(listProperty) ? response[listProperty] : [];
                var items = [];
                var i, item, length = list.length;
                for (i = 0; i < length; i++) {
                  item = parseItem(list[i]);
                  if (!data.hasOwnProperty(item.name)) {
                    data[item.name] = {
                      name: item.name,
                      urls: {}
                    };
                  }
                  data[item.name].urls[formatType] = item.url;
                }
                cb(data);
            }
            else if (this.status === 0 || this.status > 400) {
              cb(data);
            }
          }
        }
        req.onerror = function () {
          cb(data);
        }
        req.timeout = 60000 * 5; // 5 minutes
        req.open('GET', url, true);
        req.send();
      };

      var getMediafiles = function (data, cb) {
        getItemList(data, mediafilesServletURL, 'mediafiles', 'rtmp', cb);
      }

      var getPlaylists = function (data, cb) {
        var doInclude = "<%=playlistFlag%>" == "1";
        if (doInclude) {
          getItemList(data, playlistServletURL, 'playlists', 'hls', cb);
        }
        else {
          cb(data);
        }
      };

      var populateListing = function (data) {
        console.log("Store:\r\n" + JSON.stringify(data, null, 2));
        var $container = $('#available-streams-listing');
        var innerContent = '';
        var getStreamListItem = function (item) {
          var json = encodeURIComponent(JSON.stringify(item));
          var streamName = item.name;
          var urls = item.urls;
          var type = item.name.split('.')[1] === 'm3u8' ? 'hls' : 'rtmp';
          var html = "<li data-stream=\"" + streamName + "\" data-streamitem=\"" + json + "\" class=\"stream-listing\">\r\n" +
                  "<h2 class=\"stream-header\">" + streamName + "</h2>\r\n" +
                  "<a class=\"medium-font-size subscriber-link link red-text\" style=\"cursor: pointer;\" onclick=\"invokeViewStream('" + streamName + "'); return false;\">View</a>" +
                  "<hr class=\"stream-rule\">\r\n" +
                  "<p>\r\n" +
                    "<a class=\"link red-text\" style=\"cursor: pointer;\" onclick=\"invokeViewPageStream('" + streamName + "'); return false;\">" + urls[type] + "</a></span>\r\n" +
                  "</p>\r\n" +
                "</li>";
          return html;
        };

        for (var key in data) {
          innerContent += getStreamListItem(data[key]);
        }

        if (innerContent.length > 0) {
          innerContent = '<ul class="stream-menu-listing">' + innerContent + '</ul>';
          $container.html(innerContent);
        }
        else {
          $container.html('<h3 class="no-streams-entry">No recordings found</h3>');
        }
      };

      getMediafiles(store, function(data) {
        getPlaylists(data, function(data) {
          populateListing(data);
        });
       });
      })(this, document, jQuery.noConflict());
    </script>
    {{> footer }}
  </body>
</html>
