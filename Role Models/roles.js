// roles.js
// Displays a random role model from rolemodels.txt in the .role-model class

async function loadRoleModel() {
    try {
        // Check if a role model is already locked in localStorage
        let lockedRoleModel = localStorage.getItem('lockedRoleModel');
        let today = new Date();
        let shouldPickNew = false;
        if (!lockedRoleModel) {
            shouldPickNew = true;
        } else if (today.getMonth() === 2 && today.getDate() === 13) {
            shouldPickNew = true;
        }
        if (shouldPickNew) {
            const response = await fetch('./Role Models/rolemodels.txt');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const text = await response.text();
            const roleModels = text.split('\n').filter(line => line.trim() !== '');
            lockedRoleModel = roleModels[Math.floor(Math.random() * roleModels.length)];
            localStorage.setItem('lockedRoleModel', lockedRoleModel);
        }
        document.querySelector('.role-model').textContent = lockedRoleModel;
    } catch (error) {
        console.error('Error fetching role model:', error);
        document.querySelector('.role-model').textContent = 'Could not load role model. Please try again later.';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRoleModel);
} else {
    loadRoleModel();
}
