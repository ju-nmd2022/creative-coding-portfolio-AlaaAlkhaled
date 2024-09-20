let circles = [];
let agents = [];
let field = [];
const gridSize = 6;
const gridSpacing = 100;
const minRadius = 30;
const maxRadius = 40;

const numAgents = 200;
const fieldSize = 50;
const flowFieldCols = Math.ceil(600 / fieldSize);
const flowFieldRows = Math.ceil(600 / fieldSize);
const noiseScale = 5;

let synth;
let reverb;
let audioStarted = false;

// Single smooth melody scale (C Major Scale)
// This melody was generated from ChatGPT.
const currentScale = [60, 62, 64, 65, 67, 69, 71, 72];

function setup() {
  createCanvas(600, 600);
  noFill();

  reverb = new Tone.Reverb(2).toDestination();

  synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 1 }
  }).connect(reverb);

  Tone.start().then(() => {
    audioStarted = true;
  });

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
    const col = floor(agent.position.x / fieldSize);
    const row = floor(agent.position.y / fieldSize);

    if (col >= 0 && col < flowFieldCols && row >= 0 && row < flowFieldRows) {
      const desiredDirection = field[col][row];
      agent.follow(desiredDirection);
    }

    agent.update();
    agent.checkEdges();
    fill(agent.color);
    agent.draw();
  }
}

function generateField() {
  for (let x = 0; x < flowFieldCols; x++) {
    field[x] = [];
    for (let y = 0; y < flowFieldRows; y++) {
      const angle = noise(x / noiseScale, y / noiseScale) * TWO_PI;
      field[x][y] = p5.Vector.fromAngle(angle);
    }
  }
}

class Boid {
  constructor(x, y, color) {
    this.position = createVector(x, y);
    this.prevPosition = this.position.copy();
    this.velocity = p5.Vector.random2D();
    this.acceleration = createVector(0, 0);
    this.maxSpeed = 2.5;
    this.maxForce = 0.2;
    this.color = color;
    this.lastNoteTime = 0;
  }

  follow(force) {
    force = force.copy().mult(this.maxSpeed);
    let steer = p5.Vector.sub(force, this.velocity).limit(this.maxForce);
    this.acceleration.add(steer);
  }

  update() {
    this.prevPosition.set(this.position);

    this.velocity.add(this.acceleration).limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);

    this.checkBoundaryCrossing();
  }

  checkBoundaryCrossing() {
    const wasInside = this.isInsideCanvas(this.prevPosition);
    const isInside = this.isInsideCanvas(this.position);

    if (wasInside !== isInside) {
      this.triggerSound();
    }
  }

  isInsideCanvas(pos) {
    return pos.x >= 0 && pos.x <= width && pos.y >= 0 && pos.y <= height;
  }

  checkEdges() {
    if (this.position.x < 0) this.position.x = width;
    else if (this.position.x > width) this.position.x = 0;

    if (this.position.y < 0) this.position.y = height;
    else if (this.position.y > height) this.position.y = 0;
  }

  triggerSound() {
    if (!audioStarted || Tone.context.state !== 'running') return;

    let now = millis();
    if (now - this.lastNoteTime > 500) {
      let index = floor(map(this.position.y, 0, height, 0, currentScale.length));
      index = constrain(index, 0, currentScale.length - 1);
      let midiNote = currentScale[index];
      let freq = Tone.Frequency(midiNote, "midi");
      synth.triggerAttackRelease(freq, "8n");
      this.lastNoteTime = now;
    }
  }

  draw() {
    ellipse(this.position.x, this.position.y, 6);
  }
}

function generateAgents() {
  for (let i = 0; i < numAgents; i++) {
    let agent = new Boid(random(width), random(height), color(150, 200, 255));
    agents.push(agent);
  }
}

function createCirclesGrid() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let x = i * gridSpacing + gridSpacing / 2;
      let y = j * gridSpacing + gridSpacing / 2;
      let radius = random(minRadius, maxRadius);

      let colorChoice = floor(random(3));
      let circleColor;
      if (colorChoice === 0) {
        circleColor = color(0, random(150, 255), 0);
      } else if (colorChoice === 1) {
        circleColor = color(0, 0, random(150, 255)); 
      } else {
        let whiteShade = random(200, 255);
        circleColor = color(whiteShade);
      }

      circles.push({ x, y, radius, color: circleColor });
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