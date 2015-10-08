Developer Documentation
===
This documentation pertains to developers maintaining the Red5 Pro Server FrontEnd project. There are several developer-related tasks and workflows that do not pertain to the End-Users of Red5 Pro; as such, the output generated from this project as a developer is the content that is available to End-Users.

Developing Pages For a WebApp
===
The site structure of a Red5 server - ultimately a tomcat server - is defined by the directories in the __webapps__ folder of the server.

Using Red5 Pro Server to serve pages while developing
---
1. Download the latest Red5 Pro Server: [https://account.red5pro.com/download](https://account.red5pro.com/download)
2. Unzip the download into a location you prefer. For the purposes of my development, I simply added it to the same location as my local checkout of this repository, then added that to the __.gitignore__ file (_red5pro-server_). You can do the same if you prefer.
3. Start the Red5 Pro server: 

```
$ cd red5pro-server
$ ./red5.sh
```

By default, Red5 Pro will start at [http://localhost:5080](http://localhost:5080).

Deploying to Red5 Pro Server
---

