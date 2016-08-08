/* global jwplayer */
import REST from './components/restAPI.js'
// import WS from './components/wsAPI.js'

let restAPI = new REST('xyz123')
// let websocket = new WS('xyz123')

updateVodFiles()

document.getElementById('refreshVOD').onclick = updateVodFiles

function updateVodFiles () {
  document.querySelector('.activeTableBody').remove()
  const tbody = document.createElement('tbody')
  tbody.className = 'activeTableBody'
  document.querySelector('.activeTable').appendChild(tbody)

  restAPI.makeAPICall('getApplications', null, (applications) => {
    applications.data.forEach((application) => {
      if (application !== 'dashboard') {
        restAPI.makeAPICall('getVodFiles', {appname: application}, (vodFile) => {
          if (vodFile.code === 200) {
            vodFile.data.forEach((name) => {
              let tr = document.createElement('tr')
              let td = document.createElement('td')
              tr.class = application
              td.innerHTML = name.name
              td.id = `${application}:${name.name}`
              td.onclick = viewVODFile

              tr.appendChild(td)

              document.querySelector('.activeTableBody').appendChild(tr)
            })
          }
        })
      }
    })
  })
}

function viewVODFile () {
  const content = this.id.split(':')
  jwplayer('playbackVideo').setup({
    file: `rtmp://10.1.10.18/${content[0]}/${content[1]}`,
    mediaid: 'tester'
  })
  document.getElementById('vodDataLabel').innerHTML = `${content[1]}`
  document.getElementById('deleteVodFile').name = this.id
  document.getElementById('deleteVodFile').onclick = deleteVODFile

  let rows = document.getElementsByTagName('td')
  for (let ii = 0; ii < rows.length; ii++) {
    rows[ii].style.backgroundColor = 'white'
  }
  this.style.backgroundColor = '#a8a8a8'
}

function deleteVODFile () {
  console.log('executed Delete File')
  const content = this.name.split(':')
  const file = content[1].split('.')
  restAPI.makeDeleteCall('deleteVodFiles', {appname: content[0], filename: file[0], extension: file[1]}, () => {})
  document.getElementById('vodView').style.display = 'none'
  document.getElementById(this.name).remove()
}
