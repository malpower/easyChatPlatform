$(document).ready(function()
{
    let data={startTime: 0,endTime: (new Date).getTime()};
    let api=new WebIF;
    $.ajax({url: "http://development.malpower.net/cusWifs/statistics/getSubmitReportByUser",
            type: "POST",
            dataType: "JSON",
            data: JSON.stringify(data),
            xhrFields:{withCredentials: true},
            success: function(res)
            {
                console.log(res);
            }});
    // $.ajax({url: "http://development.malpower.net/user/sign",
    //         type: "GET",
    //         dataType: "JSON",
    //         xhrFields:{withCredentials: true},
    //         success: function(res)
    //         {
    //             console.log(res);
    //
    //         }});

});
