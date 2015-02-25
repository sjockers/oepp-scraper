#!/usr/bin/env node

var scraperjs = require('scraperjs');
var fs = require('fs');
var Q = require('q');

var baseUrl = 'http://www.ppp-projektdatenbank.de/index.php?id=9&tx_ppp_controller_searchmap[sector]=&tx_ppp_controller_searchmap[subsector]=&tx_ppp_controller_searchmap[state]=&tx_ppp_controller_searchmap[county]=&tx_ppp_controller_searchmap[action][showList]=Suchen&tx_ppp_controller_searchmap[offset]=';
var out = fs.createWriteStream('data.json', { encoding: "utf8" });

for (i = 0; i < 1; i++) {
  var offset = i * 15;
  var indexUrl = baseUrl + offset;
  var scraper = scrapeProjectIndexPage(indexUrl);

  scraper.then(function(data) {
    data.lastReturn.then(function(sets) {
      console.log(sets);
    });
  });
}

function scrapeProjectIndexPage (url) {
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

function scrapeProjectDetailsPage (url) {
  var detailsScraper = scraperjs.StaticScraper.create(url);
  return detailsScraper.scrape(function($) {
    return {
      title: $("#content h2").text(),
      source: url,
      meta: extractMetaData($)
    };
  });
}

function extractMetaData ($) {
  var input = $('h3:contains("Projektstammdaten") + table td.label');
  var output = {};
  input.each(function() {
    var key = $(this).text().trim();
    output[key] = $(this).next().text().trim();
  });
  return output;
}
