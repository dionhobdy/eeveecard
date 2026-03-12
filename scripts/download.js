// scripts/download.js
// Downloads the card div as a PNG when download-icon is clicked

// You need html2canvas for this to work
// Add <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script> in your HTML

document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.querySelector('.download-icon');
    const card = document.querySelector('.card');
    if (downloadBtn && card) {
        downloadBtn.addEventListener('click', () => {
            html2canvas(card).then(canvas => {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = 'birthday-card.png';
                link.click();
            });
        });
    }
});
