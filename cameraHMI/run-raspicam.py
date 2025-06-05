import os

cmd = "while :; do libcamera-vid -t 0 -n --codec MJPEG --width 1920 --height 1080 --framerate 10 --inline --listen -o tcp://0.0.0.0:1234 ; done"

os.system(cmd)
