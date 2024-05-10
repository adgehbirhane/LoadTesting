"use strict";
const childProc = require("child_process");
const { performance } = require('perf_hooks');
const CHILD_PROCESSES = 20;
const URL = 'http://localhost:3000';

(async () => {
  let responseTimes = [];
  let children = [];

  for (let i = 0; i < CHILD_PROCESSES; i++) {
    let childProcess = childProc.spawn("node", ["child.js", `--url=${URL}`])
    children.push(childProcess);
  }

  let responses = children.map(function wait(child) {
    return new Promise(function c(res) {
      let start = performance.now();
      child.stdout.on('data', (data) => {
        console.log(`child stdout: ${data}`);
      });
      child.on("exit", function (code) {
        if (code === 0) {
          let end = performance.now();
          let elapsedTime = end - start;
          responseTimes.push(elapsedTime);
          res(true);
        } else {
          res(false);
        }
      });
    });
  });

  responses = await Promise.all(responses);

  if (responses.filter(Boolean).length == responses.length) {
    const sum = responseTimes.reduce((a, b) => a + b, 0);
    const avgResponseTime = (sum / responseTimes.length) || 0;
    console.log(`Average Response Time: ${avgResponseTime.toFixed(2)} milliseconds`);
    console.log("Performance testing completed successfully!");
  } else {
    console.log("Performance testing failed!");
  }
})();
