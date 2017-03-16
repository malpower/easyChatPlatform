const ObjectId=require("mongodb").ObjectID;
const config=require("../config");
function SID()
{
    this.generateNewSID=function()
    {
        return (new ObjectId).toString();
    };
    this.getReqSID=function(req)
    {
        let sid=req.cookies[config.web.sid];
        return sid;
    };
    this.setResSID=function(res,value)
    {
        res.cookie(config.web.sid,value);
    };
}

module.exports=new SID;
