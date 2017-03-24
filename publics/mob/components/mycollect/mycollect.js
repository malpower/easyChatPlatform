/**
 * Created by dai on 2017/2/23.
 */
$(document).ready(function () {
    //模拟数据
     var id = location.search.split('&')[1].split('=')[1];
     function formatDate(now) { 
		 		//console.log(now);
				var year=now.getYear()-100;
				//console.log(year);
				var month=now.getMonth()+1; 
				var date=now.getDate(); 
				var hour=now.getHours(); 
				var minute=now.getMinutes(); 
				var second=now.getSeconds();
				if(date<10){
					data = '0'+data
				};
				if(hour<10){
					hour = '0' + hour
				};
				if(minute<10){
					minute = '0' + minute
				};
				if(second<10){
					second = '0' + second
				}
				return "20"+year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second; 
			};
			$.ajax({
		 	  	type:"post",
		 	  	url:"http://qdzy.internal-i-focusing.com/wif/data/query",
		 	  	async:true,
		 	  	dataType:'json',
		 	  	data:JSON.stringify({
		 	  		category: 'Samples',   //积分
					conditions: {"like.openId":id},
					filter: {caseImg: 0},//查询条件，格式与mongodb查询条件相同
					pageNumber: 0,   //页码，可选，从0起记
					pageSize: 10,    //页大小，可选
					sort: {"createTime":-1} 
		 	  	}),
				success:function(resss){
					console.log(resss);
					if(!resss.error){	
						for(var a = 0;a<resss.list.length;a++){
							$('#mycollectList').append(
								 '<li><a href="detailes.html?caseid='+resss.list[a]._id+'">'+
           						 '<div class="fl ui-img" style="background: url(http://qdzy.internal-i-focusing.com/getImage?id='+resss.list[a]._id+')no-repeat center;background-size: 100% 100%;"></div>'+
           						 '<div class="fl ui-info">'+
           						 '<h2 class="ft-14" >'+resss.list[a].caseTitle+'</h2>'+
            					 '<p class="ft-12 ui-btm-hink"><span class="width-80">'+resss.list[a].caseAbstract+'</span> <span class="fr">'+formatDate(new Date(resss.list[a].createTime))+'</span></p>'+
           						 '</div>'+
            					 '<a/></li>'
										)
									}
								  }			
								}
		 		  		});
});