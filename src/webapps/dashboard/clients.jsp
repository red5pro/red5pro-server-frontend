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
    <script src="./src/lib/videojs/video.min.js" defer></script>
    <script src="./src/lib/videojs/videojs-media-sources.min.js" defer></script>
    <script src="./src/lib/videojs/videojs.hls.min.js" defer></script>
    <script src="./dist/bundle-clients.js" defer></script>
  </head>
  <body>

    <div class="container">
      <div class="row position-relative">
        <div class = 'one-half-col float-left'>
          <h1>Clients Overview</h1>
        </div>
        <div class = 'one-half-col float-right position-absolute bottom right'>
          <header>
            <a href="/dashboard/index.jsp">Dashboard</a>
            <a href="/dashboard/clients.jsp">Clients</a>
            <a href="#">Server</a>
            <a href="#">VoD</a>
          </header>
        </div>
      </div>
      <hr>
      <div class="row">
        <h3>Active Connections</h3>
        <div class="float-left one-fifth-col" id = 'activeConnections'>
          <table id = 'activeConnectionsTable'>
            <tbody id = 'activeConnectionsTableBody'>
            </tbody>
          </table>
          <button id = 'recordStream' style="display:none">Record Stream</button>
          <button id = 'viewMap' style="display:none">View Map</button>
        </div>
        <div class="float-right four-fifth-col">
          <div class = 'top row' id = mapData>
            <div id = 'dataMapContainer'>
              <div id="dataMap" style="position: relative; width: 100%; height: 100%;"></div>
            </div>
          </div>
          <div class = 'row' id = 'streamData' style="display:none">
            <h4 id = 'streamDataLabel'></h4>
            <div class = 'row' id = 'streamVidParent'>
              <video id = 'streamVid' controls style='background-color: black'></video>
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