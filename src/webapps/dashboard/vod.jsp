{{> jsp_header }}
<!doctype html>
<html lang="eng">
  <head>
    {{> head_meta }}
    <link href="http://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet" type="text/css">
    <link rel="stylesheet" href="css/dashboard.css">
    <title>Welcome to the Red5 Pro Server!</title>
    <style>
    </style>
    <script src="./dist/bundle-vod.js" defer></script>
    <script src="https://content.jwplatform.com/libraries/dasWifC7.js" defer></script>
  </head>
  <body>
    <div class="container">
      <div class="row position-relative">
        <div class = 'one-half-col float-left'>
          <img class = 'logo' src="./images/red5pro_logo.svg">
        </div>
        <div class = 'one-half-col float-right position-absolute bottom right'>
          <header>
            <a href="/dashboard/index.jsp">Dashboard</a>
            <a href="/dashboard/clients.jsp">Clients</a>
            <a href="#">Server</a>
            <a href="/dashboard/vod.jsp">VoD</a>
          </header>
        </div>
      </div>
      <hr>
      <div class="row">
        <div class="float-left one-fifth-col active">
          <h2 class = 'center-text'>VoD Files</h2>
          <table class = 'activeTable'>
            <tbody class = 'activeTableBody'>
            </tbody>
          </table>
          <button id = 'deleteVodFile'>Delete File</button>
          <button id = 'refreshVOD'>Refresh</button>
        </div>
        <div class="float-right four-fifth-col" id = vodView>
          <h2 class = 'center-text'>VoD Overview</h2>
          <div class = 'top row'>
            <div id="playbackVideo"></div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>