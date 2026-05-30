const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- VALODU TULKOJUMI ---
const t = {
    lv: {
        controls: 'Spied <span class="key">Spacebar</span> vai klikšķini uz spēles, lai lidotu',
        shopTitle: "VEIKALS (UPGRADES)",
        wallet: "Tavs Zelts:",
        up1Title: "Zelta Multiplikators", up1Desc: "Dod vairāk zelta par katru lecienu.",
        up2Title: "Subu Atņemšana (Damage)", up2Desc: "Noņem vairāk sekotāju par katriem vārtiem.",
        up3Title: "Zelta Raktuves (Pasīvais)", up3Desc: "Automātiski ražo zeltu katru sekundi.",
        up4Title: "Pasīvais Damage (Sekundē)", up4Desc: "Automātiski atņem subus katru sekundi.",
        up5Title: "Auto Jumper", up5Desc: "Automātiski palecina Pepi pirms zemes.",
        upgradeBtn: "Uzlabot", price: "Cena", buy: "PIRKT", owned: "NOPIRKTS AKTĪVS",
        stat1: "Lēciens dod: +", stat2: "Vārti maina: ", stat3: "Pasīvais ienākums: +", stat4: "Pasīvais damage: -",
        jumperActive: "AKTĪVS", jumperNot: "NAV NOPIRKTS", winTitle: "PEPE UZVARĒJA!", winDesc: "MrBeast zaudēja visus sekotājus!"
    },
    en: {
        controls: 'Press <span class="key">Spacebar</span> or click on the game to fly',
        shopTitle: "SHOP (UPGRADES)",
        wallet: "Your Gold:",
        up1Title: "Gold Multiplier", up1Desc: "Gives more gold per single jump.",
        up2Title: "Sub Reduction (Damage)", up2Desc: "Removes more subscribers per gate.",
        up3Title: "Gold Mines (Passive)", up3Desc: "Automatically produces gold every second.",
        up4Title: "Passive Damage (Per Sec)", up4Desc: "Automatically removes subs every second.",
        up5Title: "Auto Jumper", up5Desc: "Automatically makes Pepe jump before hitting ground.",
        upgradeBtn: "Upgrade", price: "Price", buy: "BUY", owned: "BOUGHT ACTIVE",
        stat1: "Jump gives: +", stat2: "Gate changes: ", stat3: "Passive income: +", stat4: "Passive damage: -",
        jumperActive: "ACTIVE", jumperNot: "NOT BOUGHT", winTitle: "PEPE WON!", winDesc: "MrBeast lost all of his subscribers!"
    }
};

// Ielādējam izvēlēto valodu (pēc noklusējuma 'lv')
let currentLang = localStorage.getItem("pepeLang") || "lv";

// --- SPĒLES PROGRESA DATI ---
let points = parseInt(localStorage.getItem("pepePoints")) || 0;
let beastSubs = parseInt(localStorage.getItem("beastSubs")) || 491000000;
const maxBeastSubs = 491000000;

let upgradeLecLimenis = parseInt(localStorage.getItem("upLecLimenis")) || 1;
let upgradeVartiLimenis = parseInt(localStorage.getItem("upVartiLimenis")) || 1;
let upgradePasivsLimenis = parseInt(localStorage.getItem("upPasivsLimenis")) || 0;
let upgradeDmgSecLimenis = parseInt(localStorage.getItem("upDmgSecLimenis")) || 0;
let hasAutoJumper = localStorage.getItem("hasAutoJumper") === "true";

// --- UZLABOJUMU FUNKCIJAS ---
function gūtPunktusParLecienu() { return upgradeLecLimenis * 15; }
function gūtDamageParVartiem() { return Math.floor(Math.pow(upgradeVartiLimenis, 2.5) * 50000); } 
function gūtPasivoZeltu() { return upgradePasivsLimenis * 150; } 
function gūtPasivoDamage() { return upgradeDmgSecLimenis * 350000; } 

