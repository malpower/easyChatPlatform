function CategoryChecker()
{
    let rule=/^(Samples|Images|Users|Companies)$/;
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
