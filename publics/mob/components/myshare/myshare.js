/**
 * Created by dai on 2017/2/23.
 */
$(function(){
				 //  隐藏webview菜单按钮
    document.addEventListener('YixinJSBridgeReady', function onBridgeReady(){
        YixinJSBridge.call('hideOptionMenu');
   });
        var id = location.search.split('&')[1].split('=')[1];
        Ajax(id);
        function Ajax(Id){
        		$.ajax({
		 	  	type:"post",
		 	  	url:"http://qdzy.internal-i-focusing.com/wif/data/query",
		 	  	async:true,
		 	  	filter: {caseImg: 0},
		 	  	dataType:'json',
		 	  	data:JSON.stringify({
		 	  		category: 'Samples',   //积分
					conditions: {'userInfo.openId':Id},     //查询条件，格式与mongodb查询条件相同
					pageNumber: 0,   //页码，可选，从0起记
					pageSize: 1000,    //页大小，可选
					sort: {} }),
				success:function(res){
					console.log(res);
					if(!res.error){
						for(var a = 0;a<res.list.length;a++){
							$('#myshareList').append(							
							' <li><a href="detailes.html?caseid='+res.list[a]._id+'">'+
				            '<div class="fl ui-img" style="background: url(http://qdzy.internal-i-focusing.com/getImage?id='+res.list[a]._id+')no-repeat center;background-size: 100% 100%;"></div>'+
				            '<div class="fl ui-info">'+
				            '<h2 class="ft-14" >'+res.list[a].caseTitle+'</h2>'+
				        	'<p class="ft-12 ui-btm-hink">'+res.list[a].caseAbstract+'</p>'+
				        	'</div>'+
				            '</a></li>'							
							)
						}					
					}			
				}
		 	  })
        };
})
