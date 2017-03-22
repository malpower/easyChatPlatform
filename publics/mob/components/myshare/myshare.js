/**
 * Created by dai on 2017/2/23.
 */
/*$(document).ready(function () {
    var datas=[
        {
            img:'../components/common/images/5.jpg',
            title:'怎样做好门店营销？这里是课程名称',
            time:'2016.11.03'
        },
        {
            img:'../components/common/images/4.jpg',
            title:'怎样做好门店营销？这里是课程名称',
            time:'2016.11.03'
        },
        {
            img:'../components/common/images/3.jpg',
            title:'怎样做好门店营销？这里是课程名称',
            time:'2016.11.03'
        },
        {
            img:'../components/common/images/2.jpg',
            title:'怎样做好门店营销？这里是课程名称',
            time:'2016.11.03'
        }
    ]
    initHtml(datas);
});
function initHtml(data){
    data.forEach(function(el,i){
        var html=' <li>'+
            '<div class="fl ui-img" style="background: url('+el.img+')no-repeat center;background-size: 100% 100%;"></div>'+
            '<div class="fl ui-info">'+
            '<h2 class="ft-14" >'+el.title+'</h2>'+
        '<p class="ft-12 ui-btm-hink">'+el.time+'</p>'+
        '</div>'+
        '</li>';
        $('#myshareList').append(html)
    })

}*/

$(function(){
				 //  隐藏webview菜单按钮
    /*document.addEventListener('YixinJSBridgeReady', function onBridgeReady(){
        YixinJSBridge.call('hideOptionMenu');
   });*/
        var id = location.search.split('&')[1].split('=')[1];
        function Ajax(Id){
        		$.ajax({
		 	  	type:"post",
		 	  	url:"/wif/data/query",
		 	  	async:true,
		 	  	filter: {caseImg: 0},
		 	  	dataType:'json',
		 	  	data:JSON.stringify({
		 	  		category: 'Samples',   //积分
					conditions: {createUser:Id},     //查询条件，格式与mongodb查询条件相同
					pageNumber: 0,   //页码，可选，从0起记
					pageSize: 1000,    //页大小，可选
					sort: {} }),
				success:function(res){
					console.log(res);
					if(!res.error){
						for(var a = 0;a<res.list.length;a++){
							$('#myshareList').append(							
							' <li><a href="detailes.html?caseid='+res.list[a]._id+'">'+
				            '<div class="fl ui-img" style="background: url(/getImage?id='+res.list[a]._id+')no-repeat center;background-size: 100% 100%;"></div>'+
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
		$.ajax({
		 	  	type:"post",
		 	  	url:"/wif/data/query",
		 	  	async:true,
		 	  	dataType:'json',
		 	  	data:JSON.stringify({
		 	  		category: 'Users',//积分
					conditions: {openId:id},
		 			  }),
		 		success:function(res){
		 			if(!res.error){
		 				console.log(res.list[0]._id)
		 				Ajax(res.list[0]._id);
		 			}
				 }
	
		});
})
