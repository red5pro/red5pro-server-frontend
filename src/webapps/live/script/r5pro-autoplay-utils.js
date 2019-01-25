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
