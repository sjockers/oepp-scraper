var _ = require('lodash');
var investmentValueUtils = require('./investment_volume.js');

function flatten(data) {
  data = investmentVolumeUtils.filterClosedContractsWithInvestmentData(data);
  data = investmentValueUtils.harmonize(data);
  return _.map(data, function(item) {
    _.assign(item, item.data.Projektstammdaten);
    delete item.data;
    return item;
  });
}

module.exports = flatten;
