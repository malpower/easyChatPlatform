const format=require("../utils/format");
const Mongo=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectID;
const config=require("../config");


function MobWeb()
{
    this.init=function(app,easy)
    {
        Mongo.connect(config.database.address,function(err,db)
        {
            app.post("/like",function(req,res)
            {
                let json=format.getReqJson(req);
                if (!json)
                {
                    return res.end(JSON.stringify({error: true,code: 1,message: "Invalid request json format."}));
                }
                let openId=json.openId;
                let caseId=json.caseId;
                if (!openId || !caseId)
                {
                    return res.end(JSON.stringify({error: true,code: 3,message: "caseId and openId are required"}));
                }
                db.collection("Users").find({openId: openId}).toArray(function(err,list)
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    if (list.length===0)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: "Invalid openId"}));
                    }
                    db.collection("Samples").update({_id: new ObjectId(caseId)},{$addToSet: {"liked": {openId: openId,user: list[0]._id.toString(),createTime: (new Date).getTime()}}});
                    res.end(JSON.stringify({error: false}));
                });
            });
            app.post("/unlike",function(req,res)
            {
                let json=format.getReqJson(req);
                if (!json)
                {
                    return res.end(JSON.stringify({error: true,code: 1,message: "Invalid request json format."}));
                }
                let openId=json.openId;
                let caseId=json.caseId;
                if (!openId || (!caseId && !json.userId))
                {
                    return res.end(JSON.stringify({error: true,code: 3,message: "caseId or userId and openId are required"}));
                }
                let cond={};
                if (openId)
                {
                    cond.openId=openId;
                }
                if (json.userId)
                {
                    cond._id=new ObjectId(json.userId);
                }
                db.collection("Users").find(cond).toArray(function(err,list)
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    if (list.length===0)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: "Invalid openId"}));
                    }
                    db.collection("Samples").update({_id: new ObjectId(caseId)},{$pull: {"liked": {user: list[0]._id.toString()}}});
                    res.end(JSON.stringify({error: false}));
                });
            });
            app.post("/visit",function(req,res)
            {
                let json=format.getReqJson(req);
                if (!json)
                {
                    return res.end(JSON.stringify({error: true,code: 1,message: "Invalid request json format."}));
                }
                let openId=json.openId;
                let caseId=json.caseId;
                if (!openId || !caseId)
                {
                    return res.end(JSON.stringify({error: true,code: 3,message: "caseId and openId are required"}));
                }
                db.collection("Users").find({openId: openId}).toArray(function(err,list)
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    if (list.length===0)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: "Invalid openId"}));
                    }
                    db.collection("Samples").update({_id: new ObjectId(caseId)},{$addToSet: {"visited": {user: list[0]._id.toString(),createTime: (new Date).getTime()}}});
                    res.end(JSON.stringify({error: false}));
                });
            });
            app.post("/getLike",function(req,res)
            {
                let json=format.getReqJson(req);
                if (!json)
                {
                    return res.end(JSON.stringify({error: true,code: 1,message: "Invalid request json format."}));
                }
                let openId=json.openId;
                json.pageNumber=json.pageNumber || 0;
                json.pageSize=json.pageSize || 1024;
                json.sort=json.sort || {};
                if (!openId)
                {
                    return res.end(JSON.stringify({error: true,code: 3,message: "caseId and openId are required"}));
                }
                db.collection("Samples").find({"liked.openId": openId.toString()},{caseImg: 0}).skip(json.pageSize*json.pageNumber).limit(json.pageSize).sort(json.sort).toArray(function(err,list)
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    res.end(JSON.stringify({error: false,list: list}));
                });
            });
        });
    };
}

module.exports=new MobWeb;
