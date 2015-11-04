{{> jsp_header }}
<!doctype html>
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Welcome to the Red5 Pro Server!</title>
    <style>
      #main-page-subcontent {
          text-align: center;
          position: relative;
          width: 100%;
          height: 340px;
          overflow: hidden;
        }

        #tablet-container, #features-container {
          position: absolute;
        }

        #tablet-container {
          width: 520px;
        }

        #features-container {
          margin-left: 20px;
          margin-top: 120px;
          width: 460px;
        }

        #main-page-tablet-img {
          width: 100%;
        }

        #main-page-features-img {
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
                  <img class="red5pro-logo" src="images/logo_68.png">&nbsp;<span class="red5pro-header black-text">RED5</span>&nbsp;&nbsp;<span class="red5pro-header red-text">PRO</span>
               </a>
            </p>
            <p class="left" style="padding-left: 6px; padding-top: 5px;"><span class="red5pro-header registration-mark">&reg;</span></p>
          </div>
          <h2 class="tag-line">LIVE STREAMING FOR ANY SCREEN</h2>
        </div>
        <div id="main-page-subcontent" class="clear-fix">
          <div id="tablet-container">
            <img id="main-page-tablet-img" src="images/red5pro_features_tablet_container.png">
          </div>
          <div id="features-container">
            <img id="main-page-features-img" src="images/red5pro_features.png">
          </div>
        </div>
        <div class="content-section-story">
          <h1 class="red-text">Welcome!</h1>
          <h4>If you are seeing this page, then you have successfully downloaded and are running the Red5 Pro Server!</h4>
          <p>Built on the open source <a class="link" href="https://github.com/Red5/red5-server" target="_blank">Red5 Server</a>, Red5 Pro allows you to build scalable live streaming and second screen applications.</p>
          <div>
            <h3><a class="link" href="/live">Live Streaming</a></h3>
            <p>Add two way live audio, video and data streaming to your app with just a few lines of code using our SDKs (iOS and Android).</p>
            <p><a class="link" href="/live">Visit the Live Streaming example shipped with the Red5 Pro Server</a></p>
          </div>
          <div>
            <h3>Second Screen</h3>
            <p>Create cross-platform second screen experiences similar to Google's ChromeCast. Enable instant control of digital signs, smart TVs and more through our easy to use SDKs.</p>
            <p><a class="link" href="/secondscreen">Visit the Second Screen example shipped with the Red5 Pro Server</a></p>
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