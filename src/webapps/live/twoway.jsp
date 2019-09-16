{{> jsp_header }}
<%
  String host = ip;
%>
<!doctype html>
{{> license}}
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Two-Way Live Streaming with the Red5 Pro Server!</title>
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
    </style>
    <script type="text/javascript" src="lib/swfobject/swfobject.js"></script>
    <script type="text/javascript">
      // For version detection, set to min. required Flash Player version, or 0 (or 0.0.0), for no version detection.
      var swfVersionStr = "11.1.0";
      // To use express install, set to playerProductInstall.swf, otherwise the empty string.
      var xiSwfUrlStr = "lib/swfobject/playerProductInstall.swf";
      var flashvars = {
        host: "<%= host %>"
      };
      var params = {};
      params.quality = "high";
      params.bgcolor = "#989696";
      params.allowscriptaccess = "always";
      params.allowfullscreen = "true";
      var attributes = {};
      attributes.id = "Main";
      attributes.name = "Broadcaster";
      attributes.align = "middle";
      if(swfobject.hasFlashPlayerVersion("11.1.0")) {
        swfobject.embedSWF(
            "Main.swf", "flashContent",
            "100%", "600",
            swfVersionStr, xiSwfUrlStr,
            flashvars, params, attributes);
        // JavaScript enabled so display the flashContent div in case it is not replaced with a swf object.
        swfobject.createCSS("#flashContent", "display:block; text-align:left; padding: 0; background-color: #ffffff");
      }
      else {
        // nada.

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
          <h2 class="tag-line">TWO-WAY LIVE STREAMING EXAMPLE</h2>
        </div>
        <div id="live-page-subcontent" class="clear-fix">
          <div id="live-image-container">
            <img id="live-page-img" src="images/red5pro_live_broadcast.png">
          </div>
        </div>
        <div class="content-section-story">
          <p>To start a Broadcast session:
            <ol>
                    <li>Allow device access.</li>
                    <li>Provide a <strong>stream name</strong>.</li>
                    <li>Click <strong>Ready</strong>.</li>
                    <li>Wait for the <strong>stream name</strong> to show up in the drop-down element.</li>
                    <li>Click <strong>Subscribe</strong>.</li>
            </ol>
          </p>
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
                <param name="movie" value="Main.swf" />
                <param name="quality" value="high" />
                <param name="bgcolor" value="#989696" />
                <param name="allowScriptAccess" value="sameDomain" />
                <param name="allowFullScreen" value="true" />
                <!--[if !IE]>-->
                <object type="application/x-shockwave-flash" data="Main.swf" width="100%" height="100%">
                    <param name="quality" value="high" />
                    <param name="bgcolor" value="#989696" />
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
          <hr class="top-padded-rule" />
          <h3><a class="link" href="https://www.red5pro.com/docs/streaming/" target="_blank">Streaming SDKs</a></h3>
          <p>You can download the Streaming SDKs from your <a class="link" href="http://account.red5pro.com/download" target="_blank">Red5 Pro Accounts</a> page.</p>
          <p>Please visit the online <a class="link" href="https://www.red5pro.com/docs/streaming/" target="_blank">Red5 Pro Documentation</a> for further information about integrating the streaming SDKs into your own native application!</p>
          <hr class="top-padded-rule" />
          {{> applications }}
          <hr class="top-padded-rule" />
          {{> additional_info }}
        </div>
      </div>
    </div>
    <script>
      (function(window, document) {

       function accessSWF() {
          return document.getElementById("Broadcaster");
        }

        function handleBroadcastIpChange(value) {
          accessSWF().resetHost(value);
        }
        window.r5pro_registerIpChangeListener(handleBroadcastIpChange);

       }(this, document));
    </script>
    {{> footer }}
   </body>
</html>
