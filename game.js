const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 1000;

const cowboy = {
    x: 500,
    y: 500,
    speed: 3,
    width: 20,
    height: 20
};

let camera = {
    x: 0,
    y: 0
};

let keys = {
    up: false,
    down: false,
    left: false,
    right: false
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowUp') keys.up = true;
    if (e.code === 'ArrowDown') keys.down = true;
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowUp') keys.up = false;
    if (e.code === 'ArrowDown') keys.down = false;
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
});

function seededRandom(seed) {
    let m = 0x80000000; // 2^31
    let a = 1103515245;
    let c = 12345;
    let s = seed;
    return function() {
        s = (a * s + c) % m;
        return s / m;
    };
}

function generateObjects(count, minDistance) {
    const objects = [];
    const seed = 12345; // Fixed seed for reproducibility
    const random = seededRandom(seed);
    const worldSize = 10000;

    while (objects.length < count) {
        let x = random() * worldSize;
        let y = random() * worldSize;
        let tooClose = false;

        for (let obj of objects) {
            const dx = x - obj.x;
            const dy = y - obj.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                tooClose = true;
                break;
            }
        }

        if (!tooClose) {
            objects.push({ x, y });
        }
    }

    return objects;
}

const allObjects = generateObjects(200, 30);
const rocks = allObjects.slice(0, 100);
const cacti = allObjects.slice(100, 200);

function rectsIntersect(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function checkCollisionWithRocks(newX, newY) {
    const cowboyRect = {
        x: newX,
        y: newY,
        width: cowboy.width,
        height: cowboy.height
    };

    for (let rock of rocks) {
        const rockRect = {
            x: rock.x,
            y: rock.y,
            width: 20, // Assuming rock size
            height: 20
        };

        if (rectsIntersect(cowboyRect, rockRect)) {
            return true; // Collision, block movement
        }
    }

    return false;
}

function checkCollisionWithCacti() {
    const cowboyX = cowboy.x;
    const cowboyY = cowboy.y;

    for (let cactus of cacti) {
        const cactusX = cactus.x;
        const cactusY = cactus.y;

        const dx = cowboyX - cactusX;
        const dy = cowboyY - cactusY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) { // Assuming cactus collision radius is 10
            triggerExplosion();
            gameOver();
            return;
        }
    }
}

function triggerExplosion() {
    // Play explosion sound
    // explosionSound.play();

    // Draw explosion animation
    // For simplicity, a red circle expanding
    let explosionRadius = 0;
    let explosionInterval = setInterval(() => {
        explosionRadius += 5;
        if (explosionRadius > 100) {
            clearInterval(explosionInterval);
        }
        ctx.beginPath();
        ctx.arc(500, 500, explosionRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
    }, 50);
}

function gameOver() {
    // Display game over message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
}

function update() {
    let dx = 0;
    let dy = 0;

    if (keys.up) dy = -cowboy.speed;
    if (keys.down) dy = cowboy.speed;
    if (keys.left) dx = -cowboy.speed;
    if (keys.right) dx = cowboy.speed;

    // Check collision with rocks before moving
    const newX = cowboy.x + dx;
    const newY = cowboy.y + dy;

    if (!checkCollisionWithRocks(newX, newY)) {
        cowboy.x = newX;
        cowboy.y = newY;
        camera.x = cowboy.x - 500;
        camera.y = cowboy.y - 500;
    }

    // Check collision with cacti
    checkCollisionWithCacti();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw rocks
    for (let rock of rocks) {
        const x = rock.x - camera.x;
        const y = rock.y - camera.y;
        ctx.fillStyle = 'gray';
        ctx.fillRect(x, y, 20, 20);
    }

    // Draw cacti
    for (let cactus of cacti) {
        const x = cactus.x - camera.x;
        const y = cactus.y - camera.y;
        ctx.fillStyle = 'green';
        ctx.fillRect(x, y, 20, 20);
    }

    // Draw cowboy
    ctx.fillStyle = 'brown';
    ctx.fillRect(500, 500, cowboy.width, cowboy.height);
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();