// --- VEIKALA CENAS ---
function cenasLec() { return upgradeLecLimenis * 60; }
function cenasVarti() { return upgradeVartiLimenis * 180; }
function cenasPasivs() { return (upgradePasivsLimenis + 1) * 120; }
function cenasDmgSec() { return (upgradeDmgSecLimenis + 1) * 250; }
const cenaJumper = 1000000;

// --- BILŽU IELĀDE ---
const imgIet = new Image(); imgIet.src = 'pepe_iet.png';
const imgLec = new Image(); imgLec.src = 'pepe_lec.png';
const imgKrit = new Image(); imgKrit.src = 'pepe_krit.png';
const imgBeast = new Image(); imgBeast.src = 'mrbeast_seja.png';

const pepe = { x: 80, y: 250, radius: 20, velocity: 0, gravity: 0.38, jump: -6.8 };
let pipes = [];
const pipeWidth = 68; const pipeGap = 160; const pipeSpeed = 3; let pipeTimer = 0;

// DOM elementi
const langSelect = document.getElementById("lang-select");
const btnReset = document.getElementById("btn-reset");
const goldCountEl = document.getElementById("gold-count");
const btnLec = document.getElementById("btn-upgrade-lec");
const btnVarti = document.getElementById("btn-upgrade-varti");
const btnPasivs = document.getElementById("btn-upgrade-pasivs");
const btnDmgSec = document.getElementById("btn-upgrade-dmg-sec");
const btnJumper = document.getElementById("btn-upgrade-jumper");

const statGold = document.getElementById("stat-gold");
const statDmg = document.getElementById("stat-dmg");
const statPasivs = document.getElementById("stat-pasivs");
const statDmgSec = document.getElementById("stat-dmg-sec");
const statJumper = document.getElementById("stat-jumper");

// --- VALODAS UN RESET KONTROLE ---
langSelect.value = currentLang;
langSelect.addEventListener("change", (e) => {
    currentLang = e.target.value;
    localStorage.setItem("pepeLang", currentLang);
    atjaunotVeikaluUI();
});

btnReset.addEventListener("click", () => {
    if (confirm(currentLang === "lv" ? "Vai tiešām vēlies nodzēst visu progresu?" : "Are you sure you want to reset all progress?")) {
        localStorage.clear();
        location.reload();
    }
});

// Vadība
canvas.addEventListener("click", () => PepeLec());
window.addEventListener("keydown", (e) => {
    if (e.code === "Space") { e.preventDefault(); PepeLec(); }
});

// Pogu klikšķi
btnLec.addEventListener("click", () => {
    let cena = cenasLec(); if (points >= cena) { points -= cena; upgradeLecLimenis++; saglabatDatus(); atjaunotVeikaluUI(); }
});
btnVarti.addEventListener("click", () => {
    let cena = cenasVarti(); if (points >= cena) { points -= cena; upgradeVartiLimenis++; saglabatDatus(); atjaunotVeikaluUI(); }
});
btnPasivs.addEventListener("click", () => {
    let cena = cenasPasivs(); if (points >= cena) { points -= cena; upgradePasivsLimenis++; saglabatDatus(); atjaunotVeikaluUI(); }
});
btnDmgSec.addEventListener("click", () => {
    let cena = cenasDmgSec(); if (points >= cena) { points -= cena; upgradeDmgSecLimenis++; saglabatDatus(); atjaunotVeikaluUI(); }
});
btnJumper.addEventListener("click", () => {
    if (!hasAutoJumper && points >= cenaJumper) { points -= cenaJumper; hasAutoJumper = true; saglabatDatus(); atjaunotVeikaluUI(); }
});

function PepeLec() {
    pepe.velocity = pepe.jump;
    points += gūtPunktusParLecienu();
    saglabatDatus();
    atjaunotVeikaluUI();
}

setInterval(() => {
    if (beastSubs > 0) {
        points += gūtPasivoZeltu();
        beastSubs -= gūtPasivoDamage();
        if (beastSubs < 0) beastSubs = 0;
        saglabatDatus();
        atjaunotVeikaluUI();
    }
}, 1000);

