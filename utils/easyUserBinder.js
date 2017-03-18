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
                return callback(new Error("Cannot find user in DB."),json);
            }
            database.collection("Users").update({_id: new ObjectId(id)},{$set: {openId: openId}});
            list[0].openId=openId;
            process.nextTick(callback,undefined,list[0]);
        });
    });
}


module.exports={bindEasyUser: BindUserOnEasyChat};
