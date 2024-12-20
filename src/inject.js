/* global chrome, fetch*/
const API = 'https://api.github.com/repos/'
function getUsernameWithReponameFromGithubURL (url) {
  var parser = document.createElement('a')
  parser.href = url
  var repoURL = parser.pathname.substring(1).split('/')
  return repoURL[0] + '/' + repoURL[1]
}
function formatKiloBytes (bytes) {
  if (bytes === 0) {
    return {
      size: 0,
      measure: 'Bytes'
    }
  }
  bytes *= 1024
  var k = 1024
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  var i = Math.floor(Math.log(bytes) / Math.log(k))
  return {
    size: parseFloat((bytes / Math.pow(k, i)).toFixed(2)),
    measure: sizes[i]
  }
}
function checkStatus (response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}
function parseJSON (response) {
  return response.json()
}
function getRepoSize (repo, callback) {
  fetch(API + repo)
    .then(checkStatus)
    .then(parseJSON)
    .then(function (data) {
      callback(data.size)
    }).catch(function (error) {
      if (error) {}
      callback(0)
    })
}
chrome.extension.sendMessage({}, function (response) {
  var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval)
      let ns = document.querySelector('ul.numbers-summary')
      if (ns !== null) {
        getRepoSize(getUsernameWithReponameFromGithubURL(window.location.href), function (size) {
          var fb = formatKiloBytes(size)
          var html = '<li>' +
            '<a>' +
            '<svg class="octicon octicon-database" aria-hidden="true" height="16" version="1.1" viewBox="0 0 12 16" width="12">' +
            '<path d="M6 15c-3.31 0-6-.9-6-2v-2c0-.17.09-.34.21-.5.67.86 3 1.5 5.79 1.5s5.12-.64 5.79-1.5c.13.16.21.33.21.5v2c0 1.1-2.69 2-6 2zm0-4c-3.31 0-6-.9-6-2V7c0-.11.04-.21.09-.31.03-.06.07-.13.12-.19C.88 7.36 3.21 8 6 8s5.12-.64 5.79-1.5c.05.06.09.13.12.19.05.1.09.21.09.31v2c0 1.1-2.69 2-6 2zm0-4c-3.31 0-6-.9-6-2V3c0-1.1 2.69-2 6-2s6 .9 6 2v2c0 1.1-2.69 2-6 2zm0-5c-2.21 0-4 .45-4 1s1.79 1 4 1 4-.45 4-1-1.79-1-4-1z"></path>' +
            '</svg>' +
            '<span class="num text-emphasized"> ' +
            fb.size +
            '</span> ' +
            fb.measure +
            '</a>' +
            '</li>'
          ns.insertAdjacentHTML('beforeend', html)
        })
      }
    }
  }, 10)
})