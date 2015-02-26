var _ = require('lodash');
var CLOSING_DATE = 'Vertragsabschluss (MM.JJJJ)';
var PHASE_3 = 'Phase 3 - Projekt mit Vertragsabschluss';
var PHASE_3A = 'Phase 3a - Projekt mit Vertragsabschluss ohne Endfinanzierung';

dateUtils = {
  toIsoDate: function(dateInput) {
    var dateOutput = dateInput.split('.').reverse();
    // Add day if missing from date:
    if (dateOutput.length < 3) {
      dateOutput.push('01');
    }
    return dateOutput.join('-');
  },

  harmonize: function(data) {
    return _.map(data, function (item) {
      var data3 = item.data[PHASE_3] || {};
      var data3a = item.data[PHASE_3A] || {};
      var closingDate = data3[CLOSING_DATE] || data3a[CLOSING_DATE];
      if (closingDate) {
        item[CLOSING_DATE] = dateUtils.toIsoDate(closingDate);
      }
      return item;
    });
  },

};

module.exports = dateUtils;
