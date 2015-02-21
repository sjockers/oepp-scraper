#!/usr/bin/env node

var scraperjs = require('scraperjs');
var fs = require('fs');

var baseUrl = 'http://www.ppp-projektdatenbank.de/index.php?id=9&tx_ppp_controller_searchmap[sector]=&tx_ppp_controller_searchmap[subsector]=&tx_ppp_controller_searchmap[state]=&tx_ppp_controller_searchmap[county]=&tx_ppp_controller_searchmap[action][showList]=Suchen&tx_ppp_controller_searchmap[offset]=';
var out = fs.createWriteStream('data.json', { encoding: "utf8" });

for (i = 0; i < 10; i++) {
  var offset = i * 15;
  var indexUrl = baseUrl + offset;
  scrapeProjectIndexPage(indexUrl);
}

function scrapeProjectIndexPage (url) {
  var indexScraper = scraperjs.StaticScraper.create(url);
  indexScraper.scrape(function($) {
    $("#list td a").map(function() {
      var detailsUrl = $(this).attr('href');
      scrapeProjectDetailsPage(detailsUrl);
    });
  });
}

function scrapeProjectDetailsPage (url) {
  var detailsScraper = scraperjs.StaticScraper.create(url);

  detailsScraper.scrape(function($) {
    return {
      title: $("#content h2").text(),
      source: url,
      meta: $("td.label").map(function() {
        return {
          label: $(this).text().trim(),
          data: $(this).next().text().trim()
        };
      }).get()
    };
  }, function(item) {
    out.write(JSON.stringify(item, null, 2));
  });
}
