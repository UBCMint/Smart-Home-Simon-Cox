# Scan computer for available serial ports

import serial.tools.list_ports

def get_ports():
  return serial.tools.list_ports.comports()
  # for port, desc, hwid in sorted(ports):
    # print("{}: {} [{}]".format(port, desc, hwid))
