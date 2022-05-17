#!/bin/env node

let fs = require('fs');
const http = require('http');
let url = require("url");
var exec = require('child_process').exec;


const server = http.createServer((req, res) => {

  const pathname = url.parse(req.url).pathname;
  console.log("request for " + pathname + " received.");
  res.writeHead(200);

  if(pathname == "/") {
    if (req.method == 'POST') {
      console.log('request method is POST');
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      });
      req.on('end', () => {
	obj = JSON.parse(data);
        switch (obj.command) {
          case 'cam-restart': {
            console.log('payload contains command to restart camera');
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('cam restart');
            res.end();
	    exec('sudo systemctl restart stream.service');
	    break;
  	  }
          case 'pi-reboot': {
            console.log('payload contains command to reboot pi');
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('pi reboot');
            res.end();
            exec('sudo reboot');
            break;
          }
	  default: {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('bad request');
            res.end();
	    break;
	  }
        }
      });
    }
    else {
      fs.readFile('piHMI.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
      });
    }
  }
  else if (pathname == "/HMIfunctions.js") {
    fs.readFile('HMIfunctions.js', function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/javascript'});
      res.write(data);
      res.end();
    })
  }
});

server.listen(8080, () => {
  const { address, port } = server.address();
  console.log(`Server is listening on: http://${address}:${port}`);
})




