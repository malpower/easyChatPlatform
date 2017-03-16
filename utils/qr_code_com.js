function QrcodeCom()
{
    let coms=new Object;
    this.addCom=function(sceneID,callback)
    {
        sceneID=sceneID.toString();
        coms[sceneID]={createAt: (new Date).getTime(),
                       callback: callback};
    };
    this.getCom=function(sceneID)
    {
        sceneID=sceneID.toString();
        return coms[sceneID].callback;
    };
    this.destroyCom=function(sceneID)
    {
        sceneID=sceneID.toString();
        coms[sceneID]=undefined;
        delete coms[sceneID];
    };
    let cleaner=setInterval(function()
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
