{{> jsp_header }}
<!doctype html>
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Live Streaming with the Red5 Pro Server!</title>
    <style>
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
          <h2 class="tag-line">LIVE STREAMING FOR ANY SCREEN</h2>
        </div>
        <div id="live-page-subcontent" class="clear-fix">
          <div id="live-image-container">
            <img id="live-page-img" src="images/red5pro_live_streaming.png">
          </div>
        </div>
        <div class="content-section-story">
          <p>Build Facetime-like experiences that connect seamlessly across platforms including Android, iOS, Flash and HTML5 (<span class="red-text"><em>coming soon</em></span>).</p>
          <div>
            <h3><a class="link" href="broadcast.jsp?host=<%= NetworkUtil.getLocalIpAddress()%>">Start Broadcasting</a></h3>
            <p>We have provided an easy way for you to start a Red5 Pro Broadcast session.</p>
            <p>The <a class="link" href="broadcast.jsp?host=<%= NetworkUtil.getLocalIpAddress()%>">Broadcast page</a> provides a means to stream video and audio. Once you have started a Broadcast, invite a friend to Subscribe using a web browser or any device with a <a href="http://github.com/red5pro" target="_blank" class="link red-text">native application</a> integrated with the Red5 Pro SDKs!</p>
            <p><a class="link medium-font-size" href="broadcast.jsp?host=<%= NetworkUtil.getLocalIpAddress()%>">&gt;&nbsp;Start a Broadcast now!</a></p>
            <h3><a class="link" href="subscribe.jsp">Start Subscribing</a></h3>
            <p>We have provided an easy way to Subscribe to a Red5 Pro Broadcast session.</p>
            <p>The <a class="link" href="subscribe.jsp">Subscribe page</a> provides a list of Broadcast stream names. Select the desired stream to subscribe to and start watching!</p>
            <p><a class="link medium-font-size" href="subscribe.jsp">&gt;&nbsp;Start Subscribing Now!</a></p>
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
  </body>
</html>