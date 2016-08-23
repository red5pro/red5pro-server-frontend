/* global WebSocket */

export default class Red5WebSocket {
  constructor (securityToken, interval = 1000, hostname = null, port = null) {
    this.securityToken = securityToken
    this.interval = interval
    this.hostname = hostname || window.location.hostname
    this.port = port || 8081
    this.url = `ws://${this.hostname}:${this.port}/api?accessToken=${this.securityToken}`
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
      // SharedObject Calls
      getSharedObjects: '/sharedobjects',
      getSharedObjectStatistics: '/sharedobjects/sharedobject/statistics',
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
  addConnection (apiCall = null, content = null) {
    if (!apiCall) {
      throw 'Must specify connection to add.' // eslint-disable-line no-throw-literal
    }
    this.currentConnections.push({
      apiCall: apiCall,
      content: content || []
    })
  }
  removeConnection (apiCall = null, content = null) {
    if (!apiCall) {
      throw 'Must specify connection to remove' // eslint-disable-line no-throw-literal
    }
    if (!content) {
      throw 'Must specify content of connection to remove. If unknown use "*". Warning this will remove all connections of the specified apiCall type.' // eslint-disable-line no-throw-literal
    }
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
        throw 'Error, must specify a Callback function' // eslint-disable-line no-throw-literal
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
