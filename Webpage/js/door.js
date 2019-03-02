
var dtLog;

$(document).ready(function () {
    dtLog = $('#dtLog').DataTable({
        language: {
            "emptyTable": "No Records Found"
        }
    });

    ajaxPost("log.php","getlog",null,function(res){
        if(res.code){
            console.log("Error : "+res.msg);
        }
        if(res.data.length <1){
            console.log("No record Found!");
            return;
        }
        var log = res.data;
        dtLog.clear().draw();
        for(var i=0; i<log.length;i++){
            //console.log(log[i].timestamp+" "+log[i].name+" "+log[i].action);
            dtLog.row.add([
                log[i].timestamp,
                log[i].name,
                log[i].action
            ]);
        }
        dtLog.order([[0, 'desc']]);
        dtLog.columns.adjust().draw();
    })
});


function ajaxPost(url,method,args,cb) {
    $.ajax({
        url: url,
        type: 'post',
        data: {'method':method,'args':args},
        success: function (data) {
            if(!data){
                console.log("Failed : Empty data"); 
                cb(null);
                return;
            }
            try {
                var response = JSON.parse(data);
                cb(response);
            } catch (err) {
                console.log('AJAX Error: (' + err + ') > ');
                console.log(data);
                var res = {
                    error: 1
                };
                cb(res);
            }
        }
    });
}
