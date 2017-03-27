const urlParser=require("url");
const config=require("./config");
const qrCodeCom=require("./utils/qr_code_com");
const sidTool=require("./utils/sid");
const messageDispatcher=require("./message_dispatcher");
const authTool=require("./auth");
const format=require("./utils/format");
const express=require("express");
const bodyParser=require("body-parser");
const MongoClient=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectID;
const easy=require("./easy_library");

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






function Init(initCallback)
{//initialization function.
    let app=express.Router();
    app.use("/easyChat",bodyParser.raw({limit: config.server.requestSizeLimit,type: config.server.requestType}));
    app.use("/easyChatInterface",bodyParser.raw({limit: config.server.requestSizeLimit,type: config.server.requestType}));
    app.use("/waitingScanQrCode",bodyParser.raw({limit: config.server.requestSizeLimit,type: config.server.requestType}));
    app.post("/easyChatInterface",function(req,res)
    {//this is the interface to receive the message from easy chat server.
        let imsg=easy.parseMessage(req.body.toString());
        messageDispatcher.process(imsg,easy,res);
        // easy.getUserBasicInformation(imsg.FromUserName.$cd,function(err,data)
        // {
        //     easy.replyText({ToUserName: imsg.FromUserName,FromUserName: imsg.ToUserName,Content: {$cd: JSON.stringify(data)}},res);
        //     easy.sendMessage({touser: imsg.FromUserName.$cd,msgtype: "text",text: {content: JSON.stringify(data)+"\r\n"+(new Date).toString()}});
        // });
    });
    app.get("/easyChatUserList",function(req,res)
    {//a status checking interface, to display the current subscribed users' open IDs.
        easy.getSubscribedUsers(function(err,json)
        {
            res.end(JSON.stringify(json));
        });
    });
    app.get("/easyChatInterface",function(req,res)
    {//verification interface for easy chat server.
        let url=urlParser.parse(req.url,true);
        let echostr=url.query.echostr;
        res.end(echostr);
    });
    app.get("/waitingScanQrCode",function(req,res)
    {//this is a long polling interface to watch the QR code scanning operation by users.

        let stamp=req.query.stamp;
        qrCodeCom.addCom(stamp,function(openid)
        {//registery a callback to the scanning communicator.
            qrCodeCom.destroyCom(stamp);            //if the callback is invoking, remove the callback from the scanning communicator.
            let sid=sidTool.generateNewSID();
            sidTool.setResSID(res,sid);
            authTool.addSign(sid,{openId: openid});     //store a temporary sign data to session.
            res.end(JSON.stringify({error: false,login: true}));            //to inform the client that the user has scanned the QR code.
        });
    });
    app.post("/easyChat/addSubscribeUsers",function(req,res)
    {

        let users=format.getReqJson(req);
        if (users===undefined)
        {
            return res.end(JSON.stringify({error: true,code: 1,message: "Invalid JSON format"}));
        }
        easy.addSubscribeUsers(users,function(err,json)
        {
            if (err)
            {
                return res.end(JSON.stringify({error: true,code: 7,message: err.message,details: json}));
            }
            res.end(JSON.stringify({error: false,content: json}));
        });
    });
    app.post("/easyChat/removeSubscribeusers",function(req,res)
    {

        let users=format.getReqJson(req);
        if (users===undefined)
        {
            return res.end(JSON.stringify({error: true,code: 1,message: "Invalid JSON format"}));
        }
        easy.removeSubscribeUsers(users,function(err,json)
        {
            if (err)
            {
                return res.end(JSON.stringify({error: true,code: 7,message: err.message,details: json}));
            }
            res.end(JSON.stringify({error: false,content: json}));
        });
    });
    app.post("/easyChat/getUserInformation",function(req,res)
    {

        let param=format.getReqJson(req);
        if (param===undefined)
        {
            return res.end(JSON.stringify({error: true,code: 1,message: "Invalid JSON format"}));
        }
        easy.getUserBasicInformation(param.openId,function(err,json)
        {
            if (err)
            {
                return res.end(JSON.stringify({error: true,code: 7,message: err.message,details: json}));
            }
            res.end(JSON.stringify({error: false,content: json}));
        });
    });
    app.post("/easyChat/sendP2pMessage",function(req,res)
    {
        let user=authTool.getSignData(sidTool.getReqSID(req));
        let param=format.getReqJson(req);

        if (param===undefined)
        {
            return res.end(JSON.stringify({error: true,code: 1,message: "Invalid JSON format"}));
        }
        if (!user || !(/^(provinceUser|groupUser|superAdmin)$/.test(user.userLevel)))
        {
            return res.end(JSON.stringify({error: true,code: 8,message: "User permission is does not support to do this."}));
        }
        database.collection("Users").find({_id: new ObjectId(param.id)},{openId: 1,bound: 1}).toArray(function(err,list)
        {
            if (err || list.length===0 || list[0].bound!==true)
            {
                return res.end(JSON.stringify({error: true,code: 2,message: (err && err.message) || "User invalid"}));
            }
            easy.sendMessage({touser: list[0].openId,msgtype: "text",text: {content: config.easyChat.invitationText}},function(err,json)
            {
                if (err)
                {
                    return res.end(JSON.stringify({error: true,code: 7,message: err.message,details: json}));
                }
                res.end(JSON.stringify({error: false,content: json}));
            });
        });
    });
    setTimeout(function()
    {
        easy.setPublicAccountMenu(config.menu,function(err,json)
        {//Simply set the menu on easy chat client.
            if (err)
            {
                console.log(err.message);
            }
            console.log("Menu setting finished.");
        });
    },1000*5);
    process.nextTick(initCallback,[app]);
}



module.exports={init: function(app,fn)
{

    Init(function(routers)
    {
        for (let i=0;i<routers.length;i++)
        {
            app.use(routers[i]);
        }
    });
    fn(undefined,easy);     //go back to the main.
}};
