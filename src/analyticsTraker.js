'use strict';

var store = require('redux/store');

function trackView(page) {
  window.analytics.trackView(page);
}

function getPageCurrent() {
  return store.getState().getIn(['screen', 'page']);
}

var analyticsTraker = {
  onDeviceReady: function() {
    window.analytics.startTrackerWithId('UA-44093216-2');

    var pageCurrent = getPageCurrent();

    trackView(pageCurrent);

    store.subscribe(function() {
      var pagePrevious = pageCurrent;
      pageCurrent = getPageCurrent();

      if (pageCurrent !== pagePrevious) {
        trackView(pageCurrent);
      }
    });

    window.onerror = function(message, url, line) {
      window.analytics.trackException(message + '|' + url + '|' + line, true); // (Description, Fatal)
    };
  },
};

module.exports = function() {
  document.addEventListener('deviceready', analyticsTraker.onDeviceReady, false);
};
