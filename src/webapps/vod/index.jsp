<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ page import="com.red5pro.server.secondscreen.net.NetworkUtil"%>
					<head>
					<title>Red5Pro Video On Demand</title>
					</head>
					
		<b>Your server IP address is <%= NetworkUtil.getLocalIpAddress()%></b>
		<br />
		<hr/>
		If you have not downloaded and installed one of the mobile apps, get them here:
		<br/>
		<br />
		Link Playstore
		<br />
		<br />
		Link iTunes
		<br />
		<br />
		Start the app you have chosen, and enter the IP into the provided IP settings box.					
		<hr/>		
		Once you have the application installed, you can get a list of videos for playback <a href="streams.jsp">here</a>. 
		<br />			
		For the Video-On-Demand experience, click <a href="/vod">here</a>
		<br />						
		For the Second Screen experience, click <a href="/secondscreen">here</a>
		<br />						