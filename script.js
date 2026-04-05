// constants
const MAROON = '#b23a3a';
const CYAN = '#00adef';

// Initialize Canvas
const canvas = new fabric.Canvas('networkCanvas', {
    width: window.innerWidth - 320,
    height: window.innerHeight,
    backgroundColor: '#ffffff'
});

/**
 * Renders a black junction dot at specific coordinates
 */
function drawJunction(x, y) {
    const circle = new fabric.Circle({ 
        radius: 8, 
        fill: 'black', 
        left: x, 
        top: y, 
        originX: 'center', 
        originY: 'center', 
        selectable: false 
    });
    canvas.add(circle);
}

/**
 * Creates the LTX Box with dynamic antennas
 */
function createLTX(x, y, label, linkType) {
    const rect = new fabric.Rect({ width: 220, height: 120, fill: MAROON, originX: 'center' });
    const text = new fabric.Text(label, { fontSize: 30, fontWeight: 'bold', top: 40, originX: 'center', fill: 'black' });
    
    const antennas = [];
    // Right-side antenna (standard for all)
    antennas.push(new fabric.Rect({ width: 14, height: 30, fill: 'black', top: -30, left: 60, originX: 'center' }));
    
    // Left-side antenna (Only for LTX Home when Cellular is selected)
    if (label === 'LTX Home' && linkType === 'Cellular') {
        antennas.push(new fabric.Rect({ width: 14, height: 30, fill: 'black', top: -30, left: -60, originX: 'center' }));
    }

    const group = new fabric.Group([rect, text, ...antennas], { left: x, top: y, selectable: true });
    canvas.add(group);
    return group;
}

/**
 * Draws the arched LoRa link - strictly only "LoRa" text
 */
function drawArchedLink(x1, x2, y, labelText) {
    const midX = (x1 + x2) / 2;
    const curveTop = y - 80;
    const path = new fabric.Path(`M ${x1} ${y} Q ${midX} ${curveTop} ${x2} ${y}`, {
        fill: '', 
        stroke: CYAN, 
        strokeWidth: 6, 
        strokeDashArray: [10, 5],
        selectable: false
    });
    
    const label = new fabric.Text(labelText, { 
        fontSize: 26, 
        fontWeight: 'bold', 
        fill: CYAN, 
        left: midX - 35, 
        top: curveTop - 25,
        selectable: false
    });
    canvas.add(path, label);
}

/**
 * MAIN GENERATION FUNCTION
 * Orchestrates the full map based on menu state
 */
function generateMap() {
    canvas.clear();
    const ltxIds = ['Home', '2', '3', '4'];
    let ltxObjs = {};

    ltxIds.forEach((id, idx) => {
        const checkbox = document.getElementById(`active-${id}`);
        if (!checkbox || !checkbox.checked) return;

        // Elements from your "perfect" menu
        const count = parseInt(document.getElementById(`count-${id}`).value) || 0;
        const link = document.getElementById(`link-${id}`).value;
        const sType = document.getElementById(`type-${id}`).value;

        const xPos = 100 + (idx * 380);
        const ltxLabel = id === 'Home' ? 'LTX Home' : `LTX ${id}`;
        
        const ltx = createLTX(xPos, 120, ltxLabel, link);
        ltxObjs[id] = ltx;

        // Logic for Communication Arch - Only LoRa
        if (id !== 'Home' && ltxObjs['Home'] && link === 'LoRa to Home') {
            drawArchedLink(ltx.left + 110, ltxObjs['Home'].left + 110, 120, 'LoRa');
        }

        const busY = 320;
        if (count > 0) {
            // 1. Vertical Drop from Box to Bus
            canvas.add(new fabric.Line([xPos + 110, 240, xPos + 110, busY], { stroke: 'black', strokeWidth: 5 }));
            drawJunction(xPos + 110, 240);
            drawJunction(xPos + 110, busY);

            // 2. Horizontal Bus Line
            canvas.add(new fabric.Line([xPos + 20, busY, xPos + 200, busY], { stroke: 'black', strokeWidth: 5 }));
            drawJunction(xPos + 20, busY);
            drawJunction(xPos + 200, busY);

            // 3. Sensor Grid (Max 3 per row)
            for (let i = 0; i < count; i++) {
                const row = Math.floor(i / 3);
                const col = i % 3;
                const sX = xPos + (col * 85) - 15;
                const sY = busY + 80 + (row * 150);

                const sensor = new fabric.Group([
                    new fabric.Rect({ width: 65, height: 100, fill: CYAN }),
                    new fabric.Text(`${sType} ${i+1}`, { fontSize: 13, angle: 90, left: 48, top: 15, fontWeight: 'bold' })
                ], { left: sX, top: sY });

                // 4. Wiring & Junction Logic
                if (row === 0) {
                    // Vertical to Bus
                    canvas.add(new fabric.Line([sX + 32, sY, sX + 32, busY], { stroke: 'black', strokeWidth: 5 }));
                    drawJunction(sX + 32, busY);
                } else {
                    // Vertical Daisy Chain to the bottom of the sensor above
                    const aboveBottom = sY - 50; 
                    canvas.add(new fabric.Line([sX + 32, sY, sX + 32, aboveBottom], { stroke: 'black', strokeWidth: 5 }));
                    drawJunction(sX + 32, aboveBottom);
                }
                
                drawJunction(sX + 32, sY); // Connection dot on sensor top
                canvas.add(sensor);
            }
        }
    });
}

// Ensure the generate button in your HTML triggers this
document.addEventListener('DOMContentLoaded', () => {
    // Looks for your "MAP" button
    const buttons = document.getElementsByTagName('button');
    for (let btn of buttons) {
        if (btn.innerText === 'MAP') {
            btn.onclick = generateMap;
        }
    }
});
