<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%
    String app = "live";
    String host="127.0.0.1";
    String stream="myStream";
    String buffer="2";
    String width="100%";
    String height="100%";

    if(request.getParameter("app") != null) {
      app = request.getParameter("app");
    }

    if(request.getParameter("host") != null) {
      host = request.getParameter("host");
    }

    if(request.getParameter("stream") != null) {
      stream = request.getParameter("stream");
    }

    if(request.getParameter("buffer") != null) {
      buffer = request.getParameter("buffer");
    }
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
    <head>
        <title>Subscribing to <%= stream %></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="google" value="notranslate" />
        <style type="text/css" media="screen">
            html, body  { height:100%; }
            body {
              margin:0;
              padding:0;
              overflow:auto;
              text-align:center;
              background-color: #ffffff;
            }
            object:focus { outline:none; }
            #flashContent { display:none; }
        </style>
    </head>
    <body>
        <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="<%= width %>" height="<%= height %>" id="Subscriber">
                <param name="movie" value="Subscriber.swf?app=<%=app %>&buffer=<%=buffer %>&host=<%=host %>&stream=<%=stream %>" />
                <param name="quality" value="high" />
                <param name="bgcolor" value="#ffffff" />
                <param name="allowScriptAccess" value="always" />
                <param name="allowFullScreen" value="true" />

                <!--[if !IE]>-->
                <object type="application/x-shockwave-flash" data="Subscriber.swf?app=<%=app %>&buffer=<%=buffer %>&host=<%=host %>&stream=<%=stream %>" width="<%= width %>" height="<%= height %>">
                    <param name="quality" value="high" />
                    <param name="bgcolor" value="#ffffff" />
                    <param name="allowScriptAccess" value="always" />
                    <param name="allowFullScreen" value="true" />

                <!--<![endif]-->
                <!--[if gte IE 6]>-->
                    <p>
                        Either scripts and active content are not permitted to run or Adobe Flash Player version
                        11.1.0 or greater is not installed.
                    </p>
                <!--<![endif]-->
                    <a href="http://www.adobe.com/go/getflashplayer">
                        <img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash Player" />
                    </a>
                <!--[if !IE]>-->
                </object>
                <!--<![endif]-->

            </object>
   </body>
</html>

