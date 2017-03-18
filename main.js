/**************************Project specification***************************
Author: malpower(Thrasky Louh)
Email: malpower@ymail.com
Mobile Phone: 18080041800


To run the program, please run "npm run start" in the directory.



**************************************************************************/



const express=require("express");
const bodyParser=require("body-parser");
const easy=require("./easy");
const webIfaces=require("./web_ifaces");
const pages=require("./pages");
const cookieParser=require("cookie-parser");
const config=require("./config");

const fs=require("fs");


const app=express();

app.use(express.static("publics"));


//All the AJAX request will be in POST method, using content type which configured in server.js.
app.use(cookieParser());


app.set("view engine","ejs");
app.set("views","views");

app.use(function(req,res,next)
{
    if (config.web.allowCORS)
    {
        res.set("Access-Control-Allow-Credentials","true");
        res.set("Access-Control-Allow-Origin",config.web.corsDomain || req.get("Origin"));
    }
    next();
});


console.log("Server is now starting...");
console.log("Initializing easy chat communicator...");
easy.init(app,function(err,easyCom)
{//First of all, initialize the easy chat library and message recipient.
    if (err)
    {
        console.log(err.message);
        process.exit(0);
    }
    console.log("Easy chat communicator online...");
    console.log("Initializing web interfaces...");
    webIfaces.init(app,easyCom,function(err)
    {//After the easy chat communicator, we are going to initialize the web interfaces.
        if (err)
        {
            console.log(err.message);
            process.exit(0);
        }
        console.log("Web interfaces online...");
        console.log("Initializing page handlers...");
        pages.init(app,easyCom,function(err)
        {//Initialize the page handlers.
            if (err)
            {
                console.log(err.message);
                process.exit(0);
            }
            console.log("Page handlers online...");
            console.log("Start to listen on port "+config.server.serverPort);
            app.listen(config.server.serverPort,function(err)
            {//Start to listen on port 80, the port 80 is required by easy chat API requirement.
                if (err)
                {
                    console.log(err.message);
                    process.exit(0);
                }
                console.log("Server on, running on port "+config.server.serverPort);
                //Here we are, all the initialization job are done.
            });
        });
    });
});


process.on("uncaughtException",function(err)
{
    fs.appendFile("./error_log.txt",`\r\n======================${(new Date).toString()}=============\r\n${err.message}\r\n\r\n\r\n${err.stack}\r\n\r\n=========================`);
});
