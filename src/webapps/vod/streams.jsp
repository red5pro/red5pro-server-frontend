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
					com.infrared5.red5pro.examples.service.StreamListService,
{{> license}}
					java.util.Map.Entry,
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
  //VOD streams list
{{> license}}
  
{{> license}}
  String ip =NetworkUtil.getLocalIpAddress();
{{> license}}
  
{{> license}}
  ApplicationContext appCtx = (ApplicationContext) application.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
{{> license}}
  
{{> license}}
  StreamListService service = (StreamListService)appCtx.getBean("vod");
{{> license}}
  
{{> license}}
  Map<String, Map<String, Object>> filesMap = service.getListOfAvailableFLVs();
{{> license}}
  
{{> license}}
	StringBuffer ret =new StringBuffer();
{{> license}}

{{> license}}
	
{{> license}}
	Iterator<Entry<String, Map<String, Object>>> iter = filesMap.entrySet().iterator();
{{> license}}
	while(iter.hasNext()){
{{> license}}
		Entry<String, Map<String, Object>> entry = iter.next();
{{> license}}
		String sName = entry.getKey();	
{{> license}}
		
{{> license}}
		ret.append("<b>"+sName+"</b><br/><a href=\"rtsp://"+ip+":8554/vod/"+sName+"\">rtsp "+sName+"</a><br />\r\n");
{{> license}}
		
{{> license}}
		ret.append( "<a href=\"flash.jsp?app=vod&host="+ip+"&stream="+sName+"\">flash "+sName+"</a><br />\r\n");
{{> license}}
	}
{{> license}}
  if(ret.length() == 0){	 
{{> license}}
		  ret.append( "No available streams");	 
{{> license}}
  }
{{> license}}
  
{{> license}}
  %>
{{> license}}

{{> license}}
  <%=ret.toString()%>
{{> license}}
    
{{> license}}
    
{{> license}}
  
{{> license}}
    
{{> license}}
