const config=require("../config");

function QrcodeCom()
{
    let coms=new Object;
    let sceneIdCounter=100;
    this.generateSceneID=function()
    {
        sceneIdCounter=(sceneIdCounter+1)%10000000;
        return sceneIdCounter;
    };
    this.addCom=function(sceneID="",callback)
    {
        sceneID=sceneID.toString();
        coms[sceneID]={createAt: (new Date).getTime(),
                       callback: callback};
    };
    this.getCom=function(sceneID="")
    {
        sceneID=sceneID.toString();
        if (!coms[sceneID])
        {
            return function(){};
        }
        return coms[sceneID].callback;
    };
    this.destroyCom=function(sceneID="")
    {
        sceneID=sceneID.toString();
        coms[sceneID]=undefined;
        delete coms[sceneID];
    };
    setInterval(function()
    {
        let cur=(new Date).getTime();
        let names=Object.keys(coms);
        function Repeater()
        {
            function Next()
            {
                setTimeout(Repeater,1000);
            }
            if (names.length===0)
            {
                return;
            }
            let name=names.shift();
            if (coms[name]===undefined)
            {
                return Next();
            }
            if (cur-coms[name].createAt>=config.qrcode.cleanDelay)
            {
                delete coms[name];
            }
            return Next();
        }
        Repeater();
    },180*1000);
}

module.exports=new QrcodeCom;
