const camRestartButton = document.getElementById('cam-restart-button');

camRestartButton.addEventListener('click', (event) => {
  console.log('camera restart button clicked');
  cameraCommand({command:'cam-restart'});
});

const cameraCommand = async (args) => {
  const url = '/cameraHMI';
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
