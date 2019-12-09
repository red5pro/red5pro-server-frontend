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
/* global window, document */
(function (window, document) {
  'use strict';

  var filterCallbacks = [];
  var filteredItems = [];
  window.r5pro_addFilterCallback = function (cb) {
    filterCallbacks.push(cb);
  }

  var initializeFilter = function () {
    var container = document.getElementsByClassName('filter-section')[0];
    if (!container) {
      console.warn('Could not find filter section.');
      return;
    }
    var targetClassName = container.getAttribute('data-target');
    var target = document.getElementsByClassName(targetClassName)[0];
    if (!target) {
      console.warn('Could not find filter target with class name: ' + targetClassName + '.');
      return;
    }

    var children = target.childNodes;
    var input = document.getElementById('filter-input');
    var typeInputs = document.getElementsByClassName('type-input');
    var filterOnTypes = typeInputs.length > 0;
    var selectedTypes = [];
    var filterTarget = function () {
      filteredItems.length = 0;
      var i = children.length;
      var child, name;
      while(--i > -1) {
        child = children.item(i);
        if (typeof child.getAttribute !== 'function') continue;
        name = child.getAttribute('data-streamname');
        if (!name.match(input.value)) {
          child.classList.add('hidden');
          filteredItems.push(child);
        } else {
          child.classList.remove('hidden');
        }
        if (filterOnTypes) {
          var str = '(\\.' + selectedTypes.join('|\\.') + ')';
          var reg = new window.RegExp(str);
          if (reg.exec(name) === null) {
            child.classList.add('hidden');
            filteredItems.push(child);
          }
        }
      }

      i = filterCallbacks.length;
      while (--i > -1) {
        filterCallbacks[i](filteredItems);
      }
    }
    input.addEventListener('change', filterTarget);
    input.addEventListener('input', filterTarget);

    if (filterOnTypes) {
      var tindex = typeInputs.length;
      var typeInput;
      var getTargetTypeFromInput = function (input) {
        return input.getAttribute('name').split('type-')[1]
      }
      var filterTargetTypes = function (event) {
        var typeTarget = event.target;
        var type = getTargetTypeFromInput(typeTarget);
        if (typeTarget.checked) {
          selectedTypes.push(type);
        } else {
          var indexOf = selectedTypes.indexOf(type);
          if (indexOf > -1) {
            selectedTypes.splice(indexOf, 1);
          }
        }
        filterTarget();
      }
      while (--tindex > -1) {
        typeInput = typeInputs[tindex]
        typeInput.addEventListener('change', filterTargetTypes);
        selectedTypes.push(getTargetTypeFromInput(typeInput));
      }
    }
  }

  if (/comp|inter|loaded/.test(document.readyState)) {
    initializeFilter();
  } else {
    document.addEventListener('DOMContentLoaded', initializeFilter, false);
  }
  window.r5pro_initializeFilter = initializeFilter;

})(window, document);
