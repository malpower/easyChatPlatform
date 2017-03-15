function Pages()
{
    this.init=function(app,callback)
    {
        process.nextTick(callback);
    };
}

module.exports=new Pages;
