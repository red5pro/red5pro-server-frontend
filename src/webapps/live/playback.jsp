{{> jsp_header }}
<%@ page import="org.springframework.context.ApplicationContext,
          com.red5pro.server.secondscreen.net.NetworkUtil,
          org.springframework.web.context.WebApplicationContext,
          com.infrared5.red5pro.examples.service.LiveStreamListService,
          java.util.Map.Entry,
          java.util.Map,
          java.util.Iterator"%>
<%
  //VOD streams list
  String host = ip;
  String protocol = request.getScheme();
  String ice=null;
  String tech=null;

  if (request.getParameter("view") != null) {
    tech = request.getParameter("view");
  }
  if (request.getParameter("ice") != null) {
    ice = request.getParameter("ice");
  }

  ApplicationContext appCtx = (ApplicationContext) application.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
  String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
%>
<!doctype html>
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Video On Demand Playback with the Red5 Pro Server!</title>
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
    <script type="text/javascript" src="lib/swfobject/swfobject.js"></script>
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
          <h2 class="tag-line">VIDEO ON DEMAND PLAYBACK FOR ANY SCREEN</h2>
        </div>
        <div id="live-page-subcontent" class="clear-fix">
          <div id="live-image-container">
            <img id="live-page-img" src="images/red5pro_live_streaming.png">
          </div>
        </div>
        <div class="content-section-story">
          <div>
            <p>Below you will find the list of recorded video to stream.</p>
            <p>If a stream is available to playback, you can select to view in browser on this page or a seperate window using the <strong>Red5 Pro HTML SDK</strong> or you can view by opening the <strong>RTSP</strong> link.</p>
            <div id="available-streams-listing" class="menu-content streaming-menu-content">
              <h3 class="no-streams-entry">Requesting files...</h3>
            </div>
            <p>You can begin a Broadcast session to Record by visiting the <a class="broadcast-link link" href="recorder.jsp?host=<%=ip%>" target="_blank">Recorder page</a>.</p>
            <p><em>Once a Broadcast session is started and stopped, the Video On Demand</em> (VOD) <em>Recording will be available. Return to this page to see the stream name listed.</em></p>
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
    <script src="lib/jquery-1.12.4.min.js"></script>
    <script src="lib/red5pro/red5pro-sdk.min.js"></script>
    <script src="script/hls-metadata.js"></script>
    <script>
      // Put server vars globally.
      var viewTech = "<%=tech%>";
      if (viewTech && viewTech !== 'null') {
        window.r5proViewTech = viewTech;
      }
      window.targetHost = "<%=ip%>";
      window.r5proIce = '<%=ice%>';
   </script>
    <script src="script/r5pro-playback-failover.js"></script>
    <script>
      // Filtering HLS playback using servlet.
      (function (window, document, $) {
       'use strict';

       var protocol = "<%=protocol%>";
       var ip = "<%=ip%>";

       var httpRegex = /^http/i;
       var baseUrl = '<%=protocol%>://<%=ip%>:5080/live';
       var mediafilesServletURL = [baseUrl, 'mediafiles'].join('/');
       var playlistServletURL = [baseUrl, 'playlists'].join('/');
       var store = {}; // name: {name:string, url:string, formats:[hls|flv]}

       var parseItem = function (item) {
          var itemName = item.name.substring(0, item.name.lastIndexOf('.'));
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
        req.timeout = 60000;
        req.open('GET', url, true);
        req.send();
      };

      var getMediafiles = function (data, cb) {
        getItemList(data, mediafilesServletURL, 'mediafiles', 'rtmp', cb);
      }

      var getPlaylists = function (data, cb) {
        // Note: Just return without playlist request.
        // :: Will need to update with HLS playback feature in future.
        cb(data)
//        getItemList(data, playlistServletURL, 'playlists', 'hls', cb);
      };

      var populateListing = function (data) {
        console.log("Store:\r\n" + JSON.stringify(data, null, 2));

        var $container = $('#available-streams-listing');
        var innerContent = '';
        var getStreamListItem = function (item) {
          var json = encodeURIComponent(JSON.stringify(item));
          var streamName = item.name;
          var urls = item.urls;
          var html = "<li data-stream=\"" + streamName + "\" data-streamitem=\"" + json + "\" class=\"stream-listing\">\r\n" +
                  "<h2 class=\"stream-header\">" + streamName + "</h2>\r\n" +
                  "<p>\r\n" +
                    "<a class=\"medium-font-size subscriber-link link red-text\" style=\"cursor: pointer;\" onclick=\"invokeViewStream('" + streamName + "'); return false;\">\r\n" +
                      "View <strong>" + streamName + "</strong>'s stream on this page." +
                    "</a>\r\n" +
                  "</p>\r\n" +
                  "<hr>\r\n" +
                  "<p>\r\n" +
                    "<span class=\"black-text\">or,&nbsp;&nbsp;<a class=\"subscriber-link link red-text\" style=\"cursor: pointer;\" onclick=\"invokeViewPageStream('" + streamName + "'); return false;\">Open in another window</a></span>\r\n" +
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
  </body>
</html>

