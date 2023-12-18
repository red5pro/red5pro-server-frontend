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
    <div class="main-container container">
      <div id="menu-section">
        {{> menu }}
      </div>
      <div id="content-section">
        <div id="subcontent-section">
          <div id="subcontent-section-text">
            <h1>Red5 Pro Server?</h1>
            <p class="heading-title">With Red5 TrueTime Solutions™, deliver interactive, sub-250 millisecond latency to millions and go beyond the expected. This is faster than humans can perceive; it’s video at the speed of thought.</p>
          </div>
          {{> header }}
        </div>
        <hr class="top-padded-rule">
        <div class="content-section-story">
          <div class="content-section_card content-section_card_small">
            <p class="content-section_card_graphic"><img decoding="async" loading="lazy" src="images/live.svg" data-src="" alt="" width="104" height="84"></p>
            <h3 class="content-section_card_title"><a class="card-link" href="/live">Live Streaming</a></h2>
            <div class="content-section_card_info">
              <p class="content-section_card_message">Add live video, audio and data streaming to your app with just a few lines of code.</p>
              <div class="content-section_card_tray">
                <p class="content-section_card_link"><a class="card-link" href="/live/broadcast.jsp?host=<%= ip %>">Start a Broadcast Now</a></p>
              </div>
            </div>
          </div>
          {{> web-applications }}
          {{> mobile-applications }}
        </div>
        {{> additional_info }}
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
    <!-- {{> footer }} -->
  </body>
</html>
