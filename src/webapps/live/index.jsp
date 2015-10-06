{{> jsp_header }}
<!doctype html>
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Welcome to the Red5 Pro Server!</title>
  </head>
  <body>
    {{> header }}
    <div class="container main-container clear-fix">
      <div id="menu-section">
        {{> menu }}
      </div>
      <div id="content-section">
        <h3><a href="broadcast.jsp?host=<%= NetworkUtil.getLocalIpAddress()%>">Broadcast</a></h3>
    To start a broadcast session to subscribe to from a device integrated the <a href="http://red5pro.com/docs/streaming/overview/" target="_blank">Red5 Pro Streaming SDK</a>:
        <br/>
        <p><a href="broadcast.jsp?host=<%= NetworkUtil.getLocalIpAddress()%>">Start broadcasting here</a></p>
        <br />
        <h3><a href="streams.jsp">Subscribe</a></h3>
    To start subscribing to a session currently being broadcast from a device integrated with the <a href="http://red5pro.com/docs/streaming/overview/">Red5 Pro Streaming SDK</a>:
        <br />
        <p><a href="streams.jsp">Access the list of active streams here</a></p>
        <hr />
        <h3>Native Applications with Red5 Pro Streaming Integrated</h3>
        <p>You can find example native applications for iOS and Android on our <a href="https://github.com/infrared5" target="_blank">Github</a>.<br/>Follow the project setup and build instructions in each project to easily create Red5 Pro nativeclients to being using the above server applications!</p>
        <ul>
                <li><a href="https://github.com/infrared5/red5pro-ios-app" target="_blank">Red5 Pro iOS Application</a></li>
                <li><a href="https://github.com/infrared5/red5pro-android-app" target="_blank">Red5 Pro Android Application</a></li>
        </ul>
        <hr />
        <h3>Additional Documentation</h3>
        Visit <a href="http://red5pro.com/docs/streaming/overview/" target="_blank">http://red5pro.com/docs/streaming/overview/</a> for more documentation regarding Red5 Pro Live Streaming.
      </div>
    {{> footer }}
  </body>
</html>