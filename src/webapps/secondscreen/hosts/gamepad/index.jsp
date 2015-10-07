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
        print("device connected (id, name): " + e.device.id + ', ' + e.device.name);
      });

      secondscreenHost.on(secondscreenHost.EventTypes.DEVICE_DISCONNECTED, function (e){
        print("device disconnected (id, name): " + e.device.id + ', ' + e.device.name);
      });

      secondscreenHost.on(secondscreenHost.EventTypes.BUTTON_UP, function(e) {
        print('Button Up: (device.id, button.id): ' + e.device.id + ', ' + e.id);
      });

      secondscreenHost.on(secondscreenHost.EventTypes.BUTTON_DOWN, function(e) {
        print('Button Down: (device.id, button.id): ' + e.device.id + ', ' + e.id);
      });

      function print(message) {
        var p = document.createElement('p');
        var text = document.createTextNode(message);
        p.appendChild(text);
        document.body.appendChild(p);
       secondscreenHost.log.info(message);
      }

    }(window));
  </script>
</head>
<body>
  <div id="slot"></div>
</body>
</html>