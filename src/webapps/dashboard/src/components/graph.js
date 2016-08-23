/* global Datamap */
/* global jQuery */
let moment = require('moment')
import Chart from 'chart.js'

Chart.defaults.global.responsive = true

export class MAP {
  constructor (context, width) {
    this.context = context
    this.width = width
    this.map
    this.bubbles = {}
    this.arcs = {}
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
        borderColor: '#E31900'
      }
    })
  }
  addPublisher (location, name, id) {
    let newPublisher = {
      name: name,
      radius: 5,
      latitude: location[0],
      longitude: location[1],
      fillKey: 'publisher'
    }

    this.bubbles[id] = newPublisher
    let tempBubbles = []
    Object.keys(this.bubbles).forEach((bubbleId) => {
      tempBubbles.push(this.bubbles[bubbleId])
    })
    this.map.bubbles(tempBubbles, {
      popupTemplate: function (geography, data) {
        return ['<div class="hoverinfo"><strong>' + data.name + '</strong>' + '</div>'].join('')
      }
    })
  }
  removePublisher (id) {
    delete this.bubbles[id]

    let tempBubbles = []
    Object.keys(this.bubbles).forEach((bubbleId) => {
      tempBubbles.push(this.bubbles[bubbleId])
    })

    this.map.bubbles(tempBubbles, {
      popupTemplate: function (geography, data) {
        return ['<div class="hoverinfo"><strong>' + data.name + '</strong>' + '</div>'].join('')
      }
    })
  }
  addSubscriber (origin, destination, name, id) {
    let newSubscriber = {
      name: name,
      radius: 1,
      latitude: origin[0],
      longitude: origin[1],
      fillKey: 'subscriber'
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
    this.bubbles[id] = newSubscriber
    this.arcs[id] = newArc
    let tempBubbles = []
    Object.keys(this.bubbles).forEach((bubbleId) => {
      tempBubbles.push(this.bubbles[bubbleId])
    })
    let tempArcs = []
    Object.keys(this.arcs).forEach((arcId) => {
      tempArcs.push(this.arcs[arcId])
    })
    this.map.bubbles(tempBubbles, {
      popupTemplate: function (geography, data) {
        return ['<div class="hoverinfo"><strong>' + data.name + '</strong>' + '</div>'].join('')
      }
    })
    this.map.arc(tempArcs, {
      strokeWidth: 2,
      arcSharpness: 1,
      strokeColor: '#E31900'
    })
  }
  removeSubscriber (id) {
    delete this.bubbles[id]
    delete this.arcs[id]

    let tempBubbles = []
    Object.keys(this.bubbles).forEach((bubbleId) => {
      tempBubbles.push(this.bubbles[bubbleId])
    })
    let tempArcs = []
    Object.keys(this.arcs).forEach((arcId) => {
      tempArcs.push(this.arcs[arcId])
    })
    this.map.bubbles(tempBubbles, {
      popupTemplate: function (geography, data) {
        return ['<div class="hoverinfo"><strong>' + data.name + '</strong>' + '</div>'].join('')
      }
    })
    this.map.arc(tempArcs, {
      strokeWidth: 2,
      arcSharpness: 1,
      strokeColor: '#E31900'
    })
  }
}

class Graph {
  constructor () {
    this.titlePreferences = {
      display: true,
      fontSize: 20,
      fontColor: '#a8a8a8',
      fontStyle: 400,
      fontFamily: 'Lato'
    }
    this.red = '#E31900'
    this.grey = '#a8a8a8'
  }
}

export class LineGraph extends Graph {
  constructor (context, label = 'label', title = 'title') {
    super()
    this.titlePreferences.text = title

    this.context = context
    this.label = label
    this.length = 11
    this.data = {
      type: 'line',
      data: {
        datasets: [{
          label: this.label,
          data: [],
          borderColor: this.red,
          backgroundColor: this.red,
          radius: 1,
          tension: 0
        },
        {
          label: 'Max Connections',
          data: [],
          borderColor: this.grey,
          backgroundColor: this.grey,
          radius: 1,
          tension: 0
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
            },
            ticks: {
              maxRotation: 30,
              minRotation: 30
            }
          }],
          yAxes: [{
            type: 'linear',
            ticks: {
              min: 0,
              suggestedMax: 10
            }
          }]
        },
        title: this.titlePreferences,
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
    for (let jj = 0; jj < this.data.data.datasets.length; jj++) {
      this.data.data.datasets[jj].data = currentData
    }

    this.currentChart = new Chart(this.context, this.data)
    this.currentChart.update()
  }

  updateGraph (newData, moreData = []) {
    let currentData = this.data.data.datasets[0].data
    let now = moment()

    if (currentData.length < 3599) {
      currentData.push({
        x: now.format(),
        y: newData
      })
      for (let ii = 0; ii < currentData.length - 1; ii++) {
        currentData[currentData.length - 2 - ii].x = now.subtract(1, 'seconds').format()
      }
      this.data.data.datasets[0].data = currentData
      if (moreData) {
        for (let jj = 0; jj < moreData.length; jj++) {
          let copiedObject = jQuery.extend(true, [], currentData)

          for (let kk = 0; kk < copiedObject.length - 1; kk++) {
            copiedObject[kk].y = this.data.data.datasets[jj + 1].data[kk].y
          }

          copiedObject[copiedObject.length - 1].y = moreData[jj]
          this.data.data.datasets[jj + 1].data = copiedObject
        }
      }
    } else {
      currentData[currentData.length - 1].x = now.format()

      for (let ii = 0; ii < currentData.length - 1; ii++) {
        currentData[ii].y = currentData[ii + 1].y
        currentData[currentData.length - 2 - ii].x = now.subtract(1, 'seconds').format()
      }
      currentData[currentData.length - 1].y = newData
      this.data.data.datasets[0].data = currentData

      if (moreData) {
        for (let jj = 0; jj < moreData.length; jj++) {
          let copiedObject = jQuery.extend(true, [], currentData)
          for (let kk = 0; kk < currentData.length - 1; kk++) {
            copiedObject[kk].y = this.data.data.datasets[jj + 1].data[kk + 1].y
          }

          copiedObject[copiedObject.length - 1].y = moreData[jj]
          this.data.data.datasets[jj + 1].data = copiedObject
        }
      }
    }
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

    for (let jj = 0; jj < this.data.data.datasets.length; jj++) {
      this.data.data.datasets[jj].data = resetData
    }
    this.currentChart.update()
  }
}
export class DoughnutGraph extends Graph {
  constructor (context, label = ['label'], title = 'title') {
    super()
    this.context = context
    this.titlePreferences.text = title
    this.type = 'doughnut'
    this.label = label
    this.data = {
      type: this.type,
      data: {
        labels: this.label,
        datasets: [{
          data: [1, 1],
          backgroundColor: [
            this.grey,
            this.red
          ]
        }]
      },
      options: {
        title: this.titlePreferences,
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
export class BarGraph extends Graph {
  constructor (context, label = ['label'], title = 'title') {
    super()
    this.context = context
    this.titlePreferences.text = title
    this.label = label
    this.data = {
      type: 'horizontalBar',
      data: {
        labels: this.label,
        datasets: [{
          backgroundColor: [
            this.red
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
        title: this.titlePreferences,
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
