import REST from './components/restAPI.js'
import WS from './components/wsAPI.js'
import {LineGraph, BarGraph, MAP} from './components/graph.js'
import {DemoVideoHandler, DemoSocketHandler} from './components/HLS.js'

let restAPI = new REST('xyz123')
let websocket = new WS('xyz123')

let connectionsGraph = new LineGraph(document.getElementById('connectionsGraph'))
let bandwidthGraph = new BarGraph(document.getElementById('bandwidthGraph'))
let map = new MAP(document.getElementById('dataMap'), document.getElementById('mapData').offsetWidth)

let activeClients = {}

connectionsGraph.makeGraph()
bandwidthGraph.makeGraph()
map.makeMap()

document.getElementById('viewMap').onclick = viewMap

restAPI.makeAPICall('getApplications', null, (applications) => {
  applications.data.forEach((application) => {
    if (application !== 'dashboard') {
      activeClients[application] = []
      websocket.addConnection('getLiveStreams', [application])
    }
  })
})

websocket.openConnection((data, content, apiCall) => {
  switch (apiCall) {
    case 'getLiveStreams':
      const newClients = data.content.data || []
      const oldClients = activeClients[content[0]] || []

      if (arraysEqual(newClients, oldClients)) {
        return
      }

      const addClients = filterConnections(newClients, oldClients)
      const removeClients = filterConnections(oldClients, newClients)

      if (removeClients) {
        removeClients.forEach((clientToTerminate) => {
          document.getElementById(clientToTerminate).remove()
        })
      }

      if (addClients) {
        addClients.forEach((clientToAdd) => {
          // Add Client UI
          let tr = document.createElement('tr')
          tr.id = clientToAdd

          let td = document.createElement('td')
          td.onclick = getMoreStreamInfo
          td.innerHTML = clientToAdd
          td.id = `${content[0]}:${clientToAdd}`

          tr.appendChild(td)
          document.getElementById('activeConnectionsTableBody').appendChild(tr)
          /* For API v2 – Make restAPI call to get publisher and subscriber ip addresses, determine location, and update bubbles
          */

          // map.addPublisher(origin, name)
          // map.addSubscriber(origin, destination, name)
        })
      }
      activeClients[content[0]] = newClients

      break
    case 'getLiveStreamStatistics':
      if (data.content.code !== 200) {
        websocket.removeConnection('getLiveStreamStatistics', content)
        document.getElementById('streamData').style.display = 'none'
        break
      }
      connectionsGraph.updateGraph(data.content.data.active_subscribers)
      bandwidthGraph.updateGraph(data.content.data.bytes_recieved / (1024 * 1024))
      break

    default:

      break
  }
})

function arraysEqual (a, b) {
  if (a.length !== b.length) {
    return false
  }
  for (let ii = 0; ii < a.length; ii++) {
    if (a.indexOf(b[ii]) === -1) {
      return false
    }
  }
  for (let jj = 0; jj < b.length; jj++) {
    if (b.indexOf(a[jj]) === -1) {
      return false
    }
  }
  return true
}

function filterConnections (a, b) {
  return a.filter((element) => {
    if (b.indexOf(element) === -1) {
      return true
    }
    return false
  })
}

function getMoreStreamInfo () {
  let content = this.id.split(':')

  // Manipulate DOM elements
  document.getElementById('streamData').style.display = 'block'
  document.getElementById('mapData').style.display = 'none'
  document.getElementById('viewMap').style.display = 'block'
  document.getElementById('streamDataLabel').innerHTML = `${content[1]}`
  document.getElementById('streamVid').remove()

  // Create some elements
  const recordButton = document.getElementById('recordStream')
  const video = document.createElement('video')

  recordButton.style.display = 'block'
  recordButton.name = this.id
  recordButton.onclick = toggleRecord

  video.id = 'streamVid'

  // Reset video DOM
  document.getElementById('streamVidParent').appendChild(video)

  // Reset graphs and connections
  connectionsGraph.reset(`Connections to Stream ${content[1]}`)
  bandwidthGraph.reset('Bandwidth')

  websocket.removeConnection('getLiveStreamStatistics', '*')
  websocket.addConnection('getLiveStreamStatistics', [content[0], content[1]])

  // Add HLS
  ;(function () {
    'use strict'
    const videoHandler = new DemoVideoHandler()
    const socketHandler = new DemoSocketHandler(videoHandler) // eslint-disable-line no-unused-vars

    videoHandler.onChange(content[0], content[1])
    socketHandler.onChange(content[0], content[1])
  })()

  // Format some video presets
  document.getElementById('streamVid_html5_api').controls = true
  document.querySelector('.vjs-big-play-button').display = 'none'
}

function toggleRecord () {
  let content = this.name.split(':')

  restAPI.makeAPICall('getLiveStreamStatistics', {
    appname: content[0],
    streamname: content[1]
  }, (recording) => {
    if (recording.data.is_recording) {
      stopRecord(content)
      this.innerHTML = 'Record Stream'
    } else {
      startRecord(content)
      this.innerHTML = 'Stop Record'
    }
  })
}

function startRecord (content) {
  restAPI.makeAPICall('recordLiveStream', {
    appname: content[0],
    streamname: content[1]
  }, (blank) => {
    console.log('Recording Stream')
  })
  document.getElementById(`${content[0]}:${content[1]}`).innerHTML = content[1] + ' &#x25cf;'
}

function stopRecord (content) {
  restAPI.makeAPICall('stopStreamRecord', {
    appname: content[0],
    streamname: content[1]
  }, (blank) => {
    console.log('Recording Terminated')
  })
  document.getElementById(`${content[0]}:${content[1]}`).innerHTML = content[1]
}

function viewMap () {
  document.getElementById('mapData').style.display = 'block'
  document.getElementById('streamData').style.display = 'none'
  document.getElementById('recordStream').style.display = 'none'

  websocket.removeConnection('getLiveStreamStatistics', '*')
  this.style.display = 'none'
}
