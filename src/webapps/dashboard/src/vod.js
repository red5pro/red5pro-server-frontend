/* global confirm */
import REST from './components/restAPI.js'
import videojs from 'video.js'

let restAPI = new REST('xyz123')

// Initialize
updateVodFiles()
window.onresize = () => {
  document.getElementById('vodContainer').style.height = document.getElementById('vodContainer').offsetWidth * 9 / 16 + 'px'
}
document.getElementById('refreshVOD').onclick = updateVodFiles
document.getElementById('rotate').onclick = rotate

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
    restAPI.makeDeleteCall('deleteVodFiles', {appname: content[0], filename: file[0], extension: file[1]}, () => {})

    document.getElementById(content[1]).remove()
    document.getElementById('vodContainer').style.width = '0%'
    document.getElementById('vodContainer').style.height = '0%'

    this.name = null
  }
  return
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
              const tr = document.createElement('tr')
              const td = document.createElement('td')

              tr.id = name.name
              td.innerHTML = name.name.split('.')[0]

              td.id = `${application}:${name.name}`
              td.onclick = viewVODFile

              tr.appendChild(td)

              document.querySelector('.activeTableBody').appendChild(tr)

              if (document.getElementById('NA')) {
                console.log('remove')
                document.getElementById('NA').remove()
              }

              if (tbody.children.length < 1) {
                console.log('adding')
                let tr = document.createElement('tr')
                let td = document.createElement('td')

                tr.id = 'NA'
                td.innerHTML = 'No streams are currently active'
                tr.appendChild(td)
                tbody.appendChild(tr)
              }
            })
          }
        })
      }
    })
  })
}

function viewVODFile () {
  const content = this.id.split(':')

  document.getElementById('vodContainer').style.width = '90%'
  document.getElementById('vodContainer').style.display = 'block'
  document.getElementById('vodContainer').style.height = document.getElementById('vodContainer').offsetWidth * 9 / 16 + 'px'

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

function rotate () {
  console.log('rotating')
  const video = document.getElementById('streamVid_Flash_api')
  let val = parseInt(video.style.transform.split('(')[1]) + 90 // Do some string voodoo to get the current rotation
  video.style.transform = `rotate(${val}deg)`
  if ((val % 180) !== 0) {
    video.style.width = '56.25%'
    video.style.marginLeft = (((document.getElementById('vodContainer').offsetWidth - video.offsetHeight) / 2) / document.getElementById('vodContainer').offsetWidth) * 100 + '%'
  } else {
    console.log('flat')
    video.style.width = '100%'
    video.style.marginLeft = 0
  }
}
