$(document).ready(function()
{
    let data={category: "Samples",content: {title: "SDLKFJ"}};
    let api=new WebIF;
    $.ajax({url: "http://localhost/user/sign",
            type: "GET",
            dataType: "JSON",
            xhrFields:{withCredentials: true},
            success: function(res)
            {
                console.log(res);
                $.ajax({url: "http://localhost/wif/data/create",
                        type: "POST",
                        dataType: "JSON",
                        data: JSON.stringify(data),
                        xhrFields:{withCredentials: true},
                        success: function(res)
                        {
                            console.log(res);
                        }});
            }});

});
