(function () {
    const card = document.querySelector('.card');
    const parts = Array.from(document.querySelectorAll('.card-part'));
    const dots = Array.from(document.querySelectorAll('.dot'));
    const prevBtn = document.querySelector('.nav-arrow.prev');
    const nextBtn = document.querySelector('.nav-arrow.next');

    if (!card || parts.length === 0) {
        return;
    }

    let index = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 40;

    function updateView() {
        parts.forEach(function (part, i) {
            part.classList.toggle('active', i === index);
        });

        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === index);
        });

        if (prevBtn) {
            prevBtn.disabled = index === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = index === parts.length - 1;
        }

        window.dispatchEvent(new CustomEvent('cardpartchange', {
            detail: {
                index: index,
                part: index + 1
            }
        }));
    }

    function goTo(newIndex) {
        if (newIndex < 0 || newIndex >= parts.length) {
            return;
        }

        if (newIndex === index) {
            return;
        }

        index = newIndex;
        updateView();

        if (typeof window.transitionToRandomGradient === 'function') {
            window.transitionToRandomGradient();
        }
    }

    function goNext() {
        goTo(index + 1);
    }

    function goPrev() {
        goTo(index - 1);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', goNext);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', goPrev);
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowRight') {
            goNext();
        }

        if (event.key === 'ArrowLeft') {
            goPrev();
        }
    });

    card.addEventListener('touchstart', function (event) {
        touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    card.addEventListener('touchend', function (event) {
        touchEndX = event.changedTouches[0].screenX;
        const delta = touchEndX - touchStartX;

        if (Math.abs(delta) < swipeThreshold) {
            return;
        }

        if (delta < 0) {
            goNext();
        } else {
            goPrev();
        }
    }, { passive: true });

    updateView();
})();
