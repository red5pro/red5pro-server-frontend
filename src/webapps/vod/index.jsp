{{> jsp_header }}
<!doctype html>
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Video On Demand with the Red5 Pro Server!</title>
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
          <div class="clear-fix">
            <p class="left">
                <a class="red5pro-header-link" href="/">
                  <img class="red5pro-logo-page" src="images/red5pro_logo.svg">
               </a>
            </p>
          </div>
          <h2 class="tag-line">VIDEO ON DEMAND FOR ANY SCREEN</h2>
        </div>
        <div id="live-page-subcontent" class="clear-fix">
          <div id="live-image-container">
            <img id="live-page-img" src="images/red5pro_live_streaming.png">
          </div>
        </div>
        <div class="content-section-story">
          <p>You can Record Live streams using Red5 Pro to be played back On Demand at a later time.</p>
          <div>
            <h3><a class="broadcast-link link" href="recorder.jsp?host=<%= ip %>">Start Recording a Broadcasting</a></h3>
            <p>We have provided an easy way for you to start a Red5 Pro Broadcast session with Recording enabled.</p>
            <p>The <a class="broadcast-link link" href="recorder.jsp?host=<%= ip %>">Broadcast Recorder page</a> provides a means to record a stream of video and audio. Once you have finished a Broadcast, invite a friend to Playback the recording using a web browser or any device with a <a href="http://github.com/red5pro" target="_blank" class="link red-text">native application</a> integrated with the Red5 Pro SDKs!</p>
            <p><a class="broadcast-link link medium-font-size" href="recorder.jsp?host=<%= ip %>">&gt;&nbsp;Start Recording a Broadcast now!</a></p>
            <h3><a class="link" href="playback.jsp">Start Playback of a Recording</a></h3>
            <p>We have provided an easy way to Playback a Recorded Red5 Pro Broadcast session.</p>
            <p>The <a class="link" href="playback.jsp">Playback page</a> provides a list of Recorded stream names. Select the desired recording to playback to and start watching!</p>
            <p><a class="link medium-font-size" href="playback.jsp">&gt;&nbsp;Start Playback Now!</a></p>
          </div>
          <hr class="top-padded-rule">
          {{> applications }}
          <hr class="top-padded-rule">
          {{> additional_info }}
        </div>
      </div>
    </div>
    {{> footer }}
  </body>
</html>