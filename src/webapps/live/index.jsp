{{> jsp_header }}
<!doctype html>
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Welcome to the Red5 Pro Server!</title>
    <style>
      #live-page-subcontent {
        text-align: center;
        position: relative;
        width: 100%;
        height: 240px;
        overflow: hidden;
      }

      #live-container {
        position: absolute;
      }

      #live-container {
        width: 520px;
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
        <h3><a href="broadcast.jsp?host=<%= NetworkUtil.getLocalIpAddress()%>">Broadcast</a></h3>
    To start a broadcast session to subscribe to from a device integrated the <a href="http://red5pro.com/docs/streaming/overview/" target="_blank">Red5 Pro Streaming SDK</a>:
        <br/>
        <p><a href="broadcast.jsp?host=<%= NetworkUtil.getLocalIpAddress()%>">Start broadcasting here</a></p>
        <br />
        <h3><a href="streams.jsp">Subscribe</a></h3>
    To start subscribing to a session currently being broadcast from a device integrated with the <a href="http://red5pro.com/docs/streaming/overview/">Red5 Pro Streaming SDK</a>:
        <br />
        <p><a href="streams.jsp">Access the list of active streams here</a></p>
        <hr class="top-padded-rule" />
        {{> applications }}
        <hr class="top-padded-rule" />
        {{> additional_info }}
      </div>
    </div>
    {{> footer }}
  </body>
</html>