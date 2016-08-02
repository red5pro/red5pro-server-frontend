import REST from './components/restAPI.js'
import WS from './components/wsAPI.js'
import {LineGraph, BarGraph} from './components/graph.js'

let restAPI = new REST('xyz123')
let websocket = new WS('xyz123', 1000)

let connectionsGraph = new LineGraph(document.getElementById('connectionsGraph'))
// let memoryGraph = new DoughnutGraph(document.getElementById('memoryGraph'))
let bandwidthGraph = new BarGraph(document.getElementById('bandwidthGraph'))

connectionsGraph.makeGraph()
bandwidthGraph.makeGraph()
// memoryGraph.makeGraph()
// bandwidthGraph.makeGraph()

restAPI.makeAPICall('getServerStatistics', null, (data) => {
  console.log(data)
  data = data.data
  // Versino Information
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
  bandwidthGraph.updateGraph(data.bytes_in / (1024 * 1024 * 1024))
})
