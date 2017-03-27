$(document).ready(function()
{
    let eif=new EasyChatIF;
    eif.waitingScanQrCode(function(err,res)
    {
        if (err)
        {
//          console.log(err.message);
//          return alert("扫码超时");
			return $('.hink-box').show();
        }
        location.href="/initialize";
    });
    
    $('.hink-box').on('click',function(){
    	location.reload();
    })
});
