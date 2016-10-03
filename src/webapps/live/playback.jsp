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

      #flashContent {
        border-radius: 5px;
        background-color: #e3e3e3;
        padding: 10px;
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
        padding-left: 20px;
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

      #red5pro-hls-player {
        width: 100%;
        height: 300px;
      }
    </style>
    <script type="text/javascript" src="swf/swfobject.js"></script>
    <script type="text/javascript">
      // For version detection, set to min. required Flash Player version, or 0 (or 0.0.0), for no version detection.
      var swfVersionStr = "11.1.0";
      // To use express install, set to playerProductInstall.swf, otherwise the empty string.
      var xiSwfUrlStr = "swf/playerProductInstall.swf";
      var flashvars = {
        streamName: "streamName",
        host: "<%= host %>"
      };
      var params = {};
      params.quality = "high";
      params.bgcolor = "#000";
      params.allowscriptaccess = "always";
      params.allowfullscreen = "true";
      var attributes = {};
      attributes.id = "Subscriber";
      attributes.name = "Subscriber";
      attributes.align = "middle";
      if(swfobject.hasFlashPlayerVersion("11.1.0")) {
        swfobject.embedSWF(
            "Subscriber.swf", "flashContent",
            "340", "280",
            swfVersionStr, xiSwfUrlStr,
            flashvars, params, attributes);
        // JavaScript enabled so display the flashContent div in case it is not replaced with a swf object.
        swfobject.createCSS("#flashContent", "display:block; text-align:left; padding-top: 10px;");
      }
      else {
        // nada
      }
  </script>
  <link href="videojs/video-js.min.css" rel="stylesheet">
  </head>
  <body>
    <template id="video-player">
      <div id="hls-video-container">
        <video id="red5pro-hls-player" height="300" class="video-js vjs-default-skin" controls autoplay data-setup="{}"></video>
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
            <p>If a stream is available to playback, you can select to view over <span class="red-text">RTSP</span>, within a <span class="red-text">Flash Player</span> or in an <span class="red-text">HLS Player</span> (where supported) on this page.</p>
            <div id="available-streams-listing" class="menu-content streaming-menu-content">
              <h3 class="no-streams-entry">Requesting files...</h3>
            </div>
            <p>You can begin a Broadcast session to Record by visiting the <a class="broadcast-link link" href="recorder.jsp?host=<%=ip%>" target="_blank">Recorder page</a>.</p>
            <p><em>Once a Broadcast session is started and stopped, the Video On Demand</em> (VOD) <em>Recording will be available. Return to this page to see the stream name listed.</em></p>
          </div>
          <div id="swf-stream-container" class="stream-container container-hidden">
                <h2 id="viewing-header" class="stream-header red-text">Viewing</h2>
                <!-- SWFObject's dynamic embed method replaces this alternative HTML content with Flash content when enough
                     JavaScript and Flash plug-in support is available. The div is initially hidden so that it doesn't show
                     when JavaScript is disabled.
                -->
                <div id="flashContent">
                    <hr>
                    <p>
                        To view this page ensure that Adobe Flash Player version 11.1.0 or greater is installed.
                    </p>
                    <script type="text/javascript">
                        var pageHost = ((document.location.protocol == "https:") ? "https://" : "http://");
                        document.write("<a href='http://www.adobe.com/go/getflashplayer'><img src='"
                                        + pageHost + "www.adobe.com/images/shared/download_buttons/get_flash_player.gif' alt='Get Adobe Flash player' /></a>" );
                    </script>
                </div>
                <noscript>
                    <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%" id="Subscriber">
                        <param name="movie" value="Subscriber.swf" />
                        <param name="quality" value="high" />
                        <param name="bgcolor" value="#000000" />
                        <param name="allowScriptAccess" value="always" />
                        <param name="allowFullScreen" value="true" />
                        <!--[if !IE]>-->
                        <object type="application/x-shockwave-flash" data="Subscriber.swf" width="100%" height="100%">
                            <param name="quality" value="high" />
                            <param name="bgcolor" value="#000000" />
                            <param name="allowScriptAccess" value="always" />
                            <param name="allowFullScreen" value="true" />
                        <!--<![endif]-->
                        <!--[if gte IE 6]>-->
                            <p>
                                Either scripts and active content are not permitted to run or Adobe Flash Player version
                                11.1.0 or greater is not installed.
                            </p>
                        <!--<![endif]-->
                            <a href="http://www.adobe.com/go/getflashplayer">
                                <img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash Player" />
                            </a>
                        <!--[if !IE]>-->
                        </object>
                        <!--<![endif]-->
                    </object>
                </noscript>
            <p class="medium-font-size download-link"><a class="red-text link" href="https://github.com/red5pro/red5pro-server-examples/releases/download/0.1.2/Red5Pro-Subscriber-Client.zip">Download</a> the source for this example.</p>
          </div>
          <div id="hls-stream-container" class="stream-container container-hidden">
            <h2 id="hls-viewing-header" class="stream-header red-text">Viewing</h2>
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
    <script src="http://webrtc.github.io/adapter/adapter-latest.js"></script>
    <script src="videojs/video.min.js"></script>
    <script src="videojs/videojs-media-sources.min.js"></script>
    <script src="videojs/videojs.hls.min.js"></script>
    <script src="script/hls-metadata.js"></script>
    <script>
      (function(window, document) {

        var viewHandler;
        function accessSWF() {
          return document.getElementById("Subscriber");
        }

        viewHandler = function viewStream(value) {
          var swf = accessSWF();
          var container = document.getElementById("swf-stream-container");
          var header = document.getElementById("viewing-header");
          header.innerText = 'Viewing ' + value + '\'s stream.';
          container.classList.remove('container-hidden');
          container.classList.add('container-padding');
          swf.viewStream(value);
          container.scrollIntoView({block: 'start', behavior: 'smooth'});
        };

        function handleHostIpChange(value) {
          var className = 'broadcast-link';
          var elements = document.getElementsByClassName(className);
          var length = elements ? elements.length : 0;
          var index = 0;
          for(index = 0; index < length; index++) {
            elements[index].href = ['broadcast.jsp?host', value].join('=');
          }
          accessSWF().resetHost(value);
        }
        window.r5pro_registerIpChangeListener(handleHostIpChange);
        window.invokeViewStream = viewHandler;

       }(this, document));
    </script>
    <script>
      (function () {

        var $videoTemplate = document.getElementById('video-player');
        var currentRotation = 0;
        var origin = [
          'webkitTransformOrigin',
          'mozTransformOrigin',
          'msTransformOrigin',
          'oTransformOrigin',
          'transformOrigin'
        ];
        var styles = [
          'webkitTransform',
          'mozTransform',
          'msTransform',
          'oTransform',
          'transform'
        ];

        function applyOrientation (value) {
          if (currentRotation === value) {
            return;
          }
          var vid = document.getElementById('red5pro-hls-player');
          var container = document.getElementById('hls-video-container');
          if (vid) {
            var i, length = styles.length;
            for(i = 0; i < length; i++) {
              vid.style[origin[i]] = value < 0 ? 'right top' : 'left bottom';
              vid.style[styles[i]] = 'translateY(-100%) rotate(' + value + 'deg)';
            }
            if (container) {
              container.style.height = value % 90 == 0 ? '540px' : '300px';
            }
          }
        }

        function addPlayer(tmpl, container) {
          var $el = document.importNode(tmpl.content, true);
          container.appendChild($el);
          return $el;
        }

        function createSource (src, type) {
          let sourceEl = document.createElement('source');
          sourceEl.src = src;
          sourceEl.type = type;
          return sourceEl;
        }

        function insertSourceInto (src, type, $parent) {
          var sourceEl = createSource(src, type);
          if ($parent.firstChild) {
            $parent.insertBefore(sourceEl, $parent.firstChild);
          }
          else {
            $parent.appendChild(sourceEl);
          }
          return sourceEl;
        }

        function viewHLS (src) {
          var player;
          if (window.hlsplayer) {
            window.hlsplayer.dispose();
            window.hlsplayer = undefined;
          }
          var parentContainer = document.getElementById('hls-stream-container');
          if (parentContainer.childNodes.length > 1) {
            parentContainer.removeChild(parentContainer.lastChild);
          }
          addPlayer($videoTemplate, parentContainer);
          insertSourceInto(src, 'application/x-mpegURL', document.getElementById('red5pro-hls-player'));
          parentContainer.classList.remove('container-hidden');
          parentContainer.classList.add('container-padding');
          parentContainer.scrollIntoView({block: 'start', behavior: 'smooth'});

          var header = document.getElementById("hls-viewing-header");
          header.innerText = 'Viewing ' + src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('.')) + '\'s stream.';

          player = videojs('red5pro-hls-player');
          player.play();
          window.onOrientation(player, applyOrientation);
          window.hlsplayer = player;
        }

        window.invokeHLSStream = viewHLS;

       })();
    </script>
    <script>
      // Filtering HLS playback using servlet.
      /*
                  listing = $('li[data-stream=' + itemName + ']');
                  if (listing && listing.length > 0) {
                    internalPlayers = $('p.internal-players', listing);
                    externalPlayers = $('div.external-players', listing);
                    if (internalPlayers && internalPlayers.length > 0) {
                      internalPlayers.append("<span class=\"black-text\">&nbsp;&nbsp;or&nbsp;&nbsp;" +
                                      "<a class=\"medium-font-size link red-text\" href=\"#\" onclick=\"invokeHLSStream('" + itemUrl + "'); return false;\">HLS</a>" +
                                      "</span>");
                    }
                    if (externalPlayers && externalPlayers.length > 0) {
                      externalPlayers.append("<p>" +
                                      "<span class=\"black-text\">Open HLS in another window:&nbsp;" +
                                      "<a class=\"subscriber-link link red-text\" href=\"<%=baseUrl%>/live/hls-vod.jsp?url=" + encodeURIComponent(itemUrl) + "&streamName=" + itemName + "\">" + itemUrl + "</a>" +
                                      "</span>" +
                      "</p>");
                    }
                  }
      */
      (function () {

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
            else if (this.status === 0) {
              cb(data);
            }
          }
        }
        req.onerror = function () {
          cb(data);
        }
        req.timeout = 15000;
        req.open('GET', url, true);
        req.send();
      };

      var getMediafiles = function (data, cb) {
        getItemList(data, mediafilesServletURL, 'mediafiles', 'flv', cb);
      }

      var getPlaylists = function (data, cb) {
        getItemList(data, playlistServletURL, 'playlists', 'hls', cb);
      };

      var populateListing = function (data) {
        console.log("Store:\r\n" + JSON.stringify(data, null, 2));

        var $container = $('#available-streams-listing');
        var innerContent = '';
        var getStreamListItem = function (item) {
          var streamName = item.name;
          var urls = item.urls;
          var html = "<li data-stream=\"" + streamName.substring(0, streamName.lastIndexOf('.')) + "\" class=\"stream-listing\">\r\n" +
                  "<h2 class=\"red-text stream-header\">" + streamName + "</h2>\r\n" +
                  "<p class=\"internal-players\" class=\"medium-font-size\">\r\n" +
                    "<span class=\"black-text\">View <strong>" + streamName + "</strong>'s stream in:</span>&nbsp;&nbsp;" +
                    (urls.hasOwnProperty('flv')
                     ? "<a class=\"medium-font-size link red-text\" href=\"rtsp://<%=ip%>:8554/live/" + streamName + "\">RTSP</a>" +
                       "&nbsp;&nbsp;<span class=\"black-text\">or</span>&nbsp;&nbsp;" +
                       "<a class=\"medium-font-size link red-text\" href=\"#\" onclick=\"invokeViewStream('" + streamName + "'); return false;\">Flash</a>\r\n"
                     : "");
          html += (urls.hasOwnProperty('hls')
                     ? (urls.hasOwnProperty('flv') ? "<span class=\"black-text\">&nbsp;&nbsp;or&nbsp;&nbsp;" : "") +
                       "<a class=\"medium-font-size link red-text\" href=\"#\" onclick=\"invokeHLSStream('" + item.urls['hls'] + "'); return false;\">HLS</a>" +
                       "</span>"
                     : "");
          html += "</p>\r\n" + "<hr>\r\n" +
                  "<div class=\"external-players\">\r\n" +
                    "<p>\r\n" +
                    (urls.hasOwnProperty('flv')
                      ? "<p><span class=\"black-text\">Open Flash in another window: <a class=\"subscriber-link link red-text\" href=\"" + baseUrl + "/flash.jsp?host=<%=ip%>&stream=" + streamName + "\">" + baseUrl + "/flash.jsp?host=<%=ip%>&stream=" + streamName + "</a></span></p>\r\n"
                      : "") +
                    (urls.hasOwnProperty('hls')
                      ? "<p><span class=\"black-text\">Open HLS in another window:&nbsp;<a class=\"subscriber-link link red-text\" href=\"" + baseUrl + "/hls-vod.jsp?url=" + encodeURIComponent(item.urls['hls']) + "&streamName=" + streamName + "\">" + item.urls['hls'] + "</a></span></p>\r\n"
                      : "") +
                    "</p>\r\n" +
                  "</div>\r\n" +
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

      })();
    </script>
  </body>
</html>

