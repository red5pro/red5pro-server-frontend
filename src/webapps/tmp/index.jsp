{{> jsp_header }}
<!doctype html>
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Welcome to the Red5 Pro Server!</title>
    <style>
      #main-page-subcontent {
          text-align: center;
          position: relative;
          width: 100%;
          height: 340px;
          overflow: hidden;
        }

        #tablet-container, #features-container {
          position: absolute;
        }

        #tablet-container {
          width: 520px;
        }

        #features-container {
          margin-left: 20px;
          margin-top: 120px;
          width: 460px;
        }

        #main-page-tablet-img {
          width: 100%;
        }

        #main-page-features-img {
          width: 100%;
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
          <div class="clear-fix">
            <p class="left">
                <a class="red5pro-header-link" href="/">
                  <img class="red5pro-logo-page" src="images/red5pro_logo.svg">
               </a>
            </p>
          </div>
          <h2 class="tag-line">@webapp@!</h2>
        </div>
        <div id="main-page-subcontent" class="clear-fix">
          <div>
            Content Here
          </div>
          <hr class="top-padded-rule">
          {{> applications }}
          <hr class="top-padded-rule">
          {{> additional_info }}
        </div>
      </div>
    </div>
    {{> footer }}
  </body>
</html>