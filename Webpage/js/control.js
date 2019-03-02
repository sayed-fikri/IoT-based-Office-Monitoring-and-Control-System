var newLine = false;

// Data format
var data = {
	//"device_developer_id": devid,
	"data": {cmd:'',option:{}}
 };

$(document).ready(function () {
    $('#led1Control').click(function(){
        console.log($("#led1Indicator").attr("src"));
        if ($("#led1Indicator").attr("src") == "images/indicator/0.png"){
            $("#led1Indicator").attr("src", "images/indicator/1.png");
            $('#led1Control').attr("src", "images/button/vertical_on_off/1.png");
            
            publish({cmd:'light',option:{sub:'off',sub2:'1'}});

        }else{
            $("#led1Indicator").attr("src", "images/indicator/0.png");
            $('#led1Control').attr("src", "images/button/vertical_on_off/0.png");
            
            publish({cmd:'light',option:{sub:'on',sub2:'1'}});

        }
    });

    $('#led2Control').click(function(){
        console.log($("#led2Indicator").attr("src"));
        if ($("#led2Indicator").attr("src") == "images/indicator/0.png"){
            $("#led2Indicator").attr("src", "images/indicator/1.png");
            $('#led2Control').attr("src", "images/button/vertical_on_off/1.png");
            
            publish({cmd:'light',option:{sub:'off',sub2:'1'}});

        }else{
            $("#led2Indicator").attr("src", "images/indicator/0.png");
            $('#led2Control').attr("src", "images/button/vertical_on_off/0.png");
            
            publish({cmd:'light',option:{sub:'on',sub2:'1'}});

        }
    });
       
});


function publish(msg)
{
    var message = new Paho.MQTT.Message(JSON.stringify(msg));
    message.destinationName = "io.data";
    mqtt.send(message);
}