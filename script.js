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
    constructor(x, y, radius, color, velocity) {
        super(x, y, radius, color, velocity);
	}
}

const friction = 0.98
class Particle extends Projectile {
    constructor(x, y, radius, color, velocity) {
        super(x, y, radius, color, velocity);
        this.alpha = 1
	}
    
    // PARTICLE EFFECT TO FADE AWAY PARTICLES
    draw() {
        context.save()
        context.globalAlpha = this.alpha
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
        context.restore()
    }
    
    update() {
        this.draw();
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 10, 'white');
const projectiles = [];
const enemies = [];
const particles = [];

function spawnEnemies() {
	setInterval(() => {
		const radius = Math.random() * (30 - 4) + 4;
		let x;
		let y;

		if (Math.random() < 0.5) {
			x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
			y = Math.random() * canvas.height;
		} else {
			x = Math.random() * canvas.width;
			y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

		const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
		const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
		const velocity = {
			x: Math.cos(angle),
			y: Math.sin(angle),
		};

		enemies.push(new Enemy(x, y, radius, color, velocity));
	}, 1000);
}

// GAME OVER FRAME
let animationId;
// GAME RUN FUNCTION
function animate() {
    animationId = requestAnimationFrame(animate);
    context.fillStyle = 'rgba(0, 0, 0, 0.1)'
	context.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    particles.forEach(particle => {
        if (particle.alpha <= 0) {
            particles.splice(particles.indexOf(particle), 1)
        } else {
            particle.update()
        }
    })


	projectiles.forEach((projectile) => {
		projectile.update();

		// IF PROJECTILE LEAVES SCREEN STOP COMPUTATION FOR IT
		if (
			projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
		) {
			setTimeout(() => {
				projectiles.splice(projectiles.indexOf(projectile), 1);
			}, 0);
		}
	});

	// COLLISION DETECTION FOR PLAYER
	enemies.forEach((enemy) => {
		enemy.update();

		const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);

		if (distance - enemy.radius - player.radius < 1) {
			cancelAnimationFrame(animationId);
		}

		// COLLISION DETECTION FOR PROJECTILES HITTING ENEMY
		projectiles.forEach((projectile) => {
			const distance = Math.hypot(
				projectile.x - enemy.x,
				projectile.y - enemy.y
			);

            // SET TIMEOUTS GET RID OF FLASH WHEN ENEMIES ARE SPLICED
            // SHRINKS BIG ENEMY WHEN HIT ELSE SPLICES IT IF ITS ALREADY SMALL
			if (distance - enemy.radius - projectile.radius < 1) {
                // PARTICLE EFFECT
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y,
                        Math.random() * 2, 
                        enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 7),
                        y: (Math.random() - 0.5) * (Math.random() * 7),
                    }))
                }
                if (enemy.radius - 10 > 5) {
                    // SHRINK EFFECT
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectiles.indexOf(projectile), 1);
                    }, 0);
                } else {
                    setTimeout(() => {
                        enemies.splice(enemies.indexOf(enemy), 1);
                        projectiles.splice(projectiles.indexOf(projectile), 1);
                    }, 0);
                }
			}
		});
	});
}

window.addEventListener('click', (event) => {
    console.log(projectiles)
	const angle = Math.atan2(
		event.clientY - canvas.height / 2,
		event.clientX - canvas.width / 2
    );
    // PROJECTILE VELOCITY
	const velocity = {
		x: Math.cos(angle) * 5,
		y: Math.sin(angle) * 5,
	};
	projectiles.push(
		new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity)
	);
});

animate();
spawnEnemies();
