$(document).ready(function()
{
    let eif=new EasyChatIF;
    eif.waitingScanQrCode(function(err,res)
    {
        if (err)
        {
            console.log(err.message);
            return alert("扫码超时");
        }
        location.href="/initialize";
    });
});
