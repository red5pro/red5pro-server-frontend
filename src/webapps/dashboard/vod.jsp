{{> jsp_header }}
<!doctype html>
<html lang="eng">
  <head>
    {{> head_meta }}
    <link href="http://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet" type="text/css">
    <link href='http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css' rel='stylesheet'>
    <link href="http://vjs.zencdn.net/5.10.8/video-js.css" rel="stylesheet">
    <link rel="stylesheet" href="css/dashboard.css">
    <title>Welcome to the Red5 Pro Server!</title>
    <style>
    </style>
    <script src="./dist/bundle-vod.js" defer></script>
  </head>
  <body class = 'vod'>
    <div class="container">
      <div class="row position-relative">
        <div class = 'one-half-col float-left'>
          <a class = 'img-link' href='/'>
            <img class = 'logo' src="./images/red5pro_logo.svg">
          </a>
        </div>
        <div class = 'one-half-col float-right position-absolute bottom right'>
          <header id = 'navBar'>
            <a href="/dashboard/vod.jsp" class = 'vod'>VoD</a>
            <a href="/dashboard/clients.jsp" class = 'clients'>Streams</a>
            <a href="/dashboard/index.jsp" class = 'dashboard'>Dashboard</a>
        </div>
      </div>
      <hr>
      <div class="row">
        <div class="float-left one-fifth-col active">
          <h2 class = 'center-text'>VoD Files</h2>
          <a id = 'refreshVOD'><i class="fa fa-refresh float-right" aria-hidden="true"></i></a>
          <table class = 'activeTable'>
            <tbody class = 'activeTableBody'>
            </tbody>
          </table>
          <button id = 'deleteVodFile'>Delete File</button>
          <button id = 'rotate' style="display:none">Rotate</button>
        </div>
        <div class="float-right four-fifth-col">
          <h2 class = 'center-text'>VoD Overview</h2>
          <div class = 'top row' id = 'vodContainer' style="display:none">
            <video id='streamVid' width=100% class="video-js vjs-default-skin" controls data-setup='{}'>
            </video>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>