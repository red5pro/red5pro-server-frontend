<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
pageEncoding="ISO-8859-1"%>

<%@ page import="java.net.Inet4Address"%>
<%@ page import="com.red5pro.server.secondscreen.net.NetworkUtil"%>

<!doctype html>
<html>
  <head>
    <meta http-equiv="cache-control" content="no-cache">
    <link rel="stylesheet" type="text/css" href="style/main.css">
    <script src="lib/host/secondscreen-host.min.js"></script>
  </head>
  <body>
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
  <div id="slot"></div>
  <button id="btn" onclick="window.notifyClient('hello, world!');">click me</button>
</body>
</html>