$(document).ready(function()
{
    console.log("SDLKFJSLDKFJLSDKFJ");
    let api=new WebIF;
    $.ajax({url: "/wif/data/modify",
            type: "POST",
            dataType: "JSON",
            data: JSON.stringify({category: "Users",id: "58cf5210ed81c781a83dcad0",content: {name: "222222222"}}),
            success: function(res)
            {
                console.log(res);
            }});
});
