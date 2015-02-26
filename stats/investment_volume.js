var _ = require('lodash');
var data = require('../data.json');

var PHASE_3 = 'Phase 3 - Projekt mit Vertragsabschluss';
var PHASE_3A = 'Phase 3a - Projekt mit Vertragsabschluss ohne Endfinanzierung';
var INVESTMENT = 'Investitionsvolumen (in Mio. Euro)';

exports = {
  closedContracts: function () {
    return _.filter(data, function(item) {
      return item.data[PHASE_3] || item.data[PHASE_3A];
    });
  },

  closedContractsWithInvestmentData: function () {
    return _.filter(data, function(item) {
      var data3 = item.data[PHASE_3] || {};
      var data3a = item.data[PHASE_3A] || {};
      return data3[INVESTMENT] || data3a[INVESTMENT] ;
    });
  },

  sumInvestment: function () {
    return _.reduce(exports.closedContractsWithInvestmentData(), function(sum, item) {
      var data3 = item.data[PHASE_3] || {};
      var data3a = item.data[PHASE_3A] || {};
      var investment = data3[INVESTMENT] || data3a[INVESTMENT] ;
      investment = parseFloat(investment.replace(',', '.'));
      return sum += investment;
    }, 0);
  }
};

console.log('---');
console.log('# of projects with phase 3 and 3a data:', exports.closedContracts().length);
console.log('# of projects where investment volume is given:', exports.closedContractsWithInvestmentData().length);
console.log('Total investment value across all projects (in Million Euros):', exports.sumInvestment());

module.exports = exports;
