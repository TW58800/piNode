import cv2  # sudo apt-get install python-opencv
import time
import sys
import socket
import serial

import picamera2
from picamera2 import Picamera2
from picamera2.outputs import FileOutput
from picamera2.encoders import JpegEncoder  # H264Encoder
encoder = JpegEncoder(q=70)  # H264Encoder()

"""
try:
    import picamera2
    from picamera2 import Picamera2
    from picamera2.outputs import FileOutput
    from picamera2.encoders import JpegEncoder  # H264Encoder
    encoder = JpegEncoder(q=70)  # H264Encoder()
    # output = FileOutput('test.h264')
except Exception as err:
    print(f"Unexpected {err=}, {type(err)=}")
    sys.exit(0)
"""


def focusing(val):
    print("send focus command")
    data = bytearray(4)
    data[0] = (val >> 12) & 0x0f
    print(data[0])
    data[1] = (val >> 8) & 0x0f
    print(data[1])
    data[2] = (val >> 4) & 0x0f
    print(data[2])
    data[3] = val & 0x0f
    print(data[3])
    focus_pos = b'\x81\x01\x04\x48' + data[0].to_bytes() + data[1].to_bytes() + data[2].to_bytes() + data[3].to_bytes() + b'\xff'
    ser.write(focus_pos)
    print(f"focus value: {focus_pos}")


def sobel(img):
    img_gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    img_sobel = cv2.Sobel(img_gray, cv2.CV_16U, 1, 1)
    return cv2.mean(img_sobel)[0]


def laplacian(img):
    img_gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    img_sobel = cv2.Laplacian(img_gray, cv2.CV_16U)
    return cv2.mean(img_sobel)[0]


def calculation(cam):
    # print("capturing image")
    try:
        cam_image = cam.capture_array("main")
        print("captured image")
        return laplacian(cam_image)
    except Exception as err:
        print(f"Unexpected {err=}, {type(err)=}")
        output.stop()
        camera.stop()
        camera.close()
        return


if __name__ == "__main__":

    print("opening serial port")
    ser = serial.Serial(
            port='/dev/ttyS0',
            # port='/dev/ttyAMA1',
            baudrate= 9600,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            bytesize=serial.EIGHTBITS,
            timeout=3)

    rec = b'\x00'
    pos = b'\x00'

    max_index = 10
    max_value = 0.0
    last_value = 0.0
    dec_count = 0
    focal_distance = 10

    camera = picamera2.Picamera2()
    camera.configure(camera.create_video_configuration())

    print("opening comms socket")
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s1:
    # s1 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s1.bind(('0.0.0.0', 2223))
        s1.listen()
        conn1, addr1 = s1.accept()
        print(f"connected by {addr1}")
        conn1.settimeout(0)  # non-blocking

    print("opening streaming socket")
    # with socket.socket() as s:  # with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s = socket.socket()
    s.bind(('0.0.0.0', 1234))
    s.listen(0)
    conn, addr = s.accept()
    print(f"connected by {addr}")
    stream = conn.makefile('wb')
    output = FileOutput(stream)
    camera.start_recording(encoder, output)
    output.start()
    print("streaming")

    ser.write(b'\x81\x09\x04\x48\xff')
    time.sleep(2)
    if ser.in_waiting > 0:
        rec = ser.read_until(b'\xff')
        print(f"serial read: {rec}")
        pos = rec[2] << 12
        pos += rec[3] << 8
        pos += rec[4] << 4
        pos += rec[5]
        print(f"position: {pos}")

    while True:
        time.sleep(1)
        data1 = b'\xff'
        try:
            data1 = conn1.recv(1024)
        except:
            # time.sleep(0.1)
            print(f"no comms data recieved: {data1}")
        if data1 != (b'\xff'):
            print(f"comms data received: {data1}")
            conn1.sendall(b'\x00\x00\x00' + data1)
            print(f"serial write: {data1}")
            ser.write(data1)
        if ser.in_waiting > 0:
            rec = ser.read_until(b'\xff')
            print(f"serial read: {rec}")
            conn1.sendall(rec)
        if not data1:
            print(f"comms data -  exiting while loop")
            ser.close()
            break
        """
        data = b'\xff'
        try:
            print("data = conn.recv(1024)")
        except Exception as err:
            # print(f"Unexpected {err=}, {type(err)=}")
            time.sleep(0.1)
            print(f"no streaming data recieved: {data}")
        if data != b'\xff':
            print(f"streaming data received: {data}")
            # conn.sendall((b'\x00\x00\x00') + data)
        if not data:
            print(f"stream closing - exiting while loop")
            # break
            print("(break commented out)")
        """

        try:
            # Adjust focus
            # focusing(focal_distance)
            # Take image and calculate image clarity


            # val = calculation(camera)
            val = 0

            print(f"lapacian value: {val}")
            # Find the maximum image clarity
            if val > max_value:
                max_index = focal_distance
                max_value = val
                # print("val > max")
            # If the image clarity starts to decrease
            if val < last_value:
                dec_count += 1

                # pos = pos + 255  # b'\xff'

                focusing(pos)
                #print("val < last_value")
            else:
                dec_count = 0

                # pos = pos - 255  # b'\xff'

                focusing(pos)
                print("dec_count = 0")
            # Image clarity is reduced by six consecutive frames
            if dec_count > 6:
                #print("dec_count > 6")
                break
            last_value = val
            # Increase the focal distance
            focal_distance += 15
            # if focal_distance > 1000:
                # print("focal_distance > 1000")
                # break
            # Adjust focus to the best
            # focusing(max_index)
            # print("max index = %d,max value = %lf" % (max_index, max_value))

        except Exception as err:
            print(f"Unexpected {err=}, {type(err)=}")
    # time.sleep(60)
    print("stopped")
    output.stop()
    camera.stop()
    camera.close()
    ser.close()
