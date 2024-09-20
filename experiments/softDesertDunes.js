let numLayers = 9;
let layerHeight;
let noiseScale = 0.005;
let noiseStrength = 60;
let desertColors = ['#4a4e69', '#4b536e', '#43587a', '#526788'];

function setup() {
    createCanvas(600, 600);
    noLoop();
    noiseSeed(15);

    layerHeight = height / numLayers + random(30, 50);
}

function draw() {
    drawNightSky();

    // draw desert layers
    for (let i = 0; i < numLayers; i++) {
        let yOffset = (i * layerHeight) + height / 4;
        fill(getLayerColor(i));
        noStroke();
    

        let noiseOffset = random(0, 100);

        beginShape();
        vertex(0, height);
        for (let x = 0; x <= width; x += 5) {
            let noiseValue = noise((x + noiseOffset) * noiseScale, i * noiseScale);
            let y = noiseValue * noiseStrength + yOffset;
            vertex(x, y);
        }
        vertex(width, height);
        endShape(CLOSE);
    }
}

function drawNightSky() {
    for (let y = 0; y < height / 3; y++) {
        let t = map(y, 0, height / 3, 0, 1);
        let skyColor = lerpColor(color(10, 10, 40), color(40, 60, 100), t);
        stroke(skyColor);
        line(0, y, width, y);
    }

    // draw stars
    for (let i = 0; i < 200; i++) {
        let starX = random(width);
        let starY = random(height / 3);
        let starSize = random(1, 3);
        noStroke();
        fill(255, 255, 255, random(150, 255));
        ellipse(starX, starY, starSize, starSize);
    }
}

function getLayerColor(layerIndex) {
    let color1 = color(desertColors[layerIndex % desertColors.length]);
    let color2 = color(desertColors[(layerIndex + 1) % desertColors.length]);

    let t = map(layerIndex, 0, numLayers, 0, 1);
    return lerpColor(color1, color2, t);
}