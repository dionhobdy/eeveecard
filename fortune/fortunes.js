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

        // Generate lucky numbers seeded by age (changes only when age changes)
        const luckyEl = document.querySelector('.lucky-numbers');
        if (luckyEl) {
            function seededRand(seed) {
                let s = seed;
                return function() {
                    s = (s * 1664525 + 1013904223) & 0xffffffff;
                    return (s >>> 0) / 4294967296;
                };
            }
            const birthDate = new Date('2016-03-13');
            const now = new Date();
            let age = now.getFullYear() - birthDate.getFullYear();
            const m = now.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
            const rand = seededRand(age * 6271);
            const nums = [];
            while (nums.length < 6) {
                const n = Math.floor(rand() * 49) + 1;
                if (!nums.includes(n)) nums.push(n);
            }
            nums.sort(function(a, b) { return a - b; });
            luckyEl.textContent = nums.join('   ');
        }
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