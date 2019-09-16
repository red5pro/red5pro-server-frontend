<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
{{> license}}
    pageEncoding="ISO-8859-1"%>
{{> license}}
    
{{> license}}
<%@ page import="java.net.InetAddress"%>    
{{> license}}
    <%
{{> license}}
    String app = "vod";
{{> license}}
    String host="localhost";
{{> license}}
    String stream="myStream";
{{> license}}
    
{{> license}}
    if(request.getParameter("app")!=null)
{{> license}}
    	app=request.getParameter("app");
{{> license}}
    if(request.getParameter("host")!=null)
{{> license}}
    	host=request.getParameter("host");  
{{> license}}
    if(request.getParameter("stream")!=null)
{{> license}}
    	stream=request.getParameter("stream");  
{{> license}}
    
{{> license}}
    System.out.println("stream "+stream);
{{> license}}
    System.out.println("app "+app);
{{> license}}
    System.out.println("host "+host);
{{> license}}
    System.out.println("launch vod ");
{{> license}}
    //VOD flash playback page.
{{> license}}
    
{{> license}}
    %>
{{> license}}
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
{{> license}}

{{> license}}
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en"> 
{{> license}}
    <head>
{{> license}}
        <title></title>
{{> license}}
        <meta name="google" value="notranslate" />         
{{> license}}
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
{{> license}}

{{> license}}
        <style type="text/css" media="screen"> 
{{> license}}
            html, body  { height:100%; }
{{> license}}
            body { margin:0; padding:0; overflow:auto; text-align:center; 
{{> license}}
                   background-color: #ffffff; }   
{{> license}}
            object:focus { outline:none; }
{{> license}}
            #flashContent { display:none; }
{{> license}}
        </style>
{{> license}}

{{> license}}
    </head>
{{> license}}
    <body>
{{> license}}

{{> license}}
            <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%" id="SimplerPlayer">
{{> license}}
                <param name="movie" value="SimplerPlayer.swf?app=<%=app %>&host=<%=host %>&stream=<%=stream %>" />
{{> license}}
                <param name="quality" value="high" />
{{> license}}
                <param name="bgcolor" value="#ffffff" />
{{> license}}
                <param name="allowScriptAccess" value="always" />
{{> license}}
                <param name="allowFullScreen" value="true" />
{{> license}}

{{> license}}
                <!--[if !IE]>-->
{{> license}}
                <object type="application/x-shockwave-flash" data="SimplerPlayer.swf?app=<%=app %>&host=<%=host %>&stream=<%=stream %>" width="100%" height="100%">
{{> license}}
                    <param name="quality" value="high" />
{{> license}}
                    <param name="bgcolor" value="#ffffff" />
{{> license}}
                    <param name="allowScriptAccess" value="always" />
{{> license}}
                    <param name="allowFullScreen" value="true" />
{{> license}}

{{> license}}
                <!--<![endif]-->
{{> license}}
                <!--[if gte IE 6]>-->
{{> license}}
                    <p> 
{{> license}}
                        Either scripts and active content are not permitted to run or Adobe Flash Player version
{{> license}}
                        11.1.0 or greater is not installed.
{{> license}}
                    </p>
{{> license}}
                <!--<![endif]-->
{{> license}}
                    <a href="http://www.adobe.com/go/getflashplayer">
{{> license}}
                        <img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash Player" />
{{> license}}
                    </a>
{{> license}}
                <!--[if !IE]>-->
{{> license}}
                </object>
{{> license}}
                <!--<![endif]-->
{{> license}}
            </object>
{{> license}}
           
{{> license}}
   </body>
{{> license}}
</html>
{{> license}}
  
{{> license}}
