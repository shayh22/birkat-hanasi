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
    }, { rootMargin: '0px 0px -4% 0px', threshold: 0.05 });

    watched.forEach(function (el) { io.observe(el); });

    /* Landing straight on /#work starts the page mid-document, where the
       observer's first report cannot always be trusted. Measure once
       ourselves at the moments the position can change under us. */
    function revealVisible() {
        var height = window.innerHeight || document.documentElement.clientHeight;
        watched.forEach(function (el) {
            if (el.classList.contains('in')) return;
            var box = el.getBoundingClientRect();
            if (box.top < height && box.bottom > 0) {
                el.classList.add('in');
                io.unobserve(el);
            }
        });
    }
    var queued = false;
    function scheduleReveal() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () {
            queued = false;
            revealVisible();
            if (!watched.some(function (el) { return !el.classList.contains('in'); })) {
                window.removeEventListener('scroll', scheduleReveal);
            }
        });
    }
    revealVisible();
    window.addEventListener('load', scheduleReveal);
    window.addEventListener('hashchange', scheduleReveal);
    window.addEventListener('scroll', scheduleReveal, { passive: true });

    /* Images arriving late move everything below them, so a block can slide
       into view without a scroll ever happening. Watch the document's own
       size for that. */
    if ('ResizeObserver' in window) {
        var ro = new ResizeObserver(scheduleReveal);
        ro.observe(document.body);
    }

    /* Last line of defence: whatever has not been reached by then is shown
       anyway, so no reader can end up facing a blank stretch of page. */
    setTimeout(function () {
        watched.forEach(function (el) { el.classList.add('in'); });
        io.disconnect();
    }, 10000);
})();
