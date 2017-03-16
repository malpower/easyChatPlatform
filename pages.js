const MongoDB=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectID;
const auth=require("./auth");


let database;
let easyCom;
function Init(app)
{
    app.get("/",function(req,res)
    {
        res.render("login",{text: "123123123"});
    });
    app.get("/mweb",function(req,res)
    {
        let code=req.query.code;
        let page=req.query.state;
        easyCom.getOauthAccessToken("98bf7dab0b964ccfa6d5f4c102cfdc2b","2229038bcd2142fab9e774838280662b",code,function(err,r)
        {
            if (err)
            {
                return res.end(err.message);
            }
            let openid=r.openid;
            let accessToken=r.access_token;
            res.render(page,{code: code,openID: openid});
        });
    });
}

function Pages()
{
    this.init=function(app,easy,callback)
    {
        console.log("Connect to database...");
        MongoDB.connect("mongodb://127.0.0.1:27017/easyChatPlatform",function(err,db)
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
