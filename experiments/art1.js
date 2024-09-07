const gridSize = 10;
const variation = 3;
const direction = 0.1;
const numBands = 20;

function setup() {
    createCanvas(innerHeight, innerWidth);
    noLoop(); 
}

function draw() {
    background(245, 240, 235);
    circles = [];

    let bandWidth = width / numBands;
    // next lines are created with help of chatGPT to for the direction af the taper 
    for (let y = 0; y < height; y += gridSize) {
        let taperAmount = calculateTaper(y); 
        let xStart = taperAmount / 2;

    for (let band = 0; band < numBands; band++) {
        let bandColor = getColor(band); 
        fill(bandColor);
        noStroke();

      // this part where created with help of ChatGPT, Loop through each cell in the current band
    for (let x = xStart + band * bandWidth; x < xStart + (band + 1) * bandWidth; x += gridSize) {
        let size = random(gridSize - variation, gridSize + variation); // Random circle size
        let xOffset = random(-variation, variation); // Random horizontal offset
        let yOffset = random(-variation, variation); // Random vertical offset
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
    let taper = (y / height) * (width * direction);
    return taper;
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

