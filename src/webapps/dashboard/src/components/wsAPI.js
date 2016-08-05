/* global WebSocket */

export default class WS {
  constructor (securityToken = 'xyz123', interval = 1000) {
    this.securityToken = securityToken
    this.interval = interval
    this.url = `ws://${window.location.hostname}:8081/api?accessToken=${this.securityToken}`
    this.wsCalls = {
      // Server Calls
      getServerInfo: '/server',
      ping: '/server/ping',
      getServerStatistics: '/server/statistics',
      // Application Calls
      getApplications: '/applications',
      getApplicationStatistics: '/applications/application/statistics',
      invoke: '/applications/application/invoke',
      // VoD Calls
      getVodFiles: '/media',
      deleteVodFile: '/media/delete',
      // Stream Calls
      getLiveStreams: '/streams',
      getLiveStreamStatistics: '/streams/stream/statistics',
      recordLiveStream: '/streams/stream/action/startrecord',
      stopStreamRecord: '/streams/stream/action/stoprecord',
      // Client Calls
      getClients: '/clients',
      getClientStatistics: '/clients/client/statistics',
      terminateClient: '/clients/client/delete',
      terminateClients: '/clients/delete'
    }
    this.currentConnections = []
  }
  addConnection (apiCall, content) {
    this.currentConnections.push({
      apiCall: apiCall,
      content: content || []
    })
  }
  removeConnection (apiCall, content) {
    this.currentConnections.forEach((connection, index) => {
      if ((connection.apiCall === apiCall) && ((connection.content === content) || (content === '*'))) {
        this.currentConnections.splice(index, 1)
      }
    })
  }
  openConnection (cb = null) {
    let socket = new WebSocket(this.url, 'api')
    let currentConnections = this.currentConnections
    let wsCalls = this.wsCalls
    let interval = this.interval

    socket.onopen = function () {
      setInterval(() => {
        currentConnections.forEach((connection) => {
          let request = {}
          request.invocation_id = new Date().getTime().toString()
          request.type = 'RMI'
          request.path = wsCalls[connection.apiCall]
          request.content = connection.content

          let payload = JSON.stringify(request)
          socket.send(payload)
        })
      }, interval)
    }

    socket.onmessage = function (evt) {
      if (!cb) {
        return console.log('Error, must specify a Callback function')
      }
      cb(JSON.parse(evt.data), currentConnections[0].content, currentConnections[0].apiCall)

      let first = currentConnections.shift()
      currentConnections.push(first)
    }

    socket.onclose = function () {
      // Websocket is closed.
    }

    socket.onerror = function (event) {
     // Websocket onerror
    }
  }
}
