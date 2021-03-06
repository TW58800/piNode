const piRebootButton = document.getElementById('pi-reboot-button');

piRebootButton.addEventListener('click', (event) => {
  console.log('pi reboot button clicked');
  piCommand({command:'pi-reboot'});
});

const piCommand = async (args) => {
  const url = '/piHMI';
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
