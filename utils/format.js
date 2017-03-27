function Format()
{
    this.getReqJson=function(req)
    {
        if (req || req.body)
        {
            try
            {
                return JSON.parse(req.body.toString());
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
