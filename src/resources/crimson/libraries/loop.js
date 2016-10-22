var limit=200, // Max number of stars
body=document.body;
loop={

 start:function(){
  for (var i=0; i <= limit; i++) {
   var star=this.newStar();
   star.style.top=this.rand()*79+10+"%";
   star.style.left=this.rand()*99+"%";
   star.style.webkitAnimationDelay=this.rand()+"s";
   star.style.mozAnimationDelay=this.rand()+"s";
   body.appendChild(star);
  };
 },
 
 rand:function(){
  return Math.random();
 },
 
 newStar:function(){
  var d = document.createElement('div');
  d.innerHTML = '<figure class="star"><figure class="star-top"></figure><figure class="star-bottom"></figure></figure>';
   return d.firstChild;
 },
};
loop.start();