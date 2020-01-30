<%@ page import="org.springframework.context.ApplicationContext,
			com.red5pro.server.stream.Red5ProIO,
			org.springframework.web.context.WebApplicationContext,
			org.red5.server.api.scope.IScope,
			org.red5.server.adapter.MultiThreadedApplicationAdapter,
         	com.red5pro.server.stream.sdp.SessionDescription"%>
         
         <% 
         String host="live";
         if(request.getParameter("scope")!=null) {
           host=request.getParameter("scope");
         }
         
         
         ApplicationContext appCtx = (ApplicationContext) application.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
        
         MultiThreadedApplicationAdapter app = (MultiThreadedApplicationAdapter)appCtx.getBean("web.handler");
         
         IScope scope = app.getScope();
         %>
         

         <%
         String streamName="stream1";
         if(request.getParameter("name")!=null) {
        	 streamName=request.getParameter("name");
           }
         
         SessionDescription sdp = Red5ProIO.createSDP(scope, streamName);
         if(sdp==null){
        	 sdp=new SessionDescription();
         }
         %>
         
        <%=sdp.toString().replaceAll("\r\n", "<br />")  %>
