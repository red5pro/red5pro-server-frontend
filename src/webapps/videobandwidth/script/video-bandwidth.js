/* eslint-disable no-console */
((window, trackBitrate, untrackBitrate, red5prosdk) => {

  red5prosdk.setLogLevel('debug')

  const outStatsField = document.querySelector('.out-stats-field')
  const inStatsField = document.querySelector('.in-stats-field')
  const serverField = document.querySelector('.form--red5pro-input')
  const smField = document.querySelector('.form--sm-input')
  const subField = document.querySelector('.form--sub-input')
  const stunField = document.querySelector('.form--stunturn-input')
  const timeoutField = document.querySelector('.form--seconds-input')
  const bitrateField = document.querySelector('.form--bitrate-input')
  const form = document.querySelector('.form')
  const progressBar = document.querySelector('.progress-bar')
  const subContainer = document.querySelector('.sub-container')

  let ipReg = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
  let localhostReg = /^localhost.*/

  serverField.value = window.location.hostname
  if (subField.checked) {
    subContainer.classList.remove('hidden')
  }
  subField.addEventListener('click', () => {
    if (subField.checked) {
      subContainer.classList.remove('hidden')
    } else {
      subContainer.classList.add('hidden')
    }
  })
  
  let config = {
    streamName: 'red5pro-bw-test',
    mediaConstraints: {
      audio: true,
      video: {
        width: { exact: 1280 },
        height: { exact: 720 }
      },
      frameRate: {
        min: 20,
        ideal: 60,
        max: 60
      }
    }
  }
  let publisherObj = {
    publisher: undefined,
    bitrateTicket: undefined
  }
  let subscriberObj = {
    subscriber: undefined,
    bitrateTicket: undefined
  }

  const getTrackSender = (connection, kind) => {
    var senders = connection.getSenders();
    var i = senders.length
    while (--i > -1) {
      if (senders[i].track.kind === kind) {
        return senders[i];
      }
    }
    return undefined;
  }

  const getNode = async (config, action) => {
    try {
      const url = `https://${config.host}/streammanager/api/4.0/event/live/${config.streamName}?action=${action}`
      const response = await fetch(url)
      const json = await response.json()
      return json
    } catch (e) {
      throw e
    }
  }

  const shutdownPublisher = async () => {
    try {
      let {
        publisher,
        bitrateTicket
      } = publisherObj
      untrackBitrate(bitrateTicket)
      await publisher.unpublish()
      for (let key in publisherObj) {
        publisherObj[key] = undefined
      }
    } catch (e) {
      console.error(e)
    }
  }

  const shutdownSubscriber = async () => {
    try {
      let {
        subscriber,
        bitrateTicket
      } = subscriberObj
      untrackBitrate(bitrateTicket)
      await subscriber.unsubscribe()
      for (let key in subscriberObj) {
        subscriberObj[key] = undefined
      }
    } catch (e) {
      console.error(e)
    }
  }

  // eslint-disable-next-line no-unused-vars
  const reportPublishStats = (bitrates, width, height, rtts, finalRtt) => {
    let average = bitrates.reduce((a, c) => a + c) / bitrates.length
    // eslint-disable-next-line no-unused-vars
    let rtt = rtts.reduce((a, c) => a + c) / rtts.length
    console.log(`[Publisher Bitrate Average] :: ${average}`)
    console.log(rtts)
    outStatsField.innerText = `Bitrate: ${average.toFixed(2)} kbps, Resolution: ${width}x${height}`//, RTT: ${rtt}, Final RTT: ${finalRtt}`
  }

  const reportSubscriberStats = (bitrates, packetsLost, packetsReceived) => {
    let average = bitrates.reduce((a, c) => a + c) / bitrates.length
    console.log(`[Subscriber Bitrate Average] :: ${average}`)
    inStatsField.innerText = `Bitrate: ${average.toFixed(2)} kbps, Packets Lost: ${packetsLost}, Packet Loss: ${Math.ceil(packetsLost/packetsReceived)}%`
  }

  const startSubscriber = async (conf) => {
    try {
      let bitrates = []
      let packetsLost = 0
      let packetsReceived = 0

      if (smField.checked) {
        try {
          let payload = await getNode(config, 'subscribe')
          if (payload.errorMessage) {
            throw new Error(payload.errorMessage)
          }
          config.app = 'streammanager'
          config.connectionParams = {
            host: payload.serverAddress,
            app: payload.scope
          }
        } catch (e) {
          throw e
        }
      }

      let subscriber = await new red5prosdk.RTCSubscriber().init(conf)
      subscriber.on('Subscribe.Play.Unpublish', (e) => {
        reportSubscriberStats(bitrates, packetsLost, packetsReceived)
        shutdownSubscriber()
        console.log(`[SUBSCRIBER] :: ${e.type}`)
      })
      await subscriber.subscribe()
      subscriberObj.subscriber = subscriber

      const connection = subscriber.getPeerConnection()
      // eslint-disable-next-line no-unused-vars
      const fn = (bitrate, report, type) => {
        if (bitrate > 0) {
          bitrates.push(bitrate)
          //          console.log(report)
        }
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          packetsLost = report.packetsLost
          packetsReceived = report.packetsReceived
        }
      }

      subscriberObj.bitrateTicket = trackBitrate(connection, fn)

    } catch (e) {
      console.error(e)
    }
  }

  const start = async () => {
    const host = serverField.value || 'localhost'
    const isLocalOrIP = ipReg.exec(host) || localhostReg.exec(host)
    const bandwidth = bitrateField.selectedOptions[0].value
    config = {...config, ...{
      protocol: isLocalOrIP ? 'ws' : 'wss',
      port: isLocalOrIP ? 5080 : 443,
      host: host,
      bandwidth: {
        video: bandwidth.toLowerCase() === 'unlimited' ? 10000 : parseInt(bandwidth, 10)
      },
      rtcConfiguration: {
        iceServers: [{urls: stunField.value}]
      }
    }}

    let bitrates = []
    let rtts = []
    let finalRtt = 0
    let justOnce = 0
    let frameWidth = 0
    let frameHeight = 0

    if (smField.checked) {
      try {
        let payload = await getNode(config, 'broadcast')
        if (payload.errorMessage) {
          throw new Error(payload.errorMessage)
        }
        config.app = 'streammanager'
        config.connectionParams = {
          host: payload.serverAddress,
          app: payload.scope
        }
      } catch (e) {
        throw e
      }
    }

    try {
      outStatsField.innerText = ''
      inStatsField.innerText = ''
      progressBar.style.width = '0%'

      let publisher = await new red5prosdk.RTCPublisher().init(config)
      await publisher.publish()
      publisherObj.publisher = publisher

      // eslint-disable-next-line no-unused-vars
      const fn = (bitrate, report, type) => {
        if (report.type === 'candidate-pair' && report.bytesSent > 0) {
          rtts.push((report.totalRoundTripTime/report.responsesReceived) * 1000)
          finalRtt = (report.totalRoundTripTime/report.responsesReceived) * 1000
          //          console.log(report)
        } else if (bitrate > 0) {
          if (subField.checked && justOnce++ < 1 && report.bytesSent > 100) {
            startSubscriber(config)
          }
          bitrates.push(bitrate)
          frameWidth = report.frameWidth
          frameHeight = report.frameHeight
          //          console.log(bitrate)
        } else {
//          console.log(report)
        }
      }

      const connection = publisher.getPeerConnection()
      const sender = getTrackSender(connection, 'video')
      let params = sender.getParameters()
      if (!params.encodings) {
        params.encodings = [{}]
      }
      params.encodings[0].maxBitrate = parseInt(config.bandwidth.video, 10) * 1000
      params.encodings[0].maxFramerate = config.mediaConstraints.frameRate.ideal

      let count = 0
      let timeout = parseInt(timeoutField.value, 10)
      let p = setInterval(() => {
        count = count + 1
        let perc = count / timeout
        progressBar.style.width = `${perc*100}%`
      }, 1000)
      let t = setTimeout(() => {
        clearInterval(p)
        clearTimeout(t)
        progressBar.style.width = '100%'
        const video = document.querySelector('#red5pro-publisher')
        frameWidth = !frameWidth ? video.videoWidth : frameWidth
        frameHeight = !frameHeight ? video.videoHeight : frameHeight
        reportPublishStats(bitrates, frameWidth, frameHeight, rtts, finalRtt)
        shutdownPublisher()
      }, timeout * 1000)

      publisherObj.bitrateTicket = trackBitrate(connection, fn)

    } catch (e) {
      console.error(e)
    }
  }

  form.addEventListener('submit', () => { start() })

})(window, window.trackBitrate, window.untrackBitrate, window.red5prosdk)
