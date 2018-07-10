/* global window, WebSocket */
(function (window, secondscreenClient) {
  'use strict';

  var isOpen = false;
  var a_protocol = window.analytics_protocol || 'ws';
  var a_host = window.analytics_host || 'localhost';
  var a_port = window.analytics_port || 8000;

  /*
  secondscreenClient.setLogLevel(secondscreenClient.LogLevels.INFO);
  secondscreenClient.log.info(secondscreenClient.versionStr());
  secondscreenClient.on('state', function(data) {
    var json = JSON.parse(data);
    console.log('Message from Host: (' + json.state + ')<br>&nbsp;&nbsp; - ' + json.message);
  });
  */

  var protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  var port = protocol === 'wss' ? 8083 : 8081;
  var host = window.targetHost;
  var ws = new WebSocket(protocol + '://' + host + ':' + port + '/live/analyze');
  ws.onmessage = function (msg) {
    console.log('[ws]:: ' + msg);
  }
  ws.onopen = function () {
    console.log('[red5pro-analytics]:: socket opened.');
    isOpen = true;
  }
  ws.onerror = function (event) {
    console.error('[red5pro-analytics]:: socket error');
    console.error(event)
    isOpen = false;
  }

  window.r5pro_ws_send = function (id, type, message) {
    var msg = 'id=' + id + ';action=' + type + ';message=' +  encodeURIComponent(message) + ';';
    if (isOpen) {
      try {
        // secondscreenClient.send('report', msg);
        ws.send(JSON.stringify({
          sendBroadcast: id.split('+').join('_'),
          ts: new Date().getTime(),
          data: {
            message: msg
          }
        }));
      } catch (e) {
        console.warn(e);
      }
      return;
    }
  }

})(window, window.secondscreenClient.noConflict());
