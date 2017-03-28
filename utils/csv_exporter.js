function respond(list,title,header,res)
{
    if (typeof(header)==="string")
    {
        header=header.split(",");
    }
    res.set("Content-Type","application/xls");
    res.set("Content-Disposition","attachment;filename=Export.xls");
    let content=`<tr><td colspan="${header.length}">${title}</td><tr>`;
    content+=`<tr><td>${header.join("</td><td>")}</td></tr>`;
    for (let i=0;i<list.length;i++)
    {
        list[i]="<td>"+list[i].join("</td><td>")+"</td>";
    }
    content+="<tr>"+list.join("</tr><tr>")+"</tr>";
    res.end(`<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" /><meta charset="utf-8" /><table border="1"><tbody>${content}</tbody></table>`);
}

module.exports={respond};