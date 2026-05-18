// This script sets a random two-color gradient as the background on each page load
(function() {
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

    // Always use the locked colors for the background
    const gradient = `linear-gradient(135deg, ${color1}, ${color2})`;
    document.body.style.background = gradient;
    // Set the same gradient for the .name class
    document.documentElement.style.setProperty('--name-gradient', gradient);

    // Only allow changing the gradient on March 13th
    if (today.getMonth() === 2 && today.getDate() === 13) {
        window.setRandomGradient = function() {
            const c1 = getRandomColor();
            const c2 = getRandomColor();
            localStorage.setItem('lockedGradientColor1', c1);
            localStorage.setItem('lockedGradientColor2', c2);
            document.body.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
        };
    } else {
        window.setRandomGradient = function() {};
    }
})();
