const MongoDB=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectID;
const format=require("./utils/format");


let database;
function BindRoutes(app)
{
    app.post("/wifaces/query",function(req,res)
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
        database.collection(json.category).find(json.conditions || {}).skip(json.pageNumber || 0).limit(json.pageSize || 1024).sort(json.sort || {}).toArray(function(err,list)
        {
            if (err)
            {
                return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
            }
            res.end(JSON.stringify({error: false,list: list}));
        });
    });
}



function WebIFaces()
{
    this.init=function(app,callback)
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
            console.log("Database connected");
            BindRoutes(app);
            process.nextTick(callback);
        });
    };
}

module.exports=new WebIFaces;
