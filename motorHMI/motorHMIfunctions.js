const panLeft = document.getElementById('pan-left');
const panRight = document.getElementById('pan-right');
const tiltUp = document.getElementById('tilt-up');
const tiltDown = document.getElementById('tilt-down');
const panHome = document.getElementById('pan-home');

panLeft.addEventListener('click', (event) => {
  console.log('pan left button clicked');
  motorWrite({address: 40, register: 6, data: [(65536-200) >> 8, (65536-200) & 255]});
});

panRight.addEventListener('click', (event) => {
  console.log('pan right button clicked');
  motorWrite({address: 40, register: 6, data: [0,200]});
});

tiltUp.addEventListener('click', (event) => {
  console.log('tilt up button clicked');
  motorWrite({address: 41, register: 6, data: [0,200]});
});

tiltDown.addEventListener('click', (event) => {
  console.log('tilt down button clicked');
  motorWrite({address: 41, register: 6, data: [(65536-200) >> 8, (65536-200) & 255]});
});

panHome.addEventListener('click', (event) => {
  console.log('pan home button clicked');
  motorWrite({address: 40, register: 5, data: [(30000) >> 8, (30000) & 255]});
});

const motorRead = async (args) => {
  const url = '/motorHMI/read';
  const data = JSON.stringify({address: args.address, register: args.register, length: args.length});
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: data,
      headers: {
        'Content-type': 'application/json'}
      });
      if(response.ok){
        console.log('request received by server');
        console.log(response);
      }
  }
  catch (error) {
    console.log(error);
  }
};

const motorWrite = async (args) => {
  const url = '/motorHMI/write';
  const data = JSON.stringify({address: args.address, register: args.register, data: args.data});
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: data,
      headers: {
        'Content-type': 'application/json'}
      });
      if(response.ok){
        console.log('request received by server');
        console.log(response);
      }
  }
  catch (error) {
    console.log(error);
  }
};