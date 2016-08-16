{{> jsp_header }}
<!doctype html>
<html lang="eng">
  <head>
    {{> head_meta }}
    <link href="http://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet" type="text/css">
    <link href="http://vjs.zencdn.net/5.10.8/video-js.css" rel="stylesheet">
    <link rel="stylesheet" href="css/dashboard.css">

    <title>Welcome to the Red5 Pro Server!</title>
    <style>
    </style>
    <script src="//cdnjs.cloudflare.com/ajax/libs/d3/3.5.3/d3.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/topojson/1.6.9/topojson.min.js"></script>
    <script src="./src/lib/datamaps.world.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js" defer></script>
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
            <a href="/dashboard/clients.jsp" class = 'clients'>Streams</a>
            <a href="/dashboard/index.jsp" class = 'dashboard'>Dashboard</a>
          </header>
        </div>
      </div>
      <hr>
      <div class="row">
        <div class="float-left one-fifth-col active">
          <h2 class = 'center-text'>Active Streams</h2>
          <table class = 'activeTable'>
            <tbody class = 'activeTableBody'>
            </tbody>
          </table>
        </div>
        <div class="float-right four-fifth-col">
          <h2 class = 'center-text'>Streams Overview</h2>
          <div class = 'top row' id = mapData>
            <header>
              <a class = 'map'>Map</a>
              <a class = 'stream'>Stream</a>
            </header>
            <div id = 'dataMapContainer'>
              <div id="dataMap" style="position: relative; width: 100%; height: 100%;"></div>
            </div>
          </div>
          <div class = 'top row' id = 'streamData' style="display:none">
            <header>
              <a class = 'map'>Map</a>
              <a class = 'stream'>Stream</a>
              <a class = 'record' id = 'recordStream' style='float: left'>Record</a>
            </header>
            <div class = 'top row wide' id = 'streamVidParent'>
              <video id='streamVid' width=100% class="video-js vjs-default-skin" controls>
              </video>
            </div>
            <hr>
            <div class = 'row'>
              <div class = "float-right one-half-col">
                <canvas id = 'connectionsGraph' width="200" height="200"></canvas>
              </div>
              <div class = "float-left one-half-col">
              <h4>Stream Statistics</h4>
              <table>
                <tbody>
                  <tr>
                    <td>Uptime</td>
                    <td id = 'Uptime'></td>
                  </tr>
                  <tr>
                    <td>Id</td>
                    <td id = 'Id'></td>
                  </tr>
                  <tr>
                    <td>Name</td>
                    <td id = 'Name'></td>
                  </tr>
                  <tr>
                    <td>Scope Path</td>
                    <td id = 'scopePath'></td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>