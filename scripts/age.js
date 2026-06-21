// age.js
// Calculates age based on birthdate and outputs to the written-content div

const birthDate = new Date('2016-03-13');
const today = new Date();

function calculateAge(birth, current) {
    let age = current.getFullYear() - birth.getFullYear();
    const m = current.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && current.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

const age = calculateAge(birthDate, today);

window.addEventListener('DOMContentLoaded', () => {
    const content = document.querySelectorAll('.written-content')[0];
    const birthdayPart = document.querySelector('.card-part[data-part="1"]');
    let confettiTimer = null;

    function clearConfetti() {
        if (confettiTimer) {
            window.clearTimeout(confettiTimer);
            confettiTimer = null;
        }

        if (!birthdayPart) {
            return;
        }

        birthdayPart.classList.remove('confetti-active');
        birthdayPart.querySelectorAll('.confetti-piece').forEach(function (piece) {
            piece.remove();
        });
    }

    function startConfetti() {
        if (!birthdayPart || !birthdayPart.classList.contains('active')) {
            return;
        }

        clearConfetti();

        const durationMs = Math.max(age, 1) * 1000;
        const pieceCount = Math.min(10 + (age * 4), 80);
        const colors = ['#ff5f6d', '#ffc371', '#6ee7b7', '#60a5fa', '#f472b6', '#fde047'];

        for (let i = 0; i < pieceCount; i++) {
            const piece = document.createElement('span');
            const drift = ((i % 7) - 3) * 14;
            const delay = (i % 12) * 0.18;
            const duration = 3.2 + ((i % 5) * 0.45);
            const size = 0.4 + ((i % 4) * 0.12);

            piece.className = 'confetti-piece';
            piece.style.left = `${(i * 13) % 100}%`;
            piece.style.backgroundColor = colors[i % colors.length];
            piece.style.animationDelay = `${delay}s`;
            piece.style.animationDuration = `${duration}s`;
            piece.style.setProperty('--confetti-drift', `${drift}px`);
            piece.style.width = `${size}rem`;
            piece.style.height = `${size * 1.9}rem`;
            piece.style.transform = `translate3d(0, -12vh, 0) rotate(${(i % 9) * 40}deg)`;
            birthdayPart.appendChild(piece);
        }

        birthdayPart.classList.add('confetti-active');
        confettiTimer = window.setTimeout(clearConfetti, durationMs);
    }

    if (content) {
        content.innerHTML = `You're <span class="age">${age}</span> years old now!? It felt like yesterday when I first met you.`;
    }
    // Update second written-content div
    const content2 = document.querySelectorAll('.written-content')[1];
    if (content2) {
        content2.innerHTML = content2.innerHTML.replace(/are /, `are <span class="age">${age}</span> `);
    }

    if (birthdayPart) {
        startConfetti();
        window.addEventListener('cardpartchange', function (event) {
            if (event.detail && event.detail.part === 1) {
                startConfetti();
                return;
            }

            clearConfetti();
        });
    }
});
