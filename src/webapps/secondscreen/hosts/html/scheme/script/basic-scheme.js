/*global window, document*/
(function(window, document) {
  'use strict';

  var path = window.namespace('com.infrared5.examples.basic');
  var bridge = path.EventBridge;
  var buttonFactory = path.UIButtonFactory;

  var secondscreenClient = window.secondscreenClient.noConflict();
  secondscreenClient.log.info(secondscreenClient.versionStr());

  var options = document.getElementById('options');
  var panel = document.getElementById('message-field');
  var appendMessage = function(value) {
    var p = document.createElement('p')
    p.innerHTML = value;
    panel.appendChild(p);
  };
  var addButton = function(config) {
    var button = buttonFactory.create().init(config);
    options.appendChild(button.$view);
    button.render().activate();
  };

  var app = {
    init: function(secondscreenClient) {
      this.secondscreenClient = secondscreenClient;

      addButton({
        id: 'push-button',
        name: '',
        eventName: 'push',
        upClass: 'push-button-state-up',
        downClass: 'push-button-state-down'
      });

      bridge.on('push', function(event) {
        secondscreenClient.send('push', {
          id: event.data.id
        }, 'foo');
      });

      secondscreenClient.on('state', function(data) {
        var json = JSON.parse(data);
        appendMessage('Message from Host: (' + json.state + ')<br>&nbsp;&nbsp; - ' + json.message);
      });

      document.getElementById('version-field').innerText = this.secondscreenClient.versionStr();

      return this;
    }
  };

  path.app = app.init(secondscreenClient);

}(window, document));