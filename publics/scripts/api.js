function WebBasicIF()
{
    this.go=function(url,data,callback)
    {
        $.ajax({url: url,
                type: "POST",
                dataType: "JSON",
                data: JSON.stringify(data),
                success: function(res)
                {
                    if (res.error)
                    {
                        return callback(new Error(res.message),res);
                    }
                    callback(undefined,res);
                },error: function(jqXhr,errorCode,errorText)
                {
                    callback(new Error(errorText),{error: true,code: 6,errorCode: errorCode,message: errorText});
                }});
    };
}

function WebIF()
{
    let that=this;
    this.count=function(parameters,callback)
    {
        parameters.category=parameters.category || throw Error("category is required.");
        parameters.conditions=parameters.conditions || throw Error("conditions is required.");
        that.go("/wif/data/count",parameters,callback);
    };
    this.query=function(parameters,callback)
    {
        parameters.category=parameters.category || throw Error("category is required.");
        parameters.conditions=parameters.conditions || throw Error("conditions is required.");
        that.go("/wif/data/query",parameters,callback);
    };
    this.create=function(parameters,callback)
    {
        parameters.category=parameters.category || throw Error("category is required.");
        parameters.content=parameters.content || throw Error("content is required.");
        that.go("/wif/data/create",parameters,callback);
    };
    this.delete=function(parameters,callback)
    {
        parameters.category=parameters.category || throw Error("category is required.");
        parameters.id=parameters.id || throw Error("id is required.");
        that.go("/wif/data/delete",parameters,callback);
    };
    this.modify=function(parameters,callback)
    {
        parameters.category=parameters.category || throw Error("category is required.");
        parameters.content=parameters.content || throw Error("content is required.");
        parameters.id=parameters.id || throw Error("id is required.");
        that.go("/wif/data/modify",parameters,callback);
    };
}

WebIF.prototype=new WebBasicIF;



function EasyChatIF()
{
    let openid=undefined;
    let o=$(".data-openid");
    if (o.length!==0)
    {
        openid=o.text();
        o.remove();
    }
    this.getOpenID=function()
    {
        return openid;
    };
}
