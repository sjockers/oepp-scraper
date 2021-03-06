#!/usr/bin/env node

var scraperjs = require('scraperjs');
var fs = require('fs');
var Q = require('q');
var json2csv = require('nice-json2csv')

var investmentVolumeUtils = require('./utils/investment_volume.js');
var flatten = require('./utils/flatten.js');

var BASE_URL = 'http://www.ppp-projektdatenbank.de/index.php?id=9&tx_ppp_controller_searchmap[sector]=&tx_ppp_controller_searchmap[subsector]=&tx_ppp_controller_searchmap[state]=&tx_ppp_controller_searchmap[county]=&tx_ppp_controller_searchmap[action][showList]=Suchen&tx_ppp_controller_searchmap[offset]=';
var ITEMS_PER_PAGE = 15;
var output = [];

iterate(0);

function iterate(step) {
  var offset = ITEMS_PER_PAGE * step;
  var indexUrl = BASE_URL + offset;
  var scraper = scrapeProjectIndexPage(indexUrl);

  scraper.then(function(data) {
    data.lastReturn.then(function(datasets) {
      if (datasets.length > 0) {
        output = output.concat(datasets);
        iterate(++step);
      }
      else {
        var processedOutput = flatten(output);
        writeOutputToJSON(processedOutput);
        writeOutputToCSV(processedOutput);
      }
    });
  });
}

function writeOutputToJSON(data) {
  console.log('---\nWriting', data.length, 'items to JSON.');
  var file = fs.createWriteStream('data.json', { encoding: "utf8" });
  file.write(JSON.stringify(data, null, 2));
  file.end();
}

function writeOutputToCSV(data) {
  console.log('---\nWriting', data.length, 'items to CSV.');
  var file = fs.createWriteStream('data.csv', { encoding: "utf8" });
  file.write(json2csv.convert(data));
  file.end();}

function scrapeProjectIndexPage(url) {
  var indexScraper = scraperjs.StaticScraper.create(url);
  return indexScraper.scrape(function($) {
    var details = $("#list td a").map(function() {
      var detailsUrl = $(this).attr('href');
      var detailsDeferred = Q.defer();
      scrapeProjectDetailsPage(detailsUrl).done(function(data) {
        detailsDeferred.resolve(data.lastReturn);
      });
      return detailsDeferred.promise;
    }).get();
    return Q.all(details);
  });
}

function scrapeProjectDetailsPage(url) {
  console.log('scraping... ', url);
  var detailsScraper = scraperjs.StaticScraper.create(url);
  return detailsScraper.scrape(function($) {
    return {
      "Projektüberschrift": $("#content h2").text().replace('Projektüberschrift: ', ''),
      "Beschreibung": $("#content .description").text(),
      src: url,
      data: parseTables($)
    };
  });
}

function parseTables($) {
  var tableData = {};
  $("#content h3").each(function() {
    var tableTitle = $(this).text().trim();
    tableData[tableTitle] = extractTableData($, tableTitle);
  });
  return tableData;
}

function extractTableData($, tableTitle) {
  var input = $('h3:contains("' + tableTitle + '") + table td.label');
  var output = {};
  input.each(function() {
    var key = $(this).text().trim();
    output[key] = $(this).next().text().trim();
  });
  return output;
}
