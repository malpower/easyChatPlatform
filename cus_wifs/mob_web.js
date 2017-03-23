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
                if (!openId)
                {
                    return res.end(JSON.stringify({error: true,code: 3,message: "caseId and openId are required"}));
                }
                db.collection("Samples").find({"liked.openId": openId.toString()},{caseImg: 0}).toArray(function(err,list)
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
