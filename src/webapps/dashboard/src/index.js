import REST from './components/restAPI.js'
import WS from './components/wsAPI.js'
let restAPI = new REST('xyz123')
let websocket = new WS('xyz123')
websocket.addConnection('getServerStatistics')
websocket.openConnection((evt, content, apiCall) => {
  console.log(evt)
  console.log(content)
  console.log(apiCall)
})

restAPI.makeAPICall('getServerStatistics', null, (data) => {
  console.log(data)
  data = data.data
  document.getElementById('OSName').innerHTML = data.os_name
  document.getElementById('OSVersion').innerHTML = data.os_version
  document.getElementById('Architecture').innerHTML = data.architecture
  document.getElementById('Red5Version').innerHTML = data.red5_pro_version
  document.getElementById('FMSVersion').innerHTML = data.fms_version
})

