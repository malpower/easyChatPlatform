function format(date)
{
    if (typeof(date)==="number")
    {
        date=new Date(date);
    }
    let t=`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()>9?date.getHours():"0"+date.getHours()}:${date.getMinutes()>9?date.getMinutes():"0"+date.getMinutes()}:${date.getSeconds()>9?date.getSeconds():"0"+date.getSeconds()}`;
    return t;
}


module.exports={format};