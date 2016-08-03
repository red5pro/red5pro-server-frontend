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
  </head>
  <body>
    <div class="container">
      <h1>Clients Overview</h1>
      <hr>
      <div class="row">
        <h3>Quick Glance</h3>
        <div class="float-left one-third-col">
          <h3>Active Connections</h3>
          <table></table>
        </div>
        <div class="float-right two-third-col">
          
        </div>
      </div>
    </div>
  </body>
  <script src="./src/lib/Chart.bundle.min.js" defer></script>
  <script src="./dist/bundle-clients.js" defer></script>
</html>