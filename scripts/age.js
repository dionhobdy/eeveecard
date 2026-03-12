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
    if (content) {
        content.innerHTML = `You're <span class="age">${age}</span> years old now!? It felt like yesterday when I first met you.`;
    }
    // Update second written-content div
    const content2 = document.querySelectorAll('.written-content')[1];
    if (content2) {
        content2.innerHTML = content2.innerHTML.replace(/are /, `are <span class="age">${age}</span> `);
    }
});
