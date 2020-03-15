var boxHeight;
 var boxWidth;
var imgHeight;
var imgWidth;
var level;
var levelText = ["",""];
var gameType = 0;
var gameStatus = 0;
var blockToken = 1;
var heartSum = 0;
var interval = null;

function getHttpRequest() {
if (window.XMLHttpRequest) {
return new XMLHttpRequest();
} else if (window.ActiveXObject) {
return new ActiveXObject("MsXml2.XmlHttp");
}
return null;
}

function ajaxMap(lv) {
var http = getHttpRequest();
if (http==null) {
alert("您的浏览器不支持ajax，无法加载地图。");
return;
}
http.onreadystatechange = function() {
if (http.readyState==4) {
gameInit(http.responseText);
}
}
http.open("GET","map/map"+lv+".js",false);
http.send(null);
}

function gameStart() {
playAudio("click");
blockToken = 0;
document.getElementById("dialog_hello").style.display = "none";
document.getElementById("bgsound").play();
changeLevel(0);
}

function getAlt(id,x,y) {
var alt = [
['星空','墙壁','垃圾桶','爱心','女巫','虚化爱心','虚化女巫'],
['星空','墙壁','地球','火星','宇航员','虚化火星','虚化宇航员'],
['星空','墙壁','月亮','玉兔','嫦娥','虚化玉兔','虚化嫦娥']
];
var img = [
['block.jpg','wall.jpg','dustbin.png','heart.png','broom.png','heart.png','broom.png'],
['block.jpg','wall.jpg','.png','.png','.png','.png','.png'],
[]
];
if (x+y==-1) {
id.alt = alt[gameType][parseInt(id.dataset.id)]+":X"+(parseInt(id.dataset.x)+1)+"Y"+(level.length-parseInt(id.dataset.y));
id.src = "img/"+img[gameType][parseInt(id.dataset.id)];
id.className = "img"+parseInt(id.dataset.id);
return;
}
if (x+y==-2) {
return "img/"+img[gameType][id];
}
x++;
y = level.length - y;
return alt[gameType][id]+":X"+x+"Y"+y;
}

function getImg(id,x,y) {
if (id<0||id>7) return;
return "<img src='"+getAlt(id,-1,-1)+"' class='img"+id+"' alt='"+getAlt(id,x,y)+"' data-x="+x+" data-y="+y+" id='img"+x+"."+y+"' data-id="+id+" onclick='imgClick(this)' width="+imgWidth+" height="+imgHeight+" style='float:left'/>";
}

function gameInit(text) {
eval(text);
imgHeight = boxHeight/(level.length*1.00);
imgWidth = boxWidth/(level[0].length*1.00);
var temp = "";
for (var i=0; i<level.length; i++) {
for (var j=0; j<level[0].length; j++) {
temp +=getImg(level[i][j],j,i);
}
}
document.getElementById("gamebox").innerHTML = temp;
gameStatus = 1;
document.getElementById("time").dataset.time = 0;
document.getElementById("time").innerHTML = "用时 0 s";
document.getElementById("step").dataset.step = 0;
document.getElementById("step").innerHTML = "行动 0 次";
heartSum = 0;
if (interval!=null) clearInterval(interval);
interval = setInterval(timeoutEvent,1000);
isSuccessful();
}

function init() {
boxHeight = document.getElementById("gamebox").offsetHeight;
boxWidth = document.getElementById("gamebox").offsetWidth;
}

function showHelp() {
if (blockToken==1) return;
playAudio("click");
blockToken = 1;
document.getElementById("dialog_help").style.display = "block";
}

function closeOver(mode) {
playAudio("click");
blockToken = 0;
document.getElementById("dialog_over").style.display = "none";
overEvent();
if (mode>0) changeLevel(1);
}

function closeHelp() {
playAudio("click");
blockToken = 0;
document.getElementById("dialog_help").style.display = "none";
}

function changeLevel(index) {
if (blockToken==1) return;
playAudio("click");
var lvDiv = document.getElementById("level");
var lv = parseInt(lvDiv.dataset.level) + index;
if (lv<1) lv=100;
if (lv>100) lv=1;
lvDiv.dataset.level = lv;
lvDiv.innerHTML = "当前 第"+lv+" 关";
ajaxMap(lv);
}

function imgClick(me) {
if (blockToken==1) return;
var id = parseInt(me.dataset.id);
var meX = parseInt(me.dataset.x);
var meY = parseInt( me.dataset.y);
var my = getMyLocation(meX,meY);
if (my==null) return;
var moveStatus = 1;
switch (id) {
case 0:
exchange(my,me);
playAudio("move");
break;
case 1:
playAudio("nomove");
return;
break;
case 2:
exchange(my,me);
playAudio("move");
break;
case 3:
moveStatus = pushObject(my,me);
isSuccessful();
break;
case 5:
moveStatus = pushObject(my,me);
isSuccessful();
break;
}
if (gameStatus==0||moveStatus!=1) return;
document.getElementById("step").dataset.step=parseInt(document.getElementById("step").dataset.step)+1;
document.getElementById("step").innerHTML = "行动 "+document.getElementById("step").dataset.step+" 次";
}

function getMyLocation(x,y) {
var my;
var tmp;
if (x>0) {
tmp=x-1;
my = document.getElementById("img"+tmp+"."+y);
if (my.dataset.id=="4"||my.dataset.id=="6") return my;
}
if (x<level[0].length-1) {
tmp=x+1;
my = document.getElementById("img"+tmp+"."+y);
if (my.dataset.id=="4"||my.dataset.id=="6") return my;
}
if (y>0) {
tmp=y-1;
my = document.getElementById("img"+x+"."+tmp);
if (my.dataset.id=="4"||my.dataset.id=="6") return my;
}
if (y<level. length-1) {
tmp=y+1;
my = document.getElementById("img"+x+"."+tmp);
if (my.dataset.id=="4"||my.dataset.id=="6") return my;
}
return null;
}

