function respond(list,title,header,res)
{
    res.set("Content-Type","application/csv");
    let content=`title\r\n`;
    content+=header.join(",")+"\r\n";
    for (let i=0;i<list.length;i++)
    {
        list[i]=list[i].join(",");
    }
    content+=list.join("\r\n");
    res.end(content);
}

module.exports={respond};