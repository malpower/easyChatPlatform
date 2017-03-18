const MongoDB=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectID;
const format=require("./utils/format");
const limiters=require("./utils/limiter");
const categoryChecker=require("./utils/category_checker");
const authTool=require("./auth");
const sidTool=require("./utils/sid");
const config=require("./config");
const resHelper=require("./utils/response_helper");
const multer=require("multer");
const upload=multer({dest: "./publics/uploads/"});



let easyCom;


let database;                   //global variable, the database object, will be used at many place. will be initialized at [$pos.001$].
function BindRoutes(app)
{//binding the routes to provide the basic interfaces.
//These interfaces are all general interfaces to provide data operations, the operation permission will be controlled by limiters.
    app.post("/wif/data/count",function(req,res)
    {
        resHelper.cors(res);            //the tool to set CORS(cross domain) according to the configuration file.
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
        resHelper.cors(res);
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
        database.collection(json.category).find(json.conditions || {}).skip(json.pageNumber || 0).limit(json.pageSize || 1024).sort(json.sort || {}).toArray(function(err,list)
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
        resHelper.cors(res);
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
            json=limiters.getLimiter(`${category}.create`)(json,req);
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
        resHelper.cors(res);
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
        resHelper.cors(res);
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
    {//simply respond the current user which is stored in auth tool(session).
        resHelper.cors(res);
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
    app.post("/user/getUserById",function(req,res)
    {
        resHelper.cors(res);
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
    app.post("/file/upload/getUrl",upload.single("wangEditorH5File"),function(req,res)
    {
        res.end(config.web.domain+"publics/uploads/"+req.file.filename);
    });
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
            console.log("Database connected");
            BindRoutes(app);
            process.nextTick(callback);
            let cusWifs=config.customizedWifs.wifs;
            for (let i=0;i<cusWifs.length;i++)
            {//initialize all the customized web interfaces.
                require("./cus_wifs/"+cusWifs[i]).init(app,easy,db);
            }
        });
    };
}

module.exports=new WebIFaces;
