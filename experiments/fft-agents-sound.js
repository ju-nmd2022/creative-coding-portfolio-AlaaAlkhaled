// Variables for visuals
let circles = [];
let agents = [];
let field = [];
const cols = 6;
const rows = 6;
const gridSpacing = 100;
const minRadius = 30;
const maxRadius = 40;
const numAgents = 200;
const fieldSize = 50;
const flowFieldCols = Math.ceil(600 / fieldSize);
const flowFieldRows = Math.ceil(600 / fieldSize);
let divider = 5;

// Variables for sound
let synth;
let reverb;
let analyzer;
let audioStarted = false;

function setup() {
  createCanvas(600, 600);
  reverb = new Tone.Reverb(2).toDestination();

  synth = new Tone.Synth({
    oscillator: {
      type: 'sine'
    },
    envelope: {
      attack: 0.5,
      decay: 0.3,
      sustain: 0.5,
      release: 1
    }
  }).connect(reverb);

  analyzer = new Tone.Analyser('fft', 256);
  synth.connect(analyzer);

  createCirclesGrid();
  generateAgents();
}

function draw() {
  background(220);
  generateField();
  drawFlowField();

  for (let circle of circles) {
    fill(circle.color);
    noStroke();
    ellipse(circle.x, circle.y, circle.radius * 2);
  }

  // Get frequency spectrum of the sound
  let fftValues = analyzer.getValue();

  noStroke();

  // This FFT visualization was created with help from ChatGPT.
  // It maps the frequency data to wider colored rectangles, with height based on amplitude.
  for (let i = 0; i < fftValues.length; i++) {
    let x = map(i, 0, fftValues.length, 0, width);
    let amplitude = fftValues[i];
    let y = map(amplitude, -100, 0, height, 0);

    let red = map(amplitude, -100, 0, 50, 255);
    let green = map(i, 0, fftValues.length, 50, 255);
    let blue = 200;
    fill(red, green, blue, 150);
    rect(x, y, (width / fftValues.length) * 2, height - y);
  }

  for (let agent of agents) {
    const col = Math.floor(agent.position.x / fieldSize);
    const row = Math.floor(agent.position.y / fieldSize);

    if (col >= 0 && col < flowFieldCols && row >= 0 && row < flowFieldRows) {
      const desiredDirection = field[col][row];
      agent.follow(desiredDirection);
    }

    // Random force for natural movement
    let randomForce = p5.Vector.random2D().mult(0.2);
    agent.applyForce(randomForce);

    agent.update();
    agent.checkBorders();

    fill(agent.color);
    noStroke();
    agent.draw();
  }

  if (audioStarted && Tone.context.state === 'running' && frameCount % 10 === 0) {
    let agent = random(agents);
  
    let noteIndex = Math.floor(map(agent.position.y, 0, height, 0, 7));
    noteIndex = constrain(noteIndex, 0, 7);
    // This melody was generated from ChatGPT.
    const currentScale = [60, 62, 64, 65, 67, 69, 71, 72];
    let note = currentScale[noteIndex];

    synth.triggerAttackRelease(Tone.Frequency(note, 'midi').toNote(), '8n');
  }

  if (!audioStarted) {
    drawInstruction();
  }
}

function drawInstruction() {
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(24);
  text('Click to Play Sound', width / 2, height - 100);
}

function generateField() {
  const time = frameCount * 0.01;
  for (let x = 0; x < flowFieldCols; x++) {
    field[x] = [];
    for (let y = 0; y < flowFieldRows; y++) {
      const angle = noise(x / divider, y / divider, time) * TWO_PI;
      field[x][y] = p5.Vector.fromAngle(angle);
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

  // Agents follow the flow field, this part is done with help of chatGPT
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
    this.acceleration.mult(0);
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
  for (let i = 0; i < numAgents; i++) {
    let agent = new Boid(
      random(width),
      random(height),
      2.5,
      0.4,
      color(50, 100, 150)
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
        color: color(random(100, 255), random(100, 255), random(200, 255)),
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

function mousePressed() {
  if (!audioStarted) {
    Tone.start();
    audioStarted = true;
  } else {
    // Synth settings
    synth.set({
      envelope: {
        attack: random(0.2, 0.6),
        decay: random(0.2, 0.4),
        sustain: random(0.5, 0.8),
        release: random(1, 2),
      },
    });

    reverb.decay = random(1.5, 4);
    divider = random(4, 7);
  }
}
