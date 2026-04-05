// ... (Fabric.js canvas init and MAROON/CYAN constants remain same)

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
        const sType = document.getElementById(`type-${id}`).value;

        const ltxLabel = id === 'Home' ? 'LTX Home' : `LTX ${id}`;
        const ltx = createLTX(xPos, 120, ltxLabel, link);
        ltxObjs[id] = ltx;

        // FIXED: Only draw LoRa arch if "LoRa to Home" is selected. 
        // No Cellular arch will be drawn.
        if (id !== 'Home' && ltxObjs['Home'] && link === 'LoRa to Home') {
            drawArchedLink(ltx.left + 110, ltxObjs['Home'].left + 110, 120, 'LoRa');
        }

        const busY = 320;
        if (count > 0) {
            // Main Drop to Bus with Junctions
            canvas.add(new fabric.Line([xPos + 110, 240, xPos + 110, busY], { stroke: 'black', strokeWidth: 5 }));
            drawJunction(xPos + 110, 240);
            drawJunction(xPos + 110, busY);

            // Bus Line
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

                // Grid Wiring Logic
                if (row === 0) {
                    // Vertical to Bus
                    canvas.add(new fabric.Line([sX + 32, sY, sX + 32, busY], { stroke: 'black', strokeWidth: 5 }));
                    drawJunction(sX + 32, busY);
                } else {
                    // Vertical Daisy Chain to sensor above
                    const aboveBottom = sY - 50; 
                    canvas.add(new fabric.Line([sX + 32, sY, sX + 3
