/**
 * Created by dai on 2017/2/24.
 */
$(document).ready(function () {
	var listurl =  location.search.split('&')[0].split('=')[1];
	var userid =  location.search.split('&')[1].split('=')[1];
	console.log(userid);	    
    console.log(listurl);
       			$.ajax({
		 	  	type:"post",
		 	  	url:"http://qdzy.internal-i-focusing.com/cusWifs/mob_web/visit",
		 	  	async:true,
		 	  	dataType:'json',
		 	  	data:JSON.stringify({
		 	  		caseId: listurl,
		 	  		openId: userid
		 	  	}),
		 	  success:function(resss){
					console.log(resss);
					if(!resss.error){							
					}
				}	
			});
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
			
						
	//加精彩		
    $('.d-collect').click(function(){
        var _this=$('.d-collect').eq(0)
        if(_this.hasClass('icon_selected')){
            _this.removeClass('icon_selected').addClass('icon_def');
            $.ajax({
		 	  	type:"post",
		 	  	url:"http://qdzy.internal-i-focusing.com/cusWifs/mob_web/unlike",
		 	  	async:true,
		 	  	dataType:'json',
		 	  	data:JSON.stringify({
		 	  		caseId: listurl, 
		 	  		openId: userid
		 	  		}),
		    success:function(res){
				 }
		 	  });
        }else {
            _this.removeClass('icon_def').addClass('icon_selected');
            $.ajax({
		 	  	type:"post",
		 	  	url:"http://qdzy.internal-i-focusing.com/cusWifs/mob_web/like",
		 	  	async:true,
		 	  	dataType:'json',
		 	  	data:JSON.stringify({
		 	  		caseId: listurl, 
		 	  		openId: userid
		 	  		}),
		    success:function(res){
				 }
		 	  })
        }
    });
    
    
//        
  $.ajax({
		 	  	type:"post",
		 	  	url:"http://qdzy.internal-i-focusing.com/wif/data/query",
		 	  	async:true,
		 	  	filter: {caseImg: 0},
		 	  	dataType:'json',
		 	  	data:JSON.stringify({
		 	  		category: 'Samples',
		 	  		filter: {caseImg: 0},//查询条件，格式与mongodb查询条件相同//积分
					conditions: {_id:listurl},     //查询条件，格式与mongodb查询条件相同
					pageNumber: 0,   //页码，可选，从0起记
					pageSize: 1000,    //页大小，可选
					sort: {} }),
		    success:function(res){
					console.log(res);
					if(!res.error){
						for(var a = 0;a<res.list[0].liked.length;a++){
							 if(res.list[0].liked[a].openId==userid){
							 	 $('.d-collect').eq(0).removeClass('icon_def').addClass('icon_selected');
						    }
						}
						$('.col-333').text(res.list[0].caseTitle);
						$('.time').text(formatDate(new Date(res.list[0].createTime)));
						$('.name').text(res.list[0].createUsername);
						$('.d-info').html(res.list[0].caseHtml)
					}
				 }
		 	  })
    //  隐藏webview菜单按钮
    document.addEventListener('YixinJSBridgeReady', function onBridgeReady() {
        YixinJSBridge.call('hideOptionMenu');
    });
})