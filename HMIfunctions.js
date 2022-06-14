const camRestartButton = document.getElementById('cam-restart-button');
const piRebootButton = document.getElementById('pi-reboot-button');
const i2cButton = document.getElementById('i2c-button');


camRestartButton.addEventListener('click', (event) => {
  console.log('camera restart button clicked');
  piCommand({command:'cam-restart'});
});

piRebootButton.addEventListener('click', (event) => {
  console.log('pi reboot button clicked');
  piCommand({command:'pi-reboot'});
});

i2cButton.addEventListener('click', (event) => {
  console.log('pi i2c button clicked');
  piCommand({command:'i2c'});
});


const piCommand = async (args) => {
  const url = '/';
  const data = JSON.stringify({command: args.command});
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