function saglabatDatus() {
    localStorage.setItem("pepePoints", points);
    localStorage.setItem("beastSubs", beastSubs);
    localStorage.setItem("upLecLimenis", upgradeLecLimenis);
    localStorage.setItem("upVartiLimenis", upgradeVartiLimenis);
    localStorage.setItem("upPasivsLimenis", upgradePasivsLimenis);
    localStorage.setItem("upDmgSecLimenis", upgradeDmgSecLimenis);
    localStorage.setItem("hasAutoJumper", hasAutoJumper);
}

function atjaunotVeikaluUI() {
    let lang = t[currentLang];

    // Tekstu tulkošana
    document.getElementById("controls-text").innerHTML = lang.controls;
    document.getElementById("shop-title").innerText = lang.shopTitle;
    document.getElementById("wallet-text").innerText = lang.wallet;
    document.getElementById("up1-title").innerText = lang.up1Title; document.getElementById("up1-desc").innerText = lang.up1Desc;
    document.getElementById("up2-title").innerText = lang.up2Title; document.getElementById("up2-desc").innerText = lang.up2Desc;
    document.getElementById("up3-title").innerText = lang.up3Title; document.getElementById("up3-desc").innerText = lang.up3Desc;
    document.getElementById("up4-title").innerText = lang.up4Title; document.getElementById("up4-desc").innerText = lang.up4Desc;
    document.getElementById("up5-title").innerText = lang.up5Title; document.getElementById("up5-desc").innerText = lang.up5Desc;
    
    document.getElementById("stat1-text").innerText = lang.stat1;
    document.getElementById("stat2-text").innerText = lang.stat2;
    document.getElementById("stat3-text").innerText = lang.stat3;
    document.getElementById("stat4-text").innerText = lang.stat4;

    goldCountEl.innerText = formatSkaitlis(points);
    
    // Pogas ar dinamiskajiem tekstiem
    btnLec.innerHTML = `${lang.upgradeBtn} (Lvl ${upgradeLecLimenis})<br>${lang.price}: ${cenasLec()}`;
    btnLec.className = points >= cenasLec() ? "shop-btn active-lec" : "shop-btn";

    btnVarti.innerHTML = `${lang.upgradeBtn} (Lvl ${upgradeVartiLimenis})<br>${lang.price}: ${cenasVarti()}`;
    btnVarti.className = points >= cenasVarti() ? "shop-btn active-varti" : "shop-btn";

    btnPasivs.innerHTML = `${lang.upgradeBtn} (Lvl ${upgradePasivsLimenis})<br>${lang.price}: ${cenasPasivs()}`;
    btnPasivs.className = points >= cenasPasivs() ? "shop-btn active-pasivs" : "shop-btn";

    btnDmgSec.innerHTML = `${lang.upgradeBtn} (Lvl ${upgradeDmgSecLimenis})<br>${lang.price}: ${cenasDmgSec()}`;
    btnDmgSec.className = points >= cenasDmgSec() ? "shop-btn active-dmg-sec" : "shop-btn";

    if (hasAutoJumper) {
        btnJumper.innerHTML = lang.owned; btnJumper.className = "shop-btn owned";
        statJumper.innerText = lang.jumperActive; statJumper.style.color = "#4caf50";
    } else {
        btnJumper.innerHTML = `${lang.buy}<br>${lang.price}: ${formatSkaitlis(cenaJumper)}`;
        btnJumper.className = points >= cenaJumper ? "shop-btn active-jumper" : "shop-btn";
        statJumper.innerText = lang.jumperNot; statJumper.style.color = "#ff4a4a";
    }

    statGold.innerText = gūtPunktusParLecienu();
    statDmg.innerText = formatSkaitlis(gūtDamageParVartiem());
    statPasivs.innerText = gūtPasivoZeltu();
    statDmgSec.innerText = formatSkaitlis(gūtPasivoDamage());
}

function createPipe() {
    let minHeight = 60; let maxHeight = canvas.height - pipeGap - 120; 
    let topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    pipes.push({ x: canvas.width, top: topHeight, bottom: canvas.height - (topHeight + pipeGap), passed: false });
}

