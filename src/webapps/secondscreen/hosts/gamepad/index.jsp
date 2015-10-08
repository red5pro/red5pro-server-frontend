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
    <script>
            (function(window) {
              var timestamp = new Date().getTime();
              var secondscreenHost = window.secondscreenHost.noConflict();
              var config = {
                name: "GamePad Example",
                maxPlayers: 10,
                registryUrl: "ws://<%= NetworkUtil.getLocalIpAddress()%>:6262/secondscreen",
                appId: "secondscreen",
                swfobjectUrl: 'lib/host/swf/swfobject.js',
                swfUrl: "lib/host/swf/secondscreenHost.swf",
                minimumVersion: {
                  major: 0,
                  minor: 0
                },
                controlMode: secondscreenHost.ControlModes.GAMEPAD,
                design: {
                  orientation: "portrait",
                  touchEnabled: false,
                  accelerometerEnabled: false,
                  layout:[{
                    type:   "image",
                    src:    'images/background.png',
                    x:      0,
                    y:      0,
                    width:  320,
                    height: 480
                  }, {
                    type:       "button",
                    id:         'pushButton',
                    srcUp:      'images/button-up.png',
                    srcDown:    'images/button-down.png',
                    x:          (320-160)/2-3,
                    y:          (480-160)/2,
                    width:      160,
                    height:     160
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
                print("<p class=\"red-text medium-font-size\">Device Donnected (id, name):<br>&nbsp;&nbsp;" + e.device.id + ', ' + e.device.name + "</p>");
              });

              secondscreenHost.on(secondscreenHost.EventTypes.DEVICE_DISCONNECTED, function (e){
                print("<p class=\"red-text medium-font-size\">Device Disconnected (id, name):<br>&nbsp;&nbsp;" + e.device.id + ', ' + e.device.name + "</p>");
              });

              secondscreenHost.on(secondscreenHost.EventTypes.BUTTON_UP, function(e) {
                print('Event.Message: (Button Up) ' +
                        '<br>&nbsp;&nbsp;From Button.id: ' + e.id +
                        '<br>&nbsp;&nbsp;On Device.id: ' + e.device.id);
              });

              secondscreenHost.on(secondscreenHost.EventTypes.BUTTON_DOWN, function(e) {
                print('Event.Message: (Button Down) ' +
                        '<br>&nbsp;&nbsp;From Button.id: ' + e.id +
                        '<br>&nbsp;&nbsp;On Device.id: ' + e.device.id);
              });

              function print(message) {
                var p = document.createElement('p');
                p.innerHTML = message;
                document.getElementById('secondscreen-example-container').appendChild(p);
               secondscreenHost.log.info(message);
              }

            }(window));
    </script>
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
          <h2 class="tag-line">SECOND SCREEN GAMEPAD CONTROLLER</h2>
        </div>
        <div>
          <div>
            <p>Once the color chip below is no longer black, this page has become a <span class="red-text">Second Screen Host</span>!</p>
            <p>To connect and communicate with this page, open a native application integrated with the <a class="link" href="http://red5pro.com/docs/streaming/overview/" target="_blank">Second Screen SDKs</a> on your favorite device to turn it into a <span class="red-text">Second Screen Client</span>!</p>
          </div>
          <div id="secondscreen-example-container">
            <div id="version-field"></div>
            <div id="slot"></div>
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
            <p>This example demonstrates how the <span class="red-text">Second Screen Host</span> can pass a controller schema that defines design &amp; layout to the <span class="red-text">Second Screen Client</span> running on a mobile device! The controller schema is parsed by the Second Screen SDK and elements are rendered natively in the application on the device.</p>
            <p>Here's the schema used for this example:</p>
            <div id="code-example" class="menu-content">
<pre><code> {
    orientation:  <span class="red-text">'portrait'</span>,
    layout:[{
      type:       <span class="red-text">'image'</span>,
      src:        <span class="red-text">'images/background.png'</span>,
      x:          <span class="code-blue-text">0</span>,
      y:          <span class="code-blue-text">0</span>,
      width:      <span class="code-blue-text">320</span>,
      height:     <span class="code-blue-text">480</span>
    }, {
      type:       <span class="red-text">'button'</span>,
      id:         <span class="red-text">'pushButton'</span>,
      srcUp:      <span class="red-text">'images/button-up.png'</span>,
      srcDown:    <span class="red-text">'images/button-down.png'</span>,
      x:          <span class="code-blue-text">(320-160)/2-3</span>,
      y:          <span class="code-blue-text">(480-160)/2</span>,
      width:      <span class="code-blue-text">160</span>,
      height:     <span class="code-blue-text">160</span>
    }]
  }</code></pre>
            </div>
            <p class="medium-font-size">Connect more devices and have some fun!</p>
          </div>
        </div>
        <hr class="top-padded-rule" />
        <h3><a class="link" href="http://red5pro.com/docs/streaming/overview/" target="_blank">Second Screen SDKs</a></h3>
        <p>You can download the Red5 Pro Second Screen SDKs from your <a class="link" href="http://account.red5pro.com/download" target="_blank">Red5 Pro Accounts</a> page.</p>
        <p>Please visit the online <a class="link" href="http://red5pro.com/docs/secondscreen/overview/" target="_blank">Red5 Pro Documentation</a> for further information about integrating the Second Screens SDKs into your own native application!</p>
        <hr class="top-padded-rule" />
        {{> applications }}
        <hr class="top-padded-rule" />
        {{> additional_info }}
        </div>
      </div>
    </div>
    {{> footer logo_url='../../images/logo_68.png' }}
  </body>
</html>