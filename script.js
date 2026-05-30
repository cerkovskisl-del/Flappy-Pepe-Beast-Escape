const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- SPĒLES PROGRESA DATI ---
let points = parseInt(localStorage.getItem("pepePoints")) || 0;
let beastSubs = parseInt(localStorage.getItem("beastSubs")) || 491000000;
const maxBeastSubs = 491000000;

let upgradeLecLimenis = parseInt(localStorage.getItem("upLecLimenis")) || 1;
let upgradeVartiLimenis = parseInt(localStorage.getItem("upVartiLimenis")) || 1;
let upgradePasivsLimenis = parseInt(localStorage.getItem("upPasivsLimenis")) || 0;
let upgradeDmgSecLimenis = parseInt(localStorage.getItem("upDmgSecLimenis")) || 0; // Jaunais līmenis

// --- UZLABOJUMU FUNKCIJAS ---
function gūtPunktusParLecienu() { return upgradeLecLimenis; }
function gūtDamageParVartiem() { return upgradeVartiLimenis * 5 - 4; } 
function gūtPasivoZeltu() { return upgradePasivsLimenis * 2; } 
function gūtPasivoDamage() { return upgradeDmgSecLimenis * 15; } // Katrs līmenis atņem 15 subs sekundē

function cenasLec() { return upgradeLecLimenis * 50; }
function cenasVarti() { return upgradeVartiLimenis * 150; }
function cenasPasivs() { return (upgradePasivsLimenis + 1) * 100; }
function cenasDmgSec() { return (upgradeDmgSecLimenis + 1) * 200; } // Jaunā cena

// --- BILŽU IELĀDE ---
const imgIet = new Image(); imgIet.src = 'pepe_iet.png';
const imgLec = new Image(); imgLec.src = 'pepe_lec.png';
const imgKrit = new Image(); imgKrit.src = 'pepe_krit.png';
const imgBeast = new Image(); imgBeast.src = 'mrbeast_seja.png';

// Pepe fizika
const pepe = {
    x: 80,
    y: 250,
    radius: 20,
    velocity: 0,
    gravity: 0.38,
    jump: -6.8
};

// Vārti
let pipes = [];
const pipeWidth = 68;
const pipeGap = 160; 
const pipeSpeed = 3;
let pipeTimer = 0;

// DOM elementi
const goldCountEl = document.getElementById("gold-count");
const btnLec = document.getElementById("btn-upgrade-lec");
const btnVarti = document.getElementById("btn-upgrade-varti");
const btnPasivs = document.getElementById("btn-upgrade-pasivs");
const btnDmgSec = document.getElementById("btn-upgrade-dmg-sec");

const statGold = document.getElementById("stat-gold");
const statDmg = document.getElementById("stat-dmg");
const statPasivs = document.getElementById("stat-pasivs");
const statDmgSec = document.getElementById("stat-dmg-sec");

// Vadība
canvas.addEventListener("click", () => PepeLec());
window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault(); 
        PepeLec();
    }
});

// Veikala uzlabojumu pogas
btnLec.addEventListener("click", () => {
    let cena = cenasLec();
    if (points >= cena) { points -= cena; upgradeLecLimenis++; saglabatDatus(); atjaunotVeikaluUI(); }
});

btnVarti.addEventListener("click", () => {
    let cena = cenasVarti();
    if (points >= cena) { points -= cena; upgradeVartiLimenis++; saglabatDatus(); atjaunotVeikaluUI(); }
});

btnPasivs.addEventListener("click", () => {
    let cena = cenasPasivs();
    if (points >= cena) { points -= cena; upgradePasivsLimenis++; saglabatDatus(); atjaunotVeikaluUI(); }
});

btnDmgSec.addEventListener("click", () => {
    let cena = cenasDmgSec();
    if (points >= cena) { points -= cena; upgradeDmgSecLimenis++; saglabatDatus(); atjaunotVeikaluUI(); }
});

function PepeLec() {
    pepe.velocity = pepe.jump;
    points += gūtPunktusParLecienu();
    saglabatDatus();
    atjaunotVeikaluUI();
}

// --- PASĪVAIS TAIMERIS (Zelts un Damage ik pēc 1 sekundes) ---
setInterval(() => {
    if (beastSubs > 0) {
        // 1. Pieskaita pasīvo zeltu
        points += gūtPasivoZeltu();

        // 2. Atņem pasīvos subus MrBeastam
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
}

function atjaunotVeikaluUI() {
    goldCountEl.innerText = formatSkaitlis(points);
    
    // Leciena poga
    let cLec = cenasLec();
    btnLec.innerHTML = `Uzlabot (Lvl ${upgradeLecLimenis})<br>Cena: ${cLec}`;
    btnLec.className = points >= cLec ? "shop-btn active-lec" : "shop-btn";

    // Vārtu poga
    let cVarti = cenasVarti();
    btnVarti.innerHTML = `Uzlabot (Lvl ${upgradeVartiLimenis})<br>Cena: ${cVarti}`;
    btnVarti.className = points >= cVarti ? "shop-btn active-varti" : "shop-btn";

    // Pasīvā zelta poga
    let cPasivs = cenasPasivs();
    btnPasivs.innerHTML = `Uzlabot (Lvl ${upgradePasivsLimenis})<br>Cena: ${cPasivs}`;
    btnPasivs.className = points >= cPasivs ? "shop-btn active-pasivs" : "shop-btn";

    // Pasīvā damage poga
    let cDmgSec = cenasDmgSec();
    btnDmgSec.innerHTML = `Uzlabot (Lvl ${upgradeDmgSecLimenis})<br>Cena: ${cDmgSec}`;
    btnDmgSec.className = points >= cDmgSec ? "shop-btn active-dmg-sec" : "shop-btn";

    statGold.innerText = gūtPunktusParLecienu();
    statDmg.innerText = formatSkaitlis(gūtDamageParVartiem());
    statPasivs.innerText = gūtPasivoZeltu();
    statDmgSec.innerText = formatSkaitlis(gūtPasivoDamage());
}

function createPipe() {
    let minHeight = 60;
    let maxHeight = canvas.height - pipeGap - 120; 
    let topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    pipes.push({ x: canvas.width, top: topHeight, bottom: canvas.height - (topHeight + pipeGap), passed: false });
}

function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

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

        // Kļūdas sadursme: Sods (MrBeast saņem atpakaļ subs)
        if (pepe.x + pepe.radius - 5 > pipes[i].x && pepe.x - pepe.radius + 5 < pipes[i].x + pipeWidth) {
            if (pepe.y - pepe.radius + 5 < pipes[i].top || pepe.y + pepe.radius - 5 > canvas.height - pipes[i].bottom) {
                
                if (!pipes[i].passed) {
                    beastSubs += gūtDamageParVartiem();
                    if (beastSubs > maxBeastSubs) beastSubs = maxBeastSubs; 
                    pipes[i].passed = true; 
                }
                pipes[i].x = -100; 
                saglabatDatus();
                atjaunotVeikaluUI();
            }
        }

        // Veiksmīga iziešana cauri vārtiem
        if (!pipes[i].passed && pipes[i].x + pipeWidth < pepe.x) {
            beastSubs -= gūtDamageParVartiem();
            if (beastSubs < 0) beastSubs = 0;
            pipes[i].passed = true;
            saglabatDatus();
            atjaunotVeikaluUI();
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

function formatSkaitlis(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function loop() {
    drawBackground();

    pepe.velocity += pepe.gravity; pepe.y += pepe.velocity;

    if (pepe.y + pepe.radius >= canvas.height) {
        pepe.y = canvas.height - pepe.radius; pepe.velocity = pepe.jump;
    }
    if (pepe.y - pepe.radius <= 0) {
        pepe.y = pepe.radius; pepe.velocity = 0;
    }

    pipeTimer++;
    if (pipeTimer >= 95) { createPipe(); pipeTimer = 0; }

    drawPipes();
    drawMrBeastBoss();
    drawPepe(pepe.x, pepe.y);

    if (beastSubs <= 0) {
        Uzvara();
    } else {
        requestAnimationFrame(loop);
    }
}

function Uzvara() {
    ctx.fillStyle = "rgba(0,0,0,0.85)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#4caf50"; ctx.font = "bold 32px Arial"; ctx.textAlign = "center";
    ctx.fillText("PEPE UZVARĒJA!", canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = "#fff"; ctx.font = "16px Arial";
    ctx.fillText("MrBeast zaudēja visus sekotājus!", canvas.width / 2, canvas.height / 2 + 35);
}

atjaunotVeikaluUI();
loop();
