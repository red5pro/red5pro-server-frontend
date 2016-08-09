import REST from './components/restAPI.js'
import WS from './components/wsAPI.js'
import {LineGraph, DoughnutGraph, BarGraph} from './components/graph.js'

let restAPI = new REST('xyz123')
let websocket = new WS('xyz123', 1000)

let connectionsGraph = new LineGraph(document.getElementById('connectionsGraph'), 'Connections', 'Server Connections')
let memoryGraph = new DoughnutGraph(document.getElementById('memoryGraph'), ['Free Memory', 'Used Memory'], 'Memory')
let bandwidthGraph = new BarGraph(document.getElementById('bandwidthGraph'), ['Bandwidth'], 'Bandwidth')

connectionsGraph.makeGraph()
memoryGraph.makeGraph()
bandwidthGraph.makeGraph()

restAPI.makeAPICall('getServerStatistics', null, (data) => {
  data = data.data

  // Version Information
  document.getElementById('OSName').innerHTML = data.os_name
  document.getElementById('OSVersion').innerHTML = data.os_version
  document.getElementById('Architecture').innerHTML = data.architecture
  document.getElementById('Red5Version').innerHTML = data.red5_pro_version
  document.getElementById('FMSVersion').innerHTML = data.fms_version

  // Server Statisitcs
  document.getElementById('Processors').innerHTML = data.processors
})

websocket.addConnection('getServerStatistics')
websocket.openConnection((data, content, apiCall) => {
  data = data.content.data

  // Graph Data
  connectionsGraph.updateGraph(data.active_connections)
  memoryGraph.updateGraph(convertMemory(data.free_memory, data.total_memory))
  bandwidthGraph.updateGraph((data.bytes_in / (1024 * 1024)).toFixed(2))

  // Uptime
  document.getElementById('Uptime').innerHTML = `${(data.uptime / 3600).toFixed(1)} seconds`
  document.getElementById('activeSubScopes').innerHTML = data.active_sub_scopes
  document.getElementById('totalSubScopes').innerHTML = data.total_sub_scopes
})

function convertMemory (free, total) {
  let used = total - free
  used = used / (1024 * 1024)
  free = free / (1024 * 1024)
  return [free.toFixed(2), used.toFixed(2)]
}
