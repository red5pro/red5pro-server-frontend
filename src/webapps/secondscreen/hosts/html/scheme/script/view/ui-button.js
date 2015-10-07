/*global window, document*/
(function(window, document) {
  'use strict';

  var path = window.namespace('com.infrared5.examples.basic');
  var bind = path.bind;
  var bridge = path.EventBridge;
  var clickThreshold = 200;

  var generateElement = function(data) {
        var div = document.createElement('div'),
            p = document.createElement('p'),
            text = document.createTextNode(data.name);
        p.appendChild(text);
        div.appendChild(p);
        div.id = data.id;
        div.classList.add('ui-button');
        p.classList.add('ui-button-label');
        return div;
      };

  var UIButton = {
    init: function(config) {
      this.data = config;
      this.eventName = config.eventName;
      this.stateClasses = {
        up: config.upClass,
        down: config.downClass
      };

      this.$view = generateElement(config);
      this.$label = this.$view.firstChild;

      this.clickEvent = {down:0};
      this.render = bind(this.render, this);
      this.handleButtonTouchStart = bind(this.handleButtonTouchStart, this);
      this.handleButtonTouchEnd = bind(this.handleButtonTouchEnd, this);

      this.$view.classList.add(this.stateClasses.up);
      this.render();
      return this;
    },
    render: function() {
      var width = this.$view.clientWidth,
          height = this.$view.clientHeight;

      this.$label.textContent = this.data.name;
      this.$label.style.width = (width - 40) + 'px';
      this.$label.style.top = (((height - this.$label.clientHeight) * 0.5)) + 'px';
      return this;
    },
    update: function(data) {
      this.data = _.extend(this.data, data);
      this.render();
    },
    activate: function() {
      this.$view.addEventListener('touchstart', this.handleButtonTouchStart);
      this.$view.addEventListener('touchend', this.handleButtonTouchEnd);
      return this;
    },
    deactivate: function() {
      this.$view.removeEventListener('touchstart', this.handleButtonTouchStart);
      this.$view.removeEventListener('touchend', this.handleButtonTouchEnd);
      return this;
    },
    handleButtonTouchStart: function() {
      this.render();
      this.$view.classList.remove(this.stateClasses.up);
      this.$view.classList.add(this.stateClasses.down);
      this.clickEvent.down = new Date().getTime();
    },
    handleButtonTouchEnd: function() {
      var now = new Date().getTime();
      this.render();
      this.$view.classList.add(this.stateClasses.up);
      this.$view.classList.remove(this.stateClasses.down);
      if(now - this.clickEvent.down < clickThreshold) {
        bridge.trigger(this.eventName, this);
      }
    }
  };

  path.UIButtonFactory = {
    create: function() {
      return Object.create(UIButton);
    }
  };

}(window, document));
