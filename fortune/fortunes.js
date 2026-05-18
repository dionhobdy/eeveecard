async function loadFortune() {
    try {
        // Check if a fortune is already locked in localStorage
        let lockedFortune = localStorage.getItem('lockedFortune');
        let today = new Date();
        // Only change the fortune on March 13th or if not set
        let shouldPickNew = false;
        if (!lockedFortune) {
            shouldPickNew = true;
        } else if (today.getMonth() === 2 && today.getDate() === 13) {
            shouldPickNew = true;
        }
        if (shouldPickNew) {
            const response = await fetch('./fortune/fortune.txt');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const fortuneText = await response.text();
            const fortunes = fortuneText.split('\n').filter(line => line.trim() !== '');
            lockedFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
            localStorage.setItem('lockedFortune', lockedFortune);
        }
        document.querySelector('.fortune').textContent = lockedFortune;
    } catch (error) {
        console.error('Error fetching fortune:', error);
        document.querySelector('.fortune').textContent = 'Could not load fortune. Please try again later.';
    }
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFortune);
} else {
    loadFortune();
}