const canvas = new fabric.Canvas('networkCanvas', {
    width: window.innerWidth - 320,
    height: window.innerHeight,
    backgroundColor: '#ffffff'
});

const MAROON = '#b23a3a';
const CYAN = '#00adef';

function drawJunction(x, y) {
    const circle = new fabric.Circle({ 
        radius: 8, fill: 'black', left: x, top: y, 
        originX: 'center', originY: 'center', selectable: false 
    });
    canvas.add(circle);
}

function createLTX(x, y, label, linkType) {
    const rect = new fabric.Rect({ width: 220, height: 120, fill: MAROON, originX: 'center' });
    const text = new fabric.Text(label, { fontSize: 30, fontWeight: 'bold', top: 40, originX: 'center' });
    
    // Antennas: Offset to the right as shown in your "correct" example
    const antennas = [];
    antennas.push(new fabric.Rect({ width: 14, height: 30, fill: 'black', top: -30, left: 60, originX: 'center' }));
    
    // Only LTX Home gets the second Cellular antenna
    if (label === 'LTX Home' && linkType === 'Cellular') {
        antennas.push(new fabric.Rect({ width: 14, height: 30, fill: 'black', top: -30, left: 100, originX: 'center' }));
    }

    const group = new fabric.Group([rect, text, ...antennas], { left: x, top: y });
    canvas.add(group);
    return group;
}

function generateMap() {
    canvas.clear();
    const ltxIds = ['Home', '2', '3', '4'];
    let ltxObjs = {};

    ltxIds.forEach((id, idx) => {
        const checkbox = document.getElementById(`active-${id}`);
        if (!checkbox || !checkbox.checked) return;

        const xPos = 100 + (idx * 380);
        const count = parseInt(document.getElementById(`count-${id}`).value);
        const link = document.getElementById(`link-${id}`).value;
        const proto = document.getElementById(`proto-${id}`).value;
        const sType = document.getElementById(`type-${id}`).value;

        const ltxLabel = id === 'Home' ? 'LTX Home' : `LTX ${id}`;
        const ltx = createLTX(xPos, 120, ltxLabel, link);
        ltxObjs[id] = ltx;

        // Correct Link Logic: No overlapping text; only LoRa/Wired arches
        if (id !== 'Home' && ltxObjs['Home']) {
            if (link === 'LoRa to Home') {
                drawArchedLink(ltx.left + 110, ltxObjs['Home'].left + 110, 120, 'LoRa');
            } else if (link === 'Wired') {
                drawArchedLink(ltx.left + 110, ltxObjs['Home'].left + 110, 240, 'Wired', true);
            }
        }

        const busY = 320;
        if (count > 0) {
            // Main Drop to Bus
            canvas.add(new fabric.Line([xPos + 110, 240, xPos + 110, busY], { stroke: 'black', strokeWidth: 5 }));
            drawJunction(xPos + 110, 240);
            drawJunction(xPos + 110, busY);

            // Horizontal Bus - correctly sized for 3 columns
            canvas.add(new fabric.Line([xPos + 20, busY, xPos + 200, busY], { stroke: 'black', strokeWidth: 5 }));
            drawJunction(xPos + 20, busY);
            drawJunction(xPos + 200, busY);

            for (let i = 0; i < count; i++) {
                const row = Math.floor(i / 3);
                const col = i % 3;
                const sX = xPos + (col * 85) - 15;
                const sY = busY + 80 + (row * 150);

                const sensor = new fabric.Group([
                    new fabric.Rect({ width: 65, height: 100, fill: CYAN }),
                    new fabric.Text(`${sType} ${i+1}`, { fontSize: 13, angle: 90, left: 48, top: 15, fontWeight: 'bold' })
                ], { left: sX, top: sY });

                // Wiring Fixes based on green circles
                if (row === 0) {
                    canvas.add(new fabric.Line([sX + 32, sY, sX + 32, busY], { stroke: 'black', strokeWidth: 5 }));
                    drawJunction(sX + 32, busY);
                } else {
                    // Vertical daisy chain link
                    const prevBottom = sY - 50; 
                    canvas.add(new fabric.Line([sX + 32, sY, sX + 32, prevBottom], { stroke: 'black', strokeWidth: 5 }));
                    drawJunction(sX + 32, prevBottom);
                }
                
                drawJunction(sX + 32, sY); // Connection to sensor top
                canvas.add(sensor);
            }
        }
    });
}

function drawArchedLink(x1, x2, y, labelText, isBottom = false) {
    const midX = (x1 + x2) / 2;
    const curveHeight = isBottom ? y + 80 : y - 80;
    const path = new fabric.Path(`M ${x1} ${y} Q ${midX} ${curveHeight} ${x2} ${y}`, {
        fill: '', stroke: CYAN, strokeWidth: 6, strokeDashArray: [10, 5]
    });
    const label = new fabric.Text(labelText, { 
        fontSize: 24, fontWeight: 'bold', fill: CYAN, left: midX - 25, top: curveHeight - 20 
    });
    canvas.add(path, label);
}
