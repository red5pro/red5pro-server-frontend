<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ page import="org.springframework.context.ApplicationContext,
					com.red5pro.server.secondscreen.net.NetworkUtil,
					org.springframework.web.context.WebApplicationContext,
					com.infrared5.red5pro.live.LiveStreamListService,					
					com.google.gson.*,
					java.util.Map.Entry,
					java.util.List,
					java.util.Map,
					java.util.Iterator,
					java.net.Inet4Address"%>
    
    
    
   
  <%  
  //Live streams list returns a json array [] of stream objects, {name:streamName}{name:thatName}
  //as [{name:streamName}{name:thatName}] 
  
// This is now controlled by the CORS filer in WEB-INF/web.xml
//  response.addHeader("Access-Control-Allow-Origin","*");
  
  ApplicationContext appCtx = (ApplicationContext) application.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
  
  LiveStreamListService service = (LiveStreamListService)appCtx.getBean("streams");

  List<String> liveMap = service.getLiveStreams();
 
	StringBuffer ret =new StringBuffer();

	
	Iterator<String> iter = liveMap.iterator();
	JsonArray results = new JsonArray();
	
	while(iter.hasNext()){
		JsonObject streamData = new JsonObject();
		String entry = iter.next();
		streamData.addProperty("name", entry);
		results.add(streamData);
	}
  
  %>

  <%=results.toString()%>
    
    
  
    
