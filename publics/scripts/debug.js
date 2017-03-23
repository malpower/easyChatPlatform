$(document).ready(function()
{
    let data={"id":"58d0b19376b5d75739826c31"};
    let api=new WebIF;
    $.ajax({url: "http://dqzy.internal-i-focusing.com/easyChat/sendP2pMessage",
            type: "POST",
            dataType: "JSON",
            data: JSON.stringify(data),
            xhrFields:{withCredentials: true},
            success: function(res)
            {
                console.log(res);
            }});
    // $.ajax({url: "http://dqzy.internal-i-focusing.com/user/sign",
    //         type: "GET",
    //         dataType: "JSON",
    //         xhrFields:{withCredentials: true},
    //         success: function(res)
    //         {
    //             console.log(res);
    //
    //         }});

});
