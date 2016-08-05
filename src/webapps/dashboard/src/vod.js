import REST from './components/restAPI.js'
// import WS from './components/wsAPI.js'

let restAPI = new REST('xyz123')
// let websocket = new WS('xyz123')

function updateVodFiles () {
  restAPI.makeAPICall('getApplications', null, (applications) => {
    console.log(applications)
    applications.data.forEach((application) => {
      if (application !== 'dashboard') {
        restAPI.makeAPICall('getVodFiles', {appname: application}, (vodFile) => {
          console.log(vodFile)
          if (vodFile.code === 200) {
            console.log(vodFile.data)
            vodFile.data.forEach((name) => {
              let tr = document.createElement('tr')
              let td = document.createElement('td')
              td.innerHTML = name.name

              tr.appendChild(td)

              document.getElementById('vodFilesTableBody').appendChild(tr)
            })
          }
        })
      }
    })
  })
}

updateVodFiles()