function exchange(a,b) {
var aId = parseInt(a.dataset.id);
var bId = parseInt(b.dataset.id);
var id = aId;
if (id>4) id=id-2;
a.dataset.id = aId-id;
b.dataset.id = bId+id;
getAlt(a,-1,0);
getAlt(b,-1,0);
}

function pushObject(a,b) {
var aX = parseInt(a.dataset.x);
var bX = parseInt(b.dataset.x);
var aY = parseInt(a.dataset.y);
var bY = parseInt(b.dataset.y);
var c;
if (aX==bX) {
if (bY<(level.length-1)&&bY-aY>0) {
c = document.getElementById("img"+bX+"."+(bY+1));
if (c.dataset.id!="1"&&c.dataset.id!="3"&&c.dataset.id!="5") {
playAudio("push");
exchange(b,c);
exchange(a,b);
return 1;
}
} else if (bY>0&&bY-aY<0) {
c = document.getElementById("img"+bX+"."+(bY-1));
if (c.dataset.id!="1"&&c.dataset.id!="3"&&c.dataset.id!="5") {
playAudio("push");
exchange(b,c);
exchange(a,b);
return 1;
}
}
} else if (aY==bY) {
if (bX<(level[0].length-1)&&bX-aX>0) {
c = document.getElementById("img"+(bX+1)+"."+bY);
if (c.dataset.id!="1"&&c.dataset.id!="3"&&c.dataset.id!="5") {
playAudio("push");
exchange(b,c);
exchange(a,b);
return 1;
}
} else if (bX>0&&bX-aX<0) {
c = document.getElementById("img"+(bX-1)+"."+bY);
if (c.dataset.id!="1"&&c.dataset.id!="3"&&c.dataset.id!="5") {
playAudio("push");
exchange(b,c);
exchange(a,b);
return 1;
}
}
}
playAudio("nopush");
}

function isSuccessful() {
if (gameStatus==0) return;
var heartNow = 0;
for (var i=0; i<level.length; i++) {
for (var j=0; j<level[0].length; j++) {
if (document.getElementById("img"+i+"."+j).dataset.id=="3") heartNow++;
}
}
if (heartSum==0) heartSum = heartNow;
if (heartSum>heartNow) playAudio("enter");
heartSum = heartNow;
if (heartNow==0) {
gameStatus = 0;
blockToken = 1;
getEvaluation();
playAudio("finish");
document.getElementById("dialog_over").style.display = "block";
}
}

function getEvaluation() {
var tmp;
var time = parseInt(document.getElementById("time").dataset.time)-1;
var step = parseInt(document.getElementById("step").dataset.step);
if (time>500) tmp = "一言难尽";
if (time<=500) tmp = "拖拉机";
if (time<=240) tmp = "自行车";
if (time<=160) tmp = "绿皮火车";
if (time<=120) tmp = "普速列车";
if (time<=80) tmp = "高铁";
if (time<=60) tmp = "客机";
if (time<=50) tmp = "音速";
if (time<=40) tmp = "超音速";
if (time<=30) tmp = "环绕";
if (time<=25) tmp = "脱离";
if (time<=20) tmp = "逃逸";
if (time<=10) tmp = "c";
if (time<=5) tmp = "∞";
document.getElementById("over_time").innerHTML = "总用时 "+time+" 秒<br>整体评价： ‘<strong>"+tmp+"</strong>’";
var v = (time/1.00)/step;
if(v>9.4) tmp = "初学乍练";
if(v<=9.4) tmp = "笨手笨脚";
if(v<=8.4) tmp = "略知一二";
if(v<=7.4) tmp = "半生不熟";
if(v<=6.4) tmp = "平平无奇";
if(v<=5.6) tmp = "驾轻就熟";
if(v<=4.8) tmp = "出类拔萃";
if(v<=4.0) tmp = "渐入佳境";
if(v<=3.4) tmp = "登堂入室";
if(v<=2.8) tmp = "炉火纯青";
if(v<=2.2) tmp = "技压群雄";
if(v<=1.8) tmp = "独步天下";
if(v<=1.4) tmp = "震古烁今";
if(v<=1.0) tmp = "超凡脱俗";
if(v<=0.8) tmp = "天人合一";
if(v<=0.6) tmp = "深不可测";
if(v<=0.4) tmp = "单身久矣";
document.getElementById("over_step").innerHTML = "总行动 "+step+" 次，平均 "+v+" 秒/次<br>手速评价： ‘<strong>"+tmp+"</strong>’";
document.getElementById("over_text1").innerHTML = "<strong>"+levelText[0]+"</strong>";
document.getElementById("over_text2").innerHTML = "<strong>"+levelText[1]+"</strong>";
}

function timeoutEvent() {
if (gameStatus==0||blockToken==1) return;
var time = parseInt(document.getElementById("time").dataset.time);
time++;
document.getElementById("time").dataset.time = time;
document.getElementById("time").innerHTML = "用时 "+(time-1)+" s";
}

function playAudio(id) {
var player = document.getElementById("m."+id);
player.currentTime = 0;
player.play();
}

function overEvent() {
for (var i=0; i<level.length; i++) {
for (var j=0; j<level[0].length; j++) {
var id = parseInt(document.getElementById("img"+i+"."+j).dataset.id);
if (id>4) id = id - 2;
if (id<3) id=0;
document.getElementById("img"+i+"."+j).dataset.id = id;
getAlt(document.getElementById("img"+i+"."+j),-1,0);
}
}

}
