function Format()
{
    this.getReqJson=function(req)
    {
        if (req || req.body)
        {
            try
            {
                return JSON.stringify(req.body.toString());
            }
            catch (e)
            {
                return undefined;
            }
        }
        return undefined;
    };
}

module.exports=new Format;
