const MongoDB=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectID;
const authTool=require("./auth");
const qrCodeCom=require("./utils/qr_code_com");
const sidTool=require("./utils/sid");
const config=require("./config");
const euBinder=require("./utils/easyUserBinder");
const express=require("express");
const queryString=require("querystring");
const bodyParser=require("body-parser");




let database;
let easyCom;
function Init(initCallback)
{//initialize the web page routes.
    let app=express.Router();
    app.get("/",function(req,res)
    {//login page, to provide the QR code.
        let stamp=qrCodeCom.generateSceneID();
        easyCom.generateQrCodeTicket(stamp,function(err,json)
        {
            if (err)
            {
                return res.end("<meta charset=\"utf-8\" />"+err.message);
            }
            res.render("login",{qrStamp: stamp,text: "123123123",qrTicket: json.ticket});
        });
    });
    app.get("/mweb",function(req,res)
    {//mobile web callbacks, this page will be request when user press menus in easy chat client app.
        let code=req.query.code;
        let page=req.query.state;
        easyCom.getOauthAccessToken(config.easyChat.appId,config.easyChat.appSec,code,function(err,r)
        {
            if (err)
            {
                return res.end(err.message);
            }
            let openid=r.openid;
            database.collection("Users").find({openId: openid}).toArray(function(err,list)
            {
                if (err)
                {
                    return res.end(err.message);
                }
                if (list.length===0)
                {
                    euBinder.bindEasyUser(openid,easyCom,database,function(err,user)
                    {
                        if (err)
                        {
                            return res.end(err.message);
                        }
                        res.redirect(config.mobAddr[page]+"code="+code+"&openId="+openid);
                    });
                }
                res.redirect(config.mobAddr[page]+"code="+code+"&openId="+openid);           //as for the destination of the redirection, config it in [menu.js] at state field.
            });
        });
    });
    app.get("/debug",function(req,res)
    {//simple frontend debug page.
        res.render("debug",{});
    });
    app.use("/superAdminSignIn",bodyParser.urlencoded()).post("/superAdminSignIn",function(req,res)
    {
        let sid=sidTool.getReqSID(req);
        if (sid===undefined)
        {
            sid=sidTool.generateNewSID();
            sidTool.setResSID(res,sid);
        }
        let data=req.body;
        database.collection("SuperAdmins").find({username: data.username,password: data.password}).toArray(function(err,list)
        {
            if (err)
            {
                return res.end(err.message);
            }
            if (list.length===0)
            {
                return res.end("Username or password invalid.");
            }
            let user=list[0];
            if (user.isFreeze===true)
            {
                return res.end("This user is frozen.");
            }
            authTool.addSign(sid,user);
            if (config.web.sendSID)
            {
                res.redirect(config.web.entryUrl+"?sid="+sid);          //after initialization, redirect to the destination which configured in [web.js]
            }
            else
            {
                res.redirect(config.web.entryUrl);
            }
        });
    });
    app.get("/getImage",function(req,res)
    {
        let id=req.query.id;
        database.collection("Samples").find({_id: new ObjectId(id)}).toArray(function(err,list)
        {
            if (err || list.length===0 || typeof(list[0].caseImg)!=="string")
            {
                return res.end("NO PIC FOUND");
            }
            let data=list[0].caseImg;
            let mimetype=data.split(",")[0];
            mimetype=mimetype.split(";")[0].split(":")[1];
            res.set("Content-Type",mimetype);
            let buffer=Buffer.from(data.split(",")[1],"base64");
            res.end(buffer);
        });
    });
    app.get("/user/signOut",function(req,res)
    {
        let sid=sidTool.getReqSID(req);
        authTool.removeSign(sid);
        res.redirect("/");
    });
    app.get("/initialize",function(req,res)
    {//this is the initialization page after user scanning the QR code, fontend must redirect to this page after calling /waitingScanQrCode interface.
        let sid=sidTool.getReqSID(req);
        if (sid===undefined || !authTool.checkSign(sid))
        {
            return res.end(`<meta charset="utf-8" /><h1>Invalid sign</h1>${sid}`);
        }
        let data=authTool.getSignData(sid);
        let openId=data.openId;
        database.collection("Users").find({openId: openId}).toArray(function(err,list)
        {
            if (err)
            {
                return res.end(err.message);
            }
            if (list.length===0)
            {
                return euBinder.bindEasyUser(openId,easyCom,database,function(err,user)
                {
                    if (err)
                    {
                        return res.end("<h1>Canot bind user information on easy chat.</h1>");
                    }
                    authTool.resetSignData(sid,user);
                    if (config.web.sendSID)
                    {
                        res.redirect(config.web.entryUrl+"?sid="+sid);          //after initialization, redirect to the destination which configured in [web.js]
                    }
                    else
                    {
                        res.redirect(config.web.entryUrl);
                    }
                });
            }
            let user=list[0];
            if (user.isFreeze===true)
            {
                return res.end("This user is frozen.");
            }
            authTool.resetSignData(sid,user);
            if (config.web.sendSID)
            {
                res.redirect(config.web.entryUrl+"?sid="+sid);          //after initialization, redirect to the destination which configured in [web.js]
            }
            else
            {
                res.redirect(config.web.entryUrl);
            }
        });
    });
    process.nextTick(initCallback,[app]);
}

function Pages()
{
    this.init=function(app,easy,callback)
    {
        console.log("Connect to database...");
        MongoDB.connect(config.database.address,function(err,db)
        {
            if (err)
            {
                console.log(err.message);
                process.exit(0);
            }
            database=db;
            easyCom=easy;
            console.log("Database connected");
            process.nextTick(callback);
            Init(function(routers)
            {
                for (let i=0;i<routers.length;i++)
                {
                    app.use(routers[i]);
                }
            });
        });
    };
}

module.exports=new Pages;