function drawBackground() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

function drawPepe(x, y) {
    let currentImage = imgIet;
    if (pepe.velocity < -1) currentImage = imgLec;
    else if (pepe.velocity > 1) currentImage = imgKrit;
    const size = pepe.radius * 2.5; 
    ctx.drawImage(currentImage, x - size / 2, y - size / 2, size, size);
}

function drawPipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;
        ctx.fillStyle = "#e91e63"; ctx.fillRect(pipes[i].x, 0, pipeWidth, pipes[i].top);
        ctx.fillStyle = "#00bcd4"; ctx.fillRect(pipes[i].x, canvas.height - pipes[i].bottom, pipeWidth, pipes[i].bottom);

        if (pepe.x + pepe.radius - 5 > pipes[i].x && pepe.x - pepe.radius + 5 < pipes[i].x + pipeWidth) {
            if (pepe.y - pepe.radius + 5 < pipes[i].top || pepe.y + pepe.radius - 5 > canvas.height - pipes[i].bottom) {
                if (!pipes[i].passed) {
                    beastSubs += gūtDamageParVartiem();
                    if (beastSubs > maxBeastSubs) beastSubs = maxBeastSubs; 
                    pipes[i].passed = true; 
                }
                pipes[i].x = -100; saglabatDatus(); atjaunotVeikaluUI();
            }
        }
        if (!pipes[i].passed && pipes[i].x + pipeWidth < pepe.x) {
            beastSubs -= gūtDamageParVartiem(); if (beastSubs < 0) beastSubs = 0;
            pipes[i].passed = true; saglabatDatus(); atjaunotVeikaluUI();
        }
        if (pipes[i].x + pipeWidth < 0) pipes.splice(i, 1);
    }
}

function drawMrBeastBoss() {
    const bossX = canvas.width - 110; const bossY = 70; const bossSize = 90;
    ctx.drawImage(imgBeast, bossX, bossY, bossSize, bossSize);
    const hpWidth = 140; const hpHeight = 14; const hpX = canvas.width - 160; const hpY = bossY - 25;
    ctx.fillStyle = "#333"; ctx.fillRect(hpX, hpY, hpWidth, hpHeight);
    const subProcents = beastSubs / maxBeastSubs;
    ctx.fillStyle = "#ff1744"; ctx.fillRect(hpX, hpY, hpWidth * subProcents, hpHeight);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.strokeRect(hpX, hpY, hpWidth, hpHeight);
    ctx.fillStyle = "#fff"; ctx.font = "bold 11px Arial"; ctx.textAlign = "center";
    ctx.fillText(formatSkaitlis(beastSubs) + " SUBS", hpX + hpWidth / 2, hpY - 5);
}

function formatSkaitlis(num) { return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "); }

function loop() {
    drawBackground();
    pepe.velocity += pepe.gravity; pepe.y += pepe.velocity;

    if (hasAutoJumper && pepe.y + pepe.radius >= canvas.height - 45 && pepe.velocity > 0) { PepeLec(); }
    if (pepe.y + pepe.radius >= canvas.height) { pepe.y = canvas.height - pepe.radius; pepe.velocity = pepe.jump; }
    if (pepe.y - pepe.radius <= 0) { pepe.y = pepe.radius; pepe.velocity = 0; }

    pipeTimer++; if (pipeTimer >= 95) { createPipe(); pipeTimer = 0; }
    drawPipes(); drawMrBeastBoss(); drawPepe(pepe.x, pepe.y);

    if (beastSubs <= 0) { Uzvara(); } else { requestAnimationFrame(loop); }
}

function Uzvara() {
    let lang = t[currentLang];
    ctx.fillStyle = "rgba(0,0,0,0.85)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#4caf50"; ctx.font = "bold 32px Arial"; ctx.textAlign = "center";
    ctx.fillText(lang.winTitle, canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = "#fff"; ctx.font = "16px Arial";
    ctx.fillText(lang.winDesc, canvas.width / 2, canvas.height / 2 + 35);
}

atjaunotVeikaluUI();
loop();
