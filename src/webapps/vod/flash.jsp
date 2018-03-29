<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
    
<%@ page import="java.net.InetAddress"%>    
    <%
    String app = "vod";
    String host="localhost";
    String stream="myStream";
    
    if(request.getParameter("app")!=null)
    	app=request.getParameter("app");
    if(request.getParameter("host")!=null)
    	host=request.getParameter("host");  
    if(request.getParameter("stream")!=null)
    	stream=request.getParameter("stream");  
    
    System.out.println("stream "+stream);
    System.out.println("app "+app);
    System.out.println("host "+host);
    System.out.println("launch vod ");
    //VOD flash playback page.
    
    %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en"> 
    <head>
        <title></title>
        <meta name="google" value="notranslate" />         
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

        <style type="text/css" media="screen"> 
            html, body  { height:100%; }
            body { margin:0; padding:0; overflow:auto; text-align:center; 
                   background-color: #ffffff; }   
            object:focus { outline:none; }
            #flashContent { display:none; }
        </style>

    </head>
    <body>

            <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%" id="SimplerPlayer">
                <param name="movie" value="SimplerPlayer.swf?app=<%=app %>&host=<%=host %>&stream=<%=stream %>" />
                <param name="quality" value="high" />
                <param name="bgcolor" value="#ffffff" />
                <param name="allowScriptAccess" value="always" />
                <param name="allowFullScreen" value="true" />

                <!--[if !IE]>-->
                <object type="application/x-shockwave-flash" data="SimplerPlayer.swf?app=<%=app %>&host=<%=host %>&stream=<%=stream %>" width="100%" height="100%">
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
  