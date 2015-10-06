<%@ page import="org.springframework.context.ApplicationContext,
          com.red5pro.server.secondscreen.net.NetworkUtil,
          org.springframework.web.context.WebApplicationContext,
          com.infrared5.red5pro.examples.service.LiveStreamListService,
          java.util.List,
          java.net.Inet4Address"%>
<%
  //LIVE streams page.
  String ip =  NetworkUtil.getLocalIpAddress();
  ApplicationContext appCtx = (ApplicationContext) application.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
  LiveStreamListService service = (LiveStreamListService)appCtx.getBean("streams");
  List<String> names = service.getLiveStreams();
  StringBuffer ret = new StringBuffer();
  if(names.size() == 0) {
    ret.append("<div class=\"menu-content\"><h3 class=\"no-streams-entry\">No streams found</h3></div>");
    ret.append("<p>You can begin a Broadcast session by vising the <a class=\"link\" href=\"broadcast.jsp?host=\">Broadcast page</a>.</p>");
    ret.append("<p><em>Once a Broadcast session is started, return to this page to see the stream name listed.</em></p>");
  }
  else {
    ret.append("<ul class=\"menu-listing application-listing\">");
    for(String sName:names) {
      ret.append("<b>"+sName+"</b><br/><a href=\"rtsp://"+ip+":8554/live/"+sName+"\">rtsp "+sName+"</a><br />\r\n");
      ret.append( "<a href=\"flash.jsp?host="+ip+"&stream="+sName+"\">flash "+sName+"</a><br />\r\n");
    }
    ret.append("</ul>");
  }
%>
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

      .no-streams-entry {
        padding-left: 20px;
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
          <h2 class="tag-line">LIVE SUBSCRIBING FOR ANY SCREEN</h2>
        </div>
        <div id="live-page-subcontent" class="clear-fix">
          <div id="live-image-container">
            <img id="live-page-img" src="images/red5pro_live_streaming.png">
          </div>
        </div>
        <div class="content-section-story">
          <div>
            <p>Below you will find the list of current live streams to subscribe to. Click an entry to begin consuming the broadcast stream:</p>
            <%=ret.toString()%>
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