let moment = require('moment')
import Chart from '../lib/Chart.bundle.min.js'
Chart.defaults.global.responsive = true

export class LineGraph {
  constructor (context) {
    this.context = context
    this.data = {
      type: 'line',
      data: {
        datasets: [{
          label: 'test',
          data: [],
          borderColor: '#E31900',
          backgroundColor: '#E31900'
        }]
      },
      options: {
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              displayFormats: {
                minute: 'hh:mm:ss'
              }
            }
          }],
          yAxes: [{
            type: 'linear',
            ticks: {
              min: 0,
              suggestedMax: 250
            }
          }]
        }
      }
    }
    this.currentChart
    // Initialize Data
  }
  makeGraph () {
    let currentData = this.data.data.datasets[0].data
    let now = moment()
    console.log(now)
    for (let ii = 0; ii < 11; ii++) {
      currentData.push({
        x: ii,
        y: ii
      })

      if (now.subtract(1, 'seconds')) {
        console.log(now.subtract(1, 'seconds').startOf('seconds'))
      }
    }
    this.data.data.datasets[0].data = currentData

    this.currentChart = new Chart(this.context, this.data)
    this.currentChart.update()
  }

  updateGraph (newData) {
    let currentData = this.data.data.datasets[0].data
    let now = moment()
    currentData[currentData.length - 1].x = now.startOf('seconds')
    // Artificially create time due graph irregularities caused by latency
    for (let ii = 0; ii < currentData.length - 2; ii++) {
      currentData[ii].y = currentData[ii + 1].y
    }
    for (let jj = 0; jj < currentData.length - 2; jj++) {
      currentData[currentData.length - 2 - jj].x = now.subtract(1, 'seconds')
    }
    currentData[currentData.length - 1].y = newData
    console.log(currentData)

    this.data.data.datasets[0].data = currentData
    this.currentChart.update()
  }
}

export class BarGraph {
  constructor (context) {
    this.context = context
    this.data = {
      type: 'horizontalBar',
      data: {
        datasets: [{
          backgroundColor: ['#E31900'],
          data: [0]
        }]
      },
      options: {
        scales: {
          xAxes: [{
            type: 'linear',
            ticks: 0,
            suggestedMax: 5
          }]
        }
      }
    }
    this.currentChart
  }
  makeGraph () {
    this.currentChart = new Chart(this.context, this.data)
  }
  updateGraph (newData) {
    this.data.data.datasets[0].data = [newData]
    this.currentChart.update()
  }
}

// export class DoughnutGraph {
//   constructor (context) {
//     this.context = context
//     this.data = {
//       type: 'doughnut',
//       data: {
//         datasets: [{
//           data: [1, 1],
//           backgroundColor: [
//           '#E31900',
//           'lightgrey'
//           ]
//         }]
//       }
//     }
//     this.currentChart
//   }
//   makeGraph () {
//     this.currentChart = new Chart(this.context, this.data)
//   }
//   updateGraph (newData) {
//     this.data.data.datasets.data = newData
//     this.currentChart.update()
//   }
// }
