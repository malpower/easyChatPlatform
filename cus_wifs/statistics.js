const format=require("../utils/format");


function Statistics()
{
    this.init=function(app,easy,db)
    {
        app.post("/getSubmitReportByUser",function(req,res)
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

        app.post("/getProvincePassReportByProvince",function(req,res){
            let json=format.getReqJson(req);
            if(!json){
                return res.end(JSON.stringify({error:true,code:1,message:"Invalid JSON structure."}));
            }
            db.collection("Samples").find({createTime: {$gte: json.startTime,$lt: json.endTime}}).toArray(function(err,list){
                if(err){
                    return res.end(JSON.stringify({error:true,code:2,message:err.message}));
                }
                let calc=new Object;
                for(let i=0;i<list.length;i++){
                    if(list[i].userInfo===undefined)  continue;
                    if(list[i].userInfo.proAddress===undefined)  continue;
                    if(calc[list[i].userInfo.proAddress]===undefined){
                        calc[list[i].userInfo.proAddress]={allcount:0,publishcount:0,passrate:"0%",province:list[i].userInfo.proAddress}
                    }
                    calc[list[i].userInfo.proAddress].allcount++;
                    if(list[i].checkState===undefined) continue;
                    if(list[i].checkState=="4"){
                        calc[list[i].userInfo.proAddress].publishcount++;
                    }
                }
                for(let i in calc){
                      calc[i].passrate=function(){
                          return (Math.round(calc[i].publishcount / calc[i].allcount * 10000) / 100.00 + "%");
                      };
                }
                let o={error: false,statistics: calc,total: list.length};
                return res.end(JSON.stringify(o));
            });
        });

        app.post("/getProvinceSubmitReportByProvince",function(req,res){
            let json=format.getReqJson(req);
            if(!json){
                return res.end(JSON.stringify({error:true,code:1,message:"Invalid JSON structure."}));
            }
            db.collection("Samples").find({createTime: {$gte: json.startTime,$lt: json.endTime}}).toArray(function(err,list){
                if(err){
                    return res.end(JSON.stringify({error:true,code:2,message:err.message}));
                }
                let calc=new Object;
                //how to calculate submit count?
                for(let i=0;i<list.length;i++){
                    if(list[i].userInfo===undefined)  continue;
                    if(list[i].userInfo.proAddress===undefined)  continue;
                    if(calc[list[i].userInfo.proAddress]===undefined){
                        calc[list[i].userInfo.proAddress]={allcount:0,submitcount:0,province:list[i].userInfo.proAddress}
                    }
                    calc[list[i].userInfo.proAddress].allcount++;
                    if(list[i].checkState===undefined) continue;
                    if(list[i].checkState=="1"){
                        calc[list[i].userInfo.proAddress].submitcount++;
                    }
                }

                let o={error: false,statistics: calc,total: list.length};
                return res.end(JSON.stringify(o));
            });
        });

        app.post("/getProvinceIntegralReportByProvince",function(req,res){
            let json=format.getReqJson(req);
            if(!json){
                return res.end(JSON.stringify({error:true,code:1,message:"Invalid JSON structure."}));
            }
            db.collection("Users").find().toArray(function(err,list){
                if(err){
                    return res.end(JSON.stringify({error:true,code:2,message:err.message}));
                }
                let calc=new Object;
                //how to calculate submit count?
                for(let i=0;i<list.length;i++){
                    if(list[i].proAddress===undefined)  continue;
                    if(list[i].integral===undefined)  continue;
                    if(calc[list[i].proAddress]===undefined){
                        calc[list[i].proAddress]={sumIntegral:0,province:list[i].proAddress}
                    }
                    if(typeof(list[i].integral)!="number"){
                        //calc[list[i].proAddress].sumIntegral=calc[list[i].proAddress].sumIntegral+0;
                    }
                    else {
                        calc[list[i].proAddress].sumIntegral=calc[list[i].proAddress].sumIntegral+list[i].integral;
                    }

                }

                let o={error: false,statistics: calc,total: list.length};
                return res.end(JSON.stringify(o));
            });
        });

        app.post("/getUserIntegralReport",function(req,res){
            let json=format.getReqJson(req);
            if(!json){
                return res.end(JSON.stringify({error:true,code:1,message:"Invalid JSON structure."}));
            }
            db.collection("Users").find().toArray(function(err,list){
                if(err){
                    return res.end(JSON.stringify({error:true,code:2,message:err.message}));
                }
                let calc=new Object;
                //how to calculate submit count?
                for(let i=0;i<list.length;i++){
                    if(list[i].openId===undefined)  continue;
                    if(list[i].integral===undefined)  continue;
                    if(calc[list[i].openId]===undefined){
                        calc[list[i].openId]={sumIntegral:list[i].integral,username:list[i].name}
                    }
                }

                let o={error: false,statistics: calc,total: list.length};
                return res.end(JSON.stringify(o));
            });
        });
    };
}

module.exports=new Statistics;
