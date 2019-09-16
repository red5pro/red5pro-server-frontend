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
An  example  of  the EULA can be found on our website at: https://account.red5pro.com/assets/LICENSE.txt.

The above copyright notice and this license shall be included in all copies or portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,  INCLUDING  BUT  
NOT  LIMITED  TO  THE  WARRANTIES  OF  MERCHANTABILITY, FITNESS  FOR  A  PARTICULAR  PURPOSE  AND  
NONINFRINGEMENT.   IN  NO  EVENT  SHALL INFRARED5, INC. BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN  AN  ACTION  OF  CONTRACT,  TORT  OR  OTHERWISE,  ARISING  FROM,  OUT  OF  OR  IN CONNECTION 
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function (window, document, red5prosdk) {
  /**
    * https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
    * https://webkit.org/blog/6784/new-video-policies-for-ios/
  */
  var hasShownModal = false;
  function showModal (content) {
    var div = document.createElement('div');
    div.classList.add('modal');
    var container = document.createElement('div');
    var button = document.createElement('a');
    var close = document.createTextNode('close');
    button.href = "#";
    button.appendChild(close);
    button.classList.add('modal-close');
    container.appendChild(button);
    container.appendChild(content);
    div.appendChild(container);
    document.body.appendChild(div);
    button.addEventListener('click', function () {
      document.body.removeChild(div);
    });
  }
  function generateLine (text) {
    var p = document.createElement('p');
    var t = document.createTextNode(text);
    p.appendChild(t);
    return p;
  }
  function generateInfoLink () {
    var p = document.createElement('p');
    var a1 = document.createElement('a');
    a1.target = '_blank';
    a1.href = 'https://developers.google.com/web/updates/2017/09/autoplay-policy-changes';
    var a1t = document.createTextNode('More Info');
    a1.appendChild(a1t);
    p.appendChild(a1);
    return p;
  }
  function generateAutoPlaybackHandler (title, message) {
    return function () {
      if (hasShownModal ) return;
      var content = document.createElement('div');
      content.appendChild(generateLine(title));
      content.appendChild(document.createElement('br'));
      content.appendChild(generateLine(message));
      content.appendChild(document.createElement('br'));
      content.appendChild(generateInfoLink());
      hasShownModal = true;
      showModal(content);
    }
  }

  var onAutoPlaybackFailure = generateAutoPlaybackHandler('Auto playback failed.', 'Close this modal and click the play button.');
  var onAutoPlaybackMuted = generateAutoPlaybackHandler('Auto playback is muted.', 'Close this modal and click the mute button for audio.');
  window.trackAutoplayRestrictions = function (subscriber) {
    subscriber.on(red5prosdk.SubscriberEventTypes.AUTO_PLAYBACK_FAILURE, onAutoPlaybackFailure);
    subscriber.on(red5prosdk.SubscriberEventTypes.AUTO_PLAYBACK_MUTED, onAutoPlaybackMuted);
  }
  window.untrackAutoplayRestrictions = function (subscriber) {
    subscriber.off(red5prosdk.SubscriberEventTypes.AUTO_PLAYBACK_FAILURE, onAutoPlaybackFailure);
    subscriber.off(red5prosdk.SubscriberEventTypes.AUTO_PLAYBACK_MUTED, onAutoPlaybackMuted);
  }
})(window, document, window.red5prosdk); // eslint-disable-line no-undef
