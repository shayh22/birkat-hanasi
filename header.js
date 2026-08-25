/* Tells the sticky header when it has left the top of the page, so it can
   tighten and cast a shadow over the content passing beneath it. Runs for
   every reader — the header sticks with or without this; only the shading
   depends on it. */
(function () {
    var header = document.querySelector('.site-header');
    if (!header || !('IntersectionObserver' in window)) return;

    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;inset-inline-start:0;width:1px;height:1px;pointer-events:none;';
    document.body.insertBefore(sentinel, document.body.firstChild);

    new IntersectionObserver(function (entries) {
        header.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
})();
