document.addEventListener('DOMContentLoaded', () => {

    // --- DATABASE SUPPORT CARD (Sederhana) ---
    // Di aplikasi nyata, ini bisa jadi sangat besar.
    // Format: { nama, tipe, trainingEffect, friendshipBonus, statBonus: {stat: nilai} }
    const supportCardsDB = {
        "none": { name: "Kosong", type: "None", trainingEffect: 0, friendshipBonus: 0, statBonus: {} },
        "kitasan_black_ssr": { name: "Kitasan Black (SSR)", type: "Speed", trainingEffect: 0.15, friendshipBonus: 0.35, statBonus: { speed: 1 } },
        "super_creek_ssr": { name: "Super Creek (SSR)", type: "Stamina", trainingEffect: 0.15, friendshipBonus: 0.25, statBonus: { stamina: 1 } },
        "fine_motion_ssr": { name: "Fine Motion (SSR)", type: "Int", trainingEffect: 0.10, friendshipBonus: 0.20, statBonus: { guts: 1, int: 1 } },
        "tazuna_ssr": { name: "Tazuna (SSR)", type: "Friend", trainingEffect: 0.10, friendshipBonus: 0, statBonus: {} }
    };

    // --- DATA DASAR GAME ---
    // Kenaikan stat dasar per latihan (asumsi kondisi Normal)
    const baseGains = {
        speed: { speed: 8, power: 4, skill: 2 },
        stamina: { stamina: 8, guts: 4, skill: 2 },
        power: { power: 8, stamina: 4, skill: 2 },
        guts: { guts: 8, speed: 4, power: 4, skill: 2 },
        int: { int: 8, speed: 2, skill: 4 }
    };
    // Bonus per level fasilitas
    const facilityBonus = {
        speed: 1, stamina: 1, power: 1, guts: 1, int: 1
    };

    const trainingTypes = ['speed', 'stamina', 'power', 'guts', 'int'];

    // --- FUNGSI UNTUK MEMBUAT INTERFACE ---
    function createTrainingOptions() {
        const container = document.getElementById('training-options');
        container.innerHTML = ''; // Kosongkan dulu
        
        trainingTypes.forEach(type => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'training-option';
            optionDiv.id = `option-${type}`;

            let selectorsHTML = `<h3>Latihan ${type.charAt(0).toUpperCase() + type.slice(1)}</h3>`;
            // Buat 5 slot kartu untuk setiap latihan
            for (let i = 1; i <= 5; i++) {
                selectorsHTML += `
                    <div class="card-selector">
                        <label for="${type}-card-${i}">Kartu ${i}</label>
                        <select id="${type}-card-${i}">
                            ${Object.keys(supportCardsDB).map(key => 
                                `<option value="${key}">${supportCardsDB[key].name}</option>`
                            ).join('')}
                        </select>
                    </div>
                `;
            }
            optionDiv.innerHTML = selectorsHTML;
            container.appendChild(optionDiv);
        });
    }
    
    // --- FUNGSI KALKULASI UTAMA ---
    function calculateTraining() {
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = '';
        let allResults = [];

        trainingTypes.forEach(type => {
            const facilityLevel = parseInt(document.getElementById(`${type}-facility`).value) || 1;
            
            let totalGains = { speed: 0, stamina: 0, power: 0, guts: 0, int: 0, skill: 0 };

            // 1. Hitung gain dasar + bonus fasilitas
            for (const stat in baseGains[type]) {
                const base = baseGains[type][stat] || 0;
                const bonus = facilityBonus[stat] * (facilityLevel - 1);
                totalGains[stat] = (totalGains[stat] || 0) + base + bonus;
            }

            // 2. Hitung bonus dari setiap Support Card yang hadir
            for (let i = 1; i <= 5; i++) {
                const selectedCardKey = document.getElementById(`${type}-card-${i}`).value;
                if (selectedCardKey !== 'none') {
                    const card = supportCardsDB[selectedCardKey];
                    
                    // Logika sederhana: Asumsikan semua kartu memberi bonus Training Effect
                    for (const stat in totalGains) {
                        if (stat !== 'skill') {
                           totalGains[stat] += (baseGains[type][stat] || 0) * card.trainingEffect;
                        }
                    }
                    
                    // Bonus jika tipe kartu sama dengan tipe latihan (Specialty Bonus)
                    if (card.type.toLowerCase() === type) {
                         for (const stat in totalGains) {
                            if (stat !== 'skill') {
                               totalGains[stat] += 2; // Bonus flat sederhana
                            }
                        }
                    }
                }
            }
            
            // Bulatkan hasil
            for (const stat in totalGains) {
                totalGains[stat] = Math.round(totalGains[stat]);
            }

            allResults.push({ type, gains: totalGains });
        });

        // Tentukan latihan terbaik (berdasarkan jumlah total stat non-skill)
        let bestType = '';
        let maxTotalGain = -1;

        allResults.forEach(result => {
            const total = result.gains.speed + result.gains.stamina + result.gains.power + result.gains.guts + result.gains.int;
            if (total > maxTotalGain) {
                maxTotalGain = total;
                bestType = result.type;
            }
        });

        // Tampilkan hasil
        allResults.forEach(result => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result-item';
            if (result.type === bestType) {
                resultDiv.classList.add('best');
            }

            let gainsText = Object.entries(result.gains)
                                 .filter(([_, value]) => value > 0)
                                 .map(([stat, value]) => `<span class="stat-gain">${stat.toUpperCase()}: +${value}</span>`)
                                 .join(' | ');

            resultDiv.innerHTML = `
                <h3>Latihan ${result.type.charAt(0).toUpperCase() + result.type.slice(1)}</h3>
                <p>${gainsText}</p>
            `;
            resultsContainer.appendChild(resultDiv);
        });
    }

    // --- INISIALISASI ---
    createTrainingOptions();
    document.getElementById('calculate-btn').addEventListener('click', calculateTraining);
});