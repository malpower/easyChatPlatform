const MongoDB=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectID;




function Pages()
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
            process.nextTick(callback);
        });
    };
}

module.exports=new Pages;
