{{> jsp_header }}
<!doctype html>
<html lang="eng">
  <head>
    <meta http-equiv="cache-control" content="no-cache">
    {{> head_meta }}
    {{> resources-secondscreen-host }}
    <title>Second Screen GamePad Controller Example with the Red5 Pro Server!</title>
    <link rel="stylesheet" type="text/css" href="style/main.css">
    <script src="lib/host/secondscreen-host.min.js"></script>
    <style>
      #code-example {
        font-size: 12px;
      }
      .code-blue-text {
        color: teal;
      }
    </style>
  </head>
  <body>
    {{> header logo_url='../../images/red5pro_logo.svg' }}
    <div class="container main-container clear-fix">
      <div id="menu-section">
        {{> menu }}
      </div>
      <div id="content-section">
        <div>
          <div class="clear-fix">
            <p class="left">
                <a class="red5pro-header-link" href="/">
                  <img class="red5pro-logo-page" src="../../images/red5pro_logo.svg">
               </a>
            </p>
          </div>
          <h2 class="tag-line">SECOND SCREEN DPAD CONTROLLER</h2>
        </div>
        <div>
          <div>
            <p>Once the color chip below is no longer black, this page has become a <span class="red-text">Second Screen Host</span>!</p>
            <p>To connect and communicate with this page, open a native application integrated with the <a class="link" href="http://red5pro.com/docs/streaming/overview/" target="_blank">Second Screen SDKs</a> on your favorite device to turn it into a <span class="red-text">Second Screen Client</span>!</p>
          </div>
          <div id="secondscreen-example-container">
            <div id="secondscreen-hud">
              <div id="version-field">Red5 Pro Second Screen Not Loaded.</div>
              <div id="slot"></div>
            </div>
            <div id="dpad-position-container"></div>
          </div>
          <script>
            (function(window, document) {
              var host;
              var checkId;
              var checkForHost = function() {
                clearTimeout(checkId);
                if(typeof window.secondscreenHost !== 'undefined') {
                  host = window.secondscreenHost.noConflict();
                  document.getElementById('version-field').innerText = host.versionStr();
                }
                else {
                  checkId = setTimeout(checkForHost, 100);
                }
              }
              checkForHost();
             }(this, document));
          </script>
          <div style="width: 100%; text-align: right;">
            <p><a class="red-text link" href="../downloads/dpad.zip">Download</a> this example.</p>
          </div>
          <div>
            <p>This example demonstrates how the <span class="red-text">Second Screen Host</span> can pass a controller schema that defines the controller type as a <strong>DPAD</strong> to the <span class="red-text">Second Screen Client</span> running on a mobile device!</p>
            <p>Here's the schema used for this example:</p>
            <div id="code-example" class="menu-content">
<pre><code> {
    orientation:  <span class="red-text">'portrait'</span>,
    layout:[{
      type:       <span class="red-text">'dpad'</span>,
      x:          <span class="code-blue-text">0</span>,
      y:          <span class="code-blue-text">0</span>,
      width:      <span class="code-blue-text">240</span>,
      height:     <span class="code-blue-text">240</span>
    }]
  }</code></pre>
            </div>
            <p>The <strong>DPAD</strong> graphics are part of the <a class="link" href="http://account.red5pro.com/download" target="_blank">Second Screen SDK</a>. If you want more control over the look &amp; feel of the controller, visit the example for the <a class="link" href="/secondscreen/hosts/gamepad">Second Screen Gamepad Controller</a>.
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
                name: 'DPAD Example',
                maxPlayers: 10,
                registryAddress: '<%= ip %>',
                swfobjectUrl: 'lib/host/swf/swfobject.js',
                swfUrl: "lib/host/swf/secondscreenHost.swf",
                minimumVersion: {
                  major: 0,
                  minor: 0
                },
                controlMode: secondscreenHost.ControlModes.GAMEPAD,
                design: {
                  orientation: "portrait",
                  layout: [{
                    type: "dpad",
                    x:      (320-240)*0.5,
                    y:      (480-240)*0.5,
                    width:  240,
                    height: 240
                  }]
                },
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

              secondscreenHost.on(secondscreenHost.EventTypes.DEVICE_CONNECTED, function (e){
                print("<p class=\"red-text medium-font-size\">Device Connected (id, name):<br>&nbsp;&nbsp;" + e.device.id + ', ' + e.device.name + "</p>");
              });

              secondscreenHost.on(secondscreenHost.EventTypes.DEVICE_DISCONNECTED, function (e){
                print("<p class=\"red-text medium-font-size\">Device Disconnected (id, name):<br>&nbsp;&nbsp;" + e.device.id + ', ' + e.device.name + "</p>");
                printPosition('');
              });

              secondscreenHost.on(secondscreenHost.EventTypes.DPAD, function(e) {
                if(e.horizontal === 0 && e.vertical === 0) {
                  printPosition('<span class="code-blue-text">DPAD Controller Idle...</span>', true);
                }
                else {
                  printPosition('Event.Message: (DPAD) ' +
                        '<br>&nbsp;&nbsp;For Position: ' + getPositionFromDpadEvent(e) +
                        '<br>&nbsp;&nbsp;On Device.id: ' + e.device.id);
                }
              });

              function getPositionFromDpadEvent(event) {
                var position = '';
                if(event.horizontal === -1)  {
                  position += 'Down';
                }
                else if(event.horizontal === 1) {
                  position += 'Up';
                }

                if(event.vertical === -1) {
                  position += 'Left';
                }
                else if(event.vertical === 1) {
                  position += 'Right';
                }

                return position;
              }

              function print(message) {
                var p = document.createElement('p');
                p.innerHTML = message;
                document.getElementById('secondscreen-hud').appendChild(p);
              }

              function printPosition(message, append) {
                var parent = document.getElementById('dpad-position-container');
                var p = document.createElement('p');
                p.innerHTML = message;
                if(!append) {
                  while(parent.hasChildNodes()) {
                    parent.removeChild(parent.lastChild);
                  }
                }
                parent.appendChild(p);
              }

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
    {{> footer logo_url='../../images/red5pro_logo.svg' }}
  </body>
</html>