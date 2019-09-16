<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
{{> license}}
    pageEncoding="ISO-8859-1"%>
{{> license}}
<%@ page import="org.springframework.context.ApplicationContext,
{{> license}}
					com.red5pro.server.secondscreen.net.NetworkUtil,
{{> license}}
					org.springframework.web.context.WebApplicationContext,
{{> license}}
					com.infrared5.red5pro.live.LiveStreamListService,					
{{> license}}
					com.google.gson.*,
{{> license}}
					java.util.Map.Entry,
{{> license}}
					java.util.List,
{{> license}}
					java.util.Map,
{{> license}}
					java.util.Iterator,
{{> license}}
					java.net.Inet4Address"%>
{{> license}}
    
{{> license}}
    
{{> license}}
    
{{> license}}
   
{{> license}}
  <%  
{{> license}}
  //Live streams list returns a json array [] of stream objects, {name:streamName}{name:thatName}
{{> license}}
  //as [{name:streamName}{name:thatName}] 
{{> license}}
  
{{> license}}
// This is now controlled by the CORS filer in WEB-INF/web.xml
{{> license}}
//  response.addHeader("Access-Control-Allow-Origin","*");
{{> license}}
  
{{> license}}
  ApplicationContext appCtx = (ApplicationContext) application.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
{{> license}}
  
{{> license}}
  LiveStreamListService service = (LiveStreamListService)appCtx.getBean("streams");
{{> license}}

{{> license}}
  List<String> liveMap = service.getLiveStreams();
{{> license}}
 
{{> license}}
	StringBuffer ret =new StringBuffer();
{{> license}}

{{> license}}
	
{{> license}}
	Iterator<String> iter = liveMap.iterator();
{{> license}}
	JsonArray results = new JsonArray();
{{> license}}
	
{{> license}}
	while(iter.hasNext()){
{{> license}}
		JsonObject streamData = new JsonObject();
{{> license}}
		String entry = iter.next();
{{> license}}
		streamData.addProperty("name", entry);
{{> license}}
		results.add(streamData);
{{> license}}
	}
{{> license}}
  
{{> license}}
  %>
{{> license}}

{{> license}}
  <%=results.toString()%>
{{> license}}
    
{{> license}}
    
{{> license}}
  
{{> license}}
    
{{> license}}
