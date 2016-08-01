/* global fetch */
require('es6-promise').polyfill()
require('isomorphic-fetch')

export default class REST {
  constructor (securityToken) {
    this.host = window.location.hostname
    this.securityToken = securityToken
    this.apiCalls = {
      // Server Calls
      getServerInfo: `http://${this.host}/api/v1/server?accessToken=${this.securityToken}`,
      ping: `http://${this.host}/api/v1/server/ping?accessToken=${this.securityToken}`,
      getServerStatistics: `http://${this.host}/api/v1/server/statistics?accessToken=${this.securityToken}`,
      // Application Calls
      getApplications: `http://${this.host}/api/v1/applications?accessToken=${this.securityToken}`,
      getApplicationStatistics: `http://${this.host}/api/v1/applications/${this.contents.appname}?accessToken=${this.securityToken}`,
      invoke: `http://${this.host}/api/v1/applications/${this.contents.appname}/invoke?accessToken=${this.securityToken}`,
      // Steram Calls
      getLiveStreams: `http://${this.host}/api/v1/applications/${this.contents.appname}/streams?accessToken=${this.securityToken}`,
      getLiveStreamStatistics: `http://${this.host}/api/v1/applications/${this.contents.appname}/streams/${this.contents.streamname}?accessToken=${this.securityToken}`,
      recordLiveStream: `http://${this.host}/api/v1/applications/${this.contents.appname}/streams/${this.contents.streamname}/action/startrecord?accessToken=$t{this.securityToken}`,
      stopStreamRecord: `http://${this.host}/api/v1/applications/${this.contents.appname}/streams/${this.contents.streamname}/action/stoprecord?accessToken=$t{this.securityToken}`
    }
    this.contents = {
      appname: '',
      streamname: ''
    }
  }

  makeAPICall (apiCall) {
    fetch(this.apiCalls[apiCall])
      .then((response) => response.json())
      .then((json) => {
        console.log(json)
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
      // Steram Calls
      getLiveStreams: `http://${this.host}/api/v1/applications/${this.contents.appname}/streams?accessToken=${this.securityToken}`,
      getLiveStreamStatistics: `http://${this.host}/api/v1/applications/${this.contents.appname}/streams/${this.contents.streamname}?accessToken=${this.securityToken}`,
      recordLiveStream: `http://${this.host}/api/v1/applications/${this.contents.appname}/streams/${this.contents.streamname}/action/startrecord?accessToken=$t{this.securityToken}`,
      stopStreamRecord: `http://${this.host}/api/v1/applications/${this.contents.appname}/streams/${this.contents.streamname}/action/stoprecord?accessToken=$t{this.securityToken}`
    }
  }
}
