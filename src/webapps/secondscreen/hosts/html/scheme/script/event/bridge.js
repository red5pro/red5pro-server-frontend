/*global window, document*/
(function(window, document) {

  var path = window.namespace('com.infrared5.examples.basic');

  /* Simple JavaScript Inheritance
   * By John Resig http://ejohn.org/
   * MIT Licensed.
   */
  // Inspired by base2 and Prototype
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  function Class(){};

  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;

            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;

            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };


  /**
  EventEmitter implements an interface for registering, unregistering, and triggering events.

  @class EventEmitter
  @namespace struct
  **/
  EventEmitter = Class.extend({
    init:function(){
      this.callbacks = {};
    },
    /**
    Register a callback for a particular event.
    
    @method addEventListener
    @param {String} eventType Which event to listen to.
      Examples: 
          
          "buttondown", "buttonup", or "shake"
          
          
    @param {Function} fn Function to be called back when the event occurs.
    
    **/
    addEventListener: function(eventType,fn){
      if (typeof fn !== 'function'){
        throw new Error('.on() callback provided was not a function');
      }
    
      // Make an array for this particular eventName
      if(this.callbacks[eventType]===undefined){
        this.callbacks[eventType] = [];
      }
    
      // TODO: Is there any cheap way to detect duplicates.
      if(this.getIndexOfFunctionByType(eventType, fn) === -1) {
        this.callbacks[eventType].push(fn);  
      }
    },

    /**
    Alias for {EventEmitter.addEventListener}
    
    @method on
    **/
    on:function(eventType,fn){
      this.addEventListener(eventType,fn);
    },

    /**
    Unregister a callback for a particular event.
    
    @method removeEventListener
    @param {String} eventType Which event to stop listening to.
    @param {Function} fn Function to be removed.
    
    **/
    removeEventListener: function(eventType,fn){
      // Remove the callback from the list of listeners for the
      // respective eventType
      if(this.callbacks[eventType]!==undefined){
        var callbacks = this.callbacks[eventType],
            indexOfFunc = this.getIndexOfFunctionByType(eventType, fn);
        if(indexOfFunc > -1) {
          callbacks.splice(indexOfFunc, 1);
        }
      }
    },

    getIndexOfFunctionByType: function(eventType, fn) {
      if(this.callbacks[eventType]!==undefined){
        var i, callbacks = this.callbacks[eventType];
        for(i = 0; i < callbacks.length; i++) {
          if(callbacks[i]==fn){
            return i;
          }
        }
        return -1;
      }
      return -1;
    },
    
    /**
    Alias for {EventEmitter.removeEventListener}
    
    @method off
    **/
    off: function(eventType,fn){
      this.removeEventListener(eventType,fn);
    },
    
    /**
    Trigger an event. (Calls all the callbacks that are listening for the eventType)
    
    @method trigger
    @param {String} eventType Which event to trigger.
    @param {Event} event Event that will be passed to all registered listeners.
    
    **/
    trigger: function(eventType,event){
      if(this.callbacks[eventType]!==undefined){
        var i,callbacks = this.callbacks[eventType];
        for(var i = 0; i<callbacks.length;i++){
          callbacks[i](event);
        }
      }
    },
    
    /**
    Convenience function that adds .type field to the event reflecting which type the event is and then passes it to trigger().
    
    @method triggerWithType
    @param {String} eventType Which event to trigger. 
    
      Appends to the event as a field called .type (event.type=eventType).
      
    @param {Event} event Event that will be passed to all registered listeners.
    
    **/
    triggerWithType: function(eventType,event){
      event.type = eventType;
      this.trigger(eventType,event);
    }
  });

  path.EventBridge = new EventEmitter();

}(window, document));