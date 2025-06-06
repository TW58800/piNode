const gpioOnButton = document.getElementById('gpio-on-button');
const gpioOffButton = document.getElementById('gpio-off-button');

gpioOnButton.addEventListener('click', (event) => {
  console.log('gpio on button clicked');
  gpioCommand({command:'on'});
});

gpioOffButton.addEventListener('click', (event) => {
  console.log('gpio off button clicked');
  gpioCommand({command:'off'});
});

const gpioCommand = async (args) => {
  const url = '/gpioHMI';
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
