{{> jsp_header }}
<!doctype html>
{{> license}}
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Live Streaming with the Red5 Pro Server</title>
  </head>
  <body>
    {{> top-bar }}
    {{> header }}
    <div class="main-container">
      <div id="menu-section">
        {{> menu }}
      </div>
      <div id="content-section">
        <div id="subcontent-section">
          <div id="subcontent-section-text">
            <h1 class="black-text">Get ahead of the curve</h1>
            <p class="heading-title">We live in a fast-moving world where real-time experience delivery has become the norm.</p>
            <p class="heading-title">With Red5 TrueTime Solutions™, deliver interactive, sub-250 millisecond latency to millions and go beyond the expected. This is faster than humans can perceive; it’s video at the speed of thought.</p>
          </div>
        </div>
        <hr class="top-padded-rule">
        <div class="content-section-story">
          <h2><a class="broadcast-link link" href="broadcast.jsp?host=<%= ip %>">Publish a Stream</a></h2>
          <p>We have provided an easy way for you to start a Red5 Pro Broadcast session.
          </p>
          <p>The <a class="link" href="broadcast-link broadcast.jsp?host=<%= ip %>">Broadcast page</a> provides a means to stream video and audio. Once you have started a Broadcast, invite a friend to Subscribe using a web browser or any device with a <a href="https://github.com/red5pro?utf8=✓&q=streaming&type=&language=" target="_blank" class="link red-text">native application</a> integrated with the Red5 Pro SDKs!</p>
          <p><a class="broadcast-link link medium-font-size" href="broadcast.jsp?host=<%= ip %>">Start a Broadcast now! <img decoding="async" loading="lazy" src="images/white-arrow.svg" data-src="" alt="" width="16" height="16"></a></p>
          <hr class="top-padded-rule">
          <h2><a class="link" href="subscribe.jsp?host=<%= ip %>">Subscribe to a Stream</a></h2>
          <p>We have provided an easy way to Subscribe to a Red5 Pro Broadcast session.</p>
          <p>The <a class="link" href="subscribe.jsp?host=<%= ip %>">Subscribe page</a> provides a list of Broadcast stream names. Select the desired stream to subscribe to and start watching!</p>
          <p><a class="link medium-font-size" href="subscribe.jsp?host=<%= ip %>">&gt;&nbsp;Start Subscribing Now!</a></p>
          </div>
          <hr class="top-padded-rule" />
          <h2><a class="link" href="https://www.red5pro.com/docs/streaming/" target="_blank">Streaming SDKs</a></h2>
          <p>You can download the Streaming SDKs from your <a class="link" href="http://account.red5pro.com/download" target="_blank">Red5 Pro Accounts</a> page to bring live streaming to your web-based and mobile applications today!</p>
          <hr class="top-padded-rule" />
          {{> web-applications }}
          <hr class="top-padded-rule">
          {{> mobile-applications }}
          <hr class="top-padded-rule" />
          {{> additional_info }}
        </div>
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
        window.r5pro_registerIpChangeListener(handleLiveIpChange);
       }(this, document));
    </script>
    <script src="script/r5pro-utils.js"></script>
    {{> footer }}
  </body>
</html>
