const buttons = ["#controls__channel_up", "#controls__channel_down", "#controls__power_btn"]
const timeout = 2000
let currentBtn = 0
let channels = 0
let showGraph = true
let gattCharacteristic = null
let chart = null
let buttonClicked = false
let buttonShown = false
let intervalCount = 0

const updateAlert = (title, description, button) => {
  $("#alert__title").text(title)
  $("#alert__desc").text(description)
  $("#alert__button").text(button)
}

function triggerDevice() {
  console.log("Trigger device")
  buttonClicked = true
  if (!gattCharacteristic) {
    return
  }

  if(currentBtn == 2) {
    gattCharacteristic.writeValue(new TextEncoder().encode(String('o')))
  } else if(currentBtn == 0) {
    gattCharacteristic.writeValue(new TextEncoder().encode(String('a')))
  } else if(currentBtn == 1) {
    gattCharacteristic.writeValue(new TextEncoder().encode(String('b')))
  }
}

const generateGraph = () => {
  $.get('/api/model_output', function(data) {
      $("#model_out").text(data.result);
      if (data.result === 1) {
        triggerDevice();
      }
    });
    $.get('/api/model_data', function(data) {
      $("#model_data").text(data.result);
      ch1 = (document.getElementById("ch1").checked || document.getElementById("all").checked) ? data.result[0] : 0;
      ch2 = (document.getElementById("ch2").checked || document.getElementById("all").checked) ? data.result[1] : 0;
      ch3 = (document.getElementById("ch3").checked || document.getElementById("all").checked) ? data.result[2] : 0;
      ch4 = (document.getElementById("ch4").checked || document.getElementById("all").checked) ? data.result[3] : 0;
      ch5 = (document.getElementById("ch5").checked || document.getElementById("all").checked) ? data.result[4] : 0;
      ch6 = (document.getElementById("ch6").checked || document.getElementById("all").checked) ? data.result[5] : 0;
      ch7 = (document.getElementById("ch7").checked || document.getElementById("all").checked) ? data.result[6] : 0;
      ch8 = (document.getElementById("ch8").checked || document.getElementById("all").checked) ? data.result[7] : 0;
    });
}

function plotData() {
  if (chart == null) {
    chart = Highcharts.chart('container', {
      title: {
        text: 'Live Voltage Readings'
      },
      
      yAxis: {
        title: {
          text: 'Voltage'
        }
      },
      
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
      },
      
      plotOptions: {
        series: {
          label: {
            connectorAllowed: false
          }
        }
      },
      
      series: [{
        name: 'Channel 1',
        data: ch1
      }, {
        name: 'Channel 2',
        data: ch2
      }, {
        name: 'Channel 3',
        data: ch3
      }, {
        name: 'Channel 4',
        data: ch4
      }, {
        name: 'Channel 5',
        data: ch5
      }, {
        name: 'Channel 6',
        data: ch6
      }, {
        name: 'Channel 7',
        data: ch7
      }, {
        name: 'Channel 8',
        data: ch8
      }],
      
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom'
            }
          }
        }]
      }
    });
  } else {
    if(showGraph) {
      chart.series[0].setData(ch1)
      chart.series[1].setData(ch2)
      chart.series[2].setData(ch3)
      chart.series[3].setData(ch4)
      chart.series[4].setData(ch5)
      chart.series[5].setData(ch6)
      chart.series[6].setData(ch7)
      chart.series[7].setData(ch8)
      chart.redraw()
    }
  }
}

const isWebBLEAvailable = () => {
    if (!navigator.bluetooth) {
        console.log('BLE not available')
        return false
    }
    console.log('Success')
    return true
}

const getDeviceInfo = () => {
    let options = {
        filters: [
            {services: [0xFFE0]}
        ]
    }

    navigator.bluetooth.requestDevice(options).then(device => {
        console.log('Name: ' + device.name)
        console.log(device)
        currDevice = device
        currDevice.gatt.connect().then(server => {
          return server.getPrimaryService(0xFFE0) //changed from 0xFE00 
        }).then(service => {
          return service.getCharacteristic(0xFFE1)
        }).then(characteristic => {
          gattCharacteristic = characteristic
          return gattCharacteristic
        })
    }).catch( error => {
        updateAlert("Error", error, "Ok")
        $("#alert").show();
        $("#controls__button").show()
        $("#controls__buttons").hide()
    })
}

const getBluetooth = () => {
  if(isWebBLEAvailable()) {
    getDeviceInfo()
  } else {
    $("#alert").show()
  }
}

const selectButton = (btn, lastBtn) => {
  $(`${btn}_selected`).show()
  $(`${lastBtn}_selected`).hide()
  $(lastBtn).show()
  $(btn).hide()
}

const clickButton = (btn) => {
  $(`${btn}_clicked`).show()
  $(`${btn}_selected`).hide()
}

const unClickButton = (btn) => {
  $(`${btn}_clicked`).hide()
  $(`${btn}`).show()
}

const controlsInterval = () => {
  setInterval(() => {
    intervalCount++
    if (buttonClicked) {
      buttonShown = true
      buttonClicked = false
      clickButton(buttons[currentBtn])
      return
    }
    if (buttonShown) {
      unClickButton(buttons[currentBtn])
    }
    if(intervalCount % 2) {
      let lastBtn = currentBtn
      if(currentBtn >= buttons.length - 1) {
        currentBtn = 0
      } else {
        currentBtn += 1
      }
      selectButton(buttons[currentBtn], buttons[lastBtn])
    }
  }, 1000)
}

const main = () => {
  console.log("Loaded")
  $("#controls__button").click(() => {
    $("#controls__button").hide()
    $("#controls__buttons").show()
    controlsInterval()
    if(isWebBLEAvailable()) {
      getDeviceInfo()
    } else {
      updateAlert("Error", "Could not connect to bluetooth", "Ok")
      $("#alert").show();
      $("#controls__button").show()
      $("#controls__buttons").hide()
    }
  })
  $("#alert__button").click(() => {$("#alert").hide()})
  $("#graph__button img").click(() => {
    console.log(showGraph)
    if(showGraph) {
      $("#graph__slide").hide()
      $("#graph__button").css("transform", "rotate(0deg)")
    } else {
      $("#graph__slide").show()
      $("#graph__button").css("transform", "rotate(180deg)")
    }
    showGraph = !showGraph
  })
  channels = $("#graph__form").children().length - 1
  setInterval(generateGraph, timeout);
  setInterval(plotData, timeout);
}

$( document ).ready(main);
