import REST from './components/restAPI.js'
import WS from './components/wsAPI.js'
// import LineGraph from './components/graph.js'
import LineGraph from './components/graph.js'

let restAPI = new REST('xyz123')
let websocket = new WS('xyz123', 2000)
let connectionsGraph = new LineGraph(document.getElementById('connectionsGraph'))
connectionsGraph.makeGraph()

restAPI.makeAPICall('getServerStatistics', null, (data) => {
  data = data.contents.data

  document.getElementById('OSName').innerHTML = data.os_name
  document.getElementById('OSVersion').innerHTML = data.os_version
  document.getElementById('Architecture').innerHTML = data.architecture
  document.getElementById('Red5Version').innerHTML = data.red5_pro_version
  document.getElementById('FMSVersion').innerHTML = data.fms_version

  document.getElementById('Processors').innerHTML = data.processors
})

websocket.addConnection('getServerStatistics')
websocket.openConnection((data, content, apiCall) => {
  data = data.data
  console.log(data.active_connections)
  console.log(data.total_memory)
  console.log(data.bytes_in)
})
