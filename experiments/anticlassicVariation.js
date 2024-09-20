const gridSize = 10;
const variation = 8;
const numBands = 20;
let circles = [];

function setup() {
    createCanvas(600, 600);
    noLoop();
}

function draw() {
    background(240, 230, 220);
    circles = [];

    let bandWidth = width / numBands;

    for (let y = 0; y < height; y += random(gridSize / 2, gridSize * 2)) {
        let taperAmount = calculateTaper(y);
        let xStart = taperAmount / random(2, 5);

        for (let band = 0; band < numBands; band++) {
            let bandColor = color(random(255), random(255), random(255), random(100, 255));
            fill(bandColor);
            strokeWeight(random(0, 3));
            stroke(random(50, 255), random(50, 255), random(50, 255), random(100, 200));

            for (let x = xStart + band * bandWidth; x < xStart + (band + 1) * bandWidth; x += random(gridSize / 2, gridSize * 2)) {
                let size = random(gridSize - variation, gridSize + variation);
                let xOffset = random(-variation, variation);
                let yOffset = random(-variation, variation);
                let posX = x + xOffset;
                let posY = y + yOffset;

                if (!isOverlapping(posX, posY, size / 2)) {
                    ellipse(posX, posY, size);
                    circles.push({ x: posX, y: posY, r: size / 2 });
                }
            }
        }
    }
}

function calculateTaper(y) {
    return (y / height) * (width * random(0.1, 0.5));
}

function getColor(band) {
    let colors = ['#F28E36', '#D8352A', '#35477D', '#45B8AC', '#F5E663'];
    return colors[band % colors.length];
}

function isOverlapping(x, y, r) {
    for (let i = 0; i < circles.length; i++) {
        let other = circles[i];
        let distance = dist(x, y, other.x, other.y);
        if (distance < r + other.r) {
            return true;
        }
    }
    return false;
}