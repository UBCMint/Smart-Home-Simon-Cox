const updateSelector = (title, list) => {
  $("#selector__inner h1").text(title)
  $(".selector__option").remove()
  list.forEach((item, index) => {
    let option = $("#selector__first").clone().attr("id", "").addClass("selector__option") 
    let input = option.find("input");
    input.attr("value", item.value);
    if (index == 0) {
      option.find("input").prop("checked", true);
    }
    option.insertAfter("#selector__first");
    option.find("label").text(item.name);
  })
  $("#selector__form").children().first().hide();
  $("#selector").show()
}

const updateAlert = (title, description, button) => {
  $("#alert__title").text(title)
  $("#alert__desc").text(description)
  $("#alert__button").text(button)
}

const getSerialPorts = () => {
  $.ajax({
    url: "/api/ports",
    success: ( result ) => {
      updateSelector("Select Cyton Board", result.ports)
    }
  })
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

getSerialPorts()

const main = () => {
  console.log("Loaded")
  $("#alert__button").click(() => {$("#alert").hide()})
  $("form").submit((event) => {
    console.log(event)
    let port = $('input[name=radio]:checked', '#selector__form').val()
    event.preventDefault();
    $("#selector__submit").attr("value", "Pairing...").css("opacity", "0.6")
    $.ajax({
      type: "POST",
      url: "/api/connect",
      data: {"port": port},
      dataType: "json",
      success: ( result ) => {
        console.log(result)
        if(result.connected) {
          console.log("Move on to next screen!")
          updateSelector("Connect to Bluetooth", [])
          updateAlert("Error", "Could not connect to bluetooth", "Ok")
          getBluetooth()
        } else {
          $("#alert").show();
        }
        $("#selector__submit").attr("value", "Next").css("opacity", "1")
      }
    })
  })
}

$( document ).ready(main);
