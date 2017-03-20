$(document).ready(function()
{
    let api=new WebIF;
    $.ajax({url: "/user/getCurrentUser",
            type: "POST",
            dataType: "JSON",
            data: JSON.stringify({}),
            success: function(res)
            {
                console.log(res);
            }});
});
