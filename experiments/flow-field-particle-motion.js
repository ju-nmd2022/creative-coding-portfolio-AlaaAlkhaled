let circles = [];
let agents = [];
let field = [];
const cols = 5;
const rows = 5;
const gridSpacing = 100;
const minRadius = 30;
const maxRadius = 40;

const numAgents = 200; 
const fieldSize = 50;
const flowFieldCols = Math.ceil(600 / fieldSize);
const flowFieldRows = Math.ceil(600 / fieldSize);
const divider = 5; 

function setup() {
    createCanvas(600, 600);
    noFill();

    generateField(); 
    createCirclesGrid();
    generateAgents();
}

function draw() {
    background(220);

    drawFlowField();

    for (let circle of circles) {
        fill(circle.color);
        ellipse(circle.x, circle.y, circle.radius * 2);
    }

    for (let agent of agents) {
        const col = Math.floor(agent.position.x / fieldSize);
        const row = Math.floor(agent.position.y / fieldSize);

        if (col >= 0 && col < flowFieldCols && row >= 0 && row < flowFieldRows) {
            const desiredDirection = field[col][row];
            agent.follow(desiredDirection); // Make agent follow flow field
        }

        agent.update();
        agent.checkBorders();
        fill(agent.color); // Use agent's random color (now more uniform)
        agent.draw();
    }
}

function generateField() {
    for (let x = 0; x < flowFieldCols; x++) {
        field[x] = [];
        for (let y = 0; y < flowFieldRows; y++) {
            const angle = noise(x / divider, y / divider) * TWO_PI; // Random angle from Perlin noise
            field[x][y] = p5.Vector.fromAngle(angle); // Create a vector with that angle
        }
    }
}

class Boid {
    constructor(x, y, maxSpeed, maxForce, color) {
        this.position = createVector(x, y);
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(0, 0);
        this.maxSpeed = maxSpeed;
        this.maxForce = maxForce;
        this.color = color;
    }

    follow(desiredDirection) {
        desiredDirection = desiredDirection.copy();
        desiredDirection.mult(this.maxSpeed);
        let steer = p5.Vector.sub(desiredDirection, this.velocity);
        steer.limit(this.maxForce);
        this.applyForce(steer);
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    update() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0); // Reset acceleration each frame
    }

    checkBorders() {
        if (this.position.x < -10) this.position.x = width + 10;
        if (this.position.x > width + 10) this.position.x = -10;

        if (this.position.y < -10) this.position.y = height + 10;
        if (this.position.y > height + 10) this.position.y = -10;
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);
        ellipse(0, 0, 6);
        pop();
    }
}

function generateAgents() {
    const startY = height / 2;
    for (let i = 0; i < numAgents; i++) {
        let agent = new Boid(
            random(width),
            startY + random(-300, 300),
            2.5,
            0.2,
            color(150, 200, 255)
        );
        agents.push(agent);
    }
}

function createCirclesGrid() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let x = i * gridSpacing + gridSpacing / 2;
            let y = j * gridSpacing + gridSpacing / 2;
            let radius = random(minRadius, maxRadius);
            let newCircle = {
                x, 
                y, 
                radius, 
                color: color(random(100, 255), random(100, 255), random(200, 255))
            };
            circles.push(newCircle);
        }
    }
}

function drawFlowField() {
    stroke(100);
    for (let x = 0; x < flowFieldCols; x++) {
        for (let y = 0; y < flowFieldRows; y++) {
            let force = field[x][y];
            push();
            translate(x * fieldSize + fieldSize / 2, y * fieldSize + fieldSize / 2);
            rotate(force.heading());
            line(0, 0, fieldSize / 2, 0);
            pop();
        }
    }
}