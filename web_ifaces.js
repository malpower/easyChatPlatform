const MongoDB=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectID;
const format=require("./utils/format");
const limiters=require("./utils/limiter");
const categoryChecker=require("./utils/category_checker");
const authTool=require("./auth");
const sidTool=require("./utils/sid");



let easyCom;


let database;                   //global variable, the database object, will be used at many place. will be initialized at [$pos.001$].
function BindRoutes(app)
{
    app.post("/wif/data/count",function(req,res)
    {
        res.cookie("Access-Control-Allow-Credentials","true");
        res.cookie("Access-Control-Allow-Origin","*");
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
        database.collection(json.category).find(json.conditions || {}).skip(json.pageNumber || 0).limit(json.pageSize || 1024).sort(json.sort || {}).count(function(err,count)
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
        res.cookie("Access-Control-Allow-Credentials","true");
        res.cookie("Access-Control-Allow-Origin","*");
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
            json=limiters.getLimiter(`${category}.query`)(json);
        }
        catch (e)
        {
            return res.end(JSON.stringify({error: true,code: 4,message: e.message}));
        }
        database.collection(json.category).find(json.conditions || {}).skip(json.pageNumber || 0).limit(json.pageSize || 1024).sort(json.sort || {}).toArray(function(err,list)
        {
            if (err)
            {
                return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
            }
            res.end(JSON.stringify({error: false,list: list}));
        });
    });
    app.post("/wif/data/create",function(req,res)
    {
        res.cookie("Access-Control-Allow-Credentials","true");
        res.cookie("Access-Control-Allow-Origin","*");
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
            json=limiters.getLimiter(`${category}.create`)(json);
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
        res.cookie("Access-Control-Allow-Credentials","true");
        res.cookie("Access-Control-Allow-Origin","*");
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
            json=limiters.getLimiter(`${category}.delete`)(json);
        }
        catch (e)
        {
            return res.end(JSON.stringify({error: true,code: 4,message: e.message}));
        }
        if (typeof(json.id)!=="string")
        {
            return res.end(JSON.stringify({error: true,code: 3,message: `"id" is required.`}));
        }
        database.collection(json.category).remove({_id: new ObjectId(json.id)},function(err,r)
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
        res.cookie("Access-Control-Allow-Credentials","true");
        res.cookie("Access-Control-Allow-Origin","*");
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
            json=limiters.getLimiter(`${category}.modify`)(json);
        }
        catch (e)
        {
            return res.end(JSON.stringify({error: true,code: 4,message: e.message}));
        }
        if (typeof(json.id)!=="string")
        {
            return res.end(JSON.stringify({error: true,code: 3,message: `"id" is required.`}));
        }
        database.collection(json.category).update({_id: new ObjectId(json.id)},{$set: json.content || {}},function(err,r)
        {
            if (err)
            {
                return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
            }
            res.end(JSON.stringify({error: false}));
        });
    });
    app.post("/user/getCurrentUser",function(req,res)
    {
        res.cookie("Access-Control-Allow-Credentials","true");
        res.cookie("Access-Control-Allow-Origin","*");
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
}



function WebIFaces()
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
            easyCom=easy;
            database=db;                   //[$pos.001$]   if the db object is valid, set the database as this value.
            console.log("Database connected");
            BindRoutes(app);
            process.nextTick(callback);
        });
    };
}

module.exports=new WebIFaces;
