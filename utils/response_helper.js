let config=require("../config");


function Helper()
{
    this.cors=function(res)
    {
        if (config.web.allowCORS)
        {
            res.set("Access-Control-Allow-Credentials","true");
            res.set("Access-Control-Allow-Origin","*");
        }
    };
}

module.exports=new Helper;
