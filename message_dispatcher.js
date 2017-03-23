const qrCodeCom=require("./utils/qr_code_com");
const euBinder=require("./utils/easyUserBinder");
const MongoClient=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectID;
const config=require("./config");

let database;
MongoClient.connect(config.database.address,function(err,db)
{//connect to database first.
    if (err)
    {
        console.log(err.message);
        process.exit(0);
    }
    database=db;
});


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
md.addEventHandler("CLICK",function(message,easy,res)
{
    if (message.EventKey.$cd==="myComp")
    {
        //easy.replyText({ToUserName: message.FromUserName,FromUserName: message.ToUserName,Content: {$cd: "我的评比测试"}},res);
        // easy.replyImage({ToUserName: message.FromUserName,FromUserName: message.ToUserName},"http://dqzy.internal-i-focusing.com/images/wait.jpg",res);
        //easy.replyArticals({ToUserName: message.FromUserName,FromUserName: message.ToUserName},[{PicUrl: {$cd: "http://dqzy.internal-i-focusing.com/images/wait.jpg"}}],res);
        easy.sendCustomMessage({touser: message.FromUserName.$cd,msgtype: "image",image: {media_id: "31764814"}},function(err)
        {
            if (err)
            {
                console.log(err.message);
            }
        });
        res.end("INVALID");
    }
});


md.addEventHandler("subscribe",function(message,easy,res)
{
    let openId=message.FromUserName.$cd;
    euBinder.bindEasyUser(openId,easy,databse,function(err,user)
    {
        res.end("");
    });
});



module.exports=md;
