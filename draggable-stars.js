(function(){
  function initDraggableStars(){
    var stars = document.querySelectorAll('.star');
    if(!stars.length) return;

    var dragging = null;
    var offsetX = 0, offsetY = 0;

    function getPoint(e){
      if(e.touches && e.touches.length) return {x: e.touches[0].clientX, y: e.touches[0].clientY};
      return {x: e.clientX, y: e.clientY};
    }

    function onDown(e, star){
      dragging = star;
      var rect = star.getBoundingClientRect();
      var pt = getPoint(e);
      offsetX = pt.x - rect.left;
      offsetY = pt.y - rect.top;

      star.style.animation = 'none';
      star.style.transition = 'none';
      star.style.transform = 'none';
      star.style.zIndex = 10000;
      star.style.position = 'fixed';
      star.style.left = rect.left + 'px';
      star.style.top = rect.top + 'px';
      star.style.cursor = 'grabbing';
      e.preventDefault();
    }

    function onMove(e){
      if(!dragging) return;
      var pt = getPoint(e);
      var newLeft = pt.x - offsetX;
      var newTop = pt.y - offsetY;
      dragging.style.left = newLeft + 'px';
      dragging.style.top = newTop + 'px';

      var dRect = dragging.getBoundingClientRect();
      var dCenterX = dRect.left + dRect.width / 2;
      var dCenterY = dRect.top + dRect.height / 2;

      stars.forEach(function(other){
        if(other === dragging) return;
        if(other.dataset.bouncing === 'true') return;
        var oRect = other.getBoundingClientRect();
        var oCenterX = oRect.left + oRect.width / 2;
        var oCenterY = oRect.top + oRect.height / 2;
        var dx = oCenterX - dCenterX;
        var dy = oCenterY - dCenterY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var minDist = (dRect.width + oRect.width) / 2;
        if(dist < minDist){
          bounceStar(other, dx, dy, dist || 1);
        }
      });

      e.preventDefault();
    }

    function bounceStar(star, dx, dy, dist){
      star.dataset.bouncing = 'true';
      var angle = Math.atan2(dy, dist === 0 ? 0.001 : dx);
      var force = 90 + Math.random() * 40;
      var bx = Math.cos(angle) * force;
      var by = Math.sin(angle) * force;
      var savedAnimation = star.dataset.savedAnimation || star.style.animation || 'twinkle 3.4s ease-in-out infinite';

      star.style.animation = 'none';
      star.style.transition = 'transform 0.35s cubic-bezier(.25,.8,.35,1)';
      star.style.transform = 'translate(' + bx + 'px, ' + by + 'px) scale(1.15)';

      setTimeout(function(){
        star.style.transition = 'transform 0.55s ease';
        star.style.transform = 'translate(0px, 0px) scale(1)';
        setTimeout(function(){
          star.style.transition = '';
          star.style.transform = '';
          star.style.animation = savedAnimation;
          star.dataset.bouncing = 'false';
        }, 560);
      }, 350);
    }

    function onUp(){
      if(!dragging) return;
      dragging.style.cursor = 'grab';
      dragging.style.zIndex = '';
      dragging = null;
    }

    stars.forEach(function(star){
      star.dataset.savedAnimation = star.style.animation;
      star.addEventListener('mousedown', function(e){ onDown(e, star); });
      star.addEventListener('touchstart', function(e){ onDown(e, star); }, { passive: false });
    });

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
  }

  function waitForStars(attempts){
    var stars = document.querySelectorAll('.star');
    if(stars.length){
      initDraggableStars();
    } else if(attempts < 40){
      setTimeout(function(){ waitForStars(attempts + 1); }, 100);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ waitForStars(0); });
  } else {
    waitForStars(0);
  }
})();
