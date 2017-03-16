const qrCodeCom=require("./utils/qr_code_com");


function MessageDispatcher()
{
    let messageHandlers=new Object;
    let eventHandlers=new Object;
    this.process=function(message,easy,res)
    {
        let type=message.MsgType.$cd;
        if (type==="event")
        {
            let evt=message.Event.$cd;
            let fn=eventHandlers[evt];
            if (typeof(fn)!=="function")
            {
                return res.end("");
            }
            return process.nextTick(fn,message,easy,res);
        }
        let fn=messageHandlers[type];
        if (typeof(fn)!=="function")
        {
            return res.end("");
        }
        return process.nextTick(fn,message,easy,res);
    };
    this.addMessageHandler=function(name,fn)
    {
        messageHandlers[name]=fn;
    };
    this.addEventHandler=function(name,fn)
    {
        eventHandlers[name]=fn;
    };
}


let md=new MessageDispatcher;

md.addEventHandler("scan",function(message,easy,res)
{
    let sceneID=message.EventKey.$cd;
    let fn=qrCodeCom.getCom(sceneID);
    process.nextTick(fn,message.FromUserName.$cd);
    easy.replyText({ToUserName: message.FromUserName,FromUserName: message.ToUserName,Content: {$cd: "登录成功!"}},res);
});


module.exports=md;
