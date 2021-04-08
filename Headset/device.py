# Device connections

import numpy as np
import time
from brainflow.board_shim import BoardShim, BrainFlowInputParams, BrainFlowError

class Device:
  def __init__(self, board_type : int, serial_port : str):
    print("init")
    params = BrainFlowInputParams()
    params.serial_port = serial_port
    params.ip_port = 0
    params.mac_address = ""
    params.other_info = ""
    params.serial_number = ""
    params.ip_address = ""
    params.ip_protocol = 0
    params.timeout = 0
    params.file = ""
    self.params = params
    self.board_type = board_type
    self.board = BoardShim(self.board_type, self.params)
    self.streaming = False

  def run(self, duration : int) -> np.ndarray:
    self.connect()
    time.sleep(duration)
    data = self.get_buffer()
    self.disconnect()
    return data

  def connect(self):
    try:
      self.board.prepare_session()
    except BrainFlowError as error:
      if(error.exit_code == 7):
        print("Error. Check if board is on, dongle is connected")
        return
    self.board.start_stream()
    self.streaming = True
  
  def disconnect(self):
    if (self.streaming):
      self.board.stop_stream()
      self.board.release_session()
      self.streaming = False
    
  def is_streaming(self) -> bool:
    return self.streaming

  def get_buffer(self) -> np.ndarray:
    if(self.streaming):
      return self.board.get_board_data()
    return None

