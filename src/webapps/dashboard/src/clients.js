/* global videojs */

import REST from './components/restAPI.js'
import WS from './components/wsAPI.js'
import {LineGraph, BarGraph, MAP} from './components/graph.js'

let restAPI = new REST('xyz123')
let websocket = new WS('xyz123')

let connectionsGraph = new LineGraph(document.getElementById('connectionsGraph'), 'Connections', 'Server Connections')
let bandwidthGraph = new BarGraph(document.getElementById('bandwidthGraph'), ['Bandwidth'], 'Bandwidth')
let map = new MAP(document.getElementById('dataMap'), document.getElementById('mapData').offsetWidth)

let player = videojs('streamVid', {
  techorder: [
    // 'html5',
    'flash'
  ]
})

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

websocket.addConnection('getServerStatistics')

websocket.openConnection((data, content, apiCall) => {
  switch (apiCall) {
    case 'getLiveStreams':
      const newClients = data.content.data || []
      const oldClients = activeClients[content[0]] || []
      if (arraysEqual(newClients, oldClients)) {
        return
      }
      if (document.getElementById('NA')) {
        document.getElementById('NA').remove()
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
          document.querySelector('.activeTableBody').appendChild(tr)
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
    case 'getClientStatistics':
      /* For API v2 – Make WS call to get publisher and subscriber ip addresses, determine location, and update bubbles

        let subscriberIp = get IP Address
        let publisherIp = get IP Address

        if (publisher) {
          origin = location(publisherIp)
        }
        if (subscriber) {
          origin = location(subscriberIp)
          destination = location(publisherIp)
        }

        map.addPublisher(origin, name)
        map.addSubscriber(origin, destination, name)
        origin && destination in format [longitude, latitude]

      */
      break
    case 'getServerStatistics':
      if (document.getElementById('NA')) {
        break
      }
      if (data.content.data.active_connections < 1) {
        let tr = document.createElement('tr')
        let td = document.createElement('td')
        tr.id = 'NA'
        td.innerHTML = 'No streams are currently active'
        tr.appendChild(td)

        document.querySelector('.activeTableBody').appendChild(tr)
      }

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
  console.log(content[1])
  player.pause()
  player.src([
    // {
    //   type: 'application/x-mpegURL',
    //   src: `http://localhost:5080/${content[0]}/${content[1]}.m3u8`
    // },
    {
      type: 'application/x-shockwave-flash',
      src: `rtmp://192.168.0.133/${content[0]}/${content[1]}`
    }])
  player.play()

  // Manipulate DOM elements
  document.getElementById('streamData').style.display = 'block'
  document.getElementById('mapData').style.display = 'none'
  document.getElementById('viewMap').style.display = 'block'
  // document.getElementById('streamVid_html5_api').controls = true

  // Create some elements
  const recordButton = document.getElementById('recordStream')

  recordButton.style.display = 'block'
  recordButton.name = this.id
  recordButton.onclick = toggleRecord

  // Make sure the record button is labeled and colored correctly
  restAPI.makeAPICall('getLiveStreamStatistics', {
    appname: content[0],
    streamname: content[1]
  }, (recording) => {
    if (recording.data.is_recording) {
      recordButton.innerHTML = 'Stop Record'
      recordButton.style.backgroundColor = '#E31900'
    } else {
      recordButton.innerHTML = 'Record Stream'
      recordButton.style.backgroundColor = '#a8a8a8'
    }
  })

  // Reset graphs and connections
  connectionsGraph.reset(`Connections to Stream ${content[1]}`)
  bandwidthGraph.reset('Bandwidth')

  websocket.removeConnection('getLiveStreamStatistics', '*')
  websocket.addConnection('getLiveStreamStatistics', [content[0], content[1]])

  // Highlight selected stream
  let rows = document.getElementsByTagName('td')
  for (let ii = 0; ii < rows.length; ii++) {
    rows[ii].style.backgroundColor = ''
  }
  this.style.backgroundColor = '#a8a8a8'
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
  document.getElementById('recordStream').style.backgroundColor = '#E31900'
}

function stopRecord (content) {
  restAPI.makeAPICall('stopStreamRecord', {
    appname: content[0],
    streamname: content[1]
  }, (blank) => {
    console.log('Recording Terminated')
  })
  document.getElementById(`${content[0]}:${content[1]}`).innerHTML = content[1]
  document.getElementById('recordStream').style.backgroundColor = '#a8a8a8'
}

function viewMap () {
  document.getElementById('mapData').style.display = 'block'
  document.getElementById('streamData').style.display = 'none'
  document.getElementById('recordStream').style.display = 'none'

  websocket.removeConnection('getLiveStreamStatistics', '*')
  this.style.display = 'none'
}

