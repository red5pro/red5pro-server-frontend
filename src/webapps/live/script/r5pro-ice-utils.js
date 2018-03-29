/* global navigator */
(function (window) {

  'use strict';

  var isMoz = !!navigator.mozGetUserMedia; //eslint-disable-line no-unused-vars
  var OPTION_GOOG = 'google';
  var OPTION_MOZ = 'moz';
  var OPTION_ALL = 'all';
  var mozServers = [
    {urls: 'stun:stun.services.mozilla.com:3478'}
  ];
  var googleServers = [
    {urls: ['stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302',
      'stun:stun3.l.google.com:19302',
      'stun:stun4.l.google.com:19302']
    }
  ];
  var miscServers = [
    {urls: ['stun:stun01.sipphone.com',
      'stun:stun.ekiga.net',
      'stun:stun.fwdnet.net',
      'stun:stun.ideasip.com',
      'stun:stun.iptel.org',
      'stun:stun.rixtelecom.se',
      'stun:stun.schlund.de',
      'stun:stunserver.org',
      'stun:stun.softjoys.com',
      'stun:stun.voiparound.com',
      'stun:stun.voipbuster.com',
      'stun:stun.voipstunt.com',
      'stun:stun.voxgratia.org',
      'stun:stun.xten.com']
    }
  ];
  //  var defaultServers = googleServers.concat(miscServers, mozServers);
  // var defaultServers = isMoz ? [mozServers[0]] : [{urls:googleServers[0].urls[2]}];
  var defaultServers = [{urls:googleServers[0].urls[2]}];

  function determineIceServers (option) {
    switch (option) {
      case OPTION_GOOG:
        return googleServers;
      case OPTION_MOZ:
        return mozServers;
      case OPTION_ALL:
        return googleServers.concat(miscServers, mozServers);
      default:
        return defaultServers;
    }
  }

  window.determineIceServers = determineIceServers;

})(this);
