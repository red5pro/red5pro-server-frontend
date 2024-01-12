{{> jsp_header }}
<!doctype html>
{{> license}}
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Live Streaming with the Red5 Pro Server</title>
    <style>
      .content-section_card {
        width: 45%!important;
      }
    </style>
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
            <h1>Get ahead of the curve</h1>
            <p class="heading-title">We live in a fast-moving world where real-time experience delivery has become the norm.</p>
            <p class="heading-title">With Red5 TrueTime Solutions™, deliver interactive, sub-250 millisecond latency to millions and go beyond the expected. This is faster than humans can perceive; it’s video at the speed of thought.</p>
          </div>
          {{> header }}
        </div>
        <hr class="top-padded-rule">
        <div class="content-section-story">
          <div class="content-section_card">
            <h2 class="content-section_card_title"><a class="card-link" href="broadcast.jsp?host=<%= ip %>">Publish a Stream</a></h2>
            <p>We have provided an easy way for you to start a Red5 Pro Broadcast session.</p>
            <div class="content-section_card_info">
              <p class="content-section_card_message">The <a class="card-link card-link_page" href="broadcast-link broadcast.jsp?host=<%= ip %>">Broadcast page</a> provides a means to stream video and audio. Once you have started a Broadcast, invite a friend to Subscribe using a web browser or any device with a <a href="https://github.com/red5pro?utf8=✓&q=streaming&type=&language=" target="_blank" class="card-link card-link_page" style="margin-left: 0!important">native application</a> integrated with the Red5 Pro SDKs!</p>
              <div class="content-section_card_tray">
                <p class="content-section_card_link"><a class="card-link" href="broadcast.jsp?host=<%= ip %>">Start a Broadcast now!&nbsp;</a></p>
              </div>
            </div>
          </div>
          <div class="content-section_card">
            <h2 class="content-section_card_title"><a class="card-link" href="subscribe.jsp?host=<%= ip %>">Subscribe to a Stream</a></h2>
            <p>We have provided an easy way to Subscribe to a Red5 Pro Broadcast session.</p>
            <div class="content-section_card_info">
              <p class="content-section_card_message">The <a class="card-link card-link_page" href="subscribe.jsp?host=<%= ip %>">Subscribe page</a> provides a list of Broadcast stream names. Select the desired stream to subscribe to and start watching!</p>
              <div class="content-section_card_tray">
                <p class="content-section_card_link"><a class="card-link" href="subscribe.jsp?host=<%= ip %>">Start Subscribing Now!&nbsp;</a></p>
              </div>
            </div>
          </div>
        </div>
        {{> additional_info }}
      </div>
    </div>
    <script>
      (function(window, document) {
        var className = 'broadcast-link';
        function handleLiveIpChange(value) {
          var elements = document.getElementsByClassName(className);
          var length = elements ? elements.length : 0;
          var index = 0;
          for(index = 0; index < length; index++) {
            elements[index].href = ['broadcast.jsp?host', value].join('=');
          }
        }
        let timeout
        const setupListener = () => {
          clearTimeout(timeout);
          if (window.r5pro_registerIpChangeListener) {
            window.r5pro_registerIpChangeListener(handleLiveIpChange);
          } else {
            timeout = setTimeout(setupListener, 100);
          }
        }
        timeout = setTimeout(setupListener, 100);
       }(this, document));
    </script>
    <script src="script/r5pro-utils.js"></script>
    <!-- {{> footer }} -->
  </body>
</html>
