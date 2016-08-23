/* global fetch */
require('es6-promise').polyfill()
require('isomorphic-fetch')

export default class Red5RESTAPI {
  constructor (securityToken, hostname = null, port = null) {
    this.hostname = hostname || window.location.hostname
    this.port = port || window.location.port
    this.securityToken = securityToken
    this.contents = {
      appname: '',
      filename: '',
      soname: '',
      streamname: '',
      extension: '',
      clientId: '',
      groupname: '',
      hostaddress: '',
      scopename: '',
      ipaddress: ''
    }
    this.apiCalls = {
      // IP Location Call
      getIPAddress: () => {
        return `http://freegeoip.net/json/${this.contents.ipaddress}`
      },
      // Server Calls
      getServerInfo: () => {
        return `http://${this.hostname}:${this.port}/api/v1/server?accessToken=${this.securityToken}`
      },
      ping: () => {
        return `http://${this.hostname}:${this.port}/api/v1/server/ping?accessToken=${this.securityToken}`
      },
      getServerStatistics: () => {
        return `http://${this.hostname}:${this.port}/api/v1/server/statistics?accessToken=${this.securityToken}`
      },
      // Application Calls
      getApplications: () => {
        return `http://${this.hostname}:${this.port}/api/v1/applications?accessToken=${this.securityToken}`
      },
      getApplicationStatistics: () => {
        return `http://${this.hostname}:${this.port}/api/v1/applications/${this.contents.appname}?accessToken=${this.securityToken}`
      },
      invoke: () => {
        return `http://${this.hostname}:${this.port}/api/v1/applications/${this.contents.appname}/invoke?accessToken=${this.securityToken}`
      },
      // VoD Calls
      getVodFiles: () => {
        return `http://${this.hostname}:${this.port}/api/v1/applications/${this.contents.appname}/media?accessToken=${this.securityToken}`
      },
      deleteVodFiles: () => {
        return `http://${this.hostname}:${this.port}/api/v1/applications/${this.contents.appname}/media?filename=${this.contents.filename}&extension=${this.contents.extension}&accessToken=${this.securityToken}`
      },
      // SharedObject Calls
      getSharedObjects: () => {
        return `http://${this.hostname}:${this.port}/api/v1/applications/${this.contents.appname}/sharedobjects?accessToken=${this.securityToken}`
      },
      getSharedObjectStatistics: () => {
        return `http://${this.hostname}:${this.port}/api/v1/applications/${this.contents.appname}/sharedobjects/${this.soname}?accessToken=${this.securityToken}`
      },
      // Stream Calls
      getLiveStreams: () => {
        return `http://${this.hostname}:${this.port}/api/v1/applications/${this.contents.appname}/streams?accessToken=${this.securityToken}`
      },
      getLiveStreamStatistics: () => {
        return `http://${this.hostname}:${this.port}/api/v1/applications/${this.contents.appname}/streams/${this.contents.streamname}?accessToken=${this.securityToken}`
      },
      recordLiveStream: () => {
        return `http://${this.hostname}:${this.port}/api/v1/applications/${this.contents.appname}/streams/${this.contents.streamname}/action/startrecord?accessToken=${this.securityToken}`
      },
      stopStreamRecord: () => {
        return `http://${this.hostname}:${this.port}/api/v1/applications/${this.contents.appname}/streams/${this.contents.streamname}/action/stoprecord?accessToken=${this.securityToken}`
      },
      // Client Calls
      getClients: () => {
        return `http://${this.hostname}:${this.port}/api/v1/applications/${this.contents.appname}/clients?accessToken=${this.securityToken}`
      },
      getClientStatistics: () => {
        return `http://${this.hostname}:${this.port}/api/v1/applications/${this.contents.appname}/clients/${this.contents.clientId}?accessToken=${this.securityToken}`
      },
      terminateClient: () => {
        return `http://${this.hostname}:${this.port}/api/v1/applications/${this.contents.appname}/clients/${this.contents.clientId}?accessToken=${this.securityToken}`
      },
      terminateClients: () => {
        return `http://${this.hostname}:${this.port}/api/v1/applications/${this.contents.appname}/clients?accessToken=${this.securityToken}}`
      },
      /* ---------------------------------------------------------------------------------------------------------------------------- */
      /* Stream Manager Calls*/

      // Groups
      createGroup: () => {
        return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/nodegroup?accessToken=${this.securityToken}`
      },
      readGroup: () => {
        return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/nodegroup/${this.contents.groupname}?accessToken=${this.securityToken}`
      },
      deleteGroup: () => {
        return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/nodegroup/${this.contents.groupname}?accessToken=${this.securityToken}`
      },
      listGroups: () => {
        return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/nodegroup?accessToken=${this.securityToken}`
      },
      listGroupNodes: () => {
        return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/nodegroup/${this.contents.groupname}/node?accessToken=${this.securityToken}`
      },
      listGroupOrigins: () => {
        return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/nodegroup/${this.contents.groupname}/node/origin?accessToken=${this.securityToken}`
      },
      listGroupEdges: () => {
        return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/nodegroup/${this.contents.groupname}/node/edge?accessToken=${this.securityToken}`
      },
      launchNewOrigin: () => {
        return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/nodegroup/${this.contents.groupname}/node/origin?accessToken=${this.securityToken}`
      },

      // Nodes
      readNode: () => {
        return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/node/${this.contents.hostaddress}?accessToken=${this.securityToken}`
      },
      terminateNode: () => {
        return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/node/${this.contents.hostaddress}?accessToken=${this.securityToken}`
      },

      // Streams
      readStreamBroadcast: () => {
        return `http://${this.hostname}:${this.port}/streammanager/api/1.0/event/${this.contents.scopename}/${this.contents.streamname}?action=broadcast`
      },
      readStreamSubscribe: () => {
        return `http://${this.hostname}:${this.port}/streammanager/api/1.0/event/${this.contents.scopename}/${this.contents.streamname}?action=broadcast`
      },
      readStreamWithStats: () => {
        return `http://${this.hostname}:${this.port}/streammanager/api/1.0/event/${this.contents.scopename}/${this.contents.streamname}/stats`
      },
      listStreams: () => {
        return `http://${this.hostname}:${this.port}/streammanager/api/1.0/event/list`
      },
      listAllStreamsWithStats: () => {
        return `http://${this.hostname}:${this.port}/streammanager/api/1.0/event/list/stats`
      }
    }
  }

