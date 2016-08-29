/* global fetch */

require('es6-promise').polyfill()
require('isomorphic-fetch')
import os from 'os'

export default class Red5RestApi {
  constructor (securityToken, hostname = null, port = null) {
    this.securityToken = securityToken || console.error('Must Specify A Security Token')
    this.hostname = hostname || os.hostname() || this.getBrowserHostname()
    this.port = port || 5080
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
      getIPAddress: {
        contents: ['ipaddress'],
        func: (contents) => {
          return `http://freegeoip.net/json/${contents.ipaddress}`
        }
      },
      // Server Calls
      getServerInfo: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/server?accessToken=${this.securityToken}`
        }
      },
      ping: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/server/ping?accessToken=${this.securityToken}`
        }
      },
      getServerStatistics: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/server/statistics?accessToken=${this.securityToken}`
        }
      },
      // Application Calls
      getApplications: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/applications?accessToken=${this.securityToken}`
        }
      },
      getApplicationStatistics: {
        contents: ['appname'],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/applications/${contents.appname}?accessToken=${this.securityToken}`
        }
      },
      invoke: {
        contents: ['appname'],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/applications/${contents.appname}/invoke?accessToken=${this.securityToken}`
        }
      },
      // VoD Calls
      getVodFiles: {
        contents: ['appname'],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/applications/${contents.appname}/media?accessToken=${this.securityToken}`
        }
      },
      deleteVodFile: {
        contents: ['appname', 'filename', 'extension'],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/applications/${contents.appname}/media?filename=${contents.filename}&extension=${contents.extension}&accessToken=${this.securityToken}`
        }
      },
      // SharedObject Calls
      getSharedObjects: {
        contents: ['appname'],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/applications/${contents.appname}/sharedobjects?accessToken=${this.securityToken}`
        }
      },
      getSharedObjectStatistics: {
        contents: ['appname', 'soname'],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/applications/${contents.appname}/sharedobjects/${this.soname}?accessToken=${this.securityToken}`
        }
      },
      // Stream Calls
      getLiveStreams: {
        contents: ['appname'],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/applications/${contents.appname}/streams?accessToken=${this.securityToken}`
        }
      },
      getLiveStreamStatistics: {
        contents: ['appname', 'streamname'],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/applications/${contents.appname}/streams/${contents.streamname}?accessToken=${this.securityToken}`
        }
      },
      recordLiveStream: {
        contents: ['appname', 'streamname'],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/applications/${contents.appname}/streams/${contents.streamname}/action/startrecord?accessToken=${this.securityToken}`
        }
      },
      stopStreamRecord: {
        contents: ['appname', 'streamname'],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/applications/${contents.appname}/streams/${contents.streamname}/action/stoprecord?accessToken=${this.securityToken}`
        }
      },
      // Client Calls
      getClients: {
        contents: ['appname'],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/applications/${contents.appname}/clients?accessToken=${this.securityToken}`
        }
      },
      getClientStatistics: {
        contents: ['appname', 'clientId'],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/applications/${contents.appname}/clients/${contents.clientId}?accessToken=${this.securityToken}`
        }
      },
      terminateClient: {
        contents: ['appname', 'clientId'],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/applications/${contents.appname}/clients/${contents.clientId}?accessToken=${this.securityToken}`
        }
      },
      terminateClients: {
        contents: ['appname'],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/api/v1/applications/${contents.appname}/clients?accessToken=${this.securityToken}`
        }
      },
      /* ---------------------------------------------------------------------------------------------------------------------------- */
      /* Stream Manager Calls*/

      // Groups
      createGroup: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/nodegroup?accessToken=${this.securityToken}`
        }
      },
      readGroup: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/nodegroup/${contents.groupname}?accessToken=${this.securityToken}`
        }
      },
      deleteGroup: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/nodegroup/${contents.groupname}?accessToken=${this.securityToken}`
        }
      },
      listGroups: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/nodegroup?accessToken=${this.securityToken}`
        }
      },
      listGroupNodes: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/nodegroup/${contents.groupname}/node?accessToken=${this.securityToken}`
        }
      },
      listGroupOrigins: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/nodegroup/${contents.groupname}/node/origin?accessToken=${this.securityToken}`
        }
      },
      listGroupEdges: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/nodegroup/${contents.groupname}/node/edge?accessToken=${this.securityToken}`
        }
      },
      launchNewOrigin: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/nodegroup/${contents.groupname}/node/origin?accessToken=${this.securityToken}`
        }
      },

      // Nodes
      readNode: {
        contents: ['hostaddresss'],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/node/${contents.hostaddress}?accessToken=${this.securityToken}`
        }
      },
      terminateNode: {
        contents: ['hostaddress'],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/streammanager/api/1.0/admin/node/${contents.hostaddress}?accessToken=${this.securityToken}`
        }
      },

      // Streams
      readStreamBroadcast: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/streammanager/api/1.0/event/${contents.scopename}/${contents.streamname}?action=broadcast`
        }
      },
      readStreamSubscribe: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/streammanager/api/1.0/event/${contents.scopename}/${contents.streamname}?action=broadcast`
        }
      },
      readStreamWithStats: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/streammanager/api/1.0/event/${contents.scopename}/${contents.streamname}/stats`
        }
      },
      listStreams: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/streammanager/api/1.0/event/list`
        }
      },
      listAllStreamsWithStats: {
        contents: [null],
        func: (contents) => {
          return `http://${this.hostname}:${this.port}/streammanager/api/1.0/event/list/stats`
        }
      }
    }
  }

  GET (apiCall, contents, cb) {
    if (!this.errorCheck(apiCall, contents, cb)) {
      return
    }

    fetch(this.apiCalls[apiCall].func(contents))
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
    if (!this.errorCheck(apiCall, contents, cb)) {
      return
    }

    fetch(this.apiCalls[apiCall].func(contents), {method: 'DELETE'})
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
  // if wrong apiCall. DONE.
  // if isn't a dict or null
  // if is dict but wrong keys
  // if null but needs args.
  // if no cb
  errorCheck (apiCall, contents, cb) {
    try {
      if (arguments.length !== 3) { // If invalid number of arguments
        throw { // eslint-disable-line no-throw-literal
          code: 0,
          apiCall: apiCall,
          contents: contents
        }
      }
      if (typeof apiCall !== 'string') { // If invalid type
        throw { // eslint-disable-line no-throw-literal
          code: 1,
          apiCall: apiCall,
          contents: contents
        }
      }
      if (!(apiCall in this.apiCalls)) { // If invalid apiCall.
        throw { // eslint-disable-line no-throw-literal
          code: 2,
          apiCall: apiCall,
          contents: contents
        }
      }
      if ((typeof contents !== 'object') && (contents !== null)) { // If invalid type.
        throw { // eslint-disable-line no-throw-literal
          code: 3,
          apiCall: apiCall,
          contents: contents
        }
      }
      if (typeof contents === 'object' && (contents !== null)) {
        let correctKeys = this.apiCalls[apiCall].contents
        let userKeys = Object.keys(contents)

        if (userKeys.length !== correctKeys.length) { // If incorrect number of contents passed.
          throw { // eslint-disable-line no-throw-literal
            code: 4,
            apiCall: apiCall,
            contents: contents
          }
        }
        userKeys.forEach((key) => {
          if (correctKeys.indexOf(key) === -1) { // If inncorrect key passed.
            throw { // eslint-disable-line no-throw-literal
              code: 5,
              apiCall: apiCall,
              contents: contents
            }
          }
        })
      }
      if (contents === null) {
        let correctKeys = this.apiCalls[apiCall].contents

        if (correctKeys[0] !== null) { // If incorrect null passed.
          throw { // eslint-disable-line no-throw-literal
            code: 6,
            apiCall: apiCall,
            contents: contents
          }
        }
      }
      if (typeof cb !== 'function') { // If invalid type
        throw { // eslint-disable-line no-throw-literal
          code: 7,
          apiCall: apiCall,
          contents: contents
        }
      }
      return true
    } catch (err) {
      if (err.code === 0) {
        console.warn(`Error: ${JSON.stringify(err.apiCall)}. Must pass three arguments.`)
        return false
      } else if (err.code === 1) {
        console.warn(`Error: ${JSON.stringify(err.apiCall)}. apiCall must be of type string`)
        return false
      } else if (err.code === 2) {
        console.warn(`Error: ${JSON.stringify(err.apiCall)}. Invalid apiCall. Make sure spellings are correct. For a list of valid apiCalls please reference https://www.red5pro.com/docs/server/serverapi/`)
        return false
      } else if (err.code === 3) {
        console.warn(`Error: ${JSON.stringify(err.apiCall)}. Contents: ${JSON.stringify(err.contents)} must be of type object (associative array) or null.`)
        return false
      } else if (err.code === 4) {
        console.warn(`Error: ${JSON.stringify(err.apiCall)}. Contents: ${JSON.stringify(err.contents)} contains the inncorrect number of key value pairs. Please reference https://www.red5pro.com/docs/server/serverapi/`)
      } else if (err.code === 5) {
        console.warn(`Error: ${JSON.stringify(err.apiCall)}. Contents: ${JSON.stringify(err.contents)}. Invalid content key. Make sure the key is spelled correctly and valid for this apiCall. For a list of valid content keys please reference https://www.red5pro.com/docs/server/serverapi/`)
        return false
      } else if (err.code === 6) {
        console.warn(`Error: ${JSON.stringify(err.apiCall)}. Passed null contents when expecting: ${this.apiCalls[err.apiCall].contents} as keys. For a list of valid content keys please reference https://www.red5pro.com/docs/server/serverapi/`)
        return false
      } else if (err.code === 7) {
        console.warn(`Error: ${JSON.stringify(err.apiCall)}. Callback must be of type function`)
        return false
      }
    }
  }
  getBrowserHostname () {
    try {
      return window.location.hostname
    } catch (err) {
      return console.error('Unable to detect a hostname. Please specify one.')
    }
  }
}
