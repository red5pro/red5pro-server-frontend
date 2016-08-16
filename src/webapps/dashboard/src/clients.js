import REST from './components/restAPI.js'
import WS from './components/wsAPI.js'
import {LineGraph, MAP} from './components/graph.js'
import videojs from 'video.js'
import Hls from 'videojs-contrib-hls' // eslint-disable-line no-unused-vars

// Initialize restAPI and websocket
let restAPI = new REST('xyz123')
let websocket = new WS('xyz123')

// Initialize graphs
let connectionsGraph = new LineGraph(document.getElementById('connectionsGraph'), 'Connections', 'Server Connections')
let map = new MAP(document.getElementById('dataMap'), document.getElementById('mapData').offsetWidth)

connectionsGraph.makeGraph()
map.makeMap()

let activeStreams = {}
let player = videojs('streamVid')

// Get active applications
restAPI.makeAPICall('getApplications', null, (applications) => {
  applications.data.forEach((application) => {
    if (application !== 'dashboard') {
      activeStreams[application] = []
      websocket.addConnection('getLiveStreams', [application])
    }
  })
})

// add WS call and establish connection
websocket.addConnection('getServerStatistics')
websocket.openConnection((data, content, apiCall) => {
  switch (apiCall) {
    case 'getLiveStreams':
      const newStreams = data.content.data || []
      const oldStreams = activeStreams[content[0]] || []

      if (arraysEqual(newStreams, oldStreams)) {
        return
      }
      if (document.getElementById('NA')) {
        document.getElementById('NA').remove()
      }

      const addStreams = filterConnections(newStreams, oldStreams)
      const removeStreams = filterConnections(oldStreams, newStreams)

      if (removeStreams) {
        removeStreams.forEach((streamToTerminate) => {
          document.getElementById(streamToTerminate).remove()
        })
      }

      if (addStreams) {
        addStreams.forEach((streamToAdd) => {
          // Add Client UI
          const tr = document.createElement('tr')
          tr.id = streamToAdd

          const td = document.createElement('td')
          td.onclick = getMoreStreamInfo

          const recordButton = document.getElementById('recordStream')

          restAPI.makeAPICall('getLiveStreamStatistics', {
            appname: content[0],
            streamname: streamToAdd
          }, (recording) => {
            if (recording.data.is_recording) {
              recordButton.innerHTML = 'Stop Record'
              recordButton.style.color = '#E31900'
              td.innerHTML = streamToAdd + ' &#x25cf;'
            } else {
              recordButton.innerHTML = 'Record Stream'
              td.innerHTML = streamToAdd
            }
          })
          td.innerHTML = streamToAdd
          td.id = `${content[0]}:${streamToAdd}`

          tr.appendChild(td)
          document.querySelector('.activeTableBody').appendChild(tr)
        })
      }

      activeStreams[content[0]] = newStreams
      break
    case 'getLiveStreamStatistics':
      if (data.content.code !== 200) {
        websocket.removeConnection('getLiveStreamStatistics', content)
        document.getElementById('streamData').style.display = 'none'
        break
      }
      document.getElementById('Uptime').innerHTML = `${((data.content.timestamp - data.content.data.creation_time) / 1000).toFixed()} seconds`

      connectionsGraph.updateGraph(data.content.data.active_subscribers, [data.content.data.max_subscribers])
      // bandwidthGraph.updateGraph(data.content.data.bytes_received / (1024 * 1024))
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
      return
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
  let content

  if (this.id !== '') {
    content = this.id.split(':')
  } else {
    content = this.name.split(':')
  }

  for (let ii = 0; ii < document.getElementsByClassName('map').length; ii++) {
    let streamButton = document.getElementsByClassName('stream')[ii]
    if (this.id !== '') {
      streamButton.name = this.id
    }
    streamButton.onclick = getMoreStreamInfo
  }
  // Pause player, edit source based on clicked stream, play
  player.pause()
  player.src([
    {
      type: 'application/x-mpegURL',
      src: `http://${window.location.host}/${content[0]}/${content[1]}.m3u8`
    },
    {
      type: 'rtmp/x-flv',
      src: `rtmp://192.168.1.13/${content[0]}/${content[1]}`
    }
  ])
  player.play()

  // Manipulate DOM elements
  document.getElementById('streamData').style.display = 'block'
  document.getElementById('streamData').style.width = '90%'
  document.getElementById('streamData').style.height = '100%'
  document.getElementById('mapData').style.display = 'none'

  const recordButton = document.getElementById('recordStream')

  restAPI.makeAPICall('getLiveStreamStatistics', {
    appname: content[0],
    streamname: content[1]
  }, (data) => {
    if (data.data.is_recording) {
      recordButton.innerHTML = 'Stop Record'
      recordButton.style.color = '#E31900'
    } else {
      recordButton.innerHTML = 'Record Stream'
      recordButton.style.color = ''
    }
    document.getElementById('Id').innerHTML = data.data.id
    document.getElementById('Name').innerHTML = data.data.name
    document.getElementById('scopePath').innerHTML = data.data.scope_path
  })

  recordButton.style.display = 'block'
  recordButton.name = this.id
  recordButton.onclick = toggleRecord

  // Reset graphs and connections
  connectionsGraph.reset(`Connections to Stream ${content[1]}`)

  // Change WS connection to new stream
  websocket.removeConnection('getLiveStreamStatistics', '*')
  websocket.addConnection('getLiveStreamStatistics', [content[0], content[1]])

  // Highlight selected stream
  let rows = document.getElementsByTagName('td')
  for (let ii = 0; ii < rows.length; ii++) {
    rows[ii].style.color = ''
  }
  if (this.id !== '') {
    this.style.color = '#E31900'
  } else {
    this.style.color = ''
  }

  document.getElementById('streamVidParent').style.height = document.getElementById('streamVidParent').offsetWidth * 9 / 16 + 'px'
  if (document.getElementById('streamVid_Flash_api')) {
    document.getElementById('streamVid_Flash_api').style.height = document.getElementById('streamVid_Flash_api').offsetWidth * 9 / 16 + 'px'
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
  document.getElementById('recordStream').style.color = '#E31900'
}

function stopRecord (content) {
  restAPI.makeAPICall('stopStreamRecord', {
    appname: content[0],
    streamname: content[1]
  }, (blank) => {
    console.log('Recording Terminated')
  })
  document.getElementById(`${content[0]}:${content[1]}`).innerHTML = content[1]
  document.getElementById('recordStream').style.color = ''
}

function viewMap () {
  document.getElementById('mapData').style.display = 'block'
  document.getElementById('streamData').style.width = '0%'
  document.getElementById('streamData').style.height = '0%'
  document.getElementById('recordStream').style.display = 'none'

  let rows = document.getElementsByTagName('td')
  for (let ii = 0; ii < rows.length; ii++) {
    rows[ii].style.color = ''
  }

  websocket.removeConnection('getLiveStreamStatistics', '*')
}
// let socket
// function orientation () {
//   if (socket) {
//     socket.close()
//   }

//   let url = 'ws://192.168.1.13:6262/metadata'
//   let context = '/live'
//   let stream = '/1'

//   socket = new WebSocket(`${url}${context}${stream}`)

//   socket.onopen = (e) => {
//     console.log('opened')
//     let request = {}
//     request.evt = e
//     request.id = 1233415424
//     socket.send(JSON.stringify(request))
//   }
//   socket.onclose = () => {
//     console.log('closed')
//   }
//   socket.onmessage = (obj) => {
//     console.log('message')
//     if (obj.name === 'onMetaData') {
//       console.log(obj)
//     }
//   }
//   socket.onerror = () => {
//     console.log('error')
//   }
// }

// Dynamic view for flash fallback
window.onresize = () => {
  document.getElementById('streamVidParent').style.height = document.getElementById('streamVidParent').offsetWidth * 9 / 16 + 'px'
  if (document.getElementById('streamVid_Flash_api')) {
    document.getElementById('streamVid_Flash_api').style.height = document.getElementById('streamVid_Flash_api').offsetWidth * 9 / 16 + 'px'
  }
}

// DOM housekeeping
for (let ii = 0; ii < document.getElementsByClassName('map').length; ii++) {
  document.getElementsByClassName('map')[ii].onclick = viewMap
}
