{{> jsp_header }}
<!doctype html>
<html lang="eng">
  <head>
    <meta http-equiv="cache-control" content="no-cache">
    {{> head_meta }}
    {{> resources-secondscreen-host }}
    <title>Second Screen HTML Controller Example with the Red5 Pro Server!</title>
    <link rel="stylesheet" type="text/css" href="style/main.css">
    <script src="lib/host/secondscreen-host.min.js"></script>
  </head>
  <body>
    {{> header logo_url='../../images/logo_68.png' }}
    <div class="container main-container clear-fix">
      <div id="menu-section">
        {{> menu }}
      </div>
      <div id="content-section">
        <div>
          <div id="header-field header-subcontent">
            <a class="red5pro-header-link" href="/">
              <img class="red5pro-logo" src="../../images/logo_68.png">&nbsp;<span class="red5pro-header black-text">RED5</span><span class="red5pro-header red-text">PRO</span>
            </a>
          </div>
          <h2 class="tag-line">SECOND SCREEN HTML CONTROLLER</h2>
        </div>
        <div>
          <div>
            <p>Once the color chip below is no longer black, this page has become a <span class="red-text">Second Screen Host</span>!</p>
            <p>To connect and communicate with this page, open a native application integrated with the <a class="link" href="http://red5pro.com/docs/streaming/overview/" target="_blank">Second Screen SDKs</a> on your favorite device to turn it into a <span class="red-text">Second Screen Client</span>!</p>
          </div>
          <div id="secondscreen-example-container">
            <div id="version-field"></div>
            <div id="slot"></div>
            <p id="sendForm">
              <input type="text" id="sendInput" value="Hello, World!"></input>
              <button id="sendButton" onclick="window.notifyClient('Host Message', window.document.getElementById('sendInput').value);">Send Message!</button>
            </p>
          </div>
          <script>
            (function(window, document, host) {
              document.getElementById('version-field').innerText = host.versionStr();
             }(this, document, window.secondscreenHost.noConflict()));
          </script>
          <div style="width: 100%; text-align: right;">
            <p><a class="red-text link" href="../downloads/html.zip">Download</a> this example.</p>
          </div>
          <div>
            <p>This example demonstrates how the <span class="red-text">Second Screen Host</span> can pass controller displays written using the webstack of HTML/CSS/JS to the <span class="red-text">Second Screen Client</span> running on a mobile device! In fact, you can visit the actual HTML page being delivered <a class="red-text link" href="scheme/basic-scheme.html" target="_blank">here</a>.</p>
            <p class="medium-font-size">Connect more devices and have some fun!</p>
          </div>
        </div>
        <hr class="top-padded-rule" />
        <h3><a class="link" href="http://red5pro.com/docs/streaming/overview/" target="_blank">Second Screen SDKs</a></h3>
        <p>You can download the Red5 Pro Second Screen SDKs from your <a class="link" href="http://account.red5pro.com/download" target="_blank">Red5 Pro Accounts</a> page.</p>
        <p>Please visit the online <a class="link" href="http://red5pro.com/docs/secondscreen/overview/" target="_blank">Red5 Pro Documentation</a> for further information about integrating the Second Screen SDKs into your own native application!</p>
        <hr class="top-padded-rule" />
        {{> applications }}
        <hr class="top-padded-rule" />
        {{> additional_info }}
        </div>
      </div>
    </div>
    <script>
      (function(window) { 

              var timestamp = new Date().getTime();
              var secondscreenHost = window.secondscreenHost.noConflict();
              var config = {
                name: 'HTML Control Basic',
                maxPlayers: 10,
                registryAddress: '<%= ip %>',
                swfobjectUrl: 'lib/host/swf/swfobject.js',
                swfUrl: "lib/host/swf/secondscreenHost.swf",
                minimumVersion: {
                  major: 0,
                  minor: 0
                },
                controlsUrl: 'scheme/basic-scheme.html?' + timestamp,
                controlMode: secondscreenHost.ControlModes.HTML,
                error: function(error) {
                  secondscreenHost.log.error('Registry connection error: ' + error);
                },
                success: function() {
                  secondscreenHost.log.info('Registry connected.');
                }
              };
              secondscreenHost.setLogLevel(secondscreenHost.LogLevels.INFO);
              secondscreenHost.start(config);

              secondscreenHost.on(secondscreenHost.EventTypes.SHOW_SLOT_COLOR, function(e) {
                var slot = document.getElementById('slot');
                slot.style.background = e.color;
              });

              secondscreenHost.on(secondscreenHost.EventTypes.DEVICE_CONNECTED, function (e) {
                window.notifyClient('Host Welcome', 'Welcome!');
                print("<p class=\"red-text medium-font-size\">Device Connected (id, name):<br>&nbsp;&nbsp;" + e.device.id + ', ' + e.device.name + "</p>");
              });

              secondscreenHost.on(secondscreenHost.EventTypes.DEVICE_DISCONNECTED, function (e) {
                print("<p class=\"red-text medium-font-size\">Device Disconnected (id, name):<br>&nbsp;&nbsp;" + e.device.id + ', ' + e.device.name + "</p>");
              });

              secondscreenHost.on(secondscreenHost.EventTypes.CONTROLS_URL_CHANGE, function(e) {
                print('Controls url will change: ' + e.url);
              });

              secondscreenHost.on(secondscreenHost.EventTypes.MESSAGE, function(e) {
                var deviceId = e.device.id,
                    message = e.message,
                    state = e.state;

                if(message === 'ready') {
                  e.device.send("test");
                  e.device.send("testing", 1, 2, 3);
                  e.device.send("testing", 1.126, "52 skidoo", [1, 2, 3]);
                }

                if(state !== undefined) {
                  var log = 'Event.Message: ' +
                            '(' + message + ') ' +
                            '<br>&nbsp;&nbsp;From: ' + deviceId +
                            '<br>&nbsp;&nbsp;Message: ' + JSON.stringify(state,null,2);
                  print(log);
                }

              });

              function print(message) {
                var p = document.createElement('p');
                p.innerHTML = message;
                document.getElementById('secondscreen-example-container').appendChild(p);
               secondscreenHost.log.info(message);
              }

              window.notifyClient = function(type, message) {
                secondscreenHost.allDevices().send('state', {
                  state: type,
                  message: message
                });
              };

              function handleSecondScreenHostIpChange(value) {
                var slot = document.getElementById('slot');
                secondscreenHost.stop();
                slot.style.backgroundColor = "#000";
                config.registryAddress = value;
                secondscreenHost.start(config);
              }
              window.r5pro_registerIpChangeListener(handleSecondScreenHostIpChange);

      }(window));
    </script>
   {{> footer logo_url='../../images/logo_68.png' }}
  </body>
</html>