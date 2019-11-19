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
      tmp = tmp.replaceAll("[^A-Z0-9-]", "");
      // ensure doesnt exceed proper length
      if (tmp.length() < 19) {
        errMessage = "License is too short.";
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
          errMessage = "License is not formatted correctly.";
        }
      }
    }
  }
  // check for existence
  boolean keyFileExists = keyFile.exists();

%>
<!doctype html>
{{> license}}
<html lang="eng">
  <head>
    {{> head_meta }}
    {{> resources }}
    <title>Welcome to the Red5 Pro Server!</title>
    <style>
      form {
        display: flex;
        max-width: 420px;
        margin-top: 20px;
      }
      input {
        flex: 2;
      }
      button {
        margin-left: 10px;
      }
    </style>
  </head>
  <body>
    {{> top-bar }}
    {{> navigation }}
    {{> header }}
    <div class="container main-container">
      <div id="menu-section">
        {{> menu }}
      </div>
      <div id="content-section">
        <div class="subcontent-section">
          <div>
            <h1 class="red-text">Red5 Pro License Check</h1>
          <% if (keyFileExists) { %>
            <p class="bold">Your Red5 Pro Server is licensed.</p>
          <% } else { %>
            <hr class="top-padded-rule">
            <p class="bold">If you are seeing this form, then your Red5 Pro Server is not yet licensed.</p>
            <p>Enter your license key and click submit</p>
            <div>
              <form>
                <input type="text" id="licenseKey" name="licenseKey" maxlength="19" />
                <button class="form-button">Submit</button>
              </form>
              <% if (errMessage != null) { %>
                <br />
                <p class="warning"><%= errMessage %></p>
              <% } %>
            </div>
          <% } %>
            <hr class="top-padded-rule">
            <p>If you are experiencing issues, <a class="link" href="https://red5pro.zendesk.com/?origin=webapps" target="_blank">please contact support.</a></p>
          </div>
        </div>
      </div>
    </div>
    {{> footer }}
  </body>
</html>
