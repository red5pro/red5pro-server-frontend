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
  ApplicationContext appCtx = (ApplicationContext) application.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
  LiveStreamListService service = (LiveStreamListService)appCtx.getBean("streams");
  Map<String, Map<String, Object>> filesMap = service.getListOfAvailableFLVs();
  StringBuffer ret = new StringBuffer();

  Iterator<Entry<String, Map<String, Object>>> iter = filesMap.entrySet().iterator();
  Boolean hasRecordings = iter.hasNext();
  if (hasRecordings) {
    ret.append("<div class=\"menu-content streaming-menu-content\">\r\n");
    ret.append("<ul class=\"stream-menu-listing\">\r\n");
    while (iter.hasNext()){
      Entry<String, Map<String, Object>> entry = iter.next();
      String sName = entry.getKey();
      ret.append("<b>"+sName+"</b><br/><a href=\"rtsp://"+host+":8554/vod/"+sName+"\">rtsp "+sName+"</a><br />\r\n");
      ret.append( "<a href=\"flash.jsp?app=vod&host="+host+"&stream="+sName+"\">flash "+sName+"</a><br />\r\n");
    }
    ret.append("</ul>\r\n");
    ret.append("</div>\r\n");
    ret.append("<p>To begin your own Recorded Broadcast session, visit the <a class=\"broadcast-link link\" href=\"recorder.jsp?host=" + ip + "\">Recorder page</a>!</p>\r\n");

  }
  else {
    ret.append("<div class=\"menu-content streaming-menu-content\">\r\n");
    ret.append("<h3 class=\"no-streams-entry\">No recordings found</h3>\r\n");
    ret.append("</div>\r\n");
    ret.append("<p>You can begin a Broadcast session to Record by visiting the <a class=\"broadcast-link link\" href=\"recorder.jsp?host=" + ip + "\" target=\"_blank\">Recorder page</a>.</p>\r\n");
    ret.append("<p><em>Once a Broadcast session is started and stopped, the Video On Demand</em> (VOD) <em>Recording will be available. Return to this page to see the stream name listed.</em></p>");
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

      #swf-stream-container {
        margin-top: 20px;
        text-align: center;
        background-color: rgb(239, 239, 239);
        border: 1px solid #e3e3e3;
        border-radius: 4px;
      }

      #viewing-header {
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
  </head>
  <body>
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
            <p>If a stream is available to playback, you can select to view over <span class="red-text">RTSP</span> or within a <span class="red-text">Flash Player</span> on this page.</p>
            <h3>[TBD] HLs VOD</h3>
            <%=ret.toString()%>
          </div>
          <div id="swf-stream-container" class="container-hidden">
                <h2 id="viewing-header" class="red-text">Viewing</h2>
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
            <p class="medium-font-size download-link"><a class="red-text link" href="https://github.com/red5pro/red5pro-server-examples/releases/download/0.1.1/Red5Pro-Subscriber-Client.zip">Download</a> the source for this example.</p>
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
    {{> footer }}
  </body>
</html>

