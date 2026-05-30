const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- SPĒLES PROGRESA DATI ---
let points = parseInt(localStorage.getItem("pepePoints")) || 0;
let beastSubs = parseInt(localStorage.getItem("beastSubs")) || 491000000;
const maxBeastSubs = 491000000;

let upgradeLecLimenis = parseInt(localStorage.getItem("upLecLimenis")) || 1;
let upgradeVartiLimenis = parseInt(localStorage.getItem("upVartiLimenis")) || 1;
let upgradePasivsLimenis = parseInt(localStorage.getItem("upPasivsLimenis")) || 0;
let upgradeDmgSecLimenis = parseInt(localStorage.getItem("upDmgSecLimenis")) || 0;
let hasAutoJumper = localStorage.getItem("hasAutoJumper") === "true"; // Jaunais mainīgais (true/false)

// --- UZLABOJUMU FUNKCIJAS ---
function gūtPunktusParLecienu() { return upgradeLecLimenis; }
function gūtDamageParVartiem() { return upgradeVartiLimenis * 5 - 4; } 
function gūtPasivoZeltu() { return upgradePasivsLimenis * 2; } 
function gūtPasivoDamage() { return upgradeDmgSecLimenis * 15; } 

function cenasLec() { return upgradeLecLimenis * 50; }
function cenasVarti() { return upgradeVartiLimenis * 150; }
function cenasPasivs() { return (upgradePasivsLimenis + 1) * 100; }
function canvasCenasDmgSec() { return (upgradeDmgSecLimenis + 1) * 200; }
const cenaJumper = 1000000; // Auto Jumper cena fiksēta uz 1M

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
const btnJumper = document.getElementById("btn-upgrade-jumper");

const statGold = document.getElementById("stat-gold");
const statDmg = document.getElementById("stat-dmg");
const statPasivs = document.getElementById("stat-pasivs");
const statDmgSec = document.getElementById("stat-dmg-sec");
const statJumper = document.getElementById("stat-jumper");

// Vadība
canvas.addEventListener("click", () => PepeLec());
window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault(); 
        PepeLec();
    }
});

// Veikala pogas
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
    let cena = canvasCenasDmgSec();
    if (points >= cena) { points -= cena; upgradeDmgSecLimenis++; saglabatDatus(); atjaunotVeikaluUI(); }
});

// Auto Jumper pogas darbība
btnJumper.addEventListener("click", () => {
    if (!hasAutoJumper && points >= cenaJumper) {
        points -= cenaJumper;
        hasAutoJumper = true;
        saglabatDatus();
        atjaunotVeikaluUI();
    }
});

function PepeLec() {
    pepe.velocity = pepe.jump;
    points += gūtPunktusParLecienu();
    saglabatDatus();
    atjaunotVeikaluUI();
}

// --- PASĪVAIS TAIMERIS ---
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
    goldCountEl.innerText = formatSkaitlis(points);
    
    btnLec.innerHTML = `Uzlabot (Lvl ${upgradeLecLimenis})<br>Cena: ${cenasLec()}`;
    btnLec.className = points >= cenasLec() ? "shop-btn active-lec" : "shop-btn";

    btnVarti.innerHTML = `Uzlabot (Lvl ${upgradeVartiLimenis})<br>Cena: ${cenasVarti()}`;
    btnVarti.className = points >= cenasVarti() ? "shop-btn active-varti" : "shop-btn";

    btnPasivs.innerHTML = `Uzlabot (Lvl ${upgradePasivsLimenis})<br>Cena: ${cenasPasivs()}`;
    btnPasivs.className = points >= cenasPasivs() ? "shop-btn active-pasivs" : "shop-btn";

    btnDmgSec.innerHTML = `Uzlabot (Lvl ${upgradeDmgSecLimenis})<br>Cena: ${canvasCenasDmgSec()}`;
    btnDmgSec.className = points >= canvasCenasDmgSec() ? "shop-btn active-dmg-sec" : "shop-btn";

    // Auto Jumper pogas stāvoklis vizuāli
    if (hasAutoJumper) {
        btnJumper.innerHTML = "NOPIRKTS AKTIIVS";
        btnJumper.className = "shop-btn owned";
        statJumper.innerText = "AKTĪVS";
        statJumper.style.color = "#4caf50";
    } else {
        btnJumper.innerHTML = `PIRKT<br>Cena: ${formatSkaitlis(cenaJumper)}`;
        btnJumper.className = points >= cenaJumper ? "shop-btn active-jumper" : "shop-btn";
        statJumper.innerText = "NAV NOPIRKTS";
        statJumper.style.color = "#ff4a4a";
    }

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

    // --- JAUNĀ AUTO JUMPER LOGIKA ---
    // Ja uzlabojums ir nopirkts un Pepe tuvojas zemei (atlikuši 45 pikseļi vai mazāk)
    if (hasAutoJumper && pepe.y + pepe.radius >= canvas.height - 45 && pepe.velocity > 0) {
        PepeLec(); // Izsauc lēcienu automātiski!
    }

    // Drošības barjera parastajai fizikai (ja nav nopirkts uzlabojums)
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
