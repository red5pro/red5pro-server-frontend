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
    <script src="//cdnjs.cloudflare.com/ajax/libs/d3/3.5.3/d3.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/topojson/1.6.9/topojson.min.js"></script>
    <script src="./src/lib/datamaps.world.min.js"></script>

    <script src="./dist/bundle-clients.js" defer></script>
  </head>
  <body class = 'clients'>
    <div class="container">
      <div class="row position-relative">
        <div class = 'one-half-col float-left'>
          <img class = 'logo' src="./images/red5pro_logo.svg">
        </div>
        <div class = 'one-half-col float-right position-absolute bottom right'>
          <header id = 'navBar'>
            <a href="/dashboard/vod.jsp" class = 'vod'>VoD</a>
            <a href="/dashboard/clients.jsp" class = 'clients'>Clients</a>
            <a href="/dashboard/index.jsp" class = 'dashboard'>Dashboard</a>
          </header>
        </div>
      </div>
      <hr>
      <div class="row">
        <div class="float-left one-fifth-col active">
          <h2 class = 'center-text'>Active Connections</h2>
          <table class = 'activeTable'>
            <tbody class = 'activeTableBody'>
            </tbody>
          </table>
          <button id = 'recordStream' style="display:none">Record Stream</button>
          <button id = 'viewMap' style="display:none">View Map</button>
        </div>
        <div class="float-right four-fifth-col">
          <h2 class = 'center-text'>Clients Overview</h2>
          <div class = 'top row' id = mapData>
            <div id = 'dataMapContainer'>
              <div id="dataMap" style="position: relative; width: 100%; height: 100%;"></div>
            </div>
          </div>
          <div class = 'top row' id = 'streamData' style="display:none">
            <div class = 'top row' id = 'streamVidParent'>
              <video id='streamVid' width=100% class="video-js vjs-default-skin" controls>
              </video>
            </div>
            <hr>
            <div class = 'row'>
              <div class = "float-right one-half-col">
                <canvas id = 'connectionsGraph' width="200" height="200"></canvas>
              </div>
              <div class = "float-left one-half-col">
                <canvas id = 'bandwidthGraph' width="200" height="200"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>