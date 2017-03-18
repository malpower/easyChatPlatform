$(document).ready(function()
{
    console.log("SDLKFJSLDKFJLSDKFJ");
    let api=new WebIF;
    $.ajax({url: "http://192.168.1.2/wif/data/query",
            type: "POST",
            dataType: "JSON",
            data: JSON.stringify({category: "Users",conditions: {}}),
            success: function(res)
            {
                console.log(res);
            }});
});
