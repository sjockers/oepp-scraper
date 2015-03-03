var _ = require('lodash');
var investmentValueUtils = require('./investment_volume.js');
var dateUtils = require('./date.js');

var PROJECT_META = 'Projektstammdaten';
var CONTRACTOR = 'Ansprechpartner auf Auftragnehmerseite';

function flatten(data) {
  data = investmentVolumeUtils.filterClosedContractsWithInvestmentData(data);
  data = investmentValueUtils.harmonize(data);
  date = dateUtils.harmonize(data);
  return _.map(data, function(item) {
    _.assign(item, item.data[PROJECT_META]);
    _.assign(item, item.data[CONTRACTOR]);
    delete item.data;
    return item;
  });
}

module.exports = flatten;
