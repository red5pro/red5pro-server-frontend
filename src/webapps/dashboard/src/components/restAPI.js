/* global fetch */
require('es6-promise').polyfill()
require('isomorphic-fetch')

export default class REST {
  constructor (securityToken) {
    this.host = window.location.host
    this.securityToken = securityToken
    this.contents = {
      appname: '',
      streamname: '',
      filename: '',
      extension: ''
    }
    this.apiCalls = {
      // Server Calls
      getServerInfo: `http://${this.host}/api/v1/server?accessToken=${this.securityToken}`,
      ping: `http://${this.host}/api/v1/server/ping?accessToken=${this.securityToken}`,
      getServerStatistics: `http://${this.host}/api/v1/server/statistics?accessToken=${this.securityToken}`,
      // Application Calls
      getApplications: `http://${this.host}/api/v1/applications?accessToken=${this.securityToken}`,
      getApplicationStatistics: `http://${this.host}/api/v1/applications/${this.contents.appname}?accessToken=${this.securityToken}`,
      invoke: `http://${this.host}/api/v1/applications/${this.contents.appname}/invoke?accessToken=${this.securityToken}`,
      // VoD Calls
      getVodFiles: `http://${this.host}/api/v1/applications/${this.contents.appname}/media?accessToken=${this.securityToken}`,
      deleteVodFiles: `http://${this.host}/api/v1/applications/${this.contents.appname}/media?filename=${this.contents.filename}&extension=${this.contents.extension}&accessToken=${this.securityToken}`,
      // Stream Calls
      getLiveStreams: `http://${this.host}/api/v1/applications/${this.contents.appname}/streams?accessToken=${this.securityToken}`,
      getLiveStreamStatistics: `http://${this.host}/api/v1/applications/${this.contents.appname}/streams/${this.contents.streamname}?accessToken=${this.securityToken}`,
      recordLiveStream: `http://${this.host}/api/v1/applications/${this.contents.appname}/streams/${this.contents.streamname}/action/startrecord?accessToken=${this.securityToken}`,
      stopStreamRecord: `http://${this.host}/api/v1/applications/${this.contents.appname}/streams/${this.contents.streamname}/action/stoprecord?accessToken=${this.securityToken}`
    }
  }

  makeAPICall (apiCall, contents, cb) {
    if (contents) {
      this.contents = contents
      this.updateCalls()
    }

    fetch(this.apiCalls[apiCall])
      .then((response) => response.json())
      .then((json) => {
        if (cb) {
          cb(json)
        }
      })
      .catch((e) => {
        console.log(e)
      })
  }

  makeDeleteCall (apiCall, contents, cb) {
    if (contents) {
      this.contents = contents
      this.updateCalls()
    }
    console.log(this.apiCalls[apiCall])

    fetch(this.apiCalls[apiCall], {method: 'DELETE'})
      .then((response) => response.json())
      .then((json) => {
        if (cb) {
          cb(json)
        }
      })
      .catch((e) => {
        console.log(e)
      })
  }
  updateCalls () {
    this.apiCalls = {
      // Server Calls
      getServerInfo: `http://${this.host}/api/v1/server?accessToken=${this.securityToken}`,
      ping: `http://${this.host}/api/v1/server/ping?accessToken=${this.securityToken}`,
      getServerStatistics: `http://${this.host}/api/v1/server/statistics?accessToken=${this.securityToken}`,
      // Application Calls
      getApplications: `http://${this.host}/api/v1/applications?accessToken=${this.securityToken}`,
      getApplicationStatistics: `http://${this.host}/api/v1/applications/${this.contents.appname}?accessToken=${this.securityToken}`,
      invoke: `http://${this.host}/api/v1/applications/${this.contents.appname}/invoke?accessToken=${this.securityToken}`,
      // VoD Calls
      getVodFiles: `http://${this.host}/api/v1/applications/${this.contents.appname}/media?accessToken=${this.securityToken}`,
      deleteVodFiles: `http://${this.host}/api/v1/applications/${this.contents.appname}/media?filename=${this.contents.filename}&extension=${this.contents.extension}&accessToken=${this.securityToken}`,
      // Steram Calls
      getLiveStreams: `http://${this.host}/api/v1/applications/${this.contents.appname}/streams?accessToken=${this.securityToken}`,
      getLiveStreamStatistics: `http://${this.host}/api/v1/applications/${this.contents.appname}/streams/${this.contents.streamname}?accessToken=${this.securityToken}`,
      recordLiveStream: `http://${this.host}/api/v1/applications/${this.contents.appname}/streams/${this.contents.streamname}/action/startrecord?accessToken=${this.securityToken}`,
      stopStreamRecord: `http://${this.host}/api/v1/applications/${this.contents.appname}/streams/${this.contents.streamname}/action/stoprecord?accessToken=${this.securityToken}`
    }
  }
}
