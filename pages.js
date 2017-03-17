const MongoDB=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectID;
const authTool=require("./auth");
const qrCodeCom=require("./utils/qr_code_com");
const sidTool=require("./utils/sid");
const config=require("./config");



let database;
let easyCom;
function Init(app)
{
    app.get("/",function(req,res)
    {
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
    {
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
            res.render(page,{code: code,openId: openid});
        });
    });
    app.get("/debug",function(req,res)
    {
        res.render("debug",{});
    });
    app.get("/initialize",function(req,res)
    {
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
                return res.end(`<meta charset="utf-8" /><h1>未在数据库中找到该用户</h1>`);
            }
            let user=list[0];
            authTool.resetSignData(sid,user);
            res.redirect(config.web.entryUrl);
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
