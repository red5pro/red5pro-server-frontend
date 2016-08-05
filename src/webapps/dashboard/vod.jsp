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
      <div class="row position-relative">
        <div class = 'one-half-col float-left'>
          <h1>VoD Overview</h1>
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
        <h3>VoD Files</h3>
        <div class="float-left one-fifth-col" id = 'vodFiles'>
          <table id = 'vodFilesTable'>
            <tbody id = 'vodFilesTableBody'>
            </tbody>
          </table>
        </div>
        <div class="float-right four-fifth-col">
          
        </div>
      </div>
    </div>
  </body>
</html>