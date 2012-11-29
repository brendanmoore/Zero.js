/* Mr T - Javascript MicroTest Library, Fool. */
var MrT = (function(d, ac, ce, it, id, p, cn){
var b=d.getElementById('tests')||d.body,ls=d[ce]('ul'),ts=d[ce]('p'),sy=d[ce]('style',ls.id=id),cs=[0,0,0],
tl=function(dn){ts[it]=cs.slice(0,2).join("/");ts[cn]=dn?'p':'f';};
sy[it]=['ul{list-style-type:none;}li'+p+'none;}ul:target '+p+'block}.p,.f{position:relative;}.p',
'✔";color:#0a0;}.f:','✘";color:#900;}p.p,p.f{margin-left:20px;}'].join(':before {left:-20px;position:absolute;content:"');
return function test(n, f){
  var cd=false,li=d[ce]('li'),e=function(k){return function(){
  if(cd||!(cd=true)){return;}
  ls[ac](li,li.innerHTML=n,li[cn]=k?'p':'f');
  if(++cs[1] && k){ cs[0]++; }
  tl(setTimeout(function(){if(cs[2]==cs[1]){ tl(cs[0]==cs[1]);}},0));
  };};
  if(cs[2]++||[sy,ts,ls].forEach(function(v){b[ac](v);})||true){f({pass:e(!0),fail:e(!1)});}
};})(document,'appendChild','createElement','innerText','show_passes','.p{display:','className');