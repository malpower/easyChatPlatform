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

module.exports=new Limiter;
