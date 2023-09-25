{{> jsp_header }}
<!doctype html>
{{> license}}
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Welcome to the Red5 Pro Server</title>
  </head>
  <body>
    {{> top-bar }}
    {{> navigation }}
    {{> header }}
    <div class="main-container">
      <div id="menu-section">
        {{> menu }}
      </div>
      <div id="content-section">
          <div id="subcontent-section">
            <div id="subcontent-section-text">
              <h1 class="red-text">Welcome!</h1>
              <p class="heading-title">If you are seeing this page, then you have successfully downloaded and are running the <span class="no-break">Red5 Pro Server!</span></p>
              <p class="heading-subtitle">Live video streaming solved.</p>
              <p class="heading-subtitle">Broadcast video to millions in under 500 milliseconds.</p>
            </div>
            <div id="subcontent-section-image">
              <img class="image-block" width="544" height="318" src="images/landing_stock.jpg" />
            </div>
          </div>
          <hr class="top-padded-rule">
          <div class="content-section-story">
            <h2><a class="link" href="/live">Live Streaming</a></h2>
            <p>Add live video, audio and data streaming to your app with just a few lines of code.</p>
            <p><a class="link" href="/live/broadcast.jsp?host=<%= ip %>">Start a Broadcast Now!</a></p>
            <hr class="top-padded-rule">
            {{> web-applications }}
            <hr class="top-padded-rule">
            {{> mobile-applications }}
            <hr class="top-padded-rule">
            {{> additional_info }}
          </div>
      </div>
    </div>
    <script>
        (function (window, document) {
          window.r5pro_scrollToContent = function () {
            if (window.innerHeight > window.innerWidth) {
              window.requestAnimationFrame(function () {
                var section = document.getElementsByClassName('main-container');
                if (section && section.length > 0) {
                  section.item(0).scrollIntoView({behavior: "smooth"});
                }
              });
            }
          }

          if (/comp|inter|loaded/.test(document.readyState)){
            window.r5pro_scrollToContent();
          } else {
            document.addEventListener('DOMContentLoaded', window.r5pro_scrollToContent, false);
          }
        })(window, document);
    </script>
    {{> footer }}
  </body>
</html>
