const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- SPĒLES PROGRESA DATI (Saglabājas pārlūkā) ---
let points = parseInt(localStorage.getItem("pepePoints")) || 0;
let beastSubs = parseInt(localStorage.getItem("beastSubs")) || 491000000;

// Uzlabojumu līmeņi
let upgradeLecLimenis = parseInt(localStorage.getItem("upLecLimenis")) || 1;
let upgradeVartiLimenis = parseInt(localStorage.getItem("upVartiLimenis")) || 1;

// --- UZLABOJUMU APRĒĶINI ---
// Cik punktus dod 1 lēciens
function gūtPunktusParLecienu() { return upgradeLecLimenis; }
// Cik subus atņem vieni vārti
function gūtDamageParVartiem() { return upgradeVartiLimenis * 5 - 4; } // Lvl 1 = 1, Lvl 2 = 6, Lvl 3 = 11...
// Uzlabojumu cenas
function cenasLec() { return upgradeLecLimenis * 50; }
function cenasVarti() { return upgradeVartiLimenis * 150; }

// Spēles stāvokļi
let gameRunning = false;
let isGameOver = false;

// --- BILŽU IELĀDE ---
const imgIet = new Image(); imgIet.src = 'pepe_iet.png';
const imgLec = new Image(); imgLec.src = 'pepe_lec.png';
const imgKrit = new Image(); imgKrit.src = 'pepe_krit.png';

// Pepe
const pepe = {
    x: 80,
    y: 250,
    radius: 20,
    velocity: 0,
    gravity: 0.38,
    jump: -6.8
};

// Vārti (MrBeast stabi)
let pipes = [];
const pipeWidth = 68;
const pipeGap = 160; 
const pipeSpeed = 3;
let pipeTimer = 0;

// Vadība un klikšķi uz veikala pogām
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (!gameRunning && !isGameOver) {
        // Pārbauda vai uzklikšķināja uz uzlabojumu pogām sākuma ekrānā
        if (clickX >= 30 && clickX <= 180 && clickY >= 420 && clickY <= 470) {
            PirktLecienaUzlabojumu();
        } else if (clickX >= 220 && clickX <= 370 && clickY >= 420 && clickY <= 470) {
            PirktVartuUzlabojumu();
        } else if (clickY < 400) {
            // Ja noklikšķina augstāk, sākas spēle
            SaktSpeli();
        }
    } else if (isGameOver) {
        resetGame();
    } else {
        // Spēles laikā - lēciens
        PepeLec();
    }
});

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault(); 
        if (!gameRunning && !isGameOver) {
            SaktSpeli();
        } else if (isGameOver) {
            resetGame();
        } else {
            PepeLec();
        }
    }
});

function PepeLec() {
    pepe.velocity = pepe.jump;
    points += gūtPunktusParLecienu(); // Katrs lēciens dod punktus!
    saglabatDatus();
}

function SaktSpeli() {
    gameRunning = true;
    loop();
}

function resetGame() {
    pepe.y = 250;
    pepe.velocity = 0;
    pipes = [];
    pipeTimer = 0;
    isGameOver = false;
    gameRunning = true;
    loop();
}

function PirktLecienaUzlabojumu() {
    let cena = cenasLec();
    if (points >= cena) {
        points -= cena;
        upgradeLecLimenis++;
        saglabatDatus();
        showStartScreen();
    }
}

function PirktVartuUzlabojumu() {
    let cena = cenasVarti();
    if (points >= cena) {
        points -= cena;
        upgradeVartiLimenis++;
        saglabatDatus();
        showStartScreen();
    }
}

function saglabatDatus() {
    localStorage.setItem("pepePoints", points);
    localStorage.setItem("beastSubs", beastSubs);
    localStorage.setItem("upLecLimenis", upgradeLecLimenis);
    localStorage.setItem("upVartiLimenis", upgradeVartiLimenis);
}

function createPipe() {
    let minHeight = 60;
    let maxHeight = canvas.height - pipeGap - 60;
    let topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    pipes.push({ x: canvas.width, top: topHeight, bottom: canvas.height - (topHeight + pipeGap), passed: false });
}

function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath(); ctx.arc(120, 90, 35, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(310, 160, 40, 0, Math.PI * 2); ctx.fill();
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

        // Vārti
        ctx.fillStyle = "#e91e63"; ctx.fillRect(pipes[i].x, 0, pipeWidth, pipes[i].top);
        ctx.fillStyle = "#00bcd4"; ctx.fillRect(pipes[i].x, canvas.height - pipes[i].bottom, pipeWidth, pipes[i].bottom);

        // Sadursme
        if (pepe.x + pepe.radius - 5 > pipes[i].x && pepe.x - pepe.radius + 5 < pipes[i].x + pipeWidth) {
            if (pepe.y - pepe.radius + 5 < pipes[i].top || pepe.y + pepe.radius - 5 > canvas.height - pipes[i].bottom) {
                triggerGameOver();
            }
        }

        // Iziešana cauri vārtiem
        if (!pipes[i].passed && pipes[i].x + pipeWidth < pepe.x) {
            let dmg = gūtDamageParVartiem();
            beastSubs -= dmg;
            if (beastSubs < 0) beastSubs = 0;
            pipes[i].passed = true;
            saglabatDatus();
        }

        if (pipes[i].x + pipeWidth < 0) pipes.splice(i, 1);
    }
}

function formatSkaitlis(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function drawUI() {
    // Spēlētāja punkti (Nauda)
    ctx.fillStyle = "#ffd700"; ctx.font = "bold 18px Arial"; ctx.textAlign = "left";
    ctx.fillText("Zelts: " + formatSkaitlis(points), 20, 40);
    
    // MrBeast subs skaitītājs pa vidu
    ctx.fillStyle = "#ff4a4a"; ctx.font = "bold 16px Arial"; ctx.textAlign = "right";
    ctx.fillText("MrBeast Subs: " + formatSkaitlis(beastSubs), canvas.width - 20, 40);
}

function triggerGameOver() {
    gameRunning = false; isGameOver = true;
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)"; ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ff4a4a"; ctx.font = "bold 26px Arial"; ctx.textAlign = "center";
    ctx.fillText("TU FINIŠĒJI!", canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = "#fff"; ctx.font = "16px Arial";
    ctx.fillText("MrBeast atlikuši: " + formatSkaitlis(beastSubs) + " sub", canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText("Tev ir: " + formatSkaitlis(points) + " zelts", canvas.width / 2, canvas.height / 2 + 50);

    ctx.fillStyle = "#aaa"; ctx.fillText("Noklikšķini, lai mēģinātu atkal", canvas.width / 2, canvas.height / 2 + 110);
}

function loop() {
    if (!gameRunning) return;
    drawBackground();

    pepe.velocity += pepe.gravity; pepe.y += pepe.velocity;
    if (pepe.y + pepe.radius >= canvas.height || pepe.y - pepe.radius <= 0) triggerGameOver();

    pipeTimer++;
    if (pipeTimer >= 95) { createPipe(); pipeTimer = 0; }

    drawPipes();
    drawPepe(pepe.x, pepe.y);
    drawUI();

    if (beastSubs <= 0) {
        gameRunning = false;
        Uzvara();
    } else {
        requestAnimationFrame(loop);
    }
}

function Uzvara() {
    ctx.fillStyle = "rgba(0,0,0,0.9)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#4caf50"; ctx.font = "bold 32px Arial"; ctx.textAlign = "center";
    ctx.fillText("PEPE UZVARĒJA!", canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillStyle = "#fff"; ctx.font = "16px Arial";
    ctx.fillText("MrBeast zaudēja visus sekotājus!", canvas.width / 2, canvas.height / 2 + 20);
}

function showStartScreen() {
    drawBackground();
    drawPepe(pepe.x, pepe.y);
    drawUI();
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "bold 20px Arial";
    ctx.fillText("SPIED ŠEIT VAI SPACE, LAI SĀKTU", canvas.width / 2, 180);
    
    // --- VEIKALA GRAFIKA ---
    ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fillRect(15, 330, 370, 250);
    ctx.fillStyle = "#ffd700"; ctx.font = "bold 18px Arial"; ctx.fillText("UPGRADES (VEIKALS)", canvas.width / 2, 360);

    // 1. Poga: Lēciena uzlabojums
    ctx.fillStyle = points >= cinemasLec() ? "#4caf50" : "#555";
    ctx.fillRect(30, 420, 150, 50);
    ctx.fillStyle = "#fff"; ctx.font = "12px Arial";
    ctx.fillText("Vairāk Zelta par lecienu", 105, 400);
    ctx.fillText("BUY (Lvl " + upgradeLecLimenis + ")", 105, 440);
    ctx.fillStyle = "#ffd700"; ctx.fillText("Cena: " + cenasLec(), 105, 460);

    // 2. Poga: Vārtu uzlabojums
    ctx.fillStyle = points >= cenasVarti() ? "#00bcd4" : "#555";
    ctx.fillRect(220, 420, 150, 50);
    ctx.fillStyle = "#fff"; ctx.font = "12px Arial";
    ctx.fillText("Vairāk Sub Noņemšanas", 295, 400);
    ctx.fillText("BUY (Lvl " + upgradeVartiLimenis + ")", 295, 440);
    ctx.fillStyle = "#ffd700"; ctx.fillText("Cena: " + cenasVarti(), 295, 460);
    
    // Info par spēku
    ctx.fillStyle = "#aaa"; ctx.font = "11px Arial";
    ctx.fillText("Lēciens dod: +" + gūtPunktusParLecienu() + " zeltu | Vārti noņem: -" + gūtDamageParVartiem() + " subs", canvas.width / 2, 510);
}

showStartScreen();
