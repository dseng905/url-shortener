const dns = require('dns');
const Counters = require('../models/Counters.js');
const URLEntries = require('../models/URLEntries.js');


const createURLEntry = (res,url,index) => {
  URLEntries.create({"url": url, "index": index}, (err,data) => {
    if(err) return;
    res.json({"original_url": url, "short_url": index});
  })
}

exports.createShortURL = (req, res) => {
  let url = req.body.url;

  // Search for '://', store protocol and hostname+path
  var protocolRegExp = /^https?:\/\/(.*)/i;

  // Search for patterns like xxxx.xxxx.xxxx etc.
  var hostnameRegExp = /^([a-z0-9\-_]+\.)+[a-z0-9\-_]+/i;
  // "www.example.com/test/" and "www.example.com/test" are the same URL
  if (url.match(/\/$/i)) url = url.slice(0,-1);
  
  var protocolMatch = url.match(protocolRegExp);
  if (!protocolMatch) {
    return res.json({"error": "invalid URL"});
  }
  
  // remove temporarily the protocol, for dns lookup
  var hostAndQuery = protocolMatch[1];

  // Here we have a URL w/out protocol
  // DNS lookup: validate hostname
  var hostnameMatch = hostAndQuery.match(hostnameRegExp);
  if(hostnameMatch) {
    dns.lookup(hostnameMatch[0], (err) => {
      if(err) {
        res.json({"error": "invalid URL2"});
      }
      else {
        URLEntries.findOne({"url": url}, (err,storedURL) => {
          if(err) {
            return;
          }
          if(storedURL) {
            res.json({
              "url": storedURL.url,
              "short_url": storedURL.index
            })
          }
          else {
            Counters.findOneAndUpdate({}, {$inc: {'count': 1}}, (err,data) =>{
              if(err) return;
              if(data) {
                createURLEntry(res,url,data.count);
              }
              else{
                Counters.create({'count': 1}, (err,newData) => {
                  if(err) return;
                  createURLEntry(res,url,newData.count);
                });
              }
            });
          }
        })
      }
    });
  }
  else {
    res.json({"error": "invalid URL3"});
  }
};

exports.processShortURL = (req, res) => {
  const shortUrl = req.params.shortUrl;
  if(!parseInt(shortUrl,10)){
    res.json({"error": "Wrong Format"});
    return;
  }
  URLEntries.findOne({"index": shortUrl}, (err,data) => {
    if(err) return;
    if(data) res.redirect(data.url);
    else res.json({"error": "URL cannot be found."});
  });
};