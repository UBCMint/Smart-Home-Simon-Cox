# Scan computer for available serial ports

import serial.tools.list_ports

def get_ports() -> dict:
  ports =  serial.tools.list_ports.comports()
  port_list = []
  for port, desc, hwid in sorted(ports):
    port_list.append({'name': port, 'desc': desc})
  return {"ports": port_list}
