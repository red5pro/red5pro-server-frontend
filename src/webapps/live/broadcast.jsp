<%@ page import="java.net.InetAddress"%>
<%
    String host="localhost";
    if(request.getParameter("host")!=null) {
      host=request.getParameter("host");
    }
%>
{{> jsp_header }}
<!doctype html>
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Stream Broadcasting with the Red5 Pro Server!</title>
    <style>
      object:focus {
        outline:none;
      }

      #flashContent {
        display:none;
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
    </style>
    <script type="text/javascript" src="swf/swfobject.js"></script>
    <script type="text/javascript">
      // For version detection, set to min. required Flash Player version, or 0 (or 0.0.0), for no version detection.
      var swfVersionStr = "11.1.0";
      // To use express install, set to playerProductInstall.swf, otherwise the empty string.
      var xiSwfUrlStr = "swf/playerProductInstall.swf";
      var flashvars = {
        host: "<%=host %>"
      };
      var params = {};
      params.quality = "high";
      params.bgcolor = "#ffffff";
      params.allowscriptaccess = "sameDomain";
      params.allowfullscreen = "true";
      var attributes = {};
      attributes.id = "Broadcaster";
      attributes.name = "Broadcaster";
      attributes.align = "middle";
      swfobject.embedSWF(
          "Broadcaster.swf", "flashContent",
          "100%", "716",
          swfVersionStr, xiSwfUrlStr,
          flashvars, params, attributes);
      // JavaScript enabled so display the flashContent div in case it is not replaced with a swf object.
      swfobject.createCSS("#flashContent", "display:block;text-align:left;");
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
          <div id="header-field header-subcontent">
            <a class="red5pro-header-link" href="/">
              <img class="red5pro-logo" src="images/logo_68.png">&nbsp;<span class="red5pro-header black-text">RED5</span><span class="red5pro-header red-text">PRO</span>
            </a>
          </div>
          <h2 class="tag-line">LIVE BROADCAST FOR ANY SCREEN</h2>
        </div>
        <div id="live-page-subcontent" class="clear-fix">
          <div id="live-image-container">
            <img id="live-page-img" src="images/red5pro_live_broadcast.png">
          </div>
        </div>
        <div class="content-section-story">
          <p>To start a Broadcast session, allow device access, provide a <strong>stream name</strong>, select any additional broadcast options, then click <strong>Start Broadcast.</strong></p>
        <!-- SWFObject's dynamic embed method replaces this alternative HTML content with Flash content when enough
             JavaScript and Flash plug-in support is available. The div is initially hidden so that it doesn't show
             when JavaScript is disabled.
        -->
        <div id="flashContent">
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
            <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%" id="Broadcaster">
                <param name="movie" value="Broadcaster.swf" />
                <param name="quality" value="high" />
                <param name="bgcolor" value="#ffffff" />
                <param name="allowScriptAccess" value="sameDomain" />
                <param name="allowFullScreen" value="true" />
                <!--[if !IE]>-->
                <object type="application/x-shockwave-flash" data="Broadcaster.swf" width="100%" height="100%">
                    <param name="quality" value="high" />
                    <param name="bgcolor" value="#ffffff" />
                    <param name="allowScriptAccess" value="sameDomain" />
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
          <br><br>
          <p class="medium-font-size"><a class="red-text link" href="https://github.com/red5pro/red5pro-server-examples/releases/download/0.1.0/Red5Pro-Broadcaster-Client.zip">Download</a> the source for this example.</p>
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
   </body>
</html>