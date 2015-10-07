/*global window, document*/
(function(window, document) {

  'use strict';

  var path = window.namespace('com.infrared5.examples.basic');
  path.bind = function(func, context) {
    return function() {
      return func.apply(context, arguments);
    };
  };

}(window, document));