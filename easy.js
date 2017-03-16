const xmlParser=require("xml-mapping");
const https=require("https");
const urlParser=require("url");
const config=require("./config");

let easy;

function EasyChatCommunicator(appID,appSec,callback)
{
    function PostToEasyChatServer(url,data,callback)
    {
        let req=https.request({host: "api.yixin.im",path: url,method: "POST"},function(res)
        {
            let buffer=new Buffer(0);
            res.on("data",function(chunk)
            {
                buffer=Buffer.concat([buffer,chunk]);
            }).on("end",function()
            {
                let json=JSON.parse(buffer.toString());
                if (json.errcode && json.errcode!==0)
                {
                    return callback(new Error(json.errmsg),json);
                }
                callback(undefined,json);
            });
        });
        req.on("error",function(e)
        {
            return callback(new Error(e.message));
        }).end(JSON.stringify(data));
    }
    function GetToEasyChatServer(url,callback)
    {
        let req=https.request({host: "api.yixin.im",path: url,method: "GET"},function(res)
        {
            let buffer=new Buffer(0);
            res.on("data",function(chunk)
            {
                buffer=Buffer.concat([buffer,chunk]);
            }).on("end",function()
            {
                let json=JSON.parse(buffer.toString());
                if (json.errcode && json.errcode!==0)
                {
                    return callback(new Error(json.errmsg),json);
                }
                callback(undefined,json);
            });
        });
        req.on("error",function(e)
        {
            return callback(new Error(e.message));
        }).end();
    }
    let accessToken="";
    let req=https.request({host: `api.yixin.im`,path: `/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appSec}`,method: "GET"},function(res)
    {
        res.on("data",function(chunk)
        {
            let json=JSON.parse(chunk.toString());
            if (json.errcode)
            {
                return callback(new Error(chunk.toString()));
            }
            accessToken=json.access_token;
            callback();
        });
    });
    req.on("error",function()
    {
        return callback(new Error("Cannot connect to the easy chat server."));
    });
    req.end();
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
    this.replyImages=function(msg,images,res)
    {
        let r={};
        r.ToUserName=msg.ToUserName
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
    this.replyAudio=function(msg,audio,res)
    {
        let r={};
        r.ToUserName=msg.ToUserName
        r.FromUserName=msg.FromUserName;
        r.CreateTime={$t: (new Date).getTime()};
        r.MsgType={$cd: "music"};
        r.Music=audio;
        r={xml: r};
        res.end(xmlParser.dump(r));
    };
    this.parseMessage=function(message)
    {
        return xmlParser.load(message).xml;
    };
    this.addSubscribeUsers=function(users,callback)
    {
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
}


function Init(app)
{
    app.post("/easyChatInterface",function(req,res)
    {
        let imsg=easy.parseMessage(req.body.toString());
        res.end();
        easy.getUserBasicInformation(imsg.FromUserName.$cd,function(err,data)
        {
            //easy.replyText({ToUserName: imsg.FromUserName,FromUserName: imsg.ToUserName,Content: {$cd: JSON.stringify(data)}},res);
            easy.sendMessage({touser: imsg.FromUserName.$cd,msgtype: "text",text: {content: JSON.stringify(data)+"\r\n"+(new Date).toString()}});
        });
    });
    app.get("/easyChatInterface",function(req,res)
    {
        let url=urlParser.parse(req.url,true);
        let echostr=url.query.echostr;
        res.end(echostr);
    });
    easy.setPublicAccountMenu(config.menu,function(err,json)
    {
        if (err)
        {
            console.log(err.message);
        }
    });
}



module.exports={init: function(app,fn)
{
    easy=new EasyChatCommunicator("98bf7dab0b964ccfa6d5f4c102cfdc2b","2229038bcd2142fab9e774838280662b",function(err)
    {
        if (err)
        {
            console.log(err);
        }
        Init(app);
        fn();
    });
}};
