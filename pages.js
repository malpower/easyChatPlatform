const MongoDB=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectID;
const authTool=require("./auth");
const qrCodeCom=require("./utils/qr_code_com");
const sidTool=require("./utils/sid");
const config=require("./config");



let database;
let easyCom;
function Init(app)
{//initialize the web page routes.
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
            let accessToken=r.access_token;
            res.redirect(page+"?code="+code+"&openId="+openid);           //as for the destination of the redirection, config it in [menu.js] at state field.
        });
    });
    app.get("/debug",function(req,res)
    {//simple frontend debug page.
        res.render("debug",{});
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
                return res.end(`<meta charset="utf-8" /><h1>Cannot find the user in DB.</h1>`);
            }
            let user=list[0];
            authTool.resetSignData(sid,user);
            res.redirect(config.web.entryUrl);          //after initialization, redirect to the destination which configured in [web.js]
        });
    });
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
            Init(app);
        });
    };
}

module.exports=new Pages;
