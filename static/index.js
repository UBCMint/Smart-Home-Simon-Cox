const getSerialPorts = () => {
  $.ajax({
    url: "/api/ports",
    success: ( result ) => {
      console.log(result)
      $("#selector__inner h1").text("Select Cyton Board")
      result.ports.forEach((item, index) => {
        let option = $("#selector__first").clone().attr("id", "");
        let input = option.find("input");
        input.attr("value", item.name);
        if (index == 0) {
          option.find("input").prop("checked", true);
        }
        option.insertAfter("#selector__first");
        option.find("label").text(item.desc);
      })
      $("#selector__form").children().first().hide();
      $("#selector").show()
    }
  })
}

getSerialPorts()

const main = () => {
  console.log("Loaded")
  $("#alert__button").click(() => {$("#alert").hide()})
  $("form").submit((event) => {
    console.log(event)
    let port = $('input[name=radio]:checked', '#selector__form').val()
    event.preventDefault();
    $("#selector__submit").attr("value", "Pairing...")
    $.ajax({
      type: "POST",
      url: "/api/connect",
      data: {"port": port},
      dataType: "json",
      success: ( result ) => {
        console.log(result)
        if(result.connected) {
          console.log("Move on to next screen!")
        } else {
          $("#alert").show();
        }
        $("#selector__submit").attr("value", "Next")
      }
    })
  })
}

$( document ).ready(main);
