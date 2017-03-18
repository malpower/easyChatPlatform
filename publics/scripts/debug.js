$(document).ready(function()
{
    let api=new WebIF;
    $.ajax({url: "http://192.168.99.101/wif/data/query",
            type: "POST",
            dataType: "JSON",
            data: JSON.stringify({category: "Users",conditions: {}}),
            success: function(res)
            {
                console.log(res);
            }});
});
