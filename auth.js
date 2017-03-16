const config=require("./config");

let authentication=new Object;

function Auth()
{
    this.checkSign=function(signature)
    {
        let a=authentication[signature];
        if (a===undefined)
        {
            return false;
        }
        a.timeCounter=config.auth.timeCounter;
        return true;
    };
    this.getSignData=function(signature)
    {
        let a=authentication[signature];
        if (a===undefined)
        {
            return undefined;
        }
        return a.data;
    };
    this.addSign=function(signature,data)
    {
        let a={timeCounter: config.auth.timeCounter,
               data: data,
               timer: setInterval(function()
               {
                   a.timeCounter--;
                   if (a.timeCounter<=0)
                   {
                       clearInterval(a.timer);
                       authentication[signature]=undefined;
                       delete authentication[signature];
                   }
               },config.auth.timerDuring)};
               authentication[signature]=a;
   };
   this.resetSignData=function(signature,data)
   {
       if (authentication[signature])
       {
           authentication[signature].data=data;
           return true;
       }
       return false;
   };
}

module.exports=new Auth;
