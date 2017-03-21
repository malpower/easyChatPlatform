const MongoDB=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectID;
const format=require("./utils/format");
const limiters=require("./utils/limiter");
const categoryChecker=require("./utils/category_checker");
const authTool=require("./auth");
const sidTool=require("./utils/sid");
const config=require("./config");
const multer=require("multer");
const upload=multer({dest: "./publics/uploads/"});
const express=require("express");
const bodyParser=require("body-parser");








let easyCom;


let database;                   //global variable, the database object, will be used at many place. will be initialized at [$pos.001$].
function BindRoutes(initCallback)
{//binding the routes to provide the basic interfaces.
//These interfaces are all general interfaces to provide data operations, the operation permission will be controlled by limiters.
    let app=express.Router();
    app.use("/wif",bodyParser.raw({limit: config.server.requestSizeLimit,type: config.server.requestType}));
    app.use("/user",bodyParser.raw({limit: config.server.requestSizeLimit,type: config.server.requestType}));
    app.post("/wif/data/count",function(req,res)
    {
                    //the tool to set CORS(cross domain) according to the configuration file.
        let json=format.getReqJson(req);            //formating request data.
        if (!json)
        {//Invalid data received.
            return res.end(JSON.stringify({error: true,code: 1,message: "Invalid request JSON format."}));
        }
        if (typeof(json.category)!=="string")
        {//if the data does not contain a category field.
            return res.end(JSON.stringify({error: true,code: 3,message: `"category" is required.`}));
        }
        if (!categoryChecker.checkCategory(json.category))
        {//check the allowed categories.
            return res.end(JSON.stringify({error: true,code: 5,message: `The value of "category" is illegal.`}));
        }
        database.collection(json.category).find(json.conditions || {}).skip(json.pageNumber*(json.pageSize || 1) || 0).limit(json.pageSize || 1024).sort(json.sort || {}).count(function(err,count)
        {
            if (err)
            {
                return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
            }
            res.end(JSON.stringify({error: false,count: count}));
        });
    });
    app.post("/wif/data/query",function(req,res)
    {

        let json=format.getReqJson(req);
        if (!json)
        {
            return res.end(JSON.stringify({error: true,code: 1,message: "Invalid request JSON format."}));
        }
        if (typeof(json.category)!=="string")
        {
            return res.end(JSON.stringify({error: true,code: 3,message: `"category" is required.`}));
        }
        if (!categoryChecker.checkCategory(json.category))
        {
            return res.end(JSON.stringify({error: true,code: 5,message: `The value of "category" is illegal.`}));
        }
        let category=json.category;
        try
        {
            json=limiters.getLimiter(`${category}.query`)(json,req);
        }
        catch (e)
        {
            return res.end(JSON.stringify({error: true,code: 4,message: e.message}));
        }
        if (typeof(json.conditions._id)==="string")
        {
            json.conditions._id=new ObjectId(json.conditions._id);
        }
        database.collection(json.category).find(json.conditions || {},json.filter || undefined).skip(json.pageNumber*(json.pageSize || 1) || 0).limit(json.pageSize || 1024).sort(json.sort || {}).toArray(function(err,list)
        {
            if (err)
            {
                return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
            }
            database.collection(json.category).find(json.conditions || {}).count(function(err,count)
            {
                res.end(JSON.stringify({error: false,list: list,count: count}));
            });
        });
    });
    app.post("/wif/data/create",function(req,res)
    {

        let json=format.getReqJson(req);
        if (!json)
        {
            return res.end(JSON.stringify({error: true,code: 1,message: "Invalid request JSON format."}));
        }
        if (typeof(json.category)!=="string")
        {
            return res.end(JSON.stringify({error: true,code: 3,message: `"category" is required.`}));
        }
        if (!categoryChecker.checkCategory(json.category))
        {
            return res.end(JSON.stringify({error: true,code: 5,message: `The value of "category" is illegal.`}));
        }
        let category=json.category;
        try
        {
            let limiter=limiters.getLimiter(`${category}.create`);
            if (limiter.length===2)
            {
                json=limiters.getLimiter(`${category}.create`)(json,req);
            }
            if (limiter.length===3)
            {
                return limiter(json,req,function(err,json)
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    let content=json.content;
                    database.collection(json.category).insert(content,function(err,r)
                    {
                        if (err)
                        {
                            return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                        }
                        res.end(JSON.stringify({error: false,id: r.insertedIds[0]}));
                    });
                });
            }
        }
        catch (e)
        {
            return res.end(JSON.stringify({error: true,code: 4,message: e.message}));
        }
        let content=json.content;
        database.collection(json.category).insert(content,function(err,r)
        {
            if (err)
            {
                return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
            }
            res.end(JSON.stringify({error: false,id: r.insertedIds[0]}));
        });
    });
    app.post("/wif/data/delete",function(req,res)
    {

        let json=format.getReqJson(req);
        if (!json)
        {
            return res.end(JSON.stringify({error: true,code: 1,message: "Invalid request JSON format."}));
        }
        if (typeof(json.category)!=="string")
        {
            return res.end(JSON.stringify({error: true,code: 3,message: `"category" is required.`}));
        }
        if (!categoryChecker.checkCategory(json.category))
        {
            return res.end(JSON.stringify({error: true,code: 5,message: `The value of "category" is illegal.`}));
        }
        let category=json.category;
        try
        {
            json=limiters.getLimiter(`${category}.delete`)(json,req);
        }
        catch (e)
        {
            return res.end(JSON.stringify({error: true,code: 4,message: e.message}));
        }
        if (typeof(json.id)!=="string" && typeof(json.ids)!=="object")
        {
            return res.end(JSON.stringify({error: true,code: 3,message: `"id" or "ids" are required.`}));
        }
        let cond=new Object;
        if (json.id)
        {
            cond["_id"]=new ObjectId(json.id);
        }
        else if (json.ids instanceof Array)
        {
            for (let i=0;i<json.ids.length;i++)
            {
                json.ids[i]=new ObjectId(json.ids[i]);
            }
            cond["_id"]={$in: json.ids};
        }
        database.collection(json.category).removeMany(cond,function(err,r)
        {
            if (err)
            {
                return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
            }
            res.end(JSON.stringify({error: false}));
        });
    });
    app.post("/wif/data/modify",function(req,res)
    {

        let json=format.getReqJson(req);
        if (!json)
        {
            return res.end(JSON.stringify({error: true,code: 1,message: "Invalid request JSON format."}));
        }
        if (typeof(json.category)!=="string")
        {
            return res.end(JSON.stringify({error: true,code: 3,message: `"category" is required.`}));
        }
        if (!categoryChecker.checkCategory(json.category))
        {
            return res.end(JSON.stringify({error: true,code: 5,message: `The value of "category" is illegal.`}));
        }
        let category=json.category;
        try
        {
            json=limiters.getLimiter(`${category}.modify`)(json,req);
        }
        catch (e)
        {
            return res.end(JSON.stringify({error: true,code: 4,message: e.message}));
        }
        if (typeof(json.id)!=="string" && typeof(json.ids)!=="object")
        {
            return res.end(JSON.stringify({error: true,code: 3,message: `"id" or "ids" are required.`}));
        }
        let cond=new Object;
        if (json.id)
        {
            cond["_id"]=new ObjectId(json.id);
        }
        else if (json.ids instanceof Array)
        {
            for (let i=0;i<json.ids.length;i++)
            {
                json.ids[i]=new ObjectId(json.ids[i]);
            }
            cond["_id"]={$in: json.ids};
        }
        database.collection(json.category).updateMany(cond,{$set: json.content || {}},function(err,r)
        {
            if (err)
            {
                return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
            }
            res.end(JSON.stringify({error: false}));
        });
    });
    app.post("/user/getCurrentUser",function(req,res)
    {//simply respond the current user which is stored in auth tool(session).

        let json=format.getReqJson(req);
        if (!json)
        {
            return res.end(JSON.stringify({error: true,code: 1,message: "Invalid request JSON format."}));
        }
        let sid=sidTool.getReqSID(req);
        if (sid===undefined)
        {
            return res.end(JSON.stringify({error: true,code: 8,message: "Current user not exists."}));
        }
        let user=authTool.getSignData(sid);
        if (user===undefined)
        {
            return res.end(JSON.stringify({error: true,code: 8,message: "User not signed in."}));
        }
        res.end(JSON.stringify({error: false,content: user}));
    });
    app.get("/user/sign",function(req,res)
    {//for debug only. Remove this when deploy the server to PRD.
        let sid=sidTool.generateNewSID();
        sidTool.setResSID(res,sid);
        database.collection("Users").find({}).toArray(function(err,list)
        {
            authTool.addSign(sid,list[0]);
            res.end(JSON.stringify({error: false}));
        });
    });
    app.get("/corsBind",function(req,res)
    {
        sidTool.setResSID(res,req.query.sid);
        res.end();
    });
    app.post("/user/getUserById",function(req,res)
    {

        let json=format.getReqJson(req);
        if (!json)
        {
            return res.end(JSON.stringify({error: true,code: 1,message: "Invalid request JSON format."}));
        }
        let id=json.id;
        database.collection("Users").find({_id: new ObjectId(id)}).toArray(function(err,list)
        {
            if (err)
            {
                return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
            }
            res.end(JSON.stringify({error: false,users: list}));
        });
    });
    app.post("/user/getUserByOpenId",function(req,res)
    {

        let json=format.getReqJson(req);
        if (!json)
        {
            return res.end(JSON.stringify({error: true,code: 1,message: "Invalid request JSON format."}));
        }
        database.collection("Users").find({openId: json.openId}).toArray(function(err,list)
        {
            if (err)
            {
                return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
            }
            res.end(JSON.stringify({error: false,users: list}));
        });
    });
    app.post("/user/getUserScoreSummary",function(req,res)
    {
        let json=format.getReqJson(req);
        if (!json)
        {
            return res.end(JSON.stringify({error: true,code: 1,message: "Invalid request JSON format."}));
        }
        let cond={};
        if (json.id)
        {
            cond["case.userInfo._id"]=new ObjectId(json.id);
        }
        if (json.openId)
        {
            cond["case.userInfo.openId"]=json.openId;
        }
        let p=Object.keys(cond);
        if (p.length===0)
        {
            return res.end(JSON.stringify({error: true,code: 3,message: "id or open id is required."}));
        }
        database.collection("Statistics").find(cond).toArray(function(err,list)
        {
            if (err)
            {
                return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
            }
            let score=0;
            for (let i=0;i<list.length;i++)
            {
                score+=list[i].score;
            }
            return res.end(JSON.stringify({error: false,score: score}));
        });
    });
    let router=express.Router();
    router.post("/file/upload/getUrl",upload.single("wangEditorH5File"),function(req,res)
    {
        res.set("Content-Type","text/url");
        res.end(config.web.domain+"uploads/"+req.file.filename);
    });
    app.options("*",function(req,res)
    {

        res.end("OK");
    });
    process.nextTick(initCallback,[app,router]);
}


function WebIFaces()
{
    this.init=function(app,easy,callback)
    {//initialize the web interfaces.
        console.log("Connect to database...");
        MongoDB.connect(config.database.address,function(err,db)
        {//connect to database first.
            if (err)
            {//if error, exit the process.
                console.log(err.message);
                process.exit(0);
            }
            easyCom=easy;
            database=db;                   //[$pos.001$]   if the db object is valid, set the database as this value.
            limiters.init(database);
            console.log("Database connected");
            BindRoutes(function(routers)
            {
                for (let i=0;i<routers.length;i++)
                {
                    app.use(routers[i]);
                }
            });
            process.nextTick(callback);
            let cusWifs=config.customizedWifs.wifs;
            for (let i=0;i<cusWifs.length;i++)
            {//initialize all the customized web interfaces.
                let cusRouter=express.Router();
                cusRouter.use(bodyParser.raw({limit: config.server.requestSizeLimit,type: config.server.requestType}));
                require("./cus_wifs/"+cusWifs[i]).init(cusRouter,easy);
                app.use("/cusWifs/"+cusWifs[i],cusRouter);
            }
        });
    };
}

module.exports=new WebIFaces;
