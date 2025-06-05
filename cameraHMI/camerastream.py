#import os, time

#cmd = "libcamera-vid -t 0 -n --width 1920 --height 1080 -b 10000000 --framerate 10 --codec mjpeg --inline --listen -o tcp://192.168.0.83:1234"
#os.system(cmd)


import socket
import time
from picamera2 import Picamera2, Preview
import time

#import logging

#logging.basicConfig(level=logging.INFO, format='%(asctime)s:%(levelname)s:%(message)s', filename='/home/pi/cameraHMIlog.log')
#logger = logging.getLogger(__name__)

def cameraStream():
    camera = Picamera2()# picamera2.PiCamera2()
    camera.resolution = (1920, 1080)
    camera.framerate = 10
    camera.rotation = 180
    count = 0
    while (True):        
        server_socket = socket.socket()
        server_socket.bind(('0.0.0.0', 1234))
        server_socket.listen(0)
        #logger.info('{}: listening for a connection on port 1234'.format(count))
        #logger.warning('{}: listening for a connection on port 1234'.format(count))
        # Accept a single connection and make a file-like object out of it
        while (True):
            connection = server_socket.accept()[0].makefile('wb')
            #logger.info('{}: connection made'.format(count))
            try:
                camera.start_recording(connection, format='mjpeg')
                #logger.info('{}: recording started, runtime 24 hours'.format(count))   
                time.sleep(86400)                          
                #logger.info('{}: 24 hours elapsed'.format(count))  
                #camera.wait_recording(1800)                
            except Exception as e:                
                #logger.info('{}: recording failed, {e}'.format(count))              
                connection.close()   
                break 
            try:         
                camera.stop_recording()
                #logger.info('{}: recording stopped'.format(count))  
            except Exception as e:                
                #logger.info('{}: stop recording failed, {e}'.format(count))
                connection.close()   
                break    
            finally:
                connection.close()
                #logger.info('{}: connection closed'.format(count))
                time.sleep(10)           
                #logger.info('{}: 10 seconds elapsed'.format(count)) 
        server_socket.close()
        #logger.info('{}: socket closed'.format(count))
        time.sleep(10)
        count += 1
        
cameraStream()
