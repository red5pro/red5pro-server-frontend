Developer Documentation
===
This documentation pertains to developers maintaining the Red5 Pro Server FrontEnd project. There are several developer-related tasks and workflows that do not pertain to the End-Users of Red5 Pro; as such, the output generated from this project as a developer is the content that is available to End-Users.

Quickstart
===
```
$ npm install
$ npm run start
$ npm run build
$ npm run launch
```

### Requirements

* [NodeJS](https://nodejs.org/en/download/package-manager/) (>= 0.10)
* NPM (>= 1+)
* [Red5 Pro Server](https://account.red5pro.com/download) (see below)

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

### Deploy
To deploy a build of the pages to the local Red5 Pro Server:

```
$ npm run deploy
```

This command will run a new build and place the generated files in /webapps.

### Watch
_This build options requires you to have a Red5 Pro Server installed on your machine and its location defined in the [settings.json](settings.json) under the __red5pro-server__ param_

To interactively develop the pages that are generated and deployed to the local Red5 Pro Server:

```
$ npm run watch
```

This will watch the source files and re-generate the build upon any changes, allowing you to actively develop without having to restart the server or manually deploy each time.

__You will need to install the [Live Reload Plugin](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en) for your browser.__

### Launch
_This build options requires you to have a Red5 Pro Server installed on your machine and its location defined in the [settings.json](settings.json) under the __red5pro-server__ param_

To just launch the alreayd built and deployed pages in your system's default browser:

```
$ npm run launch
```

Continuous Integration
===
This project is not added as a solo project for Continuous Integration (CI) in the Red5 Pro CI. Instead, this project is pulled, built and distributed on CI of the Red5 Pro Server.
