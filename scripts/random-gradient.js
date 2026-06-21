// This script sets a random two-color gradient as the background on each page load
(function() {
    const transitionDurationMs = 900;
    let transitionTimer = null;
    let currentGradientColors = null;
    let currentGradientSpec = null;

    function hexToRgb(hexColor) {
        const normalized = (hexColor || '').replace('#', '').trim();
        const expanded = normalized.length === 3
            ? normalized.split('').map(function (char) { return char + char; }).join('')
            : normalized;

        return {
            r: parseInt(expanded.slice(0, 2), 16) || 0,
            g: parseInt(expanded.slice(2, 4), 16) || 0,
            b: parseInt(expanded.slice(4, 6), 16) || 0
        };
    }

    function srgbToLinear(channel) {
        const value = channel / 255;
        return value <= 0.04045
            ? value / 12.92
            : Math.pow((value + 0.055) / 1.055, 2.4);
    }

    function getRelativeLuminance(rgb) {
        const r = srgbToLinear(rgb.r);
        const g = srgbToLinear(rgb.g);
        const b = srgbToLinear(rgb.b);
        return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
    }

    function applyTextThemeForGradient(c1, c2) {
        const rgb1 = hexToRgb(c1);
        const rgb2 = hexToRgb(c2);
        const avg = {
            r: (rgb1.r + rgb2.r) / 2,
            g: (rgb1.g + rgb2.g) / 2,
            b: (rgb1.b + rgb2.b) / 2
        };
        const isLightGradient = getRelativeLuminance(avg) >= 0.46;

        document.body.style.setProperty('--card-text-color', isLightGradient ? '#111111' : '#ffffff');
        document.body.style.setProperty('--card-text-shadow-color', isLightGradient ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.22)');
        document.body.style.setProperty('--dot-color', isLightGradient ? 'rgba(17, 17, 17, 0.35)' : 'rgba(255, 255, 255, 0.45)');
        document.body.style.setProperty('--dot-active-color', isLightGradient ? 'rgba(17, 17, 17, 0.9)' : 'rgba(255, 255, 255, 0.95)');
    }

    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function getRandomGradientSpec() {
        const type = pickRandom(['linear', 'radial', 'conic']);

        if (type === 'linear') {
            return {
                type: 'linear',
                angle: pickRandom([25, 45, 65, 90, 120, 135, 160, 210, 260, 315])
            };
        }

        if (type === 'radial') {
            return {
                type: 'radial',
                shape: pickRandom(['circle', 'ellipse']),
                position: pickRandom(['top left', 'top right', 'center', 'bottom left', 'bottom right'])
            };
        }

        return {
            type: 'conic',
            angle: pickRandom([0, 45, 90, 135, 180, 225, 270, 315]),
            position: pickRandom(['center', 'top left', 'top right', 'bottom left', 'bottom right'])
        };
    }

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
    let lockedGradientSpec = null;

    try {
        const storedSpec = localStorage.getItem('lockedGradientSpec');
        lockedGradientSpec = storedSpec ? JSON.parse(storedSpec) : null;
    } catch (error) {
        lockedGradientSpec = null;
    }

    var today = new Date();
    // If it's March 13th or no colors/spec are stored, generate and store new ones.
    if ((today.getMonth() === 2 && today.getDate() === 13) || !color1 || !color2 || !lockedGradientSpec) {
        color1 = getRandomColor();
        color2 = getRandomColor();
        lockedGradientSpec = getRandomGradientSpec();
        localStorage.setItem('lockedGradientColor1', color1);
        localStorage.setItem('lockedGradientColor2', color2);
        localStorage.setItem('lockedGradientSpec', JSON.stringify(lockedGradientSpec));
    }

    function buildGradient(c1, c2, spec) {
        if (!spec || !spec.type) {
            return `linear-gradient(135deg, ${c1}, ${c2})`;
        }

        if (spec.type === 'radial') {
            const shape = spec.shape || 'circle';
            const position = spec.position || 'center';
            return `radial-gradient(${shape} at ${position}, ${c1}, ${c2})`;
        }

        if (spec.type === 'conic') {
            const angle = Number.isFinite(spec.angle) ? spec.angle : 180;
            const position = spec.position || 'center';
            return `conic-gradient(from ${angle}deg at ${position}, ${c1}, ${c2}, ${c1})`;
        }

        const angle = Number.isFinite(spec.angle) ? spec.angle : 135;
        return `linear-gradient(${angle}deg, ${c1}, ${c2})`;
    }

    function setBodyGradient(c1, c2, spec) {
        const gradient = buildGradient(c1, c2, spec);
        document.body.style.background = gradient;
        document.documentElement.style.setProperty('--name-gradient', gradient);
        applyTextThemeForGradient(c1, c2);
        currentGradientColors = [c1, c2];
        currentGradientSpec = spec;
    }

    function isSameSpec(specA, specB) {
        return JSON.stringify(specA || {}) === JSON.stringify(specB || {});
    }

    function transitionToGradient(c1, c2, spec) {
        if (
            currentGradientColors &&
            currentGradientColors[0] === c1 &&
            currentGradientColors[1] === c2 &&
            isSameSpec(currentGradientSpec, spec)
        ) {
            return;
        }

        const nextGradient = buildGradient(c1, c2, spec);

        document.body.classList.remove('gradient-transition');
        document.body.style.setProperty('--next-gradient', nextGradient);
        applyTextThemeForGradient(c1, c2);
        void document.body.offsetWidth;

        if (transitionTimer) {
            window.clearTimeout(transitionTimer);
        }

        requestAnimationFrame(function () {
            document.body.classList.add('gradient-transition');
        });

        transitionTimer = window.setTimeout(function () {
            setBodyGradient(c1, c2, spec);
            document.body.classList.remove('gradient-transition');
            transitionTimer = null;
        }, transitionDurationMs);
    }

    // Always use the locked colors for the initial background
    setBodyGradient(color1, color2, lockedGradientSpec);

    // Only allow changing the gradient on March 13th
    if (today.getMonth() === 2 && today.getDate() === 13) {
        window.setRandomGradient = function() {
            const c1 = getRandomColor();
            const c2 = getRandomColor();
            const spec = getRandomGradientSpec();
            localStorage.setItem('lockedGradientColor1', c1);
            localStorage.setItem('lockedGradientColor2', c2);
            localStorage.setItem('lockedGradientSpec', JSON.stringify(spec));
            transitionToGradient(c1, c2, spec);
        };
    } else {
        window.setRandomGradient = function() {};
    }

    // Used by card-navigation.js to animate to new gradients between parts.
    window.transitionToRandomGradient = function () {
        transitionToGradient(getRandomColor(), getRandomColor(), getRandomGradientSpec());
    };
})();
