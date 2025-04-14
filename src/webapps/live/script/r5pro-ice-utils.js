/*
Copyright © 2015 Infrared5, Inc. All rights reserved.

The accompanying code comprising examples for use solely in conjunction with Red5 Pro (the "Example Code")
is  licensed  to  you  by  Infrared5  Inc.  in  consideration  of  your  agreement  to  the  following
license terms  and  conditions.  Access,  use,  modification,  or  redistribution  of  the  accompanying
code  constitutes your acceptance of the following license terms and conditions.

Permission is hereby granted, free of charge, to you to use the Example Code and associated documentation
files (collectively, the "Software") without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The Software shall be used solely in conjunction with Red5 Pro. Red5 Pro is licensed under a separate end
user  license  agreement  (the  "EULA"),  which  must  be  executed  with  Infrared5,  Inc.
An  example  of  the EULA can be found on our website at: https://account.red5.net/assets/LICENSE.txt.

The above copyright notice and this license shall be included in all copies or portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,  INCLUDING  BUT
NOT  LIMITED  TO  THE  WARRANTIES  OF  MERCHANTABILITY, FITNESS  FOR  A  PARTICULAR  PURPOSE  AND
NONINFRINGEMENT.   IN  NO  EVENT  SHALL INFRARED5, INC. BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN  AN  ACTION  OF  CONTRACT,  TORT  OR  OTHERWISE,  ARISING  FROM,  OUT  OF  OR  IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/* global navigator */
;(function (window) {
  'use strict'

  var isMoz = !!navigator.mozGetUserMedia //eslint-disable-line no-unused-vars
  var OPTION_GOOG = 'google'
  var OPTION_MOZ = 'moz'
  var OPTION_ALL = 'all'
  var mozServers = [{ urls: 'stun:stun.services.mozilla.com:3478' }]
  var googleServers = [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302',
      ],
    },
  ]
  var miscServers = [
    {
      urls: [
        'stun:stun01.sipphone.com',
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
        'stun:stun.xten.com',
      ],
    },
  ]
  //  var defaultServers = googleServers.concat(miscServers, mozServers);
  // var defaultServers = isMoz ? [mozServers[0]] : [{urls:googleServers[0].urls[2]}];
  var defaultServers = [{ urls: googleServers[0].urls[2] }]

  function determineIceServers(option) {
    switch (option) {
      case OPTION_GOOG:
        return googleServers
      case OPTION_MOZ:
        return mozServers
      case OPTION_ALL:
        return googleServers.concat(miscServers, mozServers)
      default:
        return defaultServers
    }
  }

  window.determineIceServers = determineIceServers
})(this)
