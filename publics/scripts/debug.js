$(document).ready(function()
{
    let api=new WebIF;
    api.getCurrentUser(function(err,json)
    {
        console.log(json);
    });
});
