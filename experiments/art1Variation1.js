const gridSize = 10;
const variation = 3;
const direction = 0.1;
const numBands = 20;

function setup() {
    let size = min(600, 600);
    createCanvas(size, size);
    noLoop();
    angleMode(DEGREES);
}

function draw() {
    background(245, 240, 235);
    circles = [];
    
    let radiusStep = width / (2 * numBands);
    translate(width / 2, height / 2);

    for (let band = 0; band < numBands; band++) {
        let bandColor = getColor(band);
        fill(bandColor);
        noStroke();

        let innerRadius = band * radiusStep;
        let outerRadius = (band + 1) * radiusStep;

        // the next loop is created with help from ChatGPT
        // Create circular grid for the current band
        for (let angle = 0; angle < 360; angle += gridSize) {
            let randomRadius = random(innerRadius, outerRadius); // Random radius within the band
            let posX = randomRadius * cos(angle);
            let posY = randomRadius * sin(angle);
            
            let size = random(gridSize - variation, gridSize + variation); 
            let xOffset = random(-variation, variation);
            let yOffset = random(-variation, variation); 

            if (!isOverlapping(posX + xOffset, posY + yOffset, size / 2)) {
                ellipse(posX + xOffset, posY + yOffset, size);
                circles.push({ x: posX + xOffset, y: posY + yOffset, r: size / 2 });
            }
        }
    }
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
