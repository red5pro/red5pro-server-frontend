/* global ip, WebSocket */
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
let activeClients = {}
let player = videojs('streamVid')
let socket // For video meta data

// Get active applications
restAPI.makeAPICall('getApplications', null, (applications) => {
  applications.data.forEach((application) => {
    if (application !== 'dashboard') {
      activeStreams[application] = []
      websocket.addConnection('getLiveStreams', [application])
      websocket.addConnection('getClients', [application])
    }
  })
})

// add WS call and establish connection
websocket.addConnection('getServerStatistics')
websocket.openConnection((data, content, apiCall) => {
  switch (apiCall) {
    case 'getLiveStreams':
      // Get new streams from ws call and old streams from dict
      const newStreams = data.content.data || []
      const oldStreams = activeStreams[content[0]] || []

      // If they are the same, there is nothing to update
      if (arraysEqual(newStreams, oldStreams)) {
        break
      }

      // If table empty
      if (document.getElementById('NA')) {
        document.getElementById('NA').remove()
      }

      // Determine which streams need to be removed and which need to be added from the HTML Table
      const addStreams = filterConnections(newStreams, oldStreams)
      const removeStreams = filterConnections(oldStreams, newStreams)

      // Remove the streams from the table
      if (removeStreams) {
        removeStreams.forEach((streamToTerminate) => {
          document.getElementById(streamToTerminate).remove()
        })
      }

      // Add the streams to the table
      if (addStreams) {
        addStreams.forEach((streamToAdd) => {
          // Create the row and give it an id
          const tr = document.createElement('tr')
          tr.id = streamToAdd

          // create the column and give it a function
          const td = document.createElement('td')
          td.onclick = getMoreStreamInfo
          td.id = `${content[0]}:${streamToAdd}`

          // Configure Record Button and stream names to reflect which streams are and are not recording in case user left page
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

          // add the elements to the table
          tr.appendChild(td)
          document.querySelector('.activeTableBody').appendChild(tr)
        })
      }
      // Changes implemented.  The old streams are now the new streams.  Ready for next cycle.
      activeStreams[content[0]] = newStreams
      break
    // If a stream is selected, this call will be added to the ws dict
    case 'getLiveStreamStatistics':
      // If we recieve a bad code, remove everything and revert back to the map.  Usually happens when a stream is disconnected by publisher.
      if (data.content.code !== 200) {
        websocket.removeConnection('getLiveStreamStatistics', content)
        document.getElementById('streamData').style.display = 'none'
        document.getElementById('mapData').style.display = 'block'

        for (let ii = 0; ii < document.getElementsByClassName('stream').length; ii++) {
          let streamButton = document.getElementsByClassName('stream')[ii]
          streamButton.removeAttribute('name')
          streamButton.removeEventListener('click', getMoreStreamInfo)
        }
        break
      }

      // Update some stream statistics
      document.getElementById('Uptime').innerHTML = `${((data.content.timestamp - data.content.data.creation_time) / 1000).toFixed()} seconds`
      connectionsGraph.updateGraph(data.content.data.active_subscribers, [data.content.data.max_subscribers])
      break
    case 'getClients':
      const newClients = data.content.data || []
      const oldClients = activeClients[content[0]] || []

      if (arraysEqual(newClients, oldClients)) {
        break
      }

      const addClients = filterConnections(newClients, oldClients)
      const removeClients = filterConnections(oldClients, newClients)

      if (addClients) {
        for (let ii = 0; ii < addClients.length; ii++) {
          let ipAddress = [ii].remote_address
          restAPI.makeAPICall('getIPAddress', {ipaddress: ipAddress}, (coordinates) => {
            let longitude = coordinates.longitude
            let latitude = coordinates.latitude
            map.addPublisher([longitude, latitude], coordinates.city)
          })
        }

      }

      if (removeClients) {

      }

      break
    case 'getClientStatistics':
      console.log(data)
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
    // If there are no active streams, display a message reflecting so.
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

  // Get content from either clicking the stream name or stream tab button.
  if (this.id) {
    content = this.id.split(':')
  } else {
    content = this.name.split(':')
  }

  // Switch back to correct stream on map click
  for (let ii = 0; ii < document.getElementsByClassName('stream').length; ii++) {
    let streamButton = document.getElementsByClassName('stream')[ii]
    if (this.id !== '') {
      streamButton.name = this.id
    }
    streamButton.addEventListener('click', getMoreStreamInfo)
  }

  // Pause player, rotate if needed, edit source based on clicked stream, play
  player.pause()
  orient(content[0], content[1])
  player.src([
    {
      type: 'application/x-mpegURL',
      src: `http://${window.location.host}/${content[0]}/${content[1]}.m3u8`
    },
    {
      type: 'rtmp/x-flv',
      src: `rtmp://${ip}/${content[0]}/${content[1]}`
    }
  ])
  player.play()

  // Manipulate DOM elements on tab change
  document.getElementById('streamData').style.display = 'block'
  document.getElementById('streamData').style.width = '90%'
  document.getElementById('streamData').style.height = '100%'
  document.getElementById('mapData').style.display = 'none'

  // Configure Record Button to reflect which streams are and are not recording in case user left page.  Also update some stream statistics.
  const recordButton = document.getElementById('recordStream')
  recordButton.style.display = 'block'
  recordButton.name = this.id
  recordButton.onclick = toggleRecord

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
  if (this.id) {
    this.style.color = '#E31900'
  } else {
    this.style.color = ''
    document.getElementById(this.name).style.color = '#E31900'
  }

  // Set aspect ratio of video to 9 / 16 for HLS and flash fallback
  document.getElementById('streamVidParent').style.height = document.getElementById('streamVidParent').offsetWidth * 9 / 16 + 'px'
}

function toggleRecord () {
  let content = this.name.split(':')

  // Toggle record
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
  // Manipulate DOM elements on tab change
  document.getElementById('mapData').style.display = 'block'
  document.getElementById('streamData').style.width = '0%'
  document.getElementById('streamData').style.height = '0%'
  document.getElementById('recordStream').style.display = 'none'

  // let rows = document.getElementsByTagName('td')
  // for (let ii = 0; ii < rows.length; ii++) {
  //   rows[ii].style.color = ''
  // }

  websocket.removeConnection('getLiveStreamStatistics', '*')
}

function orient (context, stream) {
  let video = document.querySelector('.vjs-tech')

  // close the socket if it is open
  if (socket) {
    console.log('Previous Socket detected. Closing.')
    socket.close()
  }

  // Return video to original position
  if (video.style.transform !== 'rotate(0deg)') {
    console.log('Previous rotation detected, correcting to 0 deg.')
    video.style.transform = 'rotate(0deg)'
    video.style.width = '100%'
    video.style.margin = '0px'
  }

  // define and connect ws
  let url = `ws://${ip}:6262/metadata/${context}/${stream}`
  socket = new WebSocket(url)

  socket.onopen = (e) => {
    console.log('Socket Opened.')
  }
  // on message,
  socket.onmessage = (msg) => {
    console.log('message')
    let data = JSON.parse(msg.data)

    // if there is no name, return (usually a ping)
    if (!data.name) {
      socket.close()
      return
    }
    // if meta data is being sent
    if (data.name === 'onMetaData') {
      console.log('meta data detected')
      data = data.data
      // and it contains an orientation, rotate to said value
      if (data.orientation) {
        console.log('rotating to', data.orientation, 'degrees and closing the socket')
        video.style.transform = `rotate(${data.orientation}deg)`
        if (data.orientation !== 180) {
          // If it's sideways, change the CSS to make it look nice
          console.log('changing width')
          video.style.width = '56.25%' // aspect ratio 9 / 16 when sideways
          console.log((document.getElementById('streamVidParent').offsetWidth - video.offsetHeight) / 2 + 'px')
          // This is math... ((Container - Video / 2) / Container) * 100 gives us the % offset from the left
          video.style.marginLeft = (((document.getElementById('streamVidParent').offsetWidth - video.offsetHeight) / 2) / document.getElementById('streamVidParent').offsetWidth) * 100 + '%'
        }
        socket.close()
        return
      }
    } else {
      console.log('no meta data detected, returning position to 0 degrees')
      video.style.transform = 'rotate(0deg)'
    }
    // close the connection once we have gotten the data we need

    socket.close()
  }
  socket.onclose = () => {
    console.log('Socket Closed')
  }
  socket.onerror = () => {
    console.log('error')
  }
}
// Dynamic resize for flash fallback
window.onresize = () => {
  document.getElementById('streamVidParent').style.height = document.getElementById('streamVidParent').offsetWidth * 9 / 16 + 'px'
}

// Some DOM housekeeping
for (let ii = 0; ii < document.getElementsByClassName('map').length; ii++) {
  document.getElementsByClassName('map')[ii].onclick = viewMap
}
