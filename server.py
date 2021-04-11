from flask import Flask, jsonify, render_template, request
from ML.deploy import DeployModel
from Headset.ports import get_ports
from Headset.device import Device
import time

board_type = 0 # Cyton board

dm = DeployModel('')
app = Flask(__name__)

device = None
bluetooth_device = ""

@app.route('/')
def index():
	return render_template('index.html')

@app.route('/connected')
def connected():
  return render_template('connected.html')

@app.route('/api/model_data')
def model_data():
	return jsonify(result=dm.get_data_and_model()[0])
	
@app.route('/api/model_output')
def model_output():
	return jsonify(result=dm.get_data_and_model()[1])

@app.route('/api/ports')
def ports():
  return get_ports()

@app.route('/api/connect', methods=['GET', 'POST'])
def connect():
  print("CONNECTING")
  port = request.form.get('port')
  if (port != None):
    device = Device(board_type, port)
    # connected = device.connect()
    connected = True # For testing purposes
    time.sleep(0.6)
    return {"connected": connected}
  return {"connected": False}

# @app.route('/api/')
