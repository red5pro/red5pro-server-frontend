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
    <script>
            (function(window) {
              var timestamp = new Date().getTime();
              var secondscreenHost = window.secondscreenHost.noConflict();
              var config = {
                name: "HTML Control Basic",
                maxPlayers: 10,
                registryUrl: "ws://<%= NetworkUtil.getLocalIpAddress()%>:6262/secondscreen",
                appId: "secondscreen",
                swfobjectUrl: 'lib/host/swf/swfobject.js',
                swfUrl: "lib/host/swf/secondscreenHost.swf",
                minimumVersion: {
                  major: 0,
                  minor: 0
                },
                controlsUrl: "scheme/basic-scheme.html?" + timestamp,
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

              secondscreenHost.on(secondscreenHost.EventTypes.DEVICE_CONNECTED, function (e){
                print("device connected (id, name): " + e.device.id + ', ' + e.device.name);
              });

              secondscreenHost.on(secondscreenHost.EventTypes.DEVICE_DISCONNECTED, function (e){
                print("device disconnected (id, name): " + e.device.id + ', ' + e.device.name);
              });

              secondscreenHost.on(secondscreenHost.EventTypes.CONTROLS_URL_CHANGE, function(e) {
                print('Controls url will change: ' + e.url);
              });

              secondscreenHost.on(secondscreenHost.EventTypes.MESSAGE, function(e) {
                var deviceId = e.device.id,
                    message = e.message,
                    state = e.state;

                if(message === 'ready') {
                  e.device.sendMessageToControls("test");
                  e.device.sendMessageToControls("testing", 1, 2, 3);
                  e.device.sendMessageToControls("testing", 1.126, "52 skidoo", [1, 2, 3]);
                }

                var log = 'Event.Message: ' +
                          '(' + message + ') ' +
                          '| From ' + deviceId + ' | ' +
                          JSON.stringify(state,null,2);

                print(log);
              });

              function print(message) {
                var p = document.createElement('p');
                var text = document.createTextNode(message);
                p.appendChild(text);
                document.body.appendChild(p);
               secondscreenHost.log.info(message);
              }

              window.notifyClient = function(message) {
                secondscreenHost.allDevices().sendMessageToControls("state", encodeURIComponent(JSON.stringify({state:'host-available', message:message})));
              };
            }(window));
    </script>
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
        <div class="secondscreen-example-container">
          <div id="slot"></div>
          <button id="btn" onclick="window.notifyClient('hello, world!');">click me</button>
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
    {{> footer }}
  </body>
</html>