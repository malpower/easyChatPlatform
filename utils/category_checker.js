function CategoryChecker()
{
    let rule=/^(Samples|Images|Users)$/;
    this.checkCategory=function(cate)
    {
        if (rule.test(cate))
        {
            return true;
        }
        return false;
    };
}

module.exports=new CategoryChecker;
