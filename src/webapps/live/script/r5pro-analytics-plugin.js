/* global window, WebSocket */
(function (window) {
  'use strict';

  var isOpen = false;
  var a_protocol = window.analytics_protocol || 'ws';
  var a_host = window.analytics_host || 'localhost';
  var a_port = window.analytics_port || 8000;
  var ws = new WebSocket(a_protocol + '://' + a_host + ':' + a_port + '/');
  var r5proClient = window.secondscreenClient.noConflict();

  if (!r5proClient) {
    return;
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

  window.r5pro_ws_send = function (id, message) {
    var msg = 'id=' + id + ';message=' +  encodeURIComponent(message) + ';';
    if (!isOpen) {
      try {
        r5proClient.send('report', msg);
      } catch (e) {
        console.warn(e);
      }
      return;
    }
    ws.send(msg);
  }

})(window);
