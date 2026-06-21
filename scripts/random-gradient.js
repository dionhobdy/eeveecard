// This script sets a random two-color gradient as the background on each page load
(function() {
    const transitionDurationMs = 900;
    let transitionTimer = null;
    let currentGradientColors = null;

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Try to get the locked gradient from localStorage
    let color1 = localStorage.getItem('lockedGradientColor1');
    let color2 = localStorage.getItem('lockedGradientColor2');

    var today = new Date();
    // If it's March 13th or no colors are stored, generate and store new colors
    if ((today.getMonth() === 2 && today.getDate() === 13) || !color1 || !color2) {
        color1 = getRandomColor();
        color2 = getRandomColor();
        localStorage.setItem('lockedGradientColor1', color1);
        localStorage.setItem('lockedGradientColor2', color2);
    }

    function buildGradient(c1, c2) {
        return `linear-gradient(135deg, ${c1}, ${c2})`;
    }

    function setBodyGradient(c1, c2) {
        const gradient = buildGradient(c1, c2);
        document.body.style.background = gradient;
        document.documentElement.style.setProperty('--name-gradient', gradient);
        currentGradientColors = [c1, c2];
    }

    function transitionToGradient(c1, c2) {
        if (currentGradientColors && currentGradientColors[0] === c1 && currentGradientColors[1] === c2) {
            return;
        }

        const nextGradient = buildGradient(c1, c2);

        document.body.classList.remove('gradient-transition');
        document.body.style.setProperty('--next-gradient', nextGradient);
        void document.body.offsetWidth;

        if (transitionTimer) {
            window.clearTimeout(transitionTimer);
        }

        requestAnimationFrame(function () {
            document.body.classList.add('gradient-transition');
        });

        transitionTimer = window.setTimeout(function () {
            setBodyGradient(c1, c2);
            document.body.classList.remove('gradient-transition');
            transitionTimer = null;
        }, transitionDurationMs);
    }

    // Always use the locked colors for the initial background
    setBodyGradient(color1, color2);

    // Only allow changing the gradient on March 13th
    if (today.getMonth() === 2 && today.getDate() === 13) {
        window.setRandomGradient = function() {
            const c1 = getRandomColor();
            const c2 = getRandomColor();
            localStorage.setItem('lockedGradientColor1', c1);
            localStorage.setItem('lockedGradientColor2', c2);
            transitionToGradient(c1, c2);
        };
    } else {
        window.setRandomGradient = function() {};
    }

    // Used by card-navigation.js to animate to new gradients between parts.
    window.transitionToRandomGradient = function () {
        transitionToGradient(getRandomColor(), getRandomColor());
    };
})();
