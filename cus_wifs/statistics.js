const format=require("../utils/format");


function Statistics()
{
    this.init=function(app,easy,db)
    {
        app.bind("/getSubmitReportByUser",function(req,res)
        {
            let json=format.getReqJson(req);
            if (!json)
            {
                return res.end(JSON.stringify({error: true,code: 1,message: "Invalid JSON structure."}));
            }
            db.collection("Samples").find({createTime: {$gte: json.startTime,$lt: json.endTime}}).toArray(function(err,list)
            {
                if (err)
                {
                    return res.end(JSON.stringify({error: true,code: 2,message: err.message}));
                }
                let calc=new Object;
                for (let i=0;i<list.length;i++)
                {
                    if (calc[list[i].createUser]===undefined)
                    {
                        calc[list[i].createUser]={count: 0,username: list[i].createUsername};
                    }
                    calc[list[i].createUser].count++;
                }
                let o={error: false,statistics: calc,total: list.length};
                return res.end(JSON.stringify(o));
            });
        });
    };
}

module.exports=new Statistics;
