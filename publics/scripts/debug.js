$(document).ready(function()
{
    let api=new WebIF;
    api.query({category: "Users",conditions: {}},function(err,json)
    {
        console.log(json);
    });
});
