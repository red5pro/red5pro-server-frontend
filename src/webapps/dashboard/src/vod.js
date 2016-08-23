/* global confirm */
import Red5RESTAPI from './components/restAPI.js'
import videojs from 'video.js'

const SECURITY_TOKEN = 'xyz123'
const HOSTNAME = window.location.hostname
const PORT = window.location.port

let restAPI = new Red5RESTAPI(SECURITY_TOKEN, HOSTNAME, PORT)

// Initialize
updateVodFiles()
document.getElementById('refreshVOD').onclick = updateVodFiles
document.getElementById('rotate').onclick = rotate

window.onresize = () => {
  document.getElementById('vodContainer').style.height = document.getElementById('vodContainer').offsetWidth * 9 / 16 + 'px'
}

let player = videojs('streamVid', {
  techorder: [
    'flash'
  ]
})

// Functions
function deleteVODFile () {
  if (!this.name) {
    return
  }

  const content = this.name.split(':')
  const file = content[1].split('.')

  if (confirm('Are you sure you want to delete this file?')) {
    restAPI.DELETE('deleteVodFiles', {appname: content[0], filename: file[0], extension: file[1]}, () => {})

    document.getElementById(content[1]).remove()
    document.getElementById('vodContainer').style.width = '0%'
    document.getElementById('vodContainer').style.height = '0%'
    document.getElementById('rotate').style.display = 'none'
    this.removeAttribute('name')
  }
  return
}
// On refresh click
function updateVodFiles () {
  let tbody = document.createElement('tbody')
  tbody.className = 'activeTableBody'
  // Delete the table body
  document.querySelector('.activeTableBody').remove()
  document.querySelector('.activeTable').appendChild(tbody)

  document.getElementById('vodContainer').style.width = '0%'
  document.getElementById('vodContainer').style.height = '0%'
  document.getElementById('rotate').style.display = 'none'
  document.getElementById('deleteVodFile').removeAttribute('name')

  // Get the active applications
  restAPI.GET('getApplications', null, (applications) => {
    applications.data.forEach((application) => {
      if (application !== 'dashboard') {
        // For each appplication, get the VOD Files
        restAPI.GET('getVodFiles', {appname: application}, (vodFile) => {
          // If they exist
          if (vodFile.code === 200) {
            vodFile.data.forEach((name) => {
              // Create e table row for them and add relevent DOM attributes
              if (document.getElementById('NA')) {
                document.getElementById('NA').remove()
              }
              let tr = document.createElement('tr')
              let td = document.createElement('td')

              tr.id = name.name
              td.innerHTML = name.name.split('.')[0]

              td.id = `${application}:${name.name}`
              td.onclick = viewVODFile

              tr.appendChild(td)

              // Add the rows to the body
              tbody.appendChild(tr)
            })
          }
        })
      }
    })
  })

  // Otherwise inform user there are no files
  if (document.querySelector('.activeTableBody').children.length < 1) {
    let tr = document.createElement('tr')
    let td = document.createElement('td')

    tr.id = 'NA'
    td.innerHTML = 'There are no VOD files'
    tr.appendChild(td)
    tbody.appendChild(tr)
  }
}

// View the clicked file
function viewVODFile () {
  const content = this.id.split(':')

  document.getElementById('vodContainer').style.width = '90%'
  document.getElementById('vodContainer').style.display = 'block'
  document.getElementById('vodContainer').style.height = document.getElementById('vodContainer').offsetWidth * 9 / 16 + 'px'

  document.getElementById('rotate').style.display = 'block'

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

  // DOM Manipulation
  document.getElementById('deleteVodFile').name = this.id
  document.getElementById('deleteVodFile').onclick = deleteVODFile

  const video = document.getElementById('streamVid_Flash_api')
  video.style.transform = 'rotate(0deg)'
  video.style.width = '100%'
  video.style.marginLeft = 0

  let rows = document.getElementsByTagName('td')

  for (let ii = 0; ii < rows.length; ii++) {
    rows[ii].style.color = ''
  }
  this.style.color = '#E31900'
}

// If the video is sideways, add the ability to rotate it.
function rotate () {
  const video = document.getElementById('streamVid_Flash_api')
  let val = parseInt(video.style.transform.split('(')[1]) + 90 // Do some string voodoo to get the current rotation
  video.style.transform = `rotate(${val}deg)`
  if ((val % 180) !== 0) {
    video.style.width = '56.25%'
    video.style.marginLeft = (((document.getElementById('vodContainer').offsetWidth - video.offsetHeight) / 2) / document.getElementById('vodContainer').offsetWidth) * 100 + '%'
  } else {
    video.style.width = '100%'
    video.style.marginLeft = 0
  }
}
