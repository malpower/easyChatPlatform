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

lim.addLimiter("Samples.create",function(json)
{
    if (json.caseTitle.length>30 || json.caseTitle.length==0)
    {
        throw new Error("标题内容不符合要求！");
        return;
    }

    if (json.caseAbstract.length<=10)
    {
        throw new Error("内容摘要字数小于最小限定！");
        return;
    }



    if (json.caseType.length==0)
    {
        throw new Error("文章分类不能为空");
        return;
    }

    json.createTime=(new Date).getTime();
    return json;
});
lim.addLimiter("Samples.modify",function(json)
{
    if (json.caseTitle.length>30 || json.caseTitle.length==0)
    {
        throw new Error("标题内容不符合要求！");
        return;
    }

    if (json.caseAbstract.length<=10)
    {
        throw new Error("内容摘要字数小于最小限定！");
        return;
    }

    if (json.caseType.length==0)
    {
        throw new Error("文章分类不能为空");
        return;
    }

    json.createTime=(new Date).getTime();
    return json;
});



module.exports=lim;
