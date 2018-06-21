/* global window, WebSocket */
(function (window) {
  'use strict';

  var isOpen = false;
  var a_protocol = window.analytics_protocol || 'ws';
  var a_host = window.analytics_host || 'localhost';
  var a_port = window.analytics_port || 8000;
  var ws = new WebSocket(a_protocol + '://' + a_host + ':' + a_port + '/');
  ws.onopen = function () {
    console.log('[red5pro-analytics]:: socket opened.');
    isOpen = true;
  }
  ws.onerror = function (event) {
    console.error('[red5pro-analytics]:: socket error');
    console.error(event)
    window.r5pro_ws_send = undefined;
    isOpen = false;
  }

  window.r5pro_ws_send = function (id, message) {
    if (!isOpen) return;

    ws.send('id=' + id + ';message=' +  encodeURIComponent(message) + ';');
  }

})(window);
