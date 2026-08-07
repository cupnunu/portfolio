(function(){
  function initDraggableStars(){
    var stars = Array.prototype.slice.call(document.querySelectorAll('.star'));
    if(!stars.length) return;

    var dragging = null;
    var offsetX = 0, offsetY = 0;

    function getPoint(e){
      if(e.touches && e.touches.length) return {x: e.touches[0].clientX, y: e.touches[0].clientY};
      return {x: e.clientX, y: e.clientY};
    }

    function findStarAt(x, y){
      if(document.elementsFromPoint){
        var els = document.elementsFromPoint(x, y);
        for(var i = 0; i < els.length; i++){
          if(els[i].classList && els[i].classList.contains('star')) return els[i];
        }
        return null;
      }
      var el = document.elementFromPoint(x, y);
      return (el && el.classList && el.classList.contains('star')) ? el : null;
    }

    function startDrag(star, pt){
      dragging = star;
      var rect = star.getBoundingClientRect();
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
    }

    function onDown(e){
      var pt = getPoint(e);
      var star = findStarAt(pt.x, pt.y);
      if(!star) return;
      startDrag(star, pt);
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

      star.style.animation = 'none';
      star.style.transition = 'transform 0.35s cubic-bezier(.25,.8,.35,1)';
      star.style.transform = 'translate(' + bx + 'px, ' + by + 'px) scale(1.15)';

      setTimeout(function(){
        star.style.transition = 'transform 0.55s ease';
        star.style.transform = 'translate(0px, 0px) scale(1)';
        setTimeout(function(){
          star.style.transition = '';
          star.style.transform = '';
          star.style.animation = '';
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

    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: false });
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

