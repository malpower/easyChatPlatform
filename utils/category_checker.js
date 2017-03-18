const config=require("../config");
function CategoryChecker()
{
    let rule=/^(Users)$/;
    this.checkCategory=function(cate)
    {
        if (rule.test(cate))
        {
            return true;
        }
        let categories=config.customizedWifs.categories;
        for (let i=0;i<categories.length;i++)
        {
            if (cate===categories[i])
            {
                return true;
            }
        }
        return false;
    };
}

module.exports=new CategoryChecker;
