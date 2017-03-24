const format=require("../utils/format");
const Mongo=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectID;
const config=require("../config");
const authTool=require("../auth");
const sidTool=require("../utils/sid");


function Statistics()
{
    this.init=function(app,easy)
    {
        Mongo.connect(config.database.address,function(err,db)
        {
            app.post("/getSubmitReportByUser",function(req,res)
            {
                let json=format.getReqJson(req);
                if (!json)
                {
                    return res.end(JSON.stringify({error: true,code: 1,message: "Invalid JSON structure."}));
                }
                db.collection("Samples").find({createTime: {$gte: json.startTime,$lt: json.endTime}}).toArray(function(err,list)
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    let calc=new Object;
                    for (let i=0;i<list.length;i++)
                    {
                        if (calc[list[i].createUser]===undefined)
                        {
                            calc[list[i].createUser]={count: 0,username: list[i].createUsername};
                        }
                        calc[list[i].createUser].count++;
                    }
                    let o={error: false,statistics: calc,total: list.length};
                    return res.end(JSON.stringify(o));
                });
            });
            app.post("/likeTop10",function(req,res)
            {
                let json=format.getReqJson(req);
                if (!json)
                {
                    return res.end(JSON.stringify({error: true,code: 1,message: "Invalid JSON format!"}));
                }
                let cond={"liked.createTime": {$gte: json.startTime,$lt: json.endTime}};
                let user=authTool.getSignData(sidTool.getReqSID(req));
                if (user===undefined)
                {
                    return res.end(JSON.stringify({error: true,code: 8,message: "User not signed in."}));
                }
                if (user.userLevel==="provinceUser")
                {
                    cond["userInfo.proAddress"]=user.proAddress;
                }
                db.collection("Samples").find(cond,{caseImg: 0,caseHtml: 0}).toArray(function(err,list)
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 1,message: err.message}));
                    }
                    list=list.sort((a,b)=>
                    {
                        if (a.liked.length>b.liked.length)
                        {
                            return -1;
                        }
                        return 1;
                    });
                    list.length=(list.length>10?10:list.length);
                    res.end(JSON.stringify({error: false,list: list}));
                });
            });
            app.post("/visitedTop10",function(req,res)
            {
                let json=format.getReqJson(req);
                if (!json)
                {
                    return res.end(JSON.stringify({error: true,code: 1,message: "Invalid JSON format!"}));
                }
                let cond={"visited.createTime": {$gte: json.startTime,$lt: json.endTime}};
                let user=authTool.getSignData(sidTool.getReqSID(req));
                if (user===undefined)
                {
                    return res.end(JSON.stringify({error: true,code: 8,message: "User not signed in."}));
                }
                if (user.userLevel==="provinceUser")
                {
                    cond["userInfo.proAddress"]=user.proAddress;
                }
                db.collection("Samples").find(cond,{caseImg: 0,caseHtml: 0}).toArray(function(err,list)
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 1,message: err.message}));
                    }
                    list=list.sort((a,b)=>
                    {
                        if (a.visited.length>b.visited.length)
                        {
                            return -1;
                        }
                        return 1;
                    });
                    list.length=(list.length>10?10:list.length);
                    res.end(JSON.stringify({error: false,list: list}));
                });
            });
            app.post("/getPiChart",function(req,res)
            {
                let json=format.getReqJson(req);
                if (!json)
                {
                    return res.end(JSON.stringify({error: true,code: 1,message: "Invalid JSON format!"}));
                }
                let steps;
                let user=authTool.getSignData(sidTool.getReqSID(req));
                if (user===undefined)
                {
                    return res.end(JSON.stringify({error: true,code: 8,message: "User not signed in."}));
                }
                if (/^(groupUser|superAdmin)$/.test(user.userLevel))
                {
                    steps=[[4,5,6,7,8],[4,5],[6,7],[8]];
                }
                else if (/^(provinceUser)$/.test(user.userLevel))
                {
                    steps=[[1,2,4,3],[1,2],[4],[3]];
                }
                else
                {
                    return res.end(JSON.stringify({error: true,code: 8,message: "Invalid user permision."}));
                }
                db.collection("Samples").find({checkState: {$in: steps[0]},createTime: {$gte: json.startTime,$lt: json.endTime}}).count(function(err,count)
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 1,message: err.message}));
                    }
                    let result={};
                    result.total=count;
                    db.collection("Samples").find({"checkState": {$in: steps[1]},createTime: {$gte: json.startTime,$lt: json.endTime}}).count(function(err,count)
                    {
                        if (err)
                        {
                            return res.end(JSON.stringify({error: true,code: 1,message: err.message}));
                        }
                        result.notApproved=count;
                        db.collection("Samples").find({"checkState": {$in: steps[2]},createTime: {$gte: json.startTime,$lt: json.endTime}}).count(function(err,count)
                        {
                            if (err)
                            {
                                return res.end(JSON.stringify({error: true,code: 1,message: err.message}));
                            }
                            result.approved=count;
                            db.collection("Samples").find({"checkState": {$in: steps[3]},createTime: {$gte: json.startTime,$lt: json.endTime}}).count(function(err,count)
                            {
                                if (err)
                                {
                                    return res.end(JSON.stringify({error: true,code: 1,message: err.message}));
                                }
                                result.rejected=count;
                                let ratio={reject: (result.rejected/result.total).toFixed(2),
                                           approved: (result.approved/result.total).toFixed(2),
                                           notApproved: (result.notApproved/result.total).toFixed(2)};
                                res.end(JSON.stringify({count: result,ratio: ratio}));
                            });
                        });
                    });
                });
            });
            app.post("/getProvincePassReportByProvince",function(req,res){
                let json=format.getReqJson(req);
                if(!json){
                    return res.end(JSON.stringify({error:true,code:1,message:"Invalid JSON structure."}));
                }
                db.collection("Samples").find({createTime: {$gte: json.startTime,$lt: json.endTime}}).toArray(function(err,list){
                    if(err){
                        return res.end(JSON.stringify({error:true,code:2,message:err.message}));
                    }
                    let calc=new Object;
                    for(let i=0;i<list.length;i++){
                        if(list[i].userInfo===undefined)  continue;
                        if(list[i].userInfo.proAddress===undefined)  continue;
                        if(calc[list[i].userInfo.proAddress]===undefined){
                            calc[list[i].userInfo.proAddress]={allcount:0,publishcount:0,passrate:"0%",province:list[i].userInfo.proAddress};
                        }
                        calc[list[i].userInfo.proAddress].allcount++;
                        if(list[i].checkState===undefined) continue;
                        if(list[i].checkState===4){
                            calc[list[i].userInfo.proAddress].publishcount++;
                        }
                    }
                    for(let i in calc){
                          calc[i].passrate=function(){
                              return (Math.round(calc[i].publishcount / calc[i].allcount * 10000) / 100.00 + "%");
                          };
                    }
                    let o={error: false,statistics: calc,total: list.length};
                    return res.end(JSON.stringify(o));
                });
            });

            app.post("/getProvinceSubmitReportByProvince",function(req,res){
                let json=format.getReqJson(req);
                if(!json){
                    return res.end(JSON.stringify({error:true,code:1,message:"Invalid JSON structure."}));
                }
                db.collection("Samples").find({createTime: {$gte: json.startTime,$lt: json.endTime}}).toArray(function(err,list){
                    if(err){
                        return res.end(JSON.stringify({error:true,code:2,message:err.message}));
                    }
                    let calc=new Object;
                    //how to calculate submit count?
                    for(let i=0;i<list.length;i++){
                        if(list[i].userInfo===undefined)  continue;
                        if(list[i].userInfo.proAddress===undefined)  continue;
                        if(calc[list[i].userInfo.proAddress]===undefined){
                            calc[list[i].userInfo.proAddress]={allcount:0,submitcount:0,province:list[i].userInfo.proAddress};
                        }
                        calc[list[i].userInfo.proAddress].allcount++;
                        if(list[i].checkState===undefined) continue;
                        if(list[i].checkState===1){
                            calc[list[i].userInfo.proAddress].submitcount++;
                        }
                    }

                    let o={error: false,statistics: calc,total: list.length};
                    return res.end(JSON.stringify(o));
                });
            });

            app.post("/getProvinceScoreReportByProvince",function(req,res){
                let json=format.getReqJson(req);
                if(!json){
                    return res.end(JSON.stringify({error:true,code:1,message:"Invalid JSON structure."}));
                }
                db.collection("Statistics").find({createTime: {$gte: json.startTime,$lt: json.endTime}}).toArray(function(err,list){
                    if(err){
                        return res.end(JSON.stringify({error:true,code:2,message:err.message}));
                    }
                    let calc=new Object;
                    //how to calculate submit count?
                    for(let i=0;i<list.length;i++){
                        if(list[i].district===undefined)  continue;
                        if(list[i].score===undefined)  continue;
                        if(calc[list[i].district]===undefined){
                            calc[list[i].district]={sumScore:0,province:list[i].district};
                        }
                        if(typeof(list[i].score)!="number"){
                            list[i].score = Number(list[i].score);
                            if(list[i].score!=list[i].score){
                                //calc[list[i].district].sumScore=calc[list[i].distrct].sumscore+0;
                                list[i].score=0;
                            }
                        }
                        calc[list[i].district].sumScore=calc[list[i].district].sumScore+list[i].score;
                    }

                    let o={error: false,statistics: calc,total: list.length};
                    return res.end(JSON.stringify(o));
                });
            });

            app.post("/getUserScoreReportbyCreateTime",function(req,res){
                let json=format.getReqJson(req);
                if(!json){
                    return res.end(JSON.stringify({error:true,code:1,message:"Invalid JSON structure."}));
                }
                db.collection("Statistics").find({createTime: {$gte: json.startTime,$lt: json.endTime}}).toArray(function(err,list){
                    if(err){
                        return res.end(JSON.stringify({error:true,code:2,message:err.message}));
                    }
                    let calc=new Object;

                    for(let i=0;i<list.length;i++){
                        if(list[i].case===undefined)  continue;
                        if(list[i].case.userInfo===undefined)  continue;
                        if(list[i].case.userInfo._id===undefined)  continue;
                        if(calc[list[i].case.userInfo._id]===undefined){
                            calc[list[i].case.userInfo._id]={sumScore:0,username:list[i].case.userInfo.name};
                        }
                        calc[list[i].case.userInfo._id].sumScore=calc[list[i].case.userInfo._id].sumScore+list[i].score;
                    }

                    let o={error: false,statistics: calc,total: list.length};
                    return res.end(JSON.stringify(o));
                });
            });
        });
    };
}

module.exports=new Statistics;
