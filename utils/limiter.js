const authTool=require("../auth");
const sidTool=require("./sid");

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
    json.content.createUser=user._id;
    return json;
});

module.exports=lim;
