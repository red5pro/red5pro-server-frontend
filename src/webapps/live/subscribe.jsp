<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ page import="org.springframework.context.ApplicationContext,
					com.red5pro.server.secondscreen.net.NetworkUtil,
					org.springframework.web.context.WebApplicationContext,
					com.infrared5.red5pro.examples.service.LiveStreamListService,
					java.util.List,
					java.net.Inet4Address"%>
    
    

  <%  
  //LIVE streams page.
  String ip =  NetworkUtil.getLocalIpAddress();
  
  ApplicationContext appCtx = (ApplicationContext) application.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
  
  LiveStreamListService service = (LiveStreamListService)appCtx.getBean("streams");
  
  List<String> names = service.getLiveStreams();
	StringBuffer ret =new StringBuffer();
	ret.append("<a href=\"broadcast.jsp?host="+ip+"\">Broadcast Now</a><br />\r\n");
	ret.append("<hr /><b>Live Streams</b><br />");
	
	for(String sName:names){
		
		ret.append("<b>"+sName+"</b><br/><a href=\"rtsp://"+ip+":8554/live/"+sName+"\">rtsp "+sName+"</a><br />\r\n");
		
		ret.append( "<a href=\"flash.jsp?host="+ip+"&stream="+sName+"\">flash "+sName+"</a><br />\r\n");
	}
	
  
  
  %>
	
  <%=ret.toString()%>
    
    
  
    