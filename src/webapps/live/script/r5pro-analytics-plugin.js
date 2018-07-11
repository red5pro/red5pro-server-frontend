/* global window, WebSocket */
(function (window) {
  'use strict';

  var isOpen = false;
  var firstReport;
  var protocol = window.analytics_protocol || (window.location.protocol === 'https:' ? 'wss' : 'ws');
  var port = window.analytics_port || (protocol === 'wss' ? 8083 : 8081);
  var host = window.analytics_host || window.targetHost;
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
        var now = new Date().getTime();
        if (!firstReport) {
          firstReport = now;
        }
        ws.send(JSON.stringify({
          sendBroadcast: id.split('+').join('_'),
          ts: now,
          data: {
            message: msg,
            elapsed: now - firstReport
          }
        }));
      } catch (e) {
        console.warn(e);
      }
      return;
    }
  }

})(window);
