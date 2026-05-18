async function loadFortune() {
    try {
        let lockedAdvice = localStorage.getItem('lockedAdvice');
        let today = new Date();
        let shouldPickNew = false;
        if (!lockedAdvice) {
            shouldPickNew = true;
        } else if (today.getMonth() === 2 && today.getDate() === 13) {
            shouldPickNew = true;
        }
        if (shouldPickNew) {
            const response = await fetch('life advice/lifeadvice.txt');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const adviceText = await response.text();
            const adviceList = adviceText.split('\n').filter(line => line.trim() !== '');
            lockedAdvice = adviceList[Math.floor(Math.random() * adviceList.length)];
            localStorage.setItem('lockedAdvice', lockedAdvice);
        }
        document.querySelector('.lifeadvice').textContent = lockedAdvice;
    } catch (error) {
        console.error('Error fetching fortune:', error);
        document.querySelector('.lifeadvice').textContent = 'Could not load life advice. Please try again later.';
    }
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFortune);
} else {
    loadFortune();
}