const xmlParser=require("xml-mapping");
const https=require("https");
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

function EasyChatCommunicator(appID,appSec,callback=()=>{})
{
    function PostToEasyChatServer(url,data,callback)
    {//A function to communicate with the easy chat server with POST method.
        let req=https.request({host: "api.yixin.im",path: url,method: "POST"},function(res)
        {
            let buffer=new Buffer(0);
            res.on("data",function(chunk)
            {//keep receiving data
                buffer=Buffer.concat([buffer,chunk]);
            }).on("end",function()
            {//the data receiving finished, star to parse json and invoke the callback.
                let json=JSON.parse(buffer.toString());
                if (json.errcode && json.errcode!==0)
                {
                    return callback(new Error(json.errmsg),json);
                }
                callback(undefined,json);
            });
        });
        req.on("error",function(e)
        {//when the connection gots error, invoke the callback by passing an error instance.
            return callback(new Error(e.message));
        }).end(JSON.stringify(data));           //send the data to the easy chat server.
    }
    function GetToEasyChatServer(url,callback)
    {//A function to communicate with the easy chat server with GET method.
        let req=https.request({host: "api.yixin.im",path: url,method: "GET"},function(res)
        {
            let buffer=new Buffer(0);
            res.on("data",function(chunk)
            {//keep receiving data
                buffer=Buffer.concat([buffer,chunk]);
            }).on("end",function()
            {//the data receiving finished, star to parse json and invoke the callback.
                let json=JSON.parse(buffer.toString());
                if (json.errcode && json.errcode!==0)
                {
                    return callback(new Error(json.errmsg),json);
                }
                callback(undefined,json);
            });
        });
        req.on("error",function(e)
        {//when the connection gots error, invoke the callback by passing an error instance.
            return callback(new Error(e.message));
        }).end();                   //'Cause the methos is GET, no need to send data to the easy chat server.
    }
    let accessToken="";                 //internal variable, this access token is required by the easy chat server on every request.
    function RefreshAccessToken()
    {//this function is used to refresh the access token. the access token will be expired, we're gonna refresh it.
        if (process.argv.length===3)
        {
            accessToken=process.argv[2];
            return process.nextTick(function()
            {
                callback();                     //invoke the callback at the first time.
                callback=function(){};              //replace the callback with a empty function to prevent repeat calling the callback;
            });
        }
        let req=https.request({host: `api.yixin.im`,path: `/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appSec}`,method: "GET"},function(res)
        {
            res.on("data",function(chunk)
            {// since the packet will be small enough, no need to receive more than one packet, but this place might be a potential bug.
                let json=JSON.parse(chunk.toString());
                if (json.errcode)
                {
                    return callback(new Error(chunk.toString()));
                }
                accessToken=json.access_token;                  //give the value from the easy chat server to the local variable.
                console.log(`Access Token: [${accessToken}]`);          //display the new access token on console.
                callback();                     //invoke the callback at the first time.
                callback=function(){};              //replace the callback with a empty function to prevent repeat calling the callback;
            });
        });
        req.on("error",function()
        {
            return callback(new Error("Cannot connect to the easy chat server."));
        });
        req.end();
    }
    RefreshAccessToken();               //Refresh the access token as soon as the contructor runs.
    setInterval(RefreshAccessToken,config.easyChat.refreshFreq);               //set the access token refreshing frequence.
    this.sendCustomMessage=function(msg,callback=function(){})
    {
        PostToEasyChatServer(`/cgi-bin/message/custom/send?access_token=${accessToken}`,msg,callback);
    };
    this.sendMessage=function(msg,callback=function(){})
    {
        PostToEasyChatServer(`/cgi-bin/message/send?access_token=${accessToken}`,msg,callback);
    };
    this.getUserBasicInformation=function(openid,callback=function(){})
    {
        GetToEasyChatServer(`/cgi-bin/user/info?access_token=${accessToken}&openid=${openid}`,callback);
    };
    this.replyText=function(msg,res)
    {
        let rmsg={xml: {ToUserName: msg.ToUserName,FromUserName: msg.FromUserName,CreateTime: {$t: (new Date).getTime()},MsgType: {$cd: "text"},Content: msg.Content}};
        res.end(xmlParser.dump(rmsg));
    };
    this.getUserOpenIdByPhoneNumber=function(phone,cb=()=>{})
    {
        GetToEasyChatServer(`/cgi-bin/user/valid?access_token=${accessToken}&mobile=${phone}`,cb);
    };
    this.replyArticals=function(msg,images,res)
    {
        let r={};
        r.ToUserName=msg.ToUserName;
        r.FromUserName=msg.FromUserName;
        r.CreateTime={$t: (new Date).getTime()};
        r.MsgType={$cd: "news"};
        r.ArticleCount={$t: images.length};
        for (let i=0;i<images.length;i++)
        {
            images[i]={item: images[i]};
        }
        r.Articles=images;
        r={xml: r};
        res.end(xmlParser.dump(r));
    };
    this.replyImage=function(msg,image,res)
    {
        let rmsg={xml: {ToUserName: msg.ToUserName,FromUserName: msg.FromUserName,CreateTime: {$t: (new Date).getTime()},MsgType: {$cd: "image"},PicUrl: {$cd: image}}};
        res.end(xmlParser.dump(rmsg));
        // let r={};
        // r.ToUserName=msg.ToUserName;
        // r.FromUserName=msg.FromUserName;
        // r.CreateTime={$t: (new Date).getTime()};
        // r.MsgId={$t: (new Date).getTime()};
        // r.MsgType={$cd: "image"};
        // r.PicUrl={$cd: image};
        // r={xml: r};
        // res.end(xmlParser.dump(r));
    };
    this.replyAudio=function(msg,audio,res)
    {
        let r={};
        r.ToUserName=msg.ToUserName;
        r.FromUserName=msg.FromUserName;
        r.CreateTime={$t: (new Date).getTime()};
        r.MsgType={$cd: "music"};
        r.Music=audio;
        r={xml: r};
        res.end(xmlParser.dump(r));
    };
    this.parseMessage=function(message)
    {//parse the message from easy chat server to a JSON.
        return xmlParser.load(message).xml;
    };
    this.addSubscribeUsers=function(users,callback)
    {//
        PostToEasyChatServer(`/cgi-bin/follow/purview/create?access_token=${accessToken}`,{mobiles: users},callback);
    };
    this.removeSubscribeUsers=function(users,callback)
    {
        PostToEasyChatServer(`/cgi-bin/follow/purview/delete?access_token=${accessToken}`,{mobiles: users},callback);
    };
    this.setPublicAccountMenu=function(menu,callback)
    {
        PostToEasyChatServer(`/cgi-bin/menu/create?access_token=${accessToken}`,menu,callback);
    };
    this.generateQrCodeTicket=function(stamp,callback)
    {
        PostToEasyChatServer(`/cgi-bin/qrcode/create?access_token=${accessToken}`,{expire_seconds: 1800,action_name: "QR_SCENE",action_info:{scene: {scene_id: stamp}}},callback);
    };
    this.getSubscribedUsers=function(callback)
    {
        ///cgi-bin/user/get?access_token=ACCESS_TOKEN
        GetToEasyChatServer(`/cgi-bin/user/get?access_token=${accessToken}`,callback);
    };
    this.getOauthAccessToken=function(appID,appSec,code,callback)
    {
        GetToEasyChatServer(`/sns/oauth2/access_token?appid=${appID}&secret=${appSec}&code=${code}&grant_type=authorization_code`,callback);
    };
}


module.exports=new EasyChatCommunicator(config.easyChat.appId,config.easyChat.appSec);