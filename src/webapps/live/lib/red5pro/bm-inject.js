/*jshint evil:true */
/* global window */
(function(env, injectionUseIframe) {
// Mostly adapted from Cordova iOS bridge code

var execIframe,
    execXhr,
    requestCount = 0,
    commandQueue = [], // Contains pending JS->Native messages.
    isInContextOfEvalJs = 0,
    useIframe = (typeof injectionUseIframe === 'undefined') ? true : injectionUseIframe,
    callbacks = {},
    unhandledMessages = {};

// sends a message to native code
// for internal use only
function sendToNative(action) {
  var actionArgs = Array.prototype.splice.call(arguments, 1);
  var command = [action, actionArgs];
  commandQueue.push(JSON.stringify(command));
  console.log(commandQueue);

  // If we're in the context of a stringByEvaluatingJavaScriptFromString call,
  // then the queue will be flushed when it returns; no need for a poke.
  // Also, if there is already a command in the queue, then we've already
  // poked the native side, so there is no reason to do so again.
  if (!isInContextOfEvalJs && commandQueue.length == 1) {
    if(useIframe) {
      execIframe = execIframe || createExecIframe();
      execIframe.src = "r5bridge://ready";
    } else {
      // This prevents sending an XHR when there is already one being sent.
      // This should happen only in rare circumstances (refer to unit tests).
      if (execXhr && execXhr.readyState != 4) {
        execXhr = null;
      }
      execXhr = execXhr || new XMLHttpRequest();
      execXhr.open('HEAD', "/!r5_exec?" + (+new Date()), true);
      execXhr.setRequestHeader('rc', ++requestCount);
      //execXhr.setRequestHeader('cmds', nativeFetchMessages());
      execXhr.send(null);
    }
  }
}

function createExecIframe() {
  var iframe = document.createElement("iframe");
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  return iframe;
}

var nativeFetchMessages = function() {
  // Each entry in commandQueue is a JSON string already.
  if (!commandQueue.length) {
    return '';
  }
  var json = '[' + commandQueue.join(',') + ']';
  commandQueue.length = 0;
  return json;
};

var nativeEvalAndFetch = function(func) {
  // This shouldn't be nested, but better to be safe.
  isInContextOfEvalJs++;
  try {
    func();
    return nativeFetchMessages();
  } finally {
    isInContextOfEvalJs--;
  }
};

var addCallback = function(name, cb) {
  if(callbacks[name] === undefined) {
    callbacks[name] = [];
  }

  callbacks[name].push(cb);

  var messages = unhandledMessages[name];
  if(messages !== undefined) {
    for(var i = 0; i < messages.length; ++i) {
      cb.apply(null, messages[i]);
    }
    unhandledMessages[name] = undefined;
  }
};

var handleMessageFromNative = function(name, args) {
  console.log(name, args);
  var cb = callbacks[name];

  if(cb !== undefined) {
    for(var i = 0; i < cb.length; ++i) {
      cb[i].apply(null, args);
    }
  } else {
    if(unhandledMessages[name] === undefined) {
      unhandledMessages[name] = [];
    }
    unhandledMessages[name].push(args);
  }
};

function encodeParameter(param) {
  if(typeof param === 'undefined') {
    throw "undefined is not valid parameter";
  }
  else if(param instanceof Object) {
    // if non-scalar, use json encoded string
    return JSON.stringify(param);
  }
  else if(param === null) {
    // null is represented by the empty string
    return "";
  }
  else {
    return param;
  }
}

function sendToHost(messageName) {
  // TODO: consider using params inline
  var params = Array.prototype.splice.call(arguments, 1);
  for(var i = 0; i < params.length; ++i) {
    params[i] = encodeParameter(params[i]);
  }
  sendToNative('message', messageName, params);
}

env.nativeFetchMessages = nativeFetchMessages;
env.nativeEvalAndFetch = nativeEvalAndFetch;
env.sendToHost = sendToHost;
env.handleMessageFromNative = handleMessageFromNative;
env.addCallback = addCallback;
env.getUnhandledMessages = function() {
  return unhandledMessages;
};

var startTime;

env.latencyReply = function() {
  var elapsed = new Date() - startTime;
  console.log(elapsed);
  sendToNative("log", elapsed);
};

env.testLatency = function() {
  startTime = new Date();
  sendToNative("latency-test");
};

env.sendButton = function(button, state) {
  sendToNative("button", button, state);
};

var notifyReady = function() {
 sendToNative("ready", true);
}
var checkDomLoaded = function() {
  if(document.readyState === 'complete') {
    notifyReady();
  }
 else {
    window.addEventListener("load", notifyReady, false);
 }
};
checkDomLoaded();

})(window, window.injectionUseIframe);