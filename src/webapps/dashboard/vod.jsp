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
  </head>
  <body>

    <div class="container">
      <header>
        <h1>VoD Overview</h1>
        <a href="/index.jsp">Dashboard</a>
        <a href="/clients.jsp">Clients</a>
        <a href="#">Server</a>
        <a href="">VoD</a>
      </header>
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
          <div class = 'row' id = mapData>
            <div id = 'dataMapContainer'>
              <div id="dataMap" style="position: relative; width: 100%; height: 100%;"></div>
            </div>
          </div>
          <div class = 'row' id = 'streamData' style="display:none">
            <h4 id = 'streamDataLabel'></h4>
            <div class = 'row' id = 'streamVidParent'>
              <video id = 'streamVid' controls style='background-color: black'></video>
            </div>
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