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
      <h1>Clients Overview</h1>
      <hr>
      <div class="row">
        <h3>Active Connections</h3>
        <div class="float-left one-fifth-col" id = 'activeConnections'>
          <table id = 'activeConnectionsTable'>
            <tbody id = 'activeConnectionsTableBody'>
            </tbody>
          </table>
          <button id = 'recordStream'>Record Stream</button>
          <button id = 'viewMap' onclick="viewMap()" style="display:none">View Map</button>
        </div>
        <div class="float-right four-fifth-col" style="display:none">
          <div class = 'row' id = mapData>
            <div id = 'dataMapContainer'>
              <div id="dataMap" style="position: relative; width: 100%; height: 100%;"></div>
            </div>
          </div>
          <div class = 'row' id = 'streamData'>
            <div class = 'row'>
              <video id = 'streamVid' controls></video>
            </div>
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
  </body>
</html>