const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Spēles stāvokļi
let gameRunning = false;
let isGameOver = false;
let score = 0;
let highScore = localStorage.getItem("pepeHighScore") || 0;

// --- BILŽU IELĀDE ---
const imgIet = new Image();
imgIet.src = 'pepe_iet.png';

const imgLec = new Image();
imgLec.src = 'pepe_lec.png';

const imgKrit = new Image();
imgKrit.src = 'pepe_krit.png';
// --------------------

// Pepe (Spēlētāja objekts)
const pepe = {
    x: 80,
    y: 250,
    radius: 20, // Palielināts rādiuss, lai labāk atbilstu bildes izmēram
    velocity: 0,
    gravity: 0.38,
    jump: -6.8
};

// Šķēršļu (MrBeast stabu) iestatījumi
let pipes = [];
const pipeWidth = 68;
const pipeGap = 155; 
const pipeSpeed = 3;
let pipeTimer = 0;

// Vadības reģistrēšana (Pele un Spacebar)
canvas.addEventListener("click", () => handleInput());
window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault(); 
        handleInput();
    }
});

function handleInput() {
    if (!gameRunning && !isGameOver) {
        gameRunning = true;
        loop();
    } else if (isGameOver) {
        resetGame();
    } else {
        pepe.velocity = pepe.jump;
    }
}

function resetGame() {
    pepe.y = 250;
    pepe.velocity = 0;
    pipes = [];
    pipeTimer = 0;
    score = 0;
    isGameOver = false;
    gameRunning = true;
    loop();
}

function createPipe() {
    let minHeight = 60;
    let maxHeight = canvas.height - pipeGap - 60;
    let topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    
    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: canvas.height - (topHeight + pipeGap),
        passed: false
    });
}

function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.beginPath(); ctx.arc(120, 90, 35, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(155, 90, 45, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(310, 160, 40, 0, Math.PI * 2); ctx.fill();
}

// Funkcija, kas zīmē Pepi, izmantojot tavas bildes
function drawPepe(x, y) {
    let currentImage = imgIet; // Noklusējuma bilde (iet/stāv)

    // Ja Pepe kustas uz augšu (ātrums negatīvs), rādām "lec" bildi
    if (pepe.velocity < -1) {
        currentImage = imgLec;
    } 
    // Ja Pepe krīt uz leju (ātrums pozitīvs), rādām "krit" bildi
    else if (pepe.velocity > 1) {
        currentImage = imgKrit;
    }

    // Aprēķinām bildes izmēru un novietojumu ap spēlētāja centru
    const size = pepe.radius * 2.5; 
    const drawX = x - size / 2;
    const drawY = y - size / 2;

    // Zīmējam bildi uz ekrāna
    ctx.drawImage(currentImage, drawX, drawY, size, size);
}

function drawPipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;

        ctx.fillStyle = "#e91e63"; 
        ctx.strokeStyle = "#880e4f";
        ctx.lineWidth = 3;
        ctx.fillRect(pipes[i].x, 0, pipeWidth, pipes[i].top);
        ctx.strokeRect(pipes[i].x, -5, pipeWidth, pipes[i].top + 5);

        ctx.fillStyle = "#00bcd4"; 
        ctx.strokeStyle = "#006064";
        ctx.fillRect(pipes[i].x, canvas.height - pipes[i].bottom, pipeWidth, pipes[i].bottom);
        ctx.strokeRect(pipes[i].x, canvas.height - pipes[i].bottom, pipeWidth, pipes[i].bottom + 5);

        if (
            pepe.x + pepe.radius - 5 > pipes[i].x && 
            pepe.x - pepe.radius + 5 < pipes[i].x + pipeWidth
        ) {
            if (pepe.y - pepe.radius + 5 < pipes[i].top || pepe.y + pepe.radius - 5 > canvas.height - pipes[i].bottom) {
                triggerGameOver();
            }
        }

        if (!pipes[i].passed && pipes[i].x + pipeWidth < pepe.x) {
            score++;
            pipes[i].passed = true;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("pepeHighScore", highScore);
            }
        }

        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

function drawUI() {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Punkti: " + score, 20, 40);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.font = "14px Arial";
    ctx.fillText("Labākais: " + highScore, 20, 65);
}

function triggerGameOver() {
    gameRunning = false;
    isGameOver = true;

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ff4a4a";
    ctx.font = "bold 26px Arial";
    ctx.textAlign = "center";
    ctx.fillText("MRBEAST TEVI NOĶĒRA!", canvas.width / 2, canvas.height / 2 - 40);

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("Tavs rezultāts: " + score, canvas.width / 2, canvas.height / 2 + 15);
    
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 16px Arial";
    ctx.fillText("Rekords: " + highScore, canvas.width / 2, canvas.height / 2 + 45);

    ctx.fillStyle = "#cccccc";
    ctx.font = "14px Arial";
    ctx.fillText("Nospied SPACE, lai spēlētu vēlreiz", canvas.width / 2, canvas.height / 2 + 100);
}

function loop() {
    if (!gameRunning) return;

    drawBackground();

    pepe.velocity += pepe.gravity;
    pepe.y += pepe.velocity;

    if (pepe.y + pepe.radius >= canvas.height || pepe.y - pepe.radius <= 0) {
        triggerGameOver();
    }

    pipeTimer++;
    if (pipeTimer >= 95) {
        createPipe();
        pipeTimer = 0;
    }

    drawPipes();
    drawPepe(pepe.x, pepe.y);
    drawUI();

    requestAnimationFrame(loop);
}

function showStartScreen() {
    drawBackground();
    drawPepe(pepe.x, pepe.y);
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 22px Arial";
    ctx.fillText("Nospied SPACE, lai sāktu", canvas.width / 2, canvas.height / 2 - 10);
    
    ctx.font = "14px Arial";
    ctx.fillStyle = "#a2fca2";
    ctx.fillText("Palīdzi Pepei izbēgt no izaicinājuma!", canvas.width / 2, canvas.height / 2 + 25);
}

// Palaist sākuma skatu
showStartScreen();
