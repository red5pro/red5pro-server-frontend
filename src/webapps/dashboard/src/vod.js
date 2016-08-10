import REST from './components/restAPI.js'
import videojs from 'video.js'

let restAPI = new REST('xyz123')

// Initialize
updateVodFiles()
document.getElementById('refreshVOD').onclick = updateVodFiles

let player = videojs('streamVid', {
  techorder: [
    'flash'
  ]
})

// Functions
function deleteVODFile () {
  const content = this.name.split(':')
  const file = content[1].split('.')

  restAPI.makeDeleteCall('deleteVodFiles', {appname: content[0], filename: file[0], extension: file[1]}, () => {})

  document.getElementById('vodView').style.display = 'none'
  document.getElementById(this.name).remove()
}

function updateVodFiles () {
  const tbody = document.createElement('tbody')
  tbody.className = 'activeTableBody'

  document.querySelector('.activeTableBody').remove()
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
              td.innerHTML = name.name.split('.')[0]

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
  console.log(content)
  player.src([
    {
      type: 'video/x-mp4',
      src: `http://${window.location.host}/${content[0]}/streams/${content[1]}`
    },
    {
      type: 'video/x-flv',
      src: `http://${window.location.host}/${content[0]}/streams/${content[1]}`
    },
    {
      type: 'video/x-f4v',
      src: `http://${window.location.host}/${content[0]}/streams/${content[1]}`
    },
    {
      type: 'video/x-3gp',
      src: `http://${window.location.host}/${content[0]}/streams/${content[1]}`
    }
  ])
  player.play()

  document.getElementById('deleteVodFile').name = this.id
  document.getElementById('deleteVodFile').onclick = deleteVODFile

  let rows = document.getElementsByTagName('td')

  for (let ii = 0; ii < rows.length; ii++) {
    rows[ii].style.backgroundColor = ''
  }
  this.style.backgroundColor = '#a8a8a8'
}
