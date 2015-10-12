{{> jsp_header }}
<!doctype html>
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Second Screen Experiences with the Red5 Pro Server!</title>
    <style>
      #secondscreen-page-subcontent {
        text-align: center;
        position: relative;
        width: 100%;
        height: 240px;
        overflow: hidden;
      }

      #secondscreen-container {
        position: absolute;
      }

      #secondscreen-image-container {
        width: 560px;
      }

      #secondscreen-page-img {
        width: 100%;
      }

      .secondscreen-example-link {
        font-size: 20px;
        border-bottom: 1px solid;
        padding-bottom: 2px;
      }
    </style>
  </head>
  <body>
    {{> header }}
    <div class="container main-container clear-fix">
      <div id="menu-section">
        {{> menu }}
      </div>
      <div id="content-section">
        <div>
          <div id="header-field header-subcontent">
            <a class="red5pro-header-link" href="/">
              <img class="red5pro-logo" src="images/logo_68.png">&nbsp;<span class="red5pro-header black-text">RED5</span><span class="red5pro-header red-text">PRO</span>
            </a>
          </div>
          <h2 class="tag-line">SECOND SCREEN EXPERIENCES</h2>
        </div>
        <div id="secondscreen-page-subcontent" class="clear-fix">
          <div id="secondscreen-image-container">
            <img id="secondscreen-page-img" src="images/red5pro_secondscreen.png">
          </div>
        </div>
        <div class="content-section-story">
          <p>Red5 Pro's Second Screen SDKs enable you to connect devices in real-time on WiFi networks.</p>
          <p>Use a phone as a controller and second screen for your smartTV app, change out screens at runtime, or connect hundreds of smart-devices to huge digital signs at the same time for next generation experiences.</p>
          <div>
            <h3>Second Screen Examples</h3>
            <p>We have provided some examples to turn your browser into a Second Screen <span class="red-text"><strong>Host</strong></span>.</p>
            <p>Using your favorite device, open a native application with the Red5 Pro Second Screen SDKs integrated to connect as a <span class="red-text"><strong>Client</strong></span> and start your Second Screen experience.</p>
            <div>
              <h3 class="red-text"><a class="link secondscreen-example-link" href="hosts/html">HTML Controller Example</a></h3>
              <p>The HTML Controller Example demonstrates the ability of a Second Screen <span class="red-text">Host</span> to deliver a <span class="red-text">Client</span> controller to your device using the webstack.</p>
            </div>
            <div>
              <h3 class="red-text"><a class="link secondscreen-example-link" href="hosts/gamepad">Gamepad Controller Example</a></h3>
              <p>The Gamepad Controller Example demonstrates the ability of a Second Screen <span class="red-text">Host</span> to deliver a <span class="red-text">Client</span> controller using a design-and-layout schema to provide native elements for interaction.</p>
            </div>
            <div>
              <h3 class="red-text"><a class="link secondscreen-example-link" href="hosts/dpad">DPAD Controller Example</a></h3>
              <p>The DPAD Controller Example demonstrates the ability of a Second Screen <span class="red-text">Host</span> to deliver the common DPAD-style controller to the <span class="red-text">Client</span>.</p>
            </div>
          </div>
          <hr class="top-padded-rule" />
          <h3><a class="link" href="http://red5pro.com/docs/streaming/overview/" target="_blank">Second Screen SDKs</a></h3>
          <p>You can download the Red5 Pro Second Screen SDKs from your <a class="link" href="http://account.red5pro.com/download" target="_blank">Red5 Pro Accounts</a> page.</p>
          <p>Please visit the online <a class="link" href="http://red5pro.com/docs/secondscreen/overview/" target="_blank">Red5 Pro Documentation</a> for further information about integrating the Second Screen SDKs into your own native application!</p>
          <hr class="top-padded-rule" />
          {{> applications }}
          <hr class="top-padded-rule" />
          {{> additional_info }}
        </div>
      </div>
    </div>
    {{> footer }}
  </body>
</html>
