var _ = require('lodash');

var PHASE_3 = 'Phase 3 - Projekt mit Vertragsabschluss';
var PHASE_3A = 'Phase 3a - Projekt mit Vertragsabschluss ohne Endfinanzierung';
var INVESTMENT = 'Investitionsvolumen (in Mio. Euro)';
var CLOSING_DATE = 'Vertragsabschluss (MM.JJJJ)';

investmentVolumeUtils = {
  filterClosedContracts: function (data) {
    return _.filter(data, function(item) {
      return item.data[PHASE_3] || item.data[PHASE_3A];
    });
  },

  filterClosedContractsWithInvestmentData: function (data) {
    return _.filter(data, function(item) {
      var data3 = item.data[PHASE_3] || {};
      var data3a = item.data[PHASE_3A] || {};
      return data3[INVESTMENT] || data3a[INVESTMENT] ;
    });
  },

  harmonize: function(data) {
    return _.map(data, function (item) {
      var data3 = item.data[PHASE_3] || {};
      var data3a = item.data[PHASE_3A] || {};
      var investment = data3[INVESTMENT] || data3a[INVESTMENT];
      var closingDate = data3[CLOSING_DATE] || data3a[CLOSING_DATE];
      if (investment) {
        item[INVESTMENT] = parseFloat(investment.replace(',', '.'));
      }
      if (closingDate) {
        item[CLOSING_DATE] = closingDate;
      }
      return item;
    });
  },

  processSum: function (data) {
    data = investmentVolumeUtils.filterClosedContractsWithInvestmentData(data);
    data = investmentVolumeUtils.harmonize(data);
    return _.reduce(data, function(sum, item) {
      return sum += item[INVESTMENT];
    }, 0);
  }
};

module.exports = investmentVolumeUtils;
