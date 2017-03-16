function BasicIF()
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
    this.getCurrentUser=function(callback)
    {
        that.go("/users/getCurrentUser",{},callback);
    };
}

WebIF.prototype=new BasicIF;



function EasyChatIF()
{
    let that=this;
    let openid=undefined;
    let o=$(".data-openid");
    if (o.length!==0)
    {
        openid=o.text();
        o.remove();
    }
    this.getRenderedOpenId=function()
    {
        return openid;
    };
    this.waitingScanQrCode=function(callback)
    {
        if (typeof(callback)!=="function")
        {
            throw new TypeError("callback must be a function!");
        }
        let stamp=$(".data-stamp");
        if (stamp.length===0)
        {
            throw new Error("Method invoked in a wrong page.");
        }
        stamp=stamp.text();
        $(".data-stamp").remove();
        $.ajax({url: "/waitingScanQrCode",
                type: "GET",
                dataType: "JSON",
                data: "stamp="+stamp,
                success: function(res)
                {
                    callback(undefined,res);
                },error: function(jqXhr,code,text)
                {
                    callback(new Error(text));
                }});
    };
    this.addSubscribeUsers=function(users,callback)
    {
        if (typeof(callback)!=="function")
        {
            throw new TypeError("callback must be a function!");
        }
        if (!(users instanceof Array))
        {
            throw new TypeError("users must be an array!");
        }
        that.go("/easyChat/addSubscribeUsers",users,callback);
    };
    this.removeSubscribeUsers=function(users,callback)
    {
        if (typeof(callback)!=="function")
        {
            throw new TypeError("callback must be a function!");
        }
        if (!(users instanceof Array))
        {
            throw new TypeError("users must be an array!");
        }
        that.go("/easyChat/removeSubscribeUsers",users,callback);
    };
    this.getUserInformation=function(openId,callback)
    {
        if (typeof(openId)!=="string")
        {
            throw new TypeError("openId must be a string.");
        }
        if (typeof(callback)!=="function")
        {
            throw new TypeError("callback must be a function!");
        }
        that.go("/easyChat/getUserInformation",{openId: openId},callback);
    };
}
