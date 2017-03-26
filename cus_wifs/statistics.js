const format=require("../utils/format");
const Mongo=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectID;
const config=require("../config");
const authTool=require("../auth");
const sidTool=require("../utils/sid");
const csvTool=require("../utils/csv_exporter");
const dateFormater=require("../utils/date_formater");


function Statistics()
{
    this.init=function(app,easy)
    {
        Mongo.connect(config.database.address,function(err,db)
        {
            app.get("/exportCsv",function(req,res)
            {
                let json={target: req.query.target,startTime: Number(req.query.startTime),endTime: Number(req.query.endTime)};
                let cUser=authTool.getSignData(sidTool.getReqSID(req));
                if (cUser===undefined)
                {
                    return res.end(JSON.stringify({error: true,code: 8,message: "User not signed in."}));
                }
                let q=new Map;
                q["scoreHistory"]={category: "Statistics",conditions: {},processor:(err,list)=>
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    let r=new Array;
                    for (let item of list)
                    {
                        r.push([dateFormater.format(item.createTime),item.case.userInfo.proAddress+item.case.userInfo.townAddress,item.case.userInfo.name,item.reason,item.score]);
                    }
                    csvTool.respond(r,`${dateFormater.format(json.startTime).split(" ")[0]}至${dateFormater.format(json.endTime).split(" ")[0]}积分详情`,"积分日期,地区,积分人姓名,积分来源,积分值",res);
                },preprocessor: (target,cb)=>
                {
                    if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                    {
                        target.conditions["case.userInfo.proAddress"]=cUser.proAddress;
                    }
                    target.conditions["createTime"]={$gte: json.startTime,$lt: json.endTime};
                    cb();
                }};
                q["cases"]={category: "Samples",conditions: {checkState: {$ne: 100}},processor:(err,list)=>
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    let r=new Array;
                    const states=["","未审核","审核中","省驳回","省通过","集团审核中","集团已通过","已发布","集团已驳回"];
                    for (let item of list)
                    {
                        r.push([dateFormater.format(item.createTime),item.userInfo.proAddress+item.userInfo.townAddress,item.caseTitle,states[item.checkState]]);
                    }
                    csvTool.respond(r,`${dateFormater.format(json.startTime).split(" ")[0]}至${dateFormater.format(json.endTime).split(" ")[0]}案例详情`,"上传日期,地区,案例名称,审核信息",res);
                },preprocessor: (target,cb)=>
                {
                    if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                    {
                        target.conditions["case.userInfo.proAddress"]=cUser.proAddress;
                    }
                    target.conditions["createTime"]={$gte: json.startTime,$lt: json.endTime};
                    cb();
                }};
                q["visitTop10"]={category: "Samples",conditions: {},processor:(err,list)=>
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    list.sort((a,b)=>
                    {
                        return b.visited.length-a.visited.length;
                    });
                    list.length=(list.length>10?10:list.length);
                    let r=new Array;
                    for (let item of list)
                    {
                        r.push([item.caseTitle,item.visited.length]);
                    }
                    csvTool.respond(r,`${dateFormater.format(json.startTime).split(" ")[0]}至${dateFormater.format(json.endTime).split(" ")[0]}案例浏览Top10`,"案例名称,浏览量",res);
                },preprocessor: (target,cb)=>
                {
                    if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                    {
                        target.conditions["userInfo.proAddress"]=cUser.proAddress;
                    }
                    target.conditions["visited.createTime"]={$gte: json.startTime,$lt: json.endTime};
                    cb();
                }};
                q["scoreTop10"]={category: "Statistics",conditions: {},processor:(err,list)=>
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    let data=new Object;
                    for (let item of list)
                    {
                        data[item.case.userInfo.name]=(data[item.case.userInfo.name] || 0)+item.score;
                    }
                    let r=new Array;
                    for (let item in data)
                    {
                        r.push([item,data[item]]);
                    }
                    r=r.sort((a,b)=>
                    {
                        return b[1]-a[1];
                    });
                    r.length=(r.length>10?10:r.length);
                    csvTool.respond(r,`${dateFormater.format(json.startTime).split(" ")[0]}至${dateFormater.format(json.endTime).split(" ")[0]}积分统计Top10`,"姓名,积分",res);
                },preprocessor: (target,cb)=>
                {
                    if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                    {
                        target.conditions["case.userInfo.proAddress"]=cUser.proAddress;
                    }
                    target.conditions["createTime"]={$gte: json.startTime,$lt: json.endTime};
                    cb();
                }};
                q["likedTop10"]={category: "Samples",conditions: {},processor:(err,list)=>
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    list.sort((a,b)=>
                    {
                        return b.liked.length-a.liked.length;
                    });
                    list.length=(list.length>10?10:list.length);
                    let r=new Array;
                    for (let item of list)
                    {
                        r.push([item.caseTitle,item.liked.length]);
                    }
                    csvTool.respond(r,`${dateFormater.format(json.startTime).split(" ")[0]}至${dateFormater.format(json.endTime).split(" ")[0]}案例收藏Top10`,"案例名称,收藏量",res);
                },preprocessor: (target,cb)=>
                {
                    if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                    {
                        target.conditions["userInfo.proAddress"]=cUser.proAddress;
                    }
                    target.conditions["liked.createTime"]={$gte: json.startTime,$lt: json.endTime};
                    cb();
                }};
                q["passRatio"]={category: "Samples",conditions: {},processor:(err,list)=>
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    let map=new Object;
                    for (let item of list)
                    {
                        let queue;
                        if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                        {
                            if (map[item.userInfo.townAddress]===undefined)
                            {
                                map[item.userInfo.townAddress]={passed: new Array,rejected: new Array};
                            }
                            queue=map[item.userInfo.townAddress];
                        }
                        else
                        {
                            if (map[item.userInfo.proAddress]===undefined)
                            {
                                map[item.userInfo.proAddress]={passed: new Array,rejected: new Array};
                            }
                            queue=map[item.userInfo.proAddress];
                        }
                        if (/^(4|6|7|5)$/.test(item.checkState.toString()))
                        {
                            queue.passed.push(item);
                        }
                        else
                        {
                            queue.rejected.push(item);
                        }
                    }
                    let r=new Array;
                    for (let item in map)
                    {
                        if (map[item].passed.length+map[item].rejected.length===0)
                        {
                            r.push([item,"N/A"]);
                            continue;
                        }
                        r.push([item,((map[item].passed.length/(map[item].passed.length+map[item].rejected.length))*100)+"%"]);
                    }
                    csvTool.respond(r,`${dateFormater.format(json.startTime).split(" ")[0]}至${dateFormater.format(json.endTime).split(" ")[0]}各地通过率`,"地区,通过率",res);
                },preprocessor: (target,cb)=>
                {
                    if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                    {
                        target.conditions["userInfo.proAddress"]=cUser.proAddress;
                        target.conditions.checkState={$in: [4,3,6,7,8]};
                    }
                    else
                    {
                        target.conditions.checkState={$in: [6,8,7]};
                    }
                    target.conditions["createTime"]={$gte: json.startTime,$lt: json.endTime};
                    cb();
                }};
                q["scoreSum"]={category: "Statistics",conditions: {},processor:(err,list)=>
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    let map=new Object;
                    for (let item of list)
                    {
                        let queue;
                        if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                        {
                            if (map[item.case.userInfo.townAddress]===undefined)
                            {
                                map[item.case.userInfo.townAddress]={score: 0};
                            }
                            queue=map[item.case.userInfo.townAddress];
                        }
                        else
                        {
                            if (map[item.case.userInfo.proAddress]===undefined)
                            {
                                map[item.case.userInfo.proAddress]={score: 0};
                            }
                            queue=map[item.case.userInfo.proAddress];
                        }
                        queue.score+=item.score;
                    }
                    let r=new Array;
                    for (let item in map)
                    {
                        r.push([item,map[item].score]);
                    }
                    csvTool.respond(r,`${dateFormater.format(json.startTime).split(" ")[0]}至${dateFormater.format(json.endTime).split(" ")[0]}各地分积总和`,"地区,积分",res);
                },preprocessor: (target,cb)=>
                {
                    if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                    {
                        target.conditions["case.userInfo.proAddress"]=cUser.proAddress;
                    }
                    target.conditions["createTime"]={$gte: json.startTime,$lt: json.endTime};
                    cb();
                }};
                q["submitSum"]={category: "Samples",conditions: {},processor:(err,list)=>
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    let map=new Object;
                    for (let item of list)
                    {
                        let queue;
                        if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                        {
                            if (map[item.userInfo.townAddress]===undefined)
                            {
                                map[item.userInfo.townAddress]={passed: new Array,rejected: new Array};
                            }
                            queue=map[item.userInfo.townAddress];
                        }
                        else
                        {
                            if (map[item.userInfo.proAddress]===undefined)
                            {
                                map[item.userInfo.proAddress]={passed: new Array,rejected: new Array};
                            }
                            queue=map[item.userInfo.proAddress];
                        }
                        if (item.checkState===4 || item.checkState===6)
                        {
                            queue.passed.push(item);
                        }
                        else
                        {
                            queue.rejected.push(item);
                        }
                    }
                    let r=new Array;
                    for (let item in map)
                    {
                        r.push([item,(map[item].passed.length+map[item].rejected.length)]);
                    }
                    csvTool.respond(r,`${dateFormater.format(json.startTime).split(" ")[0]}至${dateFormater.format(json.endTime).split(" ")[0]}各地提交量`,"地区,提交量",res);
                },preprocessor: (target,cb)=>
                {
                    if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                    {
                        target.conditions["userInfo.proAddress"]=cUser.proAddress;
                    }
                    else
                    {
                        target.conditions["checkState"]={$in: [4,5,6,7,8]};
                    }
                    target.conditions["createTime"]={$gte: json.startTime,$lt: json.endTime};
                    cb();
                }};
                let target=q[json.target];
                
                target.preprocessor(target,()=>
                {
                    db.collection(target.category).find(target.conditions,{caseImg: 0,caseHtml: 0,caseAbstract: 0}).toArray(target.processor);
                });
            });


            app.post("/reports",function(req,res)
            {
                let json=format.getReqJson(req);
                if (!json)
                {
                    return res.end(JSON.stringify({error: true,code: 1,message: "invalid json format"}));
                }
                let cUser=authTool.getSignData(sidTool.getReqSID(req));
                if (cUser===undefined)
                {
                    return res.end(JSON.stringify({error: true,code: 8,message: "User not signed in."}));
                }
                let q=new Map;
                q["visitTop10"]={category: "Samples",conditions: {},processor:(err,list)=>
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    list.sort((a,b)=>
                    {
                        return b.visited.length-a.visited.length;
                    });
                    list.length=(list.length>10?10:list.length);
                    let r=new Array;
                    for (let item of list)
                    {
                        r.push([item.caseTitle,item.visited.length]);
                    }
                    res.end(JSON.stringify({error: false,list: r}));
                },preprocessor: (target,cb)=>
                {
                    if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                    {
                        target.conditions["userInfo.proAddress"]=cUser.proAddress;
                    }
                    target.conditions["visited.createTime"]={$gte: json.startTime,$lt: json.endTime};
                    cb();
                }};
                q["scoreTop10"]={category: "Statistics",conditions: {},processor:(err,list)=>
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    let data=new Object;
                    for (let item of list)
                    {
                        data[item.case.userInfo.name]=(data[item.case.userInfo.name] || 0)+item.score;
                    }
                    let r=new Array;
                    for (let item in data)
                    {
                        r.push([item,data[item]]);
                    }
                    r=r.sort((a,b)=>
                    {
                        return b[1]-a[1];
                    });
                    r.length=(r.length>10?10:r.length);
                    res.end(JSON.stringify({error: false,list: r}));
                },preprocessor: (target,cb)=>
                {
                    if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                    {
                        target.conditions["case.userInfo.proAddress"]=cUser.proAddress;
                    }
                    target.conditions["createTime"]={$gte: json.startTime,$lt: json.endTime};
                    cb();
                }};
                q["likedTop10"]={category: "Samples",conditions: {},processor:(err,list)=>
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    list.sort((a,b)=>
                    {
                        return b.liked.length-a.liked.length;
                    });
                    list.length=(list.length>10?10:list.length);
                    let r=new Array;
                    for (let item of list)
                    {
                        r.push([item.caseTitle,item.liked.length]);
                    }
                    res.end(JSON.stringify({error: false,list: r}));
                },preprocessor: (target,cb)=>
                {
                    if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                    {
                        target.conditions["userInfo.proAddress"]=cUser.proAddress;
                    }
                    target.conditions["liked.createTime"]={$gte: json.startTime,$lt: json.endTime};
                    cb();
                }};
                q["passRatio"]={category: "Samples",conditions: {},processor:(err,list)=>
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    let map=new Object;
                    for (let item of list)
                    {
                        let queue;
                        if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                        {
                            if (map[item.userInfo.townAddress]===undefined)
                            {
                                map[item.userInfo.townAddress]={passed: new Array,rejected: new Array};
                            }
                            queue=map[item.userInfo.townAddress];
                        }
                        else
                        {
                            if (map[item.userInfo.proAddress]===undefined)
                            {
                                map[item.userInfo.proAddress]={passed: new Array,rejected: new Array};
                            }
                            queue=map[item.userInfo.proAddress];
                        }
                        if (/^(4|6|7|5)$/.test(item.checkState.toString()))
                        {
                            queue.passed.push(item);
                        }
                        else
                        {
                            queue.rejected.push(item);
                        }
                    }
                    let r=new Array;
                    for (let item in map)
                    {
                        if (map[item].passed.length+map[item].rejected.length===0)
                        {
                            r.push([item,"N/A"]);
                            continue;
                        }
                        r.push([item,((map[item].passed.length/(map[item].passed.length+map[item].rejected.length))*100)]);
                    }
                    res.end(JSON.stringify({error: false,list: r}));
                },preprocessor: (target,cb)=>
                {
                    if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                    {
                        target.conditions["userInfo.proAddress"]=cUser.proAddress;
                        target.conditions.checkState={$in: [4,3,6,7,8]};
                    }
                    else
                    {
                        target.conditions.checkState={$in: [6,8,7]};
                    }
                    target.conditions["createTime"]={$gte: json.startTime,$lt: json.endTime};
                    cb();
                }};
                q["scoreSum"]={category: "Statistics",conditions: {},processor:(err,list)=>
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    let map=new Object;
                    for (let item of list)
                    {
                        let queue;
                        if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                        {
                            if (map[item.case.userInfo.townAddress]===undefined)
                            {
                                map[item.case.userInfo.townAddress]={score: 0};
                            }
                            queue=map[item.case.userInfo.townAddress];
                        }
                        else
                        {
                            if (map[item.case.userInfo.proAddress]===undefined)
                            {
                                map[item.case.userInfo.proAddress]={score: 0};
                            }
                            queue=map[item.case.userInfo.proAddress];
                        }
                        queue.score+=item.score;
                    }
                    let r=new Array;
                    for (let item in map)
                    {
                        r.push([item,map[item].score]);
                    }
                    res.end(JSON.stringify({error: false,list: r}));
                },preprocessor: (target,cb)=>
                {
                    if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                    {
                        target.conditions["case.userInfo.proAddress"]=cUser.proAddress;
                    }
                    target.conditions["createTime"]={$gte: json.startTime,$lt: json.endTime};
                    cb();
                }};
                q["submitSum"]={category: "Samples",conditions: {},processor:(err,list)=>
                {
                    if (err)
                    {
                        return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                    }
                    let map=new Object;
                    for (let item of list)
                    {
                        let queue;
                        if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                        {
                            if (map[item.userInfo.townAddress]===undefined)
                            {
                                map[item.userInfo.townAddress]={passed: new Array,rejected: new Array};
                            }
                            queue=map[item.userInfo.townAddress];
                        }
                        else
                        {
                            if (map[item.userInfo.proAddress]===undefined)
                            {
                                map[item.userInfo.proAddress]={passed: new Array,rejected: new Array};
                            }
                            queue=map[item.userInfo.proAddress];
                        }
                        if (item.checkState===4 || item.checkState===6)
                        {
                            queue.passed.push(item);
                        }
                        else
                        {
                            queue.rejected.push(item);
                        }
                    }
                    let r=new Array;
                    for (let item in map)
                    {
                        r.push([item,(map[item].passed.length+map[item].rejected.length)]);
                    }
                    res.end(JSON.stringify({error: false,list: r}));
                },preprocessor: (target,cb)=>
                {
                    if (!(/^(groupUser|superAdmin)$/).test(cUser.userLevel))
                    {
                        target.conditions["userInfo.proAddress"]=cUser.proAddress;
                    }
                    else
                    {
                        target.conditions["checkState"]={$in: [4,5,6,7,8]};
                    }
                    target.conditions["createTime"]={$gte: json.startTime,$lt: json.endTime};
                    cb();
                }};
                let target=q[json.target];
                
                target.preprocessor(target,()=>
                {
                    db.collection(target.category).find(target.conditions,{caseImg: 0,caseHtml: 0,caseAbstract: 0}).toArray(target.processor);
                });
            });

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
