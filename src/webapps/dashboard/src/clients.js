/* global ip, WebSocket */
import Red5RESTAPI from './components/restAPI.js'
import Red5WebSocket from './components/wsAPI.js'
import {LineGraph, MAP} from './components/graph.js'
import videojs from 'video.js'
import Hls from 'videojs-contrib-hls' // eslint-disable-line no-unused-vars
import * as constant from './components/constants.js'

const SECURITY_TOKEN = constant.SECURITY_TOKEN
const HOSTNAME = constant.HOSTNAME
const PORT = constant.PORT
const WS_PORT = constant.WS_PORT

// Instantiate Red5RESTAPI and Red5WebSocket
let restAPI = new Red5RESTAPI(SECURITY_TOKEN, HOSTNAME, PORT)
let websocket = new Red5WebSocket(SECURITY_TOKEN, 1000, HOSTNAME, WS_PORT)

// Instantiate graphs
let connectionsGraph = new LineGraph(document.getElementById('connectionsGraph'), 'Connections', 'Server Connections')
let map = new MAP(document.getElementById('dataMap'), document.getElementById('mapData').offsetWidth)

// Instantiate video player
let player = videojs('streamVid')

// Initialize variables for stream and client tracking
let activeStreams = {}
let activeClients = {}
let socket // For video meta data

// Create graphs
connectionsGraph.makeGraph()
map.makeMap()

// Get the active applications and clients
restAPI.GET('getApplications', null, (applications) => {
  applications.data.forEach((application) => {
    if (application !== 'dashboard') {
      activeStreams[application] = []
      activeClients[application] = []
      websocket.addConnection('getLiveStreams', [application])
      websocket.addConnection('getClients', [application])
    }
  })
})

// Establish WS and manipulate return data for each WS connection
websocket.addConnection('getServerStatistics')
websocket.openConnection((data, content, apiCall) => {
  switch (apiCall) {
    case 'getLiveStreams':
      // Get new streams from WS and old streams from activeStreams
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

      // Determine which streams need to be removed and which need to be added to the HTML Table
      const addStreams = filterStreams(newStreams, oldStreams)
      const removeStreams = filterStreams(oldStreams, newStreams)

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

          restAPI.GET('getLiveStreamStatistics', {
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
    // If a stream is selected, this WS connection will be added to the WS Connections dict
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
    // Get Clients returns some statistics on each Client. Plot each Client remote address on map.  In v2 of API we will be able to identify if clients are pubs or subs and thus differentiate on map.
    case 'getClients':
      // Same logic as getLiveStreams
      const newClients = data.content.data || []
      const oldClients = activeClients[content[0]] || []

      if (clientsEqual(newClients, oldClients)) {
        break
      }

      const addClients = filterClients(newClients, oldClients)
      const removeClients = filterClients(oldClients, newClients)

      // If there is a client to add
      if (addClients) {
        for (let ii = 0; ii < addClients.length; ii++) {
          // Get its IP address and unique id
          let ipAddress = addClients[ii].remote_address
          let id = addClients[ii].id
          // Get the location of the ipAddress and plot it
          restAPI.GET('getIPAddress', {ipaddress: ipAddress}, (coordinates) => {
            let longitude = coordinates.longitude
            let latitude = coordinates.latitude
            map.addPublisher([latitude, longitude], coordinates.city, id)
          })
        }
      }

      // If there is a client to remove, do so based on its unique Id
      if (removeClients) {
        for (let ii = 0; ii < removeClients.length; ii++) {
          let id = removeClients[ii].id
          map.removePublisher(id)
        }
      }
      activeClients[content[0]] = newClients
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

        map.addPublisher(origin, name, id)
        map.addSubscriber(origin, destination, name, id)
        *origin && destination in format [latitude, longitude]*

      */
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
// To see if arrays are equal
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
function clientsEqual (a, b) {
  if (a.length !== b.length) {
    return false
  }
  let aID = []
  let bID = []
  for (let ii = 0; ii < a.length; ii++) {
    aID.push(a[ii].id)
  }
  for (let jj = 0; jj < b.length; jj++) {
    bID.push(b[jj].id)
  }
  return arraysEqual(aID, bID)
}
// Filter arrays
function filterStreams (a, b) {
  return a.filter((element) => {
    if (b.indexOf(element) === -1) {
      return true
    }
    return false
  })
}
function filterClients (a, b) {
  let bID = []

  for (let jj = 0; jj < b.length; jj++) {
    bID.push(b[jj].id)
  }
  return a.filter((element) => {
    if (bID.indexOf(element.id) === -1) {
      return true
    }
    return false
  })
}
// When a stream is selected
function getMoreStreamInfo () {
  let content

  // Get content from either clicking the stream name or stream tab button.
  if (this.id) {
    content = this.id.split(':')
    for (let ii = 1; ii < content.length - 1; ii++) {
      content[1] = content[1].concat(`:${content[ii + 1]}`)
    }
  } else {
    content = this.name.split(':')
    for (let ii = 1; ii < content.length - 1; ii++) {
      content[1] = content[1].concat(`:${content[ii + 1]}`)
    }
  }

  // Ensure correct switch back to correct stream when map is clicked
  for (let ii = 0; ii < document.getElementsByClassName('stream').length; ii++) {
    let streamButton = document.getElementsByClassName('stream')[ii]
    if (this.id !== '') {
      streamButton.name = this.id
    }
    streamButton.addEventListener('click', getMoreStreamInfo)
  }

  // Pause player, rotate if needed, edit source based on clicked stream, play
  orient(content[0], content[1])
  player.pause()
  player.src([
    {
      type: 'application/x-mpegURL',
      src: `http://${HOSTNAME}:${PORT}/${content[0]}/${content[1]}.m3u8`
    },
    {
      type: 'rtmp/x-flv',
      src: `rtmp://${ip}/${content[0]}/${content[1]}`
    }
  ])
  player.play()

  // Manipulate DOM elements on change between stream and map view
  document.getElementById('streamData').style.display = 'block'
  document.getElementById('streamData').style.width = '90%'
  document.getElementById('streamData').style.height = '100%'
  document.getElementById('mapData').style.display = 'none'

  // Configure Record Button to reflect which streams are and are not recording in case user left page.  Also update some stream statistics while we have a rest API call happening.
  const recordButton = document.getElementById('recordStream')
  recordButton.style.display = 'block'
  if (this.id !== '') {
    recordButton.name = this.id
  }
  recordButton.onclick = toggleRecord

  restAPI.GET('getLiveStreamStatistics', {
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

  // Reset graphs and connections because we now have new stream statistics
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
// Toggle record
function toggleRecord () {
  let content = this.name.split(':')
  for (let ii = 1; ii < content.length - 1; ii++) {
    content[1] = content[1].concat(`:${content[ii + 1]}`)
  }

  restAPI.GET('getLiveStreamStatistics', {
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
  restAPI.GET('recordLiveStream', {
    appname: content[0],
    streamname: content[1]
  }, (blank) => {
    console.log('Recording Stream')
  })
  document.getElementById(`${content[0]}:${content[1]}`).innerHTML = content[1] + ' &#x25cf;'
  document.getElementById('recordStream').style.color = '#E31900'
}

function stopRecord (content) {
  restAPI.GET('stopStreamRecord', {
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

  websocket.removeConnection('getLiveStreamStatistics', '*')
}

function orient (context, stream) {
  let video = document.querySelector('.vjs-tech')

  // close the socket if it is open
  if (socket) {
    socket.close()
  }

  // Return video to original position
  if (video.style.transform !== 'rotate(0deg)') {
    video.style.transform = 'rotate(0deg)'
    video.style.width = '100%'
    video.style.margin = '0px'
  }

  // define and connect WS for meta data of stream
  let url = `ws://${ip}:6262/metadata/${context}/${stream}`
  socket = new WebSocket(url)

  socket.onopen = (e) => {
    console.log('Socket Opened.')
  }
  // on message,
  socket.onmessage = (msg) => {
    let data = JSON.parse(msg.data)

    // if there is no name, return (usually a ping)
    if (!data.name) {
      socket.close()
      return
    }
    // if meta data is being sent
    if (data.name === 'onMetaData') {
      data = data.data
      // and it contains an orientation, rotate to said value
      if (data.orientation) {
        video.style.transform = `rotate(${data.orientation}deg)`
        if (data.orientation !== 180) {
          // If it's sideways, change the CSS to make it look nice
          video.style.width = '56.25%' // aspect ratio 9 / 16 when sideways
          // This is math... ((Container - Video / 2) / Container) * 100 gives us the % offset from the left
          video.style.marginLeft = (((document.getElementById('streamVidParent').offsetWidth - video.offsetHeight) / 2) / document.getElementById('streamVidParent').offsetWidth) * 100 + '%'
        }
        socket.close()
        return
      }
    } else {
      video.style.transform = 'rotate(0deg)'
    }
    // close the connection once we have gotten the data we need

    socket.close()
  }
  socket.onclose = () => {
    console.log('Socket Closed')
  }
  socket.onerror = () => {
    console.error('Socket Error')
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
