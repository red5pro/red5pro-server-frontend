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
    {{> header }}
  <body>
    {{> top-bar }}
    {{> header }}
    <div class="main-container">
      <div id="menu-section">
        {{> menu }}
      </div>
      <div id="content-section">
        <div id="subcontent-section">
          <div id="subcontent-section-text">
            <h1>@webapp@</h1>
          </div>
        </div>
        <hr class="top-padded-rule">
        <div class="app-content">
          <p>Content Here</p>
          <hr class="top-padded-rule">
          <p>
            <strong>Also, be sure to add you page to the</strong>
            <br>
            <strong>&lt; menu here. You can modify that in </strong><em>/src/template/partial/menu.hbs</em>.
          </p>
        </div>
        <hr class="top-padded-rule">
        <div class="content-section-story">
          {{> web-applications }}
          {{> mobile-applications }}
        </div>
        <hr class="top-padded-rule">
        {{> additional_info }}
      </div>
    </div>
    {{> footer }}
  </body>
</html>
