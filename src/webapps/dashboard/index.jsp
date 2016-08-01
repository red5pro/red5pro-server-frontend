{{> jsp_header }}
<!doctype html>
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Welcome to the Red5 Pro Server!</title>
    <style>
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
          <div class="clear-fix">
            <p class="left">
                <a class="red5pro-header-link" href="/">
                  <img class="red5pro-logo-page" src="images/red5pro_logo.svg">
               </a>
            </p>
          </div>
          <h2 class="tag-line">dashboard!</h2>
        </div>
        <div class="content-section-story">
          <p>Content Here</p>
          <hr class="top-padded-rule">
          <p>
            <strong>Also, be sure to add you page to the</strong>
            <br>
            <strong>&lt; menu here. You can modify that in </strong><em>/src/template/partial/menu.hbs</em>.
          </p>
          <hr class="top-padded-rule">
          {{> applications }}
          <hr class="top-padded-rule">
          {{> additional_info }}
        </div>
      </div>
    </div>
    {{> footer }}
  </body>
  <script href="./src/index.js"></script>
</html>