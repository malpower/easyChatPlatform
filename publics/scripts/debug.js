$(document).ready(function()
{
    let data={"id":"58d28a673669ae593fddcc61"};
    let api=new WebIF;
    $.ajax({url: "http://development.malpower.net/easyChat/sendP2pMessage",
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
