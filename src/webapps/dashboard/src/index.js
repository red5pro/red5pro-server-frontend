import Red5RESTAPI from './components/restAPI.js'
import Red5WebSocket from './components/wsAPI.js'
import {LineGraph, DoughnutGraph} from './components/graph.js'

const SECURITY_TOKEN = 'xyz123'
const HOSTNAME = window.location.hostname
const PORT = window.location.port

// Instantiate Red5RESTAPI and Red5WebSocket
let restAPI = new Red5RESTAPI(SECURITY_TOKEN, HOSTNAME, PORT)
let websocket = new Red5WebSocket(SECURITY_TOKEN)

// Instantiate graphs
let connectionsGraph = new LineGraph(document.getElementById('connectionsGraph'), 'Connections', 'Server Connections')
let memoryGraph = new DoughnutGraph(document.getElementById('memoryGraph'), ['Free Memory (Mb)', 'Used Memory (Mb)'], 'Memory')

// Create graphs
connectionsGraph.makeGraph()
memoryGraph.makeGraph()

// Get static server statistics
restAPI.GET('getServerStatistics', null, (data) => {
  data = data.data

  // Update browser with response data
  document.getElementById('OSName').innerHTML = data.os_name
  document.getElementById('OSVersion').innerHTML = data.os_version
  document.getElementById('Architecture').innerHTML = data.architecture
  document.getElementById('Red5Version').innerHTML = data.red5_pro_version
  document.getElementById('FMSVersion').innerHTML = data.fms_version
  document.getElementById('Processors').innerHTML = data.processors
})

// Get dynamic server statistics
websocket.addConnection('getServerStatistics')
websocket.openConnection((data, content, apiCall) => {
  data = data.content.data

  // Update graph
  connectionsGraph.updateGraph(data.active_connections, [data.max_connections])
  memoryGraph.updateGraph(convertMemory(data.free_memory, data.total_memory))

  // Server uptime
  document.getElementById('Uptime').innerHTML = `${(data.uptime / 1000).toFixed()} seconds`

  // Current server subscopes
  document.getElementById('activeSubScopes').innerHTML = data.active_sub_scopes
  document.getElementById('totalSubScopes').innerHTML = data.total_sub_scopes
})

// Convert memory from bytes to Mb
function convertMemory (free, total) {
  let used = total - free
  used = used / (1024 * 1024)
  free = free / (1024 * 1024)
  return [free.toFixed(2), used.toFixed(2)]
}
