$(document).ready(function()
{
    let data={startTime: 0,endTime: (new Date).getTime()};
    let api=new WebIF;
    $.ajax({url: "http://development.malpower.net/cusWifs/statistics/getPiChart",
            type: "POST",
            dataType: "JSON",
            data: JSON.stringify(data),
            xhrFields:{withCredentials: true},
            success: function(res)
            {
                console.log(res);
            }});
    let img=$("<img>");
    img.attr("src","http://development.malpower.net/getImage?id=58cfb76b12cbcf02c3911525");
    img.appendTo("body");
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
