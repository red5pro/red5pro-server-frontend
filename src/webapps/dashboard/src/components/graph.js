/* global Datamap */
let moment = require('moment')
import Chart from '../lib/Chart.bundle.min.js'
Chart.defaults.global.responsive = true

export class MAP {
  constructor (context, width) {
    this.context = context
    this.width = width
    this.map
    this.bubbles = []
    this.arcs = []
  }
  makeMap () {
    this.map = new Datamap({
      element: this.context,
      fills: {
        defaultFill: '#a8a8a8',
        publisher: '#E31900',
        subscriber: '#E31900'
      },
      height: null,
      width: this.width,
      responsive: true,
      bubblesConfig: {
        borderColor: '#a8a8a8'
      }
    })
  }
  addPublisher (location, name) {
    let newPublisher = {
      name: name,
      radius: 5,
      latitude: location[0],
      longitude: location[1],
      fillKey: 'publisher'
    }

    this.bubbles.push(newPublisher)
    this.map.bubbles(this.bubbles, {
      popupTemplate: function (geography, data) {
        return ['<div class="hoverinfo"><strong>' + data.name + '</strong>' + '</div>'].join('')
      }
    })
  }
  addSubscriber (origin, destination, name) {
    let newSubscriber = {
      name: name,
      radius: 1,
      latitude: origin[0],
      longitude: origin[1],
      fillKey: 'publisher'
    }
    let newArc = {
      origin: {
        latitude: origin[0],
        longitude: origin[1]
      },
      destination: {
        latitude: destination[0],
        longitude: destination[1]
      }
    }
    this.bubbles.push(newSubscriber)
    this.arcs.push(newArc)
    this.map.bubbles(this.bubbles, {
      popupTemplate: function (geography, data) {
        return ['<div class="hoverinfo"><strong>' + data.name + '</strong>' + '</div>'].join('')
      }
    })
    this.map.arc(this.arcs, {
      strokeWidth: 2,
      arcSharpness: 1,
      strokeColor: '#a8a8a8'
    })
  }
}

export class LineGraph {
  constructor (context, title) {
    this.context = context
    this.length = 11
    this.title = title
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
              suggestedMax: 125
            }
          }]
        },
        title: {
          display: true,
          text: this.title,
          fontSize: 20,
          fontColor: '#a8a8a8',
          fontStyle: 400
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
      currentData.unshift({
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
  reset (title) {
    let resetData = []
    let now = moment()
    if (title) {
      this.data.options.title.text = title
    }
    for (let ii = 0; ii < 11; ii++) {
      resetData.unshift({
        x: now.subtract(1, 'seconds').format(),
        y: 0
      })
    }
    this.data.data.datasets[0].data = resetData
    this.currentChart.update()
  }
}
export class DoughnutGraph {
  constructor (context, title) {
    this.context = context
    this.title = title
    this.data = {
      type: 'doughnut',
      data: {
        labels: ['Used Memory', 'Free Memory'],
        datasets: [{
          data: [1, 1],
          backgroundColor: [
            '#E31900',
            '#a8a8a8'
          ]
        }]
      },
      options: {
        title: {
          display: true,
          text: this.title,
          fontSize: 20,
          fontColor: '#a8a8a8',
          fontStyle: 400
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
  constructor (context, title) {
    this.context = context
    this.title = title
    this.data = {
      type: 'horizontalBar',
      data: {
        labels: [this.title],
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
            ticks: {
              suggestedMax: 5,
              beginAtZero: true
            }
          }],
          yAxes: [{
            display: false
          }]
        },
        title: {
          display: true,
          text: this.title,
          fontSize: 20,
          fontColor: '#a8a8a8',
          fontStyle: 400
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
  reset (title) {
    this.data.data.datasets[0].datasets = [0]
    if (title) {
      this.data.options.title.text = title
    }
    this.currentChart.update()
  }
}
