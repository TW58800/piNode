#!/bin/env node

let fs = require('fs');
const http = require('http');
const url = require("url");
var exec = require('child_process').exec;
const i2c = require('i2c-bus');

const i2cWrite = (address, register, data) => {
  return new Promise ((resolve, reject) => {
    const buf = Buffer.from(data); 
    const result = {};
    i2c.openPromisified(1).
      then(i2c1 => i2c1.writeI2cBlock(address, register, data.length, buf).
      then(res => {      
        result["address"] = address;
        result["register"] = register;
        result["data"] = buf.toJSON().data;
        result["bytesWritten"] = res.bytesWritten;
        console.log(result);
      }).
      then(_ => {
        i2c1.close();
        console.log('i2c closed');
        resolve(result);
      })).
      catch((error) => {
        console.log(error);
        reject (error);
      });
  });
};

const i2cRead = (address, register, length) => {
  return new Promise ((resolve, reject) => {
    const buf = Buffer.alloc(length); 
    const result = {};
    i2c.openPromisified(1).
      then(i2c1 => i2c1.readI2cBlock(address, register, length, buf).
      then(res => {      
        result["address"] = address;
        result["register"] = register;
        result["data"] = buf.toJSON().data;
        console.log(result);
      }).
      then(_ => {
        i2c1.close();
        console.log('i2c closed');
        resolve(result);
      })).
      catch((error) => {
        console.log(error);
        reject (error);
      });
  });
};

const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;
  console.log("request for " + pathname + " received.");
  const pathname0 = pathname.split("/")[1];
  console.log(pathname0);
  res.writeHead(200);
  switch (pathname0) {
    case "piHMI": 
      handlePiHMIrequest(req, res, pathname);  
      break;
    case "motorHMI": 
      handleMotorHMIrequest(req, res, pathname);  
      break;
    case "cameraHMI": 
      handleCameraHMIrequest(req, res, pathname);  
      break;
    default:
  }
});

server.listen(80, () => {
  const { address, port } = server.address();
  console.log(`Server is listening on: http://${address}:${port}`);
})

const handlePiHMIrequest = (req, res, pathname) => {
  if(pathname == "/piHMI") {
    if (req.method == 'POST') {
      console.log('request method is POST');
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      });
      req.on('end', () => {
	      obj = JSON.parse(data);
        switch (obj.command) {
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
      fs.readFile('piHMI/piHMI.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
      });
    }
  }
  else if (pathname == "/piHMI/HMIfunctions.js") {
    fs.readFile('piHMI/HMIfunctions.js', function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/javascript'});
      res.write(data);
      res.end();
    })
  }
}

const handleMotorHMIrequest = (req, res, pathname) => {
  if(pathname == "/motorHMI/write") {
    if (req.method == 'POST') {
      console.log('request method is POST');
      console.log('i2c write command');
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      });
      req.on('end', async () => {
        try {
          obj = JSON.parse(data);
          const address = parseInt(obj["address"]);
          const register = parseInt(obj["register"]);
          const objData = obj["data"];
          console.log(objData);
          let result = {};
          result = await i2cWrite(address, register, objData);
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end(JSON.stringify(result));          
        }
        catch {
          console.log('i2c write error');
          res.writeHead(400, {'Content-Type': 'text/plain'});
          res.write('bad request');
          res.end();
        }
	    });
    }
  }
  else if(pathname == "/motorHMI/read") {
    if (req.method == 'POST') {
      console.log('request method is POST');
      console.log('i2c read command');
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      });
      req.on('end', async () => {
        try {
          obj = JSON.parse(data);
          const address = parseInt(obj["address"]);
          const register = parseInt(obj["register"]);
          const length = parseInt(obj["length"]);
          let result = {};
          result = await i2cRead(address, register, length);
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end(JSON.stringify(result));          
        }
        catch {
          console.log('i2c read error');
          res.writeHead(400, {'Content-Type': 'text/plain'});
          res.write('bad request');
          res.end();
        }
	    });
    }
  }
  else if (pathname == "/motorHMI") {
    fs.readFile('motorHMI/motorHMI.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
  }
  else if (pathname == "/motorHMI/motorHMIfunctions.js") {
    fs.readFile('motorHMI/motorHMIfunctions.js', function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/javascript'});
      res.write(data);
      res.end();
    })
  }
}

const handleCameraHMIrequest = (req, res, pathname) => {
  if(pathname == "/cameraHMI") {
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
            try {
              exec('sudo systemctl restart stream.service');
              exec(' ');
              exec('libcamera-vid -t 0 -n --width 1080 --height 1920 -b 10000000 --framerate 10 --codec mjpeg --inline --listen -o tcp://192.168.0.83:1234');
              console.log('camera stream restarting');              
            }
            catch {console.log('camera restart failed')};
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
      fs.readFile('cameraHMI/cameraHMI.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
      });
    }
  }
  else if (pathname == "/cameraHMI/cameraHMIfunctions.js") {
    fs.readFile('cameraHMI/cameraHMIfunctions.js', function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/javascript'});
      res.write(data);
      res.end();
    })
  }

}



