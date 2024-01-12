{{> jsp_header }}
<!doctype html>
{{> license}}
<html lang="eng">
  <head>
    <meta charset="utf-8">
    {{> head_meta }}
    {{> resources }}
    <title>Red5Pro Video Bandwidth Detection</title>
    <script src="https://unpkg.com/red5pro-webrtc-sdk@latest/red5pro-sdk.min.js"></script>
    <style>
      .form {
        padding: 20px;
        border: 1px solid rgb(64, 64,64);
        color: #fff;
        display: flex;
        flex-direction: column;
        row-gap: 10px;
      }
      .form-entry, .results-entry {
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }
      .form-entry > input, .form-entry > select {
        font-size: 1em;
        padding-left: 10px;
        border: 1px solid black;
      }
      .form-entry > label, .results-entry > .results-title {
        width: 50%;
        margin-right: 10px;
        text-align: right;
      }
      .form--submit {
        text-align: center;
      }
      .results-container {
        margin-top: 20px;
        padding: 20px;
      }
      .results-title {
        color: #db1f26;
        font-weight: 500;
        text-transform: uppercase;
        text-align: center;
      }
      .results {
        margin-top: 20px;
      }
      .ui-button {
  margin-top: 20px;
  padding: 10px 20px;
  background: transparent;
  color: white;
  border: 1px solid white;
  text-transform: unset;
  cursor: pointer;
  transition: 0.3s;
  border-radius: 0.25rem;
}

.ui-button:hover {
  color: #212529;
  background-color: #f8f9fa;
  border-color: #f8f9fa;
}
      .progress-container {
        width: 100%;
        height: 16px;
        background-color: #fff;
      }
      .progress-bar {
        width: 0%;
        height: 100%;
        background-color: #3580A2;
      }
      video {
        width: 100%;
        max-height: 240px;
        background-color: #000;
      }
      @media (max-width: 510px) {
        .form-entry {
          flex-direction: column;
        }
        .form-entry > label {
          width: 100%;
          text-align: left;
          margin-bottom: 10px;
          margin-right: 0px;
        }
        .form-entry > input, .form-entry > select {
          width: 100%;
        }
      }
</style>
  </head>
  <body>
    {{> top-bar }}
    <div class="main-container container">
      <div id="menu-section">
        {{> menu }}
      </div>
      <div id="content-section">
        <div id="subcontent-section">
          <div id="subcontent-section-text">
            <h1>Video Bandwidth Detection</h1>
          </div>
        </div>
        {{> header }}
        <div style="margin-top: 20px">
          <form class="form" action="javascript:" method="post">
            <div class="form-entry form--red5pro">
              <label for="form--red5pro-input">Red5 Pro Server:</label>
              <input type="text" name="form--red5pro-input" class="form--red5pro-input" value="localhost">
            </div>
            <div class="form-entry form--sm">
              <label for="form--sm-input">Use Stream Manager:</label>
              <input type="checkbox" name="form--sm-input" class="form--sm-input">
            </div>
            <div class="form-entry form--stunturn">
              <label for="form--stunturn-input">STUN/TURN Server:</label>
              <input type="text" name="form--stunturn-input" class="form--stunturn-input" value="stun:stun2.l.google.com:19302">
            </div>
            <div class="form-entry form--bitrate">
              <label for="form--bitrate-input">Desired Bitrate (kbps):</label>
              <select name="form--bitrate-input" class="form--bitrate-input">
                <option value="unlimited" selected>Unlimited</option>
                <option value="400">400</option>
                <option value="750">750</option>
                <option value="2500">1500</option>
                <option value="2500">3000</option>
                <option value="6000">6000</option>
                <option value="7500">7500</option>
              </select>
            </div>
            <div class="form-entry form--seconds">
              <label for="form--seconds-input">Bandwidth Check Seconds:</label>
              <input type="number" name="form--seconds-input" class="form--seconds-input" value="35">
            </div>
            <div class="form-entry form--sub">
              <label for="form--sub-input">Include Subscriber:</label>
              <input type="checkbox" name="form--sub-input" class="form--sub-input" checked>
            </div>
            <div class="form--submit">
              <button type="submit" name="form--submit-btn" class="ui-button">Check Bandwidth</button>
            </div>
          </form>
          <div class="results-container">
            <div class="progress-container">
              <div class="progress-bar"></div>
            </div>
            <hr class="top-padded-rule">
            <div>
              <p><span>Out Stats:&nbsp;&nbsp;</span><span class="out-stats-field"></span</p>
              <div>
                <video id="red5pro-publisher" controls autoplay muted height=240></video>
              </div>
            </div>
            <hr class="top-padded-rule">
            <div class="hidden sub-container">
              <p><span>In Stats:&nbsp;&nbsp;</span><span class="in-stats-field"></span</p>
              <div>
                <video id="red5pro-subscriber" controls autoplay muted playsinline height=240></video>
              </div>
            </div>
          </div>
        </div>
        {{> additional_info }}
      </div>
    </div>
    <script src="script/util.js"></script>
    <script src="script/video-bandwidth.js"></script>
  </body>
</html>
