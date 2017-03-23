/**
 * Created by dai on 2017/2/23.
 */
$(function(){
				 //  隐藏webview菜单按钮
    document.addEventListener('YixinJSBridgeReady', function onBridgeReady(){
        YixinJSBridge.call('hideOptionMenu');
   });
	ajaxGetDatas()
	function ajaxGetDatas(){
    $.ajax({
		 	  	type:"post",
		 	  	url:"http://development.malpower.net/wif/data/query",
		 	  	async:true,
		 	  	dataType:'json',
		 	  	data:JSON.stringify({
		 	  		category: 'Samples',   //积分
					conditions: {isPerfect:true},
					filter: {caseImg: 0},//查询条件，格式与mongodb查询条件相同
					pageNumber: 0,   //页码，可选，从0起记
					pageSize: 10,    //页大小，可选
					sort: {} }),
				success:function(res){
					console.log(res);
					if(!res.error){
						for(var a = 0;a<res.list.length;a++){
							$('#industryselList').append(
								' <li><a href="#">'+
				            '<div class="fl ui-img" style="background: url(http://development.malpower.net/getImage?id=' + res.list[a]._id + ')no-repeat center;background-size: 100% 100%;"></div>'+
				            '<div class="fl ui-info">'+
				            '<h2 class="ft-14">'+res.list[a].caseTitle+'</h2>'+
				            '<p class="ft-12 ui-btm-hink ui-over-h">'+res.list[a].caseAbstract+'</p>'+
				            '</div>'+
				            '</a></li>');
						}						
					}			
				}
		 	  })
	}
})

