$(document).ready(function()
{
    let api=new WebIF;
    api.create({category: "Samples",content: {title: "123"}},function(err,json)
    {
        console.log(json);
    });
});
