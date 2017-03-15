const express=require("express");
const bodyParser=require("body-parser");
const easy=require("./easy");
const webIfaces=require("./webIfaces");
const pages=require("./pages");

const app=express();

app.use(express.static("publics"));
app.use(bodyParser.raw({limit: "11m",type: "application/*"}));

console.log("Server is now starting...");
console.log("Initializing easy chat communicator...");
easy.init(app,function(err)
{
    if (err)
    {
        console.log(err.message);
        process.exit(0);
    }
    console.log("Easy chat communicator online...");
    console.log("Initializing web interfaces...");
    webIfaces.init(app,function(err)
    {
        if (err)
        {
            console.log(err.message);
            process.exit(0);
        }
        console.log("Web interfaces online...");
        console.log("Initializing page handlers...");
        pages.init(app,function(err)
        {
            if (err)
            {
                console.log(err.message);
                process.exit(0);
            }
            console.log("Page handlers online...");
            console.log("Start to listen on port 80");
            app.listen(80,function(err)
            {
                if (err)
                {
                    console.log(err.message);
                    process.exit(0);
                }
                console.log("Server on, running on port 80.");
            });
        });
    });
});