  GET (apiCall, contents, cb) {
    if (contents) {
      Object.keys(contents).forEach((attr) => {
        try {
          if (!(attr in this.contents)) {
            throw `Invalid content key: ${attr}. Make sure spellings are correct. For a list of valid content keys please reference https://www.red5pro.com/docs/server/serverapi/` // eslint-disable-line no-throw-literal
          }
        } catch (err) {
          console.error(err)
        }
        this.contents[attr] = contents[attr]
      })
    }

    fetch(this.apiCalls[apiCall]())
      .then((response) => response.json())
      .then((json) => {
        if (cb) {
          cb(json)
        }
      })
      .catch((e) => {
        throw e
      })
  }

  DELETE (apiCall, contents, cb) {
    if (contents) {
      Object.keys(contents).forEach((attr) => {
        try {
          if (!(attr in this.contents)) {
            throw `Invalid content key: ${attr}. Make sure spellings are correct. For a list of valid content keys please reference https://www.red5pro.com/docs/server/serverapi/` // eslint-disable-line no-throw-literal
          }
        } catch (err) {
          console.error(err)
        }
        this.contents[attr] = contents[attr]
      })
    }

    fetch(this.apiCalls[apiCall](), {method: 'DELETE'})
      .then((response) => response.json())
      .then((json) => {
        if (cb) {
          cb(json)
        }
      })
      .catch((e) => {
        throw e
      })
  }
}
