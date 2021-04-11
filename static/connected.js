let buttons = ["#controls__channel_up", "#controls__channel_down", "#controls__power_btn"]
let currentBtn = 0
let channels = 0
let showGraph = false

const updateAlert = (title, description, button) => {
  $("#alert__title").text(title)
  $("#alert__desc").text(description)
  $("#alert__button").text(button)
}

const generateGraph = () => {
  $.get($SCRIPT_ROOT  + '/_model_output', function(data) {
      $("#model_out").text(data.result);
      if (data.result == "0") {
        console.log('the model output is 0');
        console.log(document.getElementById("one"));
        //document.getElementById("one").style.visibility="hidden";
        document.getElementById("one").style.visibility="visible";
      } else {
        console.log('the model output is 1')
        console.log(document.getElementById("zero"));
        //document.getElementById("zero").style.visibility="hidden";
        document.getElementById("one").style.visibility="visible";
      }
    });
    $.get($SCRIPT_ROOT + '/_model_data', function(data) {
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
            // { name: 'MINT Remote'}
            { services: ['battery_service'] }
        ]
    }

    navigator.bluetooth.requestDevice(options).then(device => {
        console.log('Name: ' + device.name)
        console.log(device)
    }).catch( error => {
        console.log('Error: ' + error)
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

const main = () => {
  console.log("Loaded")
  $("#alert__button").click(() => {$("#alert").hide()})
  $("#graph__button").click(() => {
    if(showGraph) {
      $("#graph__container").hide()
    } else {
      $("#graph__container").show()
    }
    showGraph = !showGraph
  })
  channels = $("#graph__form").children().length - 1
  setInterval(() => {
    let lastBtn = currentBtn
    if(currentBtn >= buttons.length - 1) {
      currentBtn = 0
    } else {
      currentBtn += 1
    }
    selectButton(buttons[currentBtn], buttons[lastBtn])
  }, 1000)

}

$( document ).ready(main);
