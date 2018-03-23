<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ page import="org.springframework.context.ApplicationContext,
					com.red5pro.server.secondscreen.net.NetworkUtil,
					org.springframework.web.context.WebApplicationContext,
					com.infrared5.red5pro.examples.service.StreamListService,
					java.util.Map.Entry,
					java.util.Map,
					java.util.Iterator,
					java.net.Inet4Address"%>
    
    
    
   
  <%  
  //VOD streams list
  
  String ip =NetworkUtil.getLocalIpAddress();
  
  ApplicationContext appCtx = (ApplicationContext) application.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
  
  StreamListService service = (StreamListService)appCtx.getBean("vod");
  
  Map<String, Map<String, Object>> filesMap = service.getListOfAvailableFLVs();
  
	StringBuffer ret =new StringBuffer();

	
	Iterator<Entry<String, Map<String, Object>>> iter = filesMap.entrySet().iterator();
	while(iter.hasNext()){
		Entry<String, Map<String, Object>> entry = iter.next();
		String sName = entry.getKey();	
		
		ret.append("<b>"+sName+"</b><br/><a href=\"rtsp://"+ip+":8554/vod/"+sName+"\">rtsp "+sName+"</a><br />\r\n");
		
		ret.append( "<a href=\"flash.jsp?app=vod&host="+ip+"&stream="+sName+"\">flash "+sName+"</a><br />\r\n");
	}
  if(ret.length() == 0){	 
		  ret.append( "No available streams");	 
  }
  
  %>

  <%=ret.toString()%>
    
    
  
    