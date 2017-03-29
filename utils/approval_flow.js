function ApprovalFlow()
{
    let flow=new Array;
    this.startFlow=function(json,database,callback)
    {
        let pointer=0;
        function finish(op)
        {
            if (op)
            {
                return database.collection("Samples").update({_id: json._id},{$set: {checkState: json.checkState,checkPoints: json.checkPoints}},callback);
            }
            return callback(undefined);
        }
        function next()
        {
            if (pointer.length>=flow.length)
            {
                return finish(true);
            }
            let fn=flow[pointer++];
            fn(json,database,next);
        }
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
        if (json.checkState!==checkPoint)
        {
            return next();
        }
        if (!(json.userInfo.skips instanceof Array))
        {
            return finish(false);
        }
        let skip=json.userInfo.skips.find((value)=>
        {
            if (value===checkPoint)
            {
                return true;
            }
        });
        if (skip===undefined)
        {
            return finish(false);
        }
        json.checkState=nextCheckPoint;
        json.checkPoints["P"+nextCheckPoint]=(new Date).getTime();
        return next();
    };
}

function FlowGenerator()
{
    let flow=new ApprovalFlow;
    flow.addStep(CreateStep(1,4))
        .addStep(CreateStep(4,6))
        .addStep(CreateStep(6,9));
    return flow;
}

module.exports={generateFlow: FlowGenerator};
