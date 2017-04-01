const authTool=require("../auth");
const sidTool=require("./sid");
const ObjectId=require("mongodb").ObjectID;
const easy=require("../easy_library");
const flowTool=require("./approval_flow");


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
    json.content.isPerfect=false;
    if (!(json.content.checkState===6 && (/^(superAdmin|groupUser|sgroupUser)$/).test(user.userLevel)) && !(json.content.checkState===4 && (/^(superAdmin|provinceUser)$/).test(user.userLevel)) && (json.content.checkState!==1 && json.content.checkState!==100))
    {
        throw new Error("Invalid checkState");
    }
    if (json.content.caseTitle.length>30)
    {
        throw new Error("The length of caseTitle must less than 30.");
    }
    json.content.liked=new Array;
    json.content.visited=new Array;
    return json;
});
lim.addLimiter("Statistics.create",function(json,req,callback)
{
    let user=authTool.getSignData(sidTool.getReqSID(req));
    if (user===undefined || !(/^(groupUser|superAdmin|sgroupUser)$/).test(user.userLevel))
    {
        return callback(new Error("Invalid user permission."));
    }
    database.collection("Samples").find({_id: new ObjectId(json.content.caseId)},{caseImg: 0,caseHtml: 0,caseAbstract: 0}).toArray(function(err,list)
    {
        if (err)
        {
            return callback(err);
        }
        if (list.length===0)
        {
            return callback(new Error("No case found."));
        }
        if (json.content.type==="perfect")
        {
            if (list[0].isPerfect===true)
            {
                return callback(new Error("Can't set the perfect field when a sample is perfect."));
            }
            if (!(/^(groupUser|superAdmin|sgroupUser)$/).test(user.userLevel))
            {
                return callback(new Error("Only group user can do this."));
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
        callback(undefined,json);
    });
});
lim.addLimiter("Samples.modify",function(json,req)
{
    let user=authTool.getSignData(sidTool.getReqSID(req));
    if (user===undefined)
    {
        throw (new Error("User not signed in."));
    }
    Reflect.deleteProperty(json.content,"isPerfect");
    Reflect.deleteProperty(json.content,"userInfo");
    if (!(/^(100|8|3)$/.test(json.content.checkState.toString())) && !(/^(groupUser|provinceUser|superAdmin|sgroupUser)$/).test(user.userLevel))
    {
        throw (new Error("Invalid user permission."));
    }
    if(json.content.checkState)
    {
        json.content["checkPoints.P"+json.content.checkState]=(new Date).getTime();
    }
    return json;
});

lim.addLimiter("Users.create",function(json,req,callback)
{
    let user=authTool.getSignData(sidTool.getReqSID(req));
    if (user===undefined || !(/^(groupUser|sgroupUser|provinceUser|superAdmin)$/).test(user.userLevel))
    {
        throw (new Error("Invalid user permission."));
    }
    if (user.proAddress!==json.content.proAddress && user.userLevel==="provinceUser")
    {
        throw new Error("Province administrators can only create users under it's own province.");
    }
    json.content.bound=false;
    database.collection("Users").find({phone: json.content.phone}).toArray(function(err,list)
    {
        if (err)
        {
            return callback(err);
        }
        if (list.length!==0)
        {
            return callback(new Error("The phone number existed."));
        }
        easy.getUserOpenIdByPhoneNumber(json.content.phone,(err,openId)=>
        {
            if (err)
            {
                return callback(undefined,json);
            }
            json.content.openId=openId.openid;
            json.content.bound=true;
            process.nextTick(callback,undefined,json);
        });
    });
});


lim.addLimiter("Users.modify",function(json,req)
{
    let user=authTool.getSignData(sidTool.getReqSID(req));
    if (user===undefined)
    {
        throw (new Error("User not signed."));
    }
    if (json.content.userLevel==="superAdmin")
    {
        throw new Error("Invalid permission.");
    }
    if ((/^(provinceUser)$/).test(json.content.userLevel) && !(/^(groupUser|superAdmin|provinceUser|sgroupUser)$/).test(user.userLevel))
    {
       throw new Error("Invalid permission.");
    }
    if ((/^(groupUser)$/).test(json.content.userLevel) && !(/^(groupUser|superAdmin|sgroupUser)$/).test(user.userLevel))
    {
       throw new Error("Invalid permission.");
    }
    if (!(/^(groupUser|superAdmin|sgroupUser)$/).test(user.userLevel))
    {
        Reflect.deleteProperty(json.content,"proAddress");
    }
    return json;
});

lim.addLimiter("Users.delete",function(json,req)
{//This is a vulnerability, a province user can remove the super admins or group users.
    let user=authTool.getSignData(sidTool.getReqSID(req));
    if (user===undefined || !(/^(groupUser|provinceUser|superAdmin|sgroupUser)$/).test(user.userLevel))
    {
        throw (new Error("Invalid user permission."));
    }
    return json;
});

lim.addLimiter("Samples.delete",function(json,req,callback)
{//Here's a vulnerability that anyone can delete somebody's draft. And province users can delete cases across provinces.
    let user=authTool.getSignData(sidTool.getReqSID(req));
    if (!user)
    {
        return callback(new Error("User not signed in."));
    }
    if ((/^(groupUser|provinceUser|superAdmin|sgroupUser)$/).test(user.userLevel))
    {
        return callback(undefined,json);
    }
    database.collection("Samples").find({_id: new ObjectId(json.id)},{checkState: 1}).toArray(function(err,list)
    {
        if (err || list.length===0)
        {
            return callback(new Error("Invalid case id"));
        }
        if (!(/^(groupUser|provinceUser|superAdmin|sgroupUser)$/).test(user.userLevel) && !(/^(100|3|8|402)$/.test(list[0].checkState.toString())))
        {
            return callback(new Error("Invalid user permission."));
        }
        callback(undefined,json);
    });
});


lim.addLimiter("Satistics.delete",function(json,req)
{
    throw new Error("Cannot do this");
});

lim.addLimiter("Satistics.modify",function(json,req)
{
    throw new Error("Cannot do this");
});


lim.addLimiter("Samples.query",function(json,req)
{
    let user=authTool.getSignData(sidTool.getReqSID(req));
    if (!user)
    {
        json.conditions.checkState=7;
        user={};
    }
    if (!(/^(superAdmin|groupUser|sgroupUser)$/.test(user.userLevel)) && json.conditions.checkState!==7 && typeof(json.conditions._id)!=="string")
    {
        json.conditions["userInfo.proAddress"]=user.proAddress;
    }
    return json;
});

lim.addLimiter("Users.query",function(json,req)
{
    let user=authTool.getSignData(sidTool.getReqSID(req));
    if (!user)
    {
        throw new Error("User not signed in.");
    }
    if (!(/^(superAdmin|groupUser|sgroupUser)$/.test(user.userLevel)))
    {
        json.conditions["proAddress"]=user.proAddress;
    }
    return json;
});

lim.addLimiter("Statistics.query",function(json,req)
{
    let user=authTool.getSignData(sidTool.getReqSID(req));
    if (user && !(/^(superAdmin|groupUser|sgroupUser)$/.test(user.userLevel)))
    {
        json.conditions["case.userInfo.proAddress"]=user.proAddress;
    }
    return json;
});
lim.addLimiter("Samples.create.after",function(json)
{
    let flow=flowTool.generateFlow();
    flow.startFlow(json,database,()=>
    {
        //
    });
});

lim.addLimiter("Samples.modify.after",function(json)
{
    let flow=flowTool.generateFlow();
    flow.startFlow(json,database,()=>
    {
        //
    });
});

module.exports=lim;
