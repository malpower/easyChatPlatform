const authTool=require("../auth");
const sidTool=require("./sid");
const ObjectId=require("mongodb").ObjectID;

let database;

function Limiter()
{
    let limiters=new Object;
    this.getLimiter=function(limiterName)
    {
        if (typeof(limiters[limiterName])==="function")
        {
            return limiters[limiterName];
        }
        return function(json){return json;};
    };
    this.addLimiter=function(limiterName,limiter)
    {
        if (typeof(limiterName)==="string" && typeof(limiter)==="function")
        {
            limiters[limiterName]=limiter;
            return true;
        }
        else
        {
            return false;
        }
    };
    this.init=function(db)
    {
        database=db;
    };
}

let lim=new Limiter;


lim.addLimiter("Samples.create",function(json,req)
{
    let sid=sidTool.getReqSID(req);
    let user=authTool.getSignData(sid);
    if (user===undefined)
    {
        throw new Error("User not signed in.");
    }
    json.content.createTime=(new Date).getTime();
    json.content.createUser=user._id.toString();
    json.content.createUsername=user.name;
    json.content.userInfo=user;
    return json;
});
lim.addLimiter("Statistics.create",function(json,req,callback)
{
    database.collection("Samples").find({_id: new ObjectId(json.content.caseId)},{caseImg: 0,caseHtml: 0}).toArray(function(err,list)
    {
        if (err)
        {
            return callback(err);
        }
        if (json.content.type==="perfect")
        {
            if (list[0].isPerfect===true)
            {
                return callback(new Error("Can't set the perfect field when a sample is perfect."));
            }
            json.content.score=20;
            database.collection("Samples").update({_id: list[0]._id},{$set: {isPerfect: true}});
        }
        if (json.content.type==="pass")
        {
            json.content.score=10;
        }
        json.content.case=list[0];
        json.content.createTime=(new Date).getTime();
        json.content.visited=new Array;
        callback(undefined,json);
    });
});
lim.addLimiter("Samples.modify",function(json,req)
{
    if(json.content.checkState===2)
    {
        json.content["checkPoints.province"]=(new Date).getTime();
    }
    if(json.content.checkState===4)
    {
        json.content["checkPoints.publish"]=(new Date).getTime();
    }
    return json;
});



module.exports=lim;
