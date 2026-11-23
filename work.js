/* Portfolio filter. Without this script every project card stays visible and
   the filter buttons stay hidden, so nothing depends on it. */
(function () {
    var bar = document.querySelector('.work-filters');
    var grid = document.getElementById('workGrid');
    if (!bar || !grid) return;
    var buttons = bar.querySelectorAll('.filter');
    var cards = grid.querySelectorAll('.card');
    bar.hidden = false;
    bar.addEventListener('click', function (e) {
        var btn = e.target.closest('.filter');
        if (!btn) return;
        var f = btn.getAttribute('data-f');
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        cards.forEach(function (c) { c.hidden = f !== 'all' && c.getAttribute('data-cat') !== f; });
    });
})();
