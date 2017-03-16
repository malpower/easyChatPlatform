$(document).ready(function()
{
    let eif=new EasyChatIF;
    eif.waitingScanQrCode(function(err,res)
    {
        if (err)
        {
            console.log(err.message);
            return alert("ERROR");
        }
        alert(JSON.stringify(res));
    });
});
