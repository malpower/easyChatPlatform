$(document).ready(function()
{
    console.log("SDLKFJSLDKFJLSDKFJ");
    let api=new WebIF;
    $.ajax({url: "/cusWifs/statistics/getProvincePassReportByProvince",
            type: "POST",
            dataType: "JSON",
            data: JSON.stringify({category: "Users",conditions: {}}),
            success: function(res)
            {
                console.log(res);
            }});
});
