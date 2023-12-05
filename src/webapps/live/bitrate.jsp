<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ page import="org.springframework.context.ApplicationContext,
					com.red5pro.override.ProStream,
					org.springframework.web.context.WebApplicationContext,
					com.infrared5.red5pro.live.Red5ProLive,					
					com.google.gson.*"%>
					
					
<% 

	String path = "live";

	String name = "stream1";
	
	if (request.getParameter("path") != null) {
		path = request.getParameter("path");
	}
	
	if (request.getParameter("name") != null) {
		name = request.getParameter("name");
	}
	
	ApplicationContext appCtx = (ApplicationContext) application.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
	JsonObject ret = new JsonObject();
	Red5ProLive app = (Red5ProLive)appCtx.getBean("web.handler");

	ProStream stream = (ProStream) app.getStream(path, name);
	if(stream!=null){
		double bitrate  = stream.getAverageVideoBitrate();
		ret.addProperty("bitrate", bitrate);
		ret.addProperty("byterate",bitrate/8.0 );
	}
	response.getOutputStream().write(ret.toString().getBytes());
%>