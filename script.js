const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
	constructor(x, y, radius, color) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
	}

	draw() {
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		context.fillStyle = this.color;
		context.fill();
	}
}

class Projectile {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}

	draw() {
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		context.fillStyle = this.color;
		context.fill();
	}

	update() {
		this.draw();
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}
}

class Enemy extends Projectile {
    constructor(
        x,
        y,
        radius,
        color,
        velocity
    ) {
        super(
            x,
            y,
            radius,
            color,
            velocity
        )
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 30, 'blue');
const projectiles = [];
const enemies = []

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;
        let x
        let y

        if (Math.random() < 0.5) {
            x = (Math.random() < .5 ? 0 - radius : canvas.width + radius);
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = (Math.random() < .5 ? 0 - radius : canvas.height + radius);
        }

        const color = 'green'
        const angle = Math.atan2(
            canvas.height / 2 - y,
            canvas.width / 2 - x
        );
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        };

        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}

// GAME OVER FRAME
let animationId
// GAME RUN FUNCTION
function animate() {
    animationId = requestAnimationFrame(animate);
    context.clearRect(0, 0, canvas.width, canvas.height)
    player.draw()
	projectiles.forEach((projectile) => {
		projectile.update();
    });

    // COLLISION DETECTION FOR PLAYER
	enemies.forEach((enemy) => {
        enemy.update();
        
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        if (distance - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
        }

        // COLLISION DETECTION FOR PROJECTILES
        projectiles.forEach(projectile => {
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            if (distance - enemy.radius - projectile.radius < 1) {
                // GETS RID OF FLASH WHEN ENEMIES ARE SPLICED
                setTimeout(() => {
                    enemies.splice(enemies.indexOf(enemy),1)
                    projectiles.splice(projectiles.indexOf(projectile),1)
                }, 0);
            }
        })
    });
}

window.addEventListener('click', (event) => {
	const angle = Math.atan2(
		event.clientY - canvas.height / 2,
		event.clientX - canvas.width / 2
    );
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }
	projectiles.push(
		new Projectile(canvas.width / 2, canvas.height / 2, 5, 'red', velocity)
	);
});

animate();
spawnEnemies()