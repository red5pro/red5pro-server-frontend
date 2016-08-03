/* global Datamap */

import REST from './components/restAPI.js'
import WS from './components/wsAPI.js'
import {LineGraph, BarGraph} from './components/graph.js'

// import Datamap from '../lib/datamaps.world.min.js'

let restAPI = new REST('xyz123')
let websocket = new WS('xyz123')

let connectionsGraph = new LineGraph(document.getElementById('connectionsGraph'))
let bandwidthGraph = new BarGraph(document.getElementById('bandwidthGraph'))
connectionsGraph.makeGraph()
bandwidthGraph.makeGraph()

let map = new Datamap({
  element: document.getElementById('dataMap'),
  fills: {
    defaultFill: '#E31900'
  },
  height: null,
  width: document.getElementById('mapData').offsetWidth,
  responsive: true,
  bubblesConfig: {
    borderColor: 'lightgrey'
  }
})

console.log(map)

let activeClients = {}

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
  console.log(activeClients)
  switch (apiCall) {
    case 'getLiveStreams':
      const newClients = data.content.data || []
      const oldClients = activeClients[content[0]] || []

      if (arraysEqual(newClients, oldClients)) {
        return
      }
      console.log('The new clients are')
      console.log(newClients)
      console.log('The old clients are')
      console.log(oldClients)
      const addClients = filterConnections(newClients, oldClients)
      const removeClients = filterConnections(oldClients, newClients)

      console.log('We will add these clients')
      console.log(addClients)
      console.log('We will remove these clients')
      console.log(removeClients)

      if (removeClients) {
        removeClients.forEach((clientToTerminate) => {
          console.log('removing')
          console.log(clientToTerminate)
          document.getElementById(clientToTerminate).remove()
        })
      }

      if (addClients) {
        addClients.forEach((clientToAdd) => {
          console.log('adding')
          console.log(clientToAdd)
          // Add Client UI
          let tr = document.createElement('tr')
          tr.id = clientToAdd

          let td = document.createElement('td')
          let a = document.createElement('a')
          a.innerHTML = clientToAdd
          a.id = `${content[0]}:${clientToAdd}`
          a.onclick = getMoreStreamInfo

          td.appendChild(a)
          tr.appendChild(td)
          document.getElementById('activeConnectionsTableBody').appendChild(tr)

          // Add Bubble to map
          let newBubble = {
            name: clientToAdd,
            radius: 10,
            latitude: 50.07,
            longitude: 78.43
          }

          map.bubbles([newBubble], {
            popupTemplate: function (geography, data) {
              return ['<div class="hoverinfo"><strong>' + data.name + '</strong>' + '</div>'].join('')
            }
          })

          // Add Graph data
        })
      }
      activeClients[content[0]] = newClients

      break
    case 'getLiveStreamStatistics':
      console.log(data)
      connectionsGraph.updateGraph(data.content.data.active_subscribers)
      bandwidthGraph.updateGraph(data.content.data.bytes_recieved / (1024 * 1024))
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
  document.getElementById('streamData').style.display = 'block'
  document.getElementById('mapData').style.display = 'none'
  document.getElementById('viewMap').style.display = 'block'

  const recordButton = document.getElementById('recordStream')

  recordButton.name = this.id
  recordButton.onclick = toggleRecord

  connectionsGraph.reset()
  bandwidthGraph.reset()

  websocket.removeConnection('getLiveStreamStatistics', '*')
  websocket.addConnection('getLiveStreamStatistics', [content[0], null, content[1]])
  console.log(activeClients)
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
}

function stopRecord (content) {
  restAPI.makeAPICall('stopStreamRecord', {
    appname: content[0],
    streamname: content[1]
  }, (blank) => {
    console.log('Recording Terminated')
  })
}

function viewMap () {
  document.getElementById('mapData').style.display = 'block'
  document.getElementById('streamData').style.display = 'none'

  websocket.removeConnection('getLiveStreamStatistics', '*')
  this.style.display = 'none'
}
