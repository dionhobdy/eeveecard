// roles.js
// Displays a random role model from rolemodels.txt with Wikipedia photo,
// Wikidata structured bio info, and signature image.

function formatWikiDate(timeStr) {
    // handles "1913-02-04T00:00:00Z" (SPARQL) or "+1913-02-04T00:00:00Z" (Wikidata API)
    const match = (timeStr || '').match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return '';
    const months = ['January','February','March','April','May','June','July',
                    'August','September','October','November','December'];
    const month = parseInt(match[2], 10);
    const day   = parseInt(match[3], 10);
    const year  = match[1];
    return month > 0 ? months[month - 1] + ' ' + day + ', ' + year : year;
}

async function fetchWikidataInfo(wikidataId) {
    try {
        // Single SPARQL call — labels resolved server-side, no second round-trip needed
        const sparql = [
            'SELECT ?birthDate ?birthPlaceLabel ?deathDate ?deathPlaceLabel ?occupationLabel ?sig WHERE {',
            'BIND(wd:' + wikidataId + ' AS ?person)',
            'OPTIONAL { ?person wdt:P569 ?birthDate. }',
            'OPTIONAL { ?person wdt:P19 ?birthPlace. }',
            'OPTIONAL { ?person wdt:P570 ?deathDate. }',
            'OPTIONAL { ?person wdt:P20 ?deathPlace. }',
            'OPTIONAL { ?person wdt:P106 ?occupation. }',
            'OPTIONAL { ?person wdt:P109 ?sig. }',
            'SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }',
            '} LIMIT 10'
        ].join(' ');

        const resp = await fetch(
            'https://query.wikidata.org/sparql?query=' + encodeURIComponent(sparql) + '&format=json'
        );
        if (!resp.ok) return null;
        const data = await resp.json();
        const rows = (data.results && data.results.bindings) || [];
        if (rows.length === 0) return null;

        function val(row, key) { return row[key] ? row[key].value : null; }

        const r0 = rows[0];
        const info = {};

        if (val(r0, 'birthDate')) {
            const d = formatWikiDate(val(r0, 'birthDate'));
            const place = val(r0, 'birthPlaceLabel');
            info.born = d + (place ? ', ' + place : '');
        }
        if (val(r0, 'deathDate')) {
            const d = formatWikiDate(val(r0, 'deathDate'));
            const place = val(r0, 'deathPlaceLabel');
            info.died = d + (place ? ', ' + place : '');
        }

        var occs = [];
        rows.forEach(function(row) {
            var o = val(row, 'occupationLabel');
            if (o && occs.indexOf(o) < 0) occs.push(o);
        });

        if (occs.length > 0) info.occupation = occs.join(', ');
        if (val(r0, 'sig')) {
            const sigFilename = val(r0, 'sig');
            // Fetch direct image URL from Commons API to avoid redirect issues
            try {
                const commonsResp = await fetch(
                    'https://commons.wikimedia.org/w/api.php?action=query&titles=File:' +
                    encodeURIComponent(sigFilename) +
                    '&prop=imageinfo&iiprop=url&format=json&origin=*'
                );
                if (commonsResp.ok) {
                    const commonsData = await commonsResp.json();
                    const pages = commonsData.query && commonsData.query.pages;
                    if (pages) {
                        const page = Object.values(pages)[0];
                        const imgUrl = page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url;
                        if (imgUrl) info.signature = imgUrl;
                    }
                }
            } catch (_) {
                info.signature = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(sigFilename);
            }
        }

        return Object.keys(info).length > 0 ? info : null;
    } catch (err) {
        console.warn('Wikidata SPARQL fetch failed:', err);
        return null;
    }
}

function renderRoleModelInfo(info) {
    const container = document.querySelector('.role-model-info');
    if (!container || !info) return;

    const rows = [
        { label: 'Born',       value: info.born },
        { label: 'Died',       value: info.died },
        { label: 'Occupation', value: info.occupation },
    ].filter(function(r) { return r.value; });

    container.innerHTML = rows.map(function(r) {
        return '<div class="role-model-info-row">' +
               '<span class="role-model-info-label">' + r.label + '</span>' +
               '<span>' + r.value + '</span>' +
               '</div>';
    }).join('');

    const sigImg = document.querySelector('.role-model-signature');
    const sigName = document.querySelector('.role-model-signature-name');
    if (info.signature) {
        if (sigImg) { sigImg.src = info.signature; sigImg.style.display = ''; }
        if (sigName) sigName.style.display = 'none';
    } else {
        if (sigImg) sigImg.style.display = 'none';
        if (sigName) sigName.style.display = '';
    }
}

async function loadRoleModel() {
    try {
        let lockedRoleModel     = localStorage.getItem('lockedRoleModel');
        let lockedRoleModelImg  = localStorage.getItem('lockedRoleModelImg');
        let lockedRoleModelInfo = localStorage.getItem('lockedRoleModelInfo');
        const today = new Date();
        const shouldPickNew = !lockedRoleModel || (today.getMonth() === 2 && today.getDate() === 13);

        if (shouldPickNew) {
            const response = await fetch('./Role Models/rolemodels.txt');
            if (!response.ok) throw new Error('Network response was not ok');
            const text = await response.text();
            const roleModels = text.split('\n').filter(function(line) { return line.trim() !== ''; });
            lockedRoleModel = roleModels[Math.floor(Math.random() * roleModels.length)];
            localStorage.setItem('lockedRoleModel', lockedRoleModel);
            lockedRoleModelImg   = null;
            lockedRoleModelInfo  = null;
            lockedRoleModelQuote = null;
        }

        let wikidataId = null;

        // Fetch photo if not yet cached
        if (lockedRoleModelImg === null) {
            try {
                const wikiResp = await fetch(
                    'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(lockedRoleModel.trim())
                );
                if (wikiResp.ok) {
                    const wikiData = await wikiResp.json();
                    lockedRoleModelImg = (wikiData.thumbnail && wikiData.thumbnail.source)
                        ? wikiData.thumbnail.source : '';
                    wikidataId = wikiData.wikibase_item || null;
                } else {
                    lockedRoleModelImg = '';
                }
            } catch (_) { lockedRoleModelImg = ''; }
            localStorage.setItem('lockedRoleModelImg', lockedRoleModelImg);
        }

        // Fetch bio info if not yet successfully cached
        // Use !lockedRoleModelInfo (catches null AND '') so a previous empty result is retried
        if (!lockedRoleModelInfo) {
            if (!wikidataId) {
                try {
                    const wikiResp = await fetch(
                        'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(lockedRoleModel.trim())
                    );
                    if (wikiResp.ok) {
                        const wikiData = await wikiResp.json();
                        wikidataId = wikiData.wikibase_item || null;
                    }
                } catch (_) {}
            }
            if (wikidataId) {
                const info = await fetchWikidataInfo(wikidataId);
                lockedRoleModelInfo = info ? JSON.stringify(info) : '';
                if (lockedRoleModelInfo) {
                    localStorage.setItem('lockedRoleModelInfo', lockedRoleModelInfo);
                }
                // If still empty, don't persist — so it retries next load
            }
        }

        // --- Render ---

        const img = document.querySelector('.role-model-img');
        if (img) {
            if (lockedRoleModelImg) {
                img.src  = lockedRoleModelImg;
                img.alt  = lockedRoleModel;
                img.style.display = '';
            } else {
                img.style.display = 'none';
            }
        }

        // Populate name fallback (used if no signature image)
        const sigName = document.querySelector('.role-model-signature-name');
        if (sigName && lockedRoleModel) {
            sigName.textContent = lockedRoleModel.trim();
        }

        if (lockedRoleModelInfo) {
            try { renderRoleModelInfo(JSON.parse(lockedRoleModelInfo)); } catch (_) {}
        }

    } catch (error) {
        console.error('Error fetching role model:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRoleModel);
} else {
    loadRoleModel();
}
