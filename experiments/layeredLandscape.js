let numLayers = 10;
let layerHeight;
let noiseScale = 0.003; 
let noiseStrength = 100; 

function setup() {
    createCanvas(600, 600);
    noLoop();

    noiseSeed(10);

    layerHeight = height / numLayers + 50;
}

function draw() {
    background(245, 240, 235);

    for (let i = 0; i < numLayers; i++) {
        let yOffset = i * layerHeight;
        let colorValue = map(i, 0, numLayers, 0, 255);
        fill(colorValue);
        noStroke();

        let noiseOffset = random(0, 1000);

        beginShape();
        vertex(0, height);
        for (let x = 0; x <= width; x += 5) {
            let y = noise((x + noiseOffset) * noiseScale, i * noiseScale) * noiseStrength + yOffset;
            vertex(x, y);
        }
        vertex(width, height);
        endShape(CLOSE);
    }
}