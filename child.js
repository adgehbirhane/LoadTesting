"use strict";
const http = require('http');
const https = require('https');
const url = require('url');

// Parse command line arguments
const args = process.argv.slice(2);
const urlArg = args.find(arg => arg.startsWith('--url='));
const targetUrl = urlArg ? urlArg.split('=')[1] : '';

if (!targetUrl) {
  console.error('URL argument not provided');
  process.exit(1);
}

// Determine protocol to use (http or https)
const protocol = url.parse(targetUrl).protocol === 'https:' ? https : http;

const start = process.hrtime();

protocol.get(targetUrl, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const responseTime = (seconds * 1000) + (nanoseconds / 1e6);
    console.log(`Response Time: ${responseTime.toFixed(2)} ms`);
    process.exit(0);
  });
}).on('error', (err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
