Red5 Pro Server Front-End
===
This project is the front-end facing default __webapps__ pages distributed with the Red5 Pro Server.

Table of Contents
===
* [Developer Quickstart](#developer-quickstart)
   * [Requirements](#requirements)
   * [Further Reading](#further-reading)
* [WebApps Directory Structure](#webapps-directory-structure)
  * [static](#static)
  * [template](#template)
  * [webapps](#webapps)
    * [root](#root)
    * [live](#live)
    * [secondscreen](#secondscreen)
    * [Creating A New WebApp?](#creating-a-new-webapp)
* [Developer Documentation](#developer-documentation)
  * [Quickstart](#quickstart)
  * [Developing Pages for a WebApp](#developing-pages for a WebApp)
    * [Using Red5 Pro Server](#using-red5-pro-server)
    * [Deploying to Red5 Pro Server](#deploying-to-red5-pro-server)
      * [Deploy](#deploy)
      * [Watch](#watch)
      * [Launch](#launch)
  * [How To Create a New WebApp](#how-to-create-a-new-webapp)
* [Continuous Integration](#continuous-integration)
* [Query Params](#query-params)

Developer Quickstart
===

```
$ npm install
$ npm run start
```
After the Red5 Pro Server is run, open a second terminal window pointing to your local checkout and:

```
$ npm run build
$ npm run launch
```

Requirements
---
* [NodeJS](https://nodejs.org/en/download/package-manager/) (>= 0.12)
* NPM (>= 2+)
* [Red5 Pro Server](https://account.red5pro.com/download) (see below)

Further Reading
---
More detailed information can be found toward the end of this documentation as it regards to build and live previewing while developing.

[Developer Documentation](#developer-documentation)

WebApps Directory Structure
===
This section describes the structure of the __src/__ directory and how it relates to building the client-side facing pages for the WebApps that commonly are accessed on a Red5/Pro Server at [http://localhost:5080](http://localhost:5080).

static
---
The __src/static__ directory contains all the static files that are copied to each webapp directory. Typically, these are common CSS, front, images and additional assets that are needed for most - if not all - webapps.

### additional information

---

#### crossdomain.xml
This cross-domain policy file allows a SWF loaded in the Flash Player install of a browser to make Cross Domain requests which is required for streaming media and data and well as HTTP requests.

template
---
The __src/template__ directory contains the templates and partials used in generating the webapp pages upon build. The [Handlebars](http://handlebarsjs.com/) templating library and its syntax are used to define and import templates and partials. The [gulp-compile-handlebars](https://www.npmjs.com/package/gulp-compile-handlebars) plugin is used to generate the pages.

### additional information

---

#### additional_info.hbs
This is a simple blurb about where to find additional information which is atached to the end of each front-facing webapp page.

#### applications.hbs
A blurb and links about where, why and how to get the native application examples on the Red5 Pro github account.

#### footer.hbs
The footer added ot each front-facing webapp page that includes copyright and contact information.

#### head_meta.hbs
The basic &lt;meta&gt; options for the header used on each front-facing webapp page.

#### header.hbs
The branding header attached to the top of each front-facing webapp page.

#### header_ip_field.hbs
The section to the top-right of each front-facing webapp page that shows the IP address from which the page is served, as well as the logic and dialogs for a user to change that value.

#### ip_address_script.hbs
The JavaScript logic behind _header_ip_field_.

#### jsp_header.hbs
The default JSP script added to each front-facing webapp page that accessing cookies and uses Java libraries to determine the IP address.

#### menu.hbs
The menu shown to the left-side of the content on each front-facing webapp page.

#### resources-secondscreen.hbs
Additional header resources for second screen example pages. Some documentation may need such additional headers because they will be nested documentation within a webapp directory.

#### resources.hbs
The resource link list added to each front-facing webapp page.

webapps
---
The __src/webapps__ is the top level directory for each webapp to be shipped along with released of the Red5 Pro Server.

Currently the Red5 Pro Server is shipped with the following webapps:

### root
The __root__ directory is the default directory entered when visiting the server in a browser, [http://localhost:5080](http://localhost:5080).

### live
The __src/webapps/live__ directory contains the webapp that demonstrates the pub/sub streaming capabilities of the Red5 Pro Server.

Subsciber and Broadcaster pages can be accessed from the landing page or directly through their respective _.jsp_ page. Additionally, there is a default plain subscriber page - __flash.jsp__ - that is a simple embed of Flash that reads in url parameters that are passed to the SWF to automatically begin subscribing to a stream.

The SWF files for broadcaster and subscriber are generated from the __flash-clients__ section of [the red5pro-server-examples repository](https://github.com/red5pro/red5pro-server-examples/tree/master/flash-clients).

### secondscreen
The __src/webapps/secondscreen__ directory contains the webapp that demonstrates the Second Screen capabilities of the Red5 Pro Server.

Additionally, there are subdirectories of different examples that show how to use the Second Screen HTML SDK and different control scheme flavors.

### Creating A New WebApp?
If you would like to create a new webapp, please refer to the [How To Create a New WebApp](#how-to-create-a-new-webapp) documentation.

Developer Documentation
===
This documentation pertains to developers maintaining the Red5 Pro Server FrontEnd project. There are several developer-related tasks and workflows that do not pertain to the End-Users of Red5 Pro; as such, the output generated from this project as a developer is the content that is available to End-Users.

Quickstart
---
```
$ npm install
$ npm run start
```
After the Red5 Pro Server is run, open a second terminal window pointing to your local checkout and:

```
$ npm run build
$ npm run launch
```

### Requirements

* [NodeJS](https://nodejs.org/en/download/package-manager/) (>= 0.12)
* NPM (>= 2+)
* [Red5 Pro Server](https://account.red5pro.com/download) (see below)

Developing Pages For a WebApp
---
The site structure of a Red5 server - ultimately a tomcat server - is defined by the directories in the __webapps__ folder of the server.

### Using Red5 Pro Server
It is recommended to download a copy of the Red5 Pro Server in order to continuously deploy updates while developing for view and testing.

1. Download the latest Red5 Pro Server: [https://account.red5pro.com/download](https://account.red5pro.com/download)
2. Unzip the download into a location you prefer. For the purposes of my development, I simply added it to the same location as my local checkout of this repository, then added that to the __.gitignore__ file (_red5pro-server_). You can do the same if you prefer.
  * If you decide to not download and unzip the Red5 Pro Server in this repository root, you will need to modify the location for `red5pro-server-local` in [settings.json](settings.json).
4. Start the Red5 Pro server:

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
$ npm run deploy:local
```

This command will run a new build and place the generated files in __webapps__.

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

How To Create a New WebApp
---
The following section describes how to easily start a new webapp to be distributed with the Red5 Pro Server.

The `new` task is available from the __gulp__ builds and takes a `--name` option:

```
$ npm run new -- --name=your-awesome-app
```

Be sure that the `your-awesome-app` value for the `--name` option is unique. This will be the directory name that will be generated in the __/webapps__ directory of the Red5 Pro Server. __If you do not provide a unique name, previous webapp files may be overwritten!__

### Generated Project & Build Task
Upon issuing the command above, the following will be generated:

* __src/webapps/your-awesome-app__ - The home directory for the webapp, along with the default __index.jsp__ file and necessary _WEB-INF_ directory and contents.
* __scripts/task/webapp/your-awesome-app.js__ - The default build file for your webapp which will be loaded into the build process. Modify as seen fit (comments are included).

### Viewing Your New WebApp
_You will need to restart the target Red5 Pro Server in order to see your webapp on [http://localhost:5080/your-awesome-app](http://localhost:5080/your-awesome-app)_.

Do as you normally would when starting development:
```
$ npm run build
$ npm run deploy:local
$ npm run watch
```

These commands will 1) build the new webapp into the distribution directory 2) deploy the webapp to the target Red5 Pro Server and 3) start watching changes to the webapp files to enable live preview.

Continuous Integration
===
This project is not added as a solo project for Continuous Integration (CI) in the Red5 Pro CI. Instead, this project is pulled, built and distributed on CI of the Red5 Pro Server.

[![Analytics](https://ga-beacon.appspot.com/UA-59819838-3/red5pro/red5pro-server-frontend?pixel)](https://github.com/igrigorik/ga-beacon)

Query Params
===
There are several Query Parameters you can add to the URL to modify settings when viewing the Front-End within the distribution of the Red5 Pro Server.

| Query Param Name | Type | Description | Default Value |
| --- | --- | --- | --- |
| `view` | String | Target tech view to display. `rtc`, `rtmp` or `hls` (Subscriber only). | Allows SDK to failover. |
| `ice` | String | Target ICE servers to use in WebRTC transactions. `google` or `moz` | Allows browser to choose. |
| `audioBW` | Integer | Requested Audio Bandwidth (Publisher only) | `50` |
| `videoBW` | Integer | Request Video Bandwidth (Publisher only) | `256` |
| `videoWidthMin` | Integer | Request Minimum Video Width  (Publisher only) | `320` |
| `videoHeightMin` | Integer | Request Minimum Video Height (Publisher only) | `240` |
| `videoWidthMax` | Integer | Request Maximum Video Width (Publisher only) | `352` |
| `videoHeightMax` | Integer | Request Maximum Video Height (Publisher only) | `288` |
| `framerateMin` | Integer | Request Minimum Framerate (Publisher only) | `8` |
| `framerateMax` | Integer | Request Maximum Framerate (Publisher only) | `24` |

> The publisher-only min/max values are desired settings mostly for WebRTC. See [https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).

## Usage
To use a query param, append it to the URL with the first parameter prepended with `?` and following parameters prepended with `&`.

For example:

```sh
http://localhost:5080/live/broadcast.jsp?view=rtc&ice=google`
```
