{{> jsp_header }}
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

      #flashContent { display:none; }

      .content-section-story {
        max-width: 685px;
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
          <h2 class="tag-line">TWO WAY</h2>
        </div>
        <div id="live-page-subcontent" class="clear-fix">
          <div id="live-image-container">
            <img id="live-page-img" src="images/red5pro_live_streaming.png">
          </div>
        </div>
        <div class="content-section-story">
          <div>
            <p>Below you will find a Flash two way communication example where you and others can connect, broadcast, and subscribe to one another.</p>
            <p>Enter your name, select "Ready", and you will be taken to a waiting room where you will see the list of other streams/people you can Subscribe to.</p>
            <p>Unsubscribing will remove you from two way streaming with that individual and selecting Hang Up will disconnect you completely.</p>
          </div>

          <!-- SWFObject's dynamic embed method replaces this alternative HTML content with Flash content when enough 
              JavaScript and Flash plug-in support is available. The div is initially hidden so that it doesn't show
              when JavaScript is disabled.
          -->
          <div id="flashContent">
            <p>
              To view this page ensure that Adobe Flash Player version 
              11.1.0 or greater is installed. 
            </p>
            <script type="text/javascript"> 
              var pageHost = ((document.location.protocol == "https:") ? "https://" : "http://"); 
              document.write("<a href='http://www.adobe.com/go/getflashplayer'><img src='" 
              + pageHost + "www.adobe.com/images/shared/download_buttons/get_flash_player.gif' alt='Get Adobe Flash player' /></a>" ); 
            </script> 
          </div>

          <noscript>
            <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="800" height="600" id="Main">
              <param name="movie" value="Main.swf" />
              <param name="quality" value="high" />
              <param name="bgcolor" value="#989696" />
              <param name="allowScriptAccess" value="sameDomain" />
              <param name="allowFullScreen" value="true" />
              <!--[if !IE]>-->
              <object type="application/x-shockwave-flash" data="Main.swf" width="800" height="600">
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
        </div>
      </div>
    </div>
    {{> footer }}
    {{> es6-script-includes }}
    <script type="text/javascript" src="lib/swfobject/swfobject.js"></script>
    <script type="text/javascript">
        // For version detection, set to min. required Flash Player version, or 0 (or 0.0.0), for no version detection. 
        var swfVersionStr = "11.1.0";
        // To use express install, set to playerProductInstall.swf, otherwise the empty string. 
        var xiSwfUrlStr = "lib/swfobject/playerProductInstall.swf";
        var flashvars = {};
        var params = {};
        params.quality = "high";
        params.bgcolor = "#989696";
        params.allowscriptaccess = "sameDomain";
        params.allowfullscreen = "true";
        flashvars.host = location.host;
        var attributes = {};
        attributes.id = "Main";
        attributes.name = "Main";
        attributes.align = "middle";
        swfobject.embedSWF(
            "Main.swf", "flashContent", 
            "800", "600", 
            swfVersionStr, xiSwfUrlStr, 
            flashvars, params, attributes);
        // JavaScript enabled so display the flashContent div in case it is not replaced with a swf object.
        swfobject.createCSS("#flashContent", "display:block;text-align:left;");
    </script>
  </body>
</html>
