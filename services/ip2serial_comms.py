# On the raspberry pi, get the name of the serial port:-
# dmesg | grep tty

#!/usr/bin/env python
import time
import serial
import socket

HOST = "0.0.0.0"
PORT = 2223  # Port to listen on (non-privileged ports are > 1023)

print("opening serial port")
ser = serial.Serial(
        port='/dev/ttyS0',
        #port='/dev/ttyAMA1',
        baudrate= 9600,
        parity=serial.PARITY_NONE,
        stopbits=serial.STOPBITS_ONE,
        bytesize=serial.EIGHTBITS,
        timeout=3)

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen()
    conn, addr = s.accept()
    conn.settimeout(0)  # non-blocking
    with conn:
        print(f"connected by {addr}\n")
        while True:
            data = b'\xff'
            try:
                data = conn.recv(1024)
            except:
                time.sleep(0.2)
                # print(f"nothing recieved: {data}")
            if data != (b'\xff'):
                print(f"data received: {data}")
                if not data:
                    print(f"exiting while loop")
                    ser.close()
                    break
                conn.sendall((b'\x00\x00\x00') + data)
                print(f"serial write: {data}")
                ser.write(data)
            if ser.in_waiting > 0:
                rec = ser.read_until(b'\xff')
                print(f"serial read: {rec}")
                conn.sendall(rec)
