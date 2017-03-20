$(document).ready(function()
{
    let data={id: "6d6d7d6d7d67"};
    let api=new WebIF;
    $.ajax({url: "http://development.malpower.net/user/getUserById",
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
