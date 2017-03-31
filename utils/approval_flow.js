const ObjectId=require("mongodb").ObjectID;

function ApprovalFlow()
{
    let flow=new Array;
    let op=false;
    this.startFlow=function(json,database,callback)
    {
        let pointer=0;
        function setOP(o)
        {
            if (!op)
            {
                op=o;
            }
        }
        function finish()
        {
            debugger;
            if (op)
            {
                let id=json.content._id || json.id || json.ids[0];
                return database.collection("Samples").update({_id: new ObjectId(id)},{$set: {checkState: json.content.checkState,checkPoints: json.content.checkPoints}},callback);
            }
            return callback(undefined);
        }
        function next()
        {
            if (pointer>=flow.length)
            {
                return finish();
            }
            let fn=flow[pointer++];
            fn(json,database,next,finish);
        }
        process.nextTick(next);
    };
    this.addStep=function(fn)
    {
        flow.push(fn);
        return this;
    };
}

function CreateStep(checkPoint,nextCheckPoint)
{
    return (json,database,next,finish)=>
    {
        json=json.content;
        if (json.checkState!==checkPoint)
        {
            return next();
        }
        if (!(json.userInfo.skips instanceof Array))
        {
            return setOP(false);
        }
        let skip=json.userInfo.skips.find((value)=>
        {
            if (value===nextCheckPoint)
            {
                return true;
            }
        });
        if (skip===undefined)
        {
            return setOP(false);
        }
        json.checkState=nextCheckPoint;
        json.checkPoints["P"+nextCheckPoint]=(new Date).getTime();
        setOP(true);
        return next();
    };
}

function FlowGenerator()
{
    let flow=new ApprovalFlow;
    flow.addStep(CreateStep(1,4))
        .addStep(CreateStep(4,6))
        .addStep(CreateStep(6,401));
    return flow;
}

module.exports={generateFlow: FlowGenerator};
