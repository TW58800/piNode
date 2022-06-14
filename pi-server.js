#!/bin/env node

let fs = require('fs');
const http = require('http');
let url = require("url");
var exec = require('child_process').exec;
//import { Buffer } from 'node:buffer';
const i2c = require('i2c-bus');
const pan_address = 0x28;


const i2cRead = (address, register, length, buf) => {
  /*
  try {
    const i2c1 = i2c.openSync(1);
    const buf = Buffer.alloc(length);
    const bytes = i2c1.i2cReadBlockSync(address, length, register, buf);
    console.log(bytes);
    i2c1.closeSync();
  }
  catch {return ' error'};
  */
  
  i2c.openPromisified(1).
    then(i2c1 => i2c1.readI2cBlock(address, register, length, buf)).
      then(res => console.log(res)).
        then(_ => {i2c1.close(), console.log('i2c closed')}).
  catch((error) => console.log(error));
}

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
          case 'i2c': {
            console.log('payload contains i2c command');
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('pi i2c');   
            const buf = Buffer.alloc(1);         
            res.end(i2cRead(0x28, 0x04, 1, buf));
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




