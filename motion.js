/* Brings each block in as it reaches the viewport. What is hidden, and from
   which direction, is decided in the stylesheet — this file only stamps the
   stagger and adds .in at the right moment, and clears the safety timer that
   would otherwise reveal everything on its own. */
(function () {
    var root = document.documentElement;
    if (!root.classList.contains('motion-ready')) return;
    if (!('IntersectionObserver' in window)) {
        root.classList.remove('motion-ready');
        return;
    }
    clearTimeout(window.__motionFallback);

    var groups = [
        ['.hero .eyebrow', '.hero h1', '.hero-aside p', '.hero-actions'],
        ['.strip li'],
        ['.service'],
        ['.step'],
        ['.contact h2', '.contact-lead', '.contact-actions'],
        ['.section-head'],
        ['.project']
    ];
    var watched = [];

    groups.forEach(function (selectors) {
        var step = 0;
        selectors.forEach(function (sel) {
            Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
                if (step) el.style.setProperty('--d', (step * 0.08).toFixed(2) + 's');
                watched.push(el);
                step++;
            });
        });
    });

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            io.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

    watched.forEach(function (el) { io.observe(el); });

    /* Last line of defence: whatever has not been reached by then is shown
       anyway, so no reader can end up facing a blank stretch of page. */
    setTimeout(function () {
        watched.forEach(function (el) { el.classList.add('in'); });
        io.disconnect();
    }, 10000);
})();
