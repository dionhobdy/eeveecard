// scripts/download.js
// Downloads the card div as a PNG when download-icon is clicked

// You need html2canvas for this to work
// Add <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script> in your HTML

document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.querySelector('.download-icon');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            html2canvas(document.body, {
                useCORS: true,
                windowWidth: document.documentElement.scrollWidth,
                windowHeight: document.documentElement.scrollHeight
            }).then(canvas => {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                // Add a timestamp to the filename
                const now = new Date();
                const timestamp = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + '_' + String(now.getHours()).padStart(2, '0') + '-' + String(now.getMinutes()).padStart(2, '0') + '-' + String(now.getSeconds()).padStart(2, '0');
                link.download = `birthday-card-${timestamp}.png`;
                link.click();
            });
        });
    }
});
