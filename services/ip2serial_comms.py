# On the raspberry pi, get the name of the serial port:-
# dmesg | grep tty

#!/usr/bin/env python
import time
import serial
import socket

HOST = "0.0.0.0"
PORT = 2223  # Port to listen on (non-privileged ports are > 1023)

ser = serial.Serial(
        port='/dev/ttyS0',
        baudrate=9600,
        parity=serial.PARITY_NONE,
        stopbits=serial.STOPBITS_ONE,
        bytesize=serial.EIGHTBITS,
        timeout=1)

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen()
    conn, addr = s.accept()
    with conn:
        print(f"Connected by {addr}")
        while True:
            data = conn.recv(1024)
            if not data:
                break
            conn.sendall(data)
            ser.write(data)
            rec = ser.read_until(b'\xff')
            rec = rec + ser.read_until(b'\xff')
            conn.sendall(rec)
