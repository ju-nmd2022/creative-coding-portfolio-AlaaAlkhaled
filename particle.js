let circles = [];
const minRadius = 30;
const maxRadius = 80;
const totalCircles = 50;
const createCircleAttempts = 10;
const corner = { x: 0, y: 0 };
const particleAvoidRadiusFactor = 1.2;

function setup() {
    createCanvas(600, 600);
    noFill();

    for (let i = 0; i < totalCircles; i++) {
    createAndDrawCircle();
    }
}

function draw() {
    background(220);

    // Draw circles, arrows, and update particles
    for (let circle of circles) {
        noStroke();
        ellipse(circle.x, circle.y, circle.radius * 2, circle.radius * 2); // Draw the circle
        drawArrow(circle); 
    
        // Move and avoid circles for each particle
        for (let particle of circle.particles) {
            moveParticle(particle);
            avoidCircles(particle);
            fill(particle.color);
            noStroke();
            ellipse(particle.x, particle.y, 7, 7);
        }
    }
}

// Draw an arrow inside the circle pointing to the corner
function drawArrow(circle) {
    stroke(random (0, 100));
    strokeWeight(4);
    fill(0);

    // Calculate the direction towards the corner
    let dirX = corner.x - circle.x;
    let dirY = corner.y - circle.y;
    let mag = sqrt(dirX * dirX + dirY * dirY);

    if (mag > 0) {
        dirX /= mag;
        dirY /= mag;
    }

    // Set the length of the arrow based on the circle's radius
    let arrowLength = circle.radius * 0.7;

    // Draw the arrow line from the center of the circle
    let arrowX = circle.x + dirX * arrowLength;
    let arrowY = circle.y + dirY * arrowLength;
    line(circle.x, circle.y, arrowX, arrowY);

    // Draw the arrowhead (triangle) at the end of the line
    let arrowSize = 6;
    push();
    translate(arrowX, arrowY);
    rotate(atan2(dirY, dirX)); // Rotate the triangle to point in the correct direction
    beginShape();
    vertex(0, 0);
    vertex(-arrowSize, arrowSize / 2);
    vertex(-arrowSize, -arrowSize / 2);
    endShape(CLOSE);
    pop();
}

// Move particle towards the corner
function moveParticle(particle) {
    let dirX = corner.x - particle.x;
    let dirY = corner.y - particle.y;
    let mag = sqrt(dirX * dirX + dirY * dirY);

    if (mag > 0) {
        dirX /= mag; // Normalize direction
        dirY /= mag;
    }

    // Move particle towards the corner
    particle.x += dirX * particle.speed;
    particle.y += dirY * particle.speed;

    // Wrap particles around the canvas if they go out of bounds
    if (particle.x < 0) particle.x = width;
    if (particle.x > width) particle.x = 0;
    if (particle.y < 0) particle.y = height;
    if (particle.y > height) particle.y = 0;
}

// Push particles away from circles if they get too close
function avoidCircles(particle) {
    for (let circle of circles) {
        const distToCircle = dist(particle.x, particle.y, circle.x, circle.y);
        if (distToCircle < circle.radius * particleAvoidRadiusFactor) {
        let avoidX = particle.x - circle.x;
        let avoidY = particle.y - circle.y;
        let avoidMag = sqrt(avoidX * avoidX + avoidY * avoidY);

        if (avoidMag > 0) {
            avoidX /= avoidMag; 
            avoidY /= avoidMag;
            particle.x += avoidX * 2;
            particle.y += avoidY * 2;
            }
        }
    }
}

// Create and draw a circle without overlap
function createAndDrawCircle() {
    let newCircle;
    let safeToDraw = false;

    // Try placing the circle multiple times
    for (let tries = 0; tries < createCircleAttempts; tries++) {
        newCircle = {
        x: random(width),
        y: random(height),
        radius: minRadius,
        particles: []
    };

    if (!doesCircleHaveACollision(newCircle)) {
        safeToDraw = true;
        break;
        }
    }

    if (!safeToDraw) return;

    // Increase the circle's size until it collides with another circle
    for (let r = minRadius; r < maxRadius; r++) {
        newCircle.radius = r;
        if (doesCircleHaveACollision(newCircle)) {
        newCircle.radius--;
        break;
        }
    }

    circles.push(newCircle); 
    createParticles(newCircle);
}

// Check if the new circle collides with any existing circles
function doesCircleHaveACollision(circle) {
    for (let otherCircle of circles) {
        let distanceBetweenCenters = dist(circle.x, circle.y, otherCircle.x, otherCircle.y);
        if (distanceBetweenCenters < circle.radius + otherCircle.radius + 20) {
        return true;
        }
    }

    // Ensure the circle is within canvas bounds
    return (circle.x - circle.radius < 0 || circle.x + circle.radius > width ||
            circle.y - circle.radius < 0 || circle.y + circle.radius > height);
}

// Create particles around the circle
function createParticles(circle) {
    const numParticles = 10;
    const speed = 1.5;

    for (let i = 0; i < numParticles; i++) {
        const angle = random(TWO_PI);
        const particle = {
        x: circle.x + cos(angle) * circle.radius * particleAvoidRadiusFactor,
        y: circle.y + sin(angle) * circle.radius * particleAvoidRadiusFactor,
        speed: speed + random(0.5),
        color: color(255, random(50, 150), random(50, 150))
        };
        circle.particles.push(particle);
    }
}
