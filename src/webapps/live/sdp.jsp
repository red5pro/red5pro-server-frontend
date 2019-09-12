<%@ page import="org.springframework.context.ApplicationContext,
{{> license}}
			com.red5pro.server.stream.Red5ProIO,
{{> license}}
			org.springframework.web.context.WebApplicationContext,
{{> license}}
			org.red5.server.api.scope.IScope,
{{> license}}
			org.red5.server.adapter.MultiThreadedApplicationAdapter,
{{> license}}
         	com.red5pro.server.stream.sdp.SessionDescription"%>
{{> license}}
         
{{> license}}
         <% 
{{> license}}
         String host="live";
{{> license}}
         if(request.getParameter("scope")!=null) {
{{> license}}
           host=request.getParameter("scope");
{{> license}}
         }
{{> license}}
         
{{> license}}
         
{{> license}}
         ApplicationContext appCtx = (ApplicationContext) application.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
{{> license}}
        
{{> license}}
         MultiThreadedApplicationAdapter app = (MultiThreadedApplicationAdapter)appCtx.getBean("web.handler");
{{> license}}
         
{{> license}}
         IScope scope = app.getScope();
{{> license}}
         %>
{{> license}}
         
{{> license}}

{{> license}}
         <%
{{> license}}
         String streamName="stream1";
{{> license}}
         if(request.getParameter("name")!=null) {
{{> license}}
        	 streamName=request.getParameter("name");
{{> license}}
           }
{{> license}}
         
{{> license}}
         SessionDescription sdp = Red5ProIO.createSDP(scope, streamName);
{{> license}}
         if(sdp==null){
{{> license}}
        	 sdp=new SessionDescription();
{{> license}}
         }
{{> license}}
         %>
{{> license}}
         
{{> license}}
        <%=sdp.toString().replaceAll("\r\n", "<br />")  %>
{{> license}}
