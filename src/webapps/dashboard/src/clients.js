import REST from './components/restAPI.js'
import WS from './components/wsAPI.js'
import {LineGraph, BarGraph, MAP} from './components/graph.js'
import videojs from 'video.js'
import Hls from 'videojs-contrib-hls' // eslint-disable-line no-unused-vars

// Initialize restAPI and websocket
let restAPI = new REST('xyz123')
let websocket = new WS('xyz123')

// Initialize graphs
let connectionsGraph = new LineGraph(document.getElementById('connectionsGraph'), 'Connections', 'Server Connections')
let bandwidthGraph = new BarGraph(document.getElementById('bandwidthGraph'), ['Bandwidth'], 'Bandwidth')
let map = new MAP(document.getElementById('dataMap'), document.getElementById('mapData').offsetWidth)
let activeClients = {}
let player = videojs('streamVid', {
  techorder: [
    'html5',
    'flash'
  ]
})

window.onresize = () => {
  document.getElementById('streamVidParent').style.height = document.getElementById('streamVidParent').offsetWidth * 0.5 + 'px'
  if (document.getElementById('streamVid_Flash_api')) {
    document.getElementById('streamVid_Flash_api').style.height = document.getElementById('streamVid_Flash_api').offsetWidth * 0.5 + 'px'
  }
}
// Initialize object to keep track of active clients (stream)

// Plot
connectionsGraph.makeGraph()
bandwidthGraph.makeGraph()
map.makeMap()

map.addPublisher([42.309736, -71.115143], 'Infrared5')
map.addSubscriber([64.200841, -149.493673], [42.309736, -71.115143], 'Random Alaskan Dude')
map.addSubscriber([35.861660, 104.195397], [42.309736, -71.115143], 'B')
map.addSubscriber([-8.783195, 34.508523], [42.309736, -71.115143], 'C')
map.addSubscriber([-25.274398, 133.775136], [42.309736, -71.115143], 'D')
map.addSubscriber([-14.235004, -51.925280], [42.309736, -71.115143], 'E')
// DOM housekeeping
document.getElementById('viewMap').onclick = viewMap

// Get active applications
restAPI.makeAPICall('getApplications', null, (applications) => {
  applications.data.forEach((application) => {
    if (application !== 'dashboard') {
      activeClients[application] = []
      websocket.addConnection('getLiveStreams', [application])
    }
  })
})

// add WS call and establish connection
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
          const tr = document.createElement('tr')
          tr.id = clientToAdd

          const td = document.createElement('td')
          td.onclick = getMoreStreamInfo

          const recordButton = document.getElementById('recordStream')

          restAPI.makeAPICall('getLiveStreamStatistics', {
            appname: content[0],
            streamname: clientToAdd
          }, (recording) => {
            if (recording.data.is_recording) {
              recordButton.innerHTML = 'Stop Record'
              recordButton.style.backgroundColor = '#E31900'
              td.innerHTML = clientToAdd + ' &#x25cf;'
            } else {
              recordButton.innerHTML = 'Record Stream'
              recordButton.style.backgroundColor = ''
              td.innerHTML = clientToAdd
            }
          })
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
      bandwidthGraph.updateGraph(data.content.data.bytes_received / (1024 * 1024))
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
        *origin && destination in format [latitude, longitude]*

      */
      // map.addSubscriber(, [-71.115143, 42.309736], name)
      // map.addSubscriber(origin, [-71.115143, 42.309736], name)
      // map.addSubscriber(origin, [-71.115143, 42.309736], name)
      // map.addSubscriber(origin, [-71.115143, 42.309736], name)
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

  // Pause player, edit source based on clicked stream, play
  player.pause()
  player.src([
    {
      type: 'application/x-mpegURL',
      src: `http://localhost:5080/${content[0]}/${content[1]}.m3u8`
    },
    {
      type: 'rtmp/x-flv',
      src: `rtmp://192.168.0.133/${content[0]}/${content[1]}`
    }])
  player.play()

  // Manipulate DOM elements
  document.getElementById('streamData').style.display = 'block'
  document.getElementById('streamData').style.width = '90%'
  document.getElementById('streamData').style.height = '100%'
  document.getElementById('mapData').style.display = 'none'
  document.getElementById('viewMap').style.display = 'block'

  if (document.getElementById('streamVid_html5_api')) {
    document.getElementById('streamVid_html5_api').controls = true
  }
  const recordButton = document.getElementById('recordStream')
  // Create some elements

  restAPI.makeAPICall('getLiveStreamStatistics', {
    appname: content[0],
    streamname: content[1]
  }, (recording) => {
    if (recording.data.is_recording) {
      recordButton.innerHTML = 'Stop Record'
      recordButton.style.backgroundColor = '#E31900'
    } else {
      recordButton.innerHTML = 'Record Stream'
      recordButton.style.backgroundColor = ''
    }
  })

  recordButton.style.display = 'block'
  recordButton.name = this.id
  recordButton.onclick = toggleRecord

  // Reset graphs and connections
  connectionsGraph.reset(`Connections to Stream ${content[1]}`)
  bandwidthGraph.reset('Bandwidth')

  // Change WS connection to new stream
  websocket.removeConnection('getLiveStreamStatistics', '*')
  websocket.addConnection('getLiveStreamStatistics', [content[0], content[1]])

  // Highlight selected stream
  let rows = document.getElementsByTagName('td')
  for (let ii = 0; ii < rows.length; ii++) {
    // rows[ii].style.backgroundColor = ''
    rows[ii].style.color = ''
  }
  // this.style.backgroundColor = '#a8a8a8'
  this.style.color = '#E31900'

  document.getElementById('streamVidParent').style.height = document.getElementById('streamVidParent').offsetWidth * 0.5 + 'px'
  if (document.getElementById('streamVid_Flash_api')) {
    document.getElementById('streamVid_Flash_api').style.height = document.getElementById('streamVid_Flash_api').offsetWidth * 0.5 + 'px'
  }
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
  document.getElementById('recordStream').style.backgroundColor = ''
}

function viewMap () {
  document.getElementById('mapData').style.display = 'block'
  document.getElementById('streamData').style.width = '0%'
  document.getElementById('streamData').style.height = '0%'
  document.getElementById('recordStream').style.display = 'none'

  let rows = document.getElementsByTagName('td')
  for (let ii = 0; ii < rows.length; ii++) {
    // rows[ii].style.backgroundColor = ''
    rows[ii].style.color = ''
  }

  websocket.removeConnection('getLiveStreamStatistics', '*')
  this.style.display = 'none'
}
