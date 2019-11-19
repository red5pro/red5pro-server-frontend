/*
Copyright © 2015 Infrared5, Inc. All rights reserved.

The accompanying code comprising examples for use solely in conjunction with Red5 Pro (the "Example Code") 
is  licensed  to  you  by  Infrared5  Inc.  in  consideration  of  your  agreement  to  the  following  
license terms  and  conditions.  Access,  use,  modification,  or  redistribution  of  the  accompanying  
code  constitutes your acceptance of the following license terms and conditions.

Permission is hereby granted, free of charge, to you to use the Example Code and associated documentation 
files (collectively, the "Software") without restriction, including without limitation the rights to use, 
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit 
persons to whom the Software is furnished to do so, subject to the following conditions:

The Software shall be used solely in conjunction with Red5 Pro. Red5 Pro is licensed under a separate end 
user  license  agreement  (the  "EULA"),  which  must  be  executed  with  Infrared5,  Inc.   
An  example  of  the EULA can be found on our website at: https://account.red5pro.com/assets/LICENSE.txt.

The above copyright notice and this license shall be included in all copies or portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,  INCLUDING  BUT  
NOT  LIMITED  TO  THE  WARRANTIES  OF  MERCHANTABILITY, FITNESS  FOR  A  PARTICULAR  PURPOSE  AND  
NONINFRINGEMENT.   IN  NO  EVENT  SHALL INFRARED5, INC. BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN  AN  ACTION  OF  CONTRACT,  TORT  OR  OTHERWISE,  ARISING  FROM,  OUT  OF  OR  IN CONNECTION 
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/* global window */
(function (window, fetch) {
  'use strict';

  // see /template/partial/stream_manager_script.hbs
  var isStreamManager = window.jsp_isStreamManager;
  var apiEndpoint = '/streammanager/api/3.1'
  var smEndpoint = apiEndpoint + '/admin/debug/cloudcontroller';

  var streamManagerRequest = function (url) {
    return new window.promisify(function(resolve, reject) {
      fetch(url)
        .then(function (res) {
          if (res.headers.get("content-type") &&
              res.headers.get("content-type").toLowerCase().indexOf("application/json") >= 0) {
              return res.json();
          }
          else {
            throw new TypeError('Could not properly parse response.');
          }
        })
        .then(function (json) {
          if (json.errorMessage) {
            throw new Error(json.errorMessage);
          }
          resolve(json);
        })
        .catch(function (error) {
          var jsonError = typeof error === 'string' ? error : error.message;
          console.error('[Red5 Pro] :: Error - Could not request Edge/Orgin from Stream Manager. ' + jsonError)
          reject(error)
        });
    });
  }

  window.r5pro_isStreamManager = function () {
    var url = smEndpoint; // defaults to assuming this instance as the host.
    return window.promisify(function (resolve, reject) {
      if (typeof isStreamManager !== 'undefined') {
        if (isStreamManager) {
          resolve();
        } else {
          reject(false);
        }
        return;
      }
      // else call out.
      fetch(url)
        .then(function (res) {
          if (res.status !== 404) {
            isStreamManager = true;
            resolve(res);
          }
          else {
            throw new TypeError('Request for cloud controller not found. Most likely not a stream manager instance.');
          }
        })
        .catch(function (error) {
          isStreamManager = false;
          console.log('[Red5 Pro] Not a Stream Manager instance.');
          reject(error);
        });
    });
  };

  window.r5pro_requestOrigin = function (app, streamName) {
    var url = apiEndpoint + '/event/' + app + '/' + streamName + '?action=broadcast';
    return streamManagerRequest(url);
  };

  window.r5pro_requestEdge = function (app, streamName) {
    var url = apiEndpoint + '/event/' + app + '/' + streamName + '?action=subscribe';
    return streamManagerRequest(url);
  }

  window.r5pro_requestLiveStreams = function (app) {
    return window.promisify(function (resolve, reject) {
      var url = apiEndpoint + '/event/list';
      streamManagerRequest(url)
        .then(function (jsonData) {
          var appFiltered = jsonData.filter(function (stream) {
            return stream.scope === app && stream.type === 'edge';
          });
          resolve(appFiltered);
        })
        .catch(reject);
    });
  }

  window.r5pro_requestVODStreams = function (app, type) {
    return window.promisify(function (resolve, reject) {
      var url = apiEndpoint + '/media/' + app + '/' + type;
      streamManagerRequest(url)
        .then(function (jsonData) {
          console.log("Response: " + JSON.stringify(jsonData, null, 2));
          var list = jsonData.hasOwnProperty(type) ? jsonData[type] : [];
          resolve(list);
        })
        .catch(reject);
    });
  }

})(window, window.fetch);
