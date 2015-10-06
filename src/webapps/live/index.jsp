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
        <hr class="top-padded-rule" />
        {{> applications }}
        <hr class="top-padded-rule" />
        {{> additional_info }}
      </div>
    </div>
    {{> footer }}
  </body>
</html>