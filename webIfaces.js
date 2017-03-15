function WebIFaces()
{
    this.init=function(app,callback)
    {
        process.nextTick(callback);
    };
}

module.exports=new WebIFaces;
