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
          label: 'connections',
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
                hour: 'hh:mm'
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
        },
        title: {
          display: true,
          text: 'Server Connections'
        },
        legend: {
          display: false
        }
      }
    }
    this.currentChart
    // Initialize Data
  }
  makeGraph () {
    let currentData = this.data.data.datasets[0].data
    let now = moment()
    for (let ii = 0; ii < 11; ii++) {
      currentData.push({
        x: now.subtract(1, 'seconds').format(),
        y: 0
      })
    }
    this.data.data.datasets[0].data = currentData

    this.currentChart = new Chart(this.context, this.data)
    this.currentChart.update()
  }

  updateGraph (newData) {
    let currentData = this.data.data.datasets[0].data
    let now = moment()

    currentData[currentData.length - 1].x = now.format()

    for (let ii = 0; ii < currentData.length - 1; ii++) {
      currentData[ii].y = currentData[ii + 1].y
      currentData[currentData.length - 2 - ii].x = now.subtract(1, 'seconds').format()
    }
    currentData[currentData.length - 1].y = newData
    this.data.data.datasets[0].data = currentData
    this.currentChart.update()
  }
}
export class DoughnutGraph {
  constructor (context) {
    this.context = context
    this.data = {
      type: 'doughnut',
      data: {
        labels: ['Used Memory', 'Free Memory'],
        datasets: [{
          data: [1, 1],
          backgroundColor: [
            '#E31900',
            'lightgrey'
          ]
        }]
      },
      options: {
        title: {
          display: true,
          text: 'Memory'
        },
        legend: {
          position: 'bottom'
        }
      }
    }
    this.currentChart
  }
  makeGraph () {
    this.currentChart = new Chart(this.context, this.data)
  }
  updateGraph (newData) {
    this.data.data.datasets[0].data = newData
    this.currentChart.update()
  }
}
export class BarGraph {
  constructor (context) {
    this.context = context
    this.data = {
      type: 'horizontalBar',
      data: {
        labels: [''],
        datasets: [{
          backgroundColor: [
            '#E31900'
          ],
          data: [0]
        }]
      },
      options: {
        scales: {
          xAxes: [{
            type: 'linear',
            min: 0,
            suggestedMin: 0,
            suggestedMax: 5
          }]
        },
        title: {
          display: true,
          text: 'Bandwidth'
        },
        legend: {
          display: false
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
