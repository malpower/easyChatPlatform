function respond(list,title,header,res)
{
    if (typeof(headers)==="string")
    {
        header=header.split(",");
    }
    res.set("Content-Type","application/xls");
    res.set("Content-DIsposition","attachment;filename=Export.xls");
    let content=`<tr><td cols="${header.length}">${title}</td><tr>`;
    content+=`<tr><td>${header.join("</td><td>")}</td></tr>`;
    for (let i=0;i<list.length;i++)
    {
        list[i]="<td>"+list[i].join("</td><td>")+"</td>";
    }
    content+="<tr>"+list.join("</tr><tr>")+"</tr>"
    res.end(`<meta charset="utf-8" /><table><tbody>${content}</tbody></table>`);
}

module.exports={respond};