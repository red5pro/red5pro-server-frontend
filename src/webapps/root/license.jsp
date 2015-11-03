{{> jsp_header }}
<%@ page import="java.io.*,java.util.regex.*,java.nio.charset.Charset"%>
<%
  // error msg 
  String errMessage = null;
  // check for license file in root dir
  File keyFile = new File(System.getenv("RED5_HOME"), "LICENSE.KEY");
  // check for submitted key
  String licenseKey = request.getParameter("licenseKey") != null ? request.getParameter("licenseKey") : null;
  // license key string is at least 19 char long
  if (licenseKey != null) {
    if (licenseKey.length() < 19) {
        errMessage = "License is too short";
    } else {
      // first we up case with trim
      String tmp = licenseKey.toUpperCase().trim();
      // remove non-ascii chars
      tmp = tmp.replaceAll("[^\\x00-\\x7F]", "");
      // remove all non-alphanumic (hex) and non-dash
      tmp = tmp.replaceAll("[^A-F0-9-]", "");
      // ensure doesnt exceed proper length
      if (tmp.length() < 19) {
        errMessage = "License is too short";
      } else {
        // if too long just chop it
        tmp = tmp.substring(0, 19);
        // match the license pattern
        Pattern p = Pattern.compile("[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}");
        Matcher m = p.matcher(tmp);
        if (m.find()) {
          // all checks pass, write to file
          RandomAccessFile raf = null;
          try {
            Charset characterSet = Charset.forName("US-ASCII");
            raf = new RandomAccessFile(keyFile, "rw");
            raf.write(tmp.getBytes(characterSet));
            raf.close();
          } catch (Exception e) {
            errMessage = e.getMessage();
          }
        } else {
          errMessage = "License is not formatted correctly";
        }
      }
    }
  }
  // check for existence
  boolean keyFileExists = keyFile.exists();

%>
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
          <div id="header-field header-subcontent">
            <a class="red5pro-header-link" href="/">
              <img class="red5pro-logo" src="images/logo_68.png">&nbsp;<span class="red5pro-header black-text">RED5</span><span class="red5pro-header red-text">PRO</span>
            </a>
          </div>
          <h2 class="tag-line">LIVE STREAMING FOR ANY SCREEN</h2>
        </div>
        <div id="main-page-subcontent" class="clear-fix">
          <div id="tablet-container">
            <img id="main-page-tablet-img" src="images/red5pro_features_tablet_container.png">
          </div>
          <div id="features-container">
            <img id="main-page-features-img" src="images/red5pro_features.png">
          </div>
        </div>
        <div class="content-section-story">
          <% if (keyFileExists) { %>
            <h4>Your Red5 Pro Server is licensed.</h4>
            <p>If you are experiencing issues, please contact support.</p>
          <% } else { %>
            <h4>If you are seeing this form, then your Red5 Pro Server is not yet licensed.</h4>
            <p>Enter your license key and click submit</p>
            <div>
              <form>
                <input type="text" id="licenseKey" name="licenseKey" maxlength="19" />
                <button>Submit</button>
              </form>
              <% if (errMessage != null) { %>
                <br />
                <p class="red-text"><%= errMessage %></p>
              <% } %>
            </div>
          <% } %>
        </div>
      </div>
    </div>
    {{> footer }}
  </body>
</html>
