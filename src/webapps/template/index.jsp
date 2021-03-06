{{> jsp_header }}
<!doctype html>
{{> license}}
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Welcome to the Red5 Pro Server!</title>
    <style>
    </style>
  </head>
  <body>
    {{> top-bar }}
    {{> navigation }}
    {{> header }}
    <div class="main-container">
      <div id="menu-section">
        {{> menu }}
      </div>
      <div id="content-section">
        <div id="subcontent-section">
          <div id="subcontent-section-text">
            <h1 class="red-text">Welcome!</h1>
            <p class="heading-title">If you are seeing this page, then you have successfully downloaded and are running the <span class="no-break">Red5 Pro Server!</span></p>
            <p class="heading-subtitle">Live video streaming solved.</p>
            <p class="heading-subtitle">Broadcast video to millions in under 500 milliseconds.</p>
          </div>
          <div id="subcontent-section-image">
            <img class="image-block" width="544" height="318" src="images/landing_stock.jpg" />
          </div>
        </div>
        <hr class="top-padded-rule">
        <div class="content-section-story">
          <h2>Hello, world!</h2>
          <hr class="top-padded-rule">
          {{> web-applications }}
          <hr class="top-padded-rule">
          {{> mobile-applications }}
          <hr class="top-padded-rule">
          {{> additional_info }}
        </div>
      </div>
    </div>
    {{> footer }}
  </body>
</html>