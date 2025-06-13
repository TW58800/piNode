const gpio05OnButton = document.getElementById('gpio-05-on-button');
const gpio05OffButton = document.getElementById('gpio-05-off-button');
const gpio06OnButton = document.getElementById('gpio-06-on-button');
const gpio06OffButton = document.getElementById('gpio-06-off-button');

gpio05OnButton.addEventListener('click', (event) => {
  console.log('gpio on button clicked');
  gpioCommand({command:'on', data: 517});  
});

gpio05OffButton.addEventListener('click', (event) => {
  console.log('gpio off button clicked');
  gpioCommand({command:'off', data: 517});
});

gpio06OnButton.addEventListener('click', (event) => {
  console.log('gpio on button clicked');
  gpioCommand({command:'on', data: 518});  
});

gpio06OffButton.addEventListener('click', (event) => {
  console.log('gpio off button clicked');
  gpioCommand({command:'off', data: 518});
});

const gpioCommand = async (args) => {
  const url = '/gpioHMI';
  const data = JSON.stringify({command: args.command, data: args.data});
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
