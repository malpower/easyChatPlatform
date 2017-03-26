const ObjectId=require("mongodb").ObjectID;

function BindUserOnEasyChat(openId,easy,database,callback)
{
    easy.getUserBasicInformation(openId,function(err,json)
    {
        if (err)
        {
            return callback(err,json);
        }
        let id=json.remark;
        database.collection("Users").find({_id: new ObjectId(id)}).toArray(function(err,list)
        {
            if (err)
            {
                return callback(err,json);
            }
            if (list.length===0)
            {
                return database.collection("Users").insert({phone: json.mobile,openId: openId,visitor: true,isFreeze: true},function(err,r)
                {
                    let user={_id: new ObjectId(r.ids[0]),phone: json.mobile,openId: openId,visitor: true,bound: true,isFreeze: true};
                    process.nextTick(callback,undefined,user);
                });
            }
            database.collection("Users").update({_id: new ObjectId(id)},{$set: {openId: openId,bound: true}});
            list[0].openId=openId;
            process.nextTick(callback,undefined,list[0]);
        });
    });
}


module.exports={bindEasyUser: BindUserOnEasyChat};
