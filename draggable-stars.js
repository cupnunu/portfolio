(function(){
  function initDraggableStars(){
    var stars = Array.prototype.slice.call(document.querySelectorAll('.star'));
    if(!stars.length) return;

    var dragging = null;
    var offsetX = 0, offsetY = 0;
    var bubble = null;
    var PHRASES = ['teehee', 'yahoo!', 'oh my!', 'hello!', 'weee', 'woweee'];

    function createBubble(){
      var el = document.createElement('div');
      var phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
      el.textContent = phrase;
      el.style.cssText = [
        'position:fixed', 'z-index:10001', 'pointer-events:none',
        'background:#fff', 'color:#2b2b2b',
        'font-family:\'Space Grotesk\', sans-serif', 'font-weight:600', 'font-size:0.8rem',
        'padding:5px 11px', 'border-radius:14px', 'border:1.5px solid #2b2b2b',
        'box-shadow:2px 2px 0 rgba(0,0,0,0.15)',
        'white-space:nowrap',
        'transform:translate(-50%, -130%) scale(0.5)',
        'opacity:0', 'transition:transform 0.18s cubic-bezier(.34,1.56,.64,1), opacity 0.18s ease'
      ].join(';');
      document.body.appendChild(el);
      requestAnimationFrame(function(){
        el.style.opacity = '1';
        el.style.transform = 'translate(-50%, -130%) scale(1)';
      });
      return el;
    }

    function positionBubble(star){
      if(!bubble) return;
      var rect = star.getBoundingClientRect();
      bubble.style.left = (rect.left + rect.width / 2) + 'px';
      bubble.style.top = rect.top + 'px';
    }

    function removeBubble(){
      if(!bubble) return;
      var el = bubble;
      bubble = null;
      el.style.opacity = '0';
      el.style.transform = 'translate(-50%, -110%) scale(0.6)';
      setTimeout(function(){ el.remove(); }, 180);
    }

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

      bubble = createBubble();
      positionBubble(star);
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
      positionBubble(dragging);

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
      removeBubble();
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