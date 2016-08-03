import REST from './components/restAPI.js'
import WS from './components/wsAPI.js'

let restAPI = new REST('xyz123')
let websocket = new WS('xyz123')

// let activeClients = []

restAPI.makeAPICall('getApplications', null, (applications) => {
  console.log(applications)
  applications.data.forEach((application) => {
    websocket.addConnection('getLiveStreams', application)
  })
})

websocket.openConnection((data, content, apiCall) => {
  switch (apiCall) {
    case 'getLiveStreams':
      console.log(data)
      console.log(content)
      console.log(apiCall)
      // const newClients = data.data
      // const oldClients = activeClients

      // if (arraysEqual(newClients, oldClients)) {
      //   return
      // }

      // const addClients = filterConnections(newClients, oldClients)
      // const removeClients = filterConnections(oldClients, newClients)

      // if (addClients) {

      // }
      // if (removeClients) {
      //   activeClients.filter((client) => {
      //     if (removeClients.indexOf(client)) {
      //     }
      //   })
      // }
      // removeConnections(removeClients, activeClients)
      // addConnections(addClients, activeClients)
      break
    case 'getClientStatistics':
      break
  }
})

// function arraysEqual (a, b) {
//   if (a.length !== b.length) {
//     return false
//   }
//   for (let ii = 0; ii < a.length; ii++){
//     if (a.indexOf(b[ii]) === -1){
//       return false
//     }
//   }
//   for (let jj = 0; jj < b.length; jj++){
//     if (b.indexOf(a[jj]) === -1){
//       return false
//     }
//   }
//   return true
// }

// function filterConnections (a, b) {
//   return a.filter((element) => {
//     if (b.indexOf(element) === -1) {
//       return true
//     }
//     return false
//   })
// }

// function removeConnections (a, b) {
//   for (let ii = 0; ii < a.length - 1; ii++) {
//     b.splice(b.indexOf(a[ii]), 1)
//   }
// }

// function addConnections (a, b) {
//   a.join(b)
// }
