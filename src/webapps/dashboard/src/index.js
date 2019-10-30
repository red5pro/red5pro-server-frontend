import Red5RestApi from './components/restAPI.js'
import Red5WebSocket from './components/wsAPI.js'
import {LineGraph, DoughnutGraph} from './components/graph.js'
import {SECURITY_TOKEN, HOSTNAME, PORT, WS_PORT} from './components/constants.js'

// Instantiate Red5RestApi and Red5WebSocket.
let restAPI = new Red5RestApi(SECURITY_TOKEN, HOSTNAME, PORT)
let websocket = new Red5WebSocket(SECURITY_TOKEN, 1000, HOSTNAME, WS_PORT)

// Instantiate Graphs.
let connectionsGraph = new LineGraph(document.getElementById('connectionsGraph'), 'Connections', 'Server Connections')
let memoryGraph = new DoughnutGraph(document.getElementById('memoryGraph'), ['Free Memory (Mb)', 'Used Memory (Mb)'], 'Memory')

// Create Graphs.
connectionsGraph.makeGraph()
memoryGraph.makeGraph()

// Get Static Server Statistics.
restAPI.GET('getServerStatistics', null, (data) => {
  data = data.data

  // Update Browser With Response Data.
  document.getElementById('OSName').innerHTML = data.os_name
  document.getElementById('OSVersion').innerHTML = data.os_version
  document.getElementById('Architecture').innerHTML = data.architecture
  document.getElementById('Red5Version').innerHTML = data.red5_pro_version
  document.getElementById('FMSVersion').innerHTML = data.fms_version
  document.getElementById('Processors').innerHTML = data.processors
})

// Get Dynamic Server Statistics.
websocket.addConnection('getServerStatistics')
websocket.openConnection((data, content, apiCall) => {
  data = data.content.data

  // Update Graphs.

  // Connections.
  connectionsGraph.updateGraph(data.active_connections, [data.max_connections])

  // Memory.
  memoryGraph.updateGraph(convertMemory(data.free_memory, data.total_memory))

  // Server Uptime.
  document.getElementById('Uptime').innerHTML = `${(data.uptime / 1000).toFixed()} seconds`

  // Current Server Subscopes.
  document.getElementById('activeSubScopes').innerHTML = data.active_sub_scopes
  document.getElementById('totalSubScopes').innerHTML = data.total_sub_scopes
})

// Convert memory from bytes to Mb.
function convertMemory (free, total) {
  let used = total - free
  used = used / (1024 * 1024)
  free = free / (1024 * 1024)
  return [free.toFixed(2), used.toFixed(2)]
}
