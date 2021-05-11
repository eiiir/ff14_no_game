const EnemyGenE12S = {

    phase: 0,
    role: 0, // 0-3 => 獅子 | 4-7 => 無職
    handMode: 0,
    lions: [1, 7, 9, 15],
    stock: [false, false, false, false], // 青緑紫赤
    crystals: [
        { color: "lightblue", x: 30, y: 10 },
        { color: "lightgreen", x: 100, y: 10 },
        { color: "purple", x: 480, y: 10 },
        { color: "red", x: 555, y: 10 }
    ],
    deadlySwamps: [],

    initStock: () => {
        const r = Math.floor(Math.random() * 5);
        const patterns = [
            [true, true, false, false],
            [true, false, true, false],
            [true, false, false, true],
            [false, true, true, false],
            [false, false, true, true]
        ];
        EnemyGenE12S.stock = patterns[r];
    },

    initialize: () => {
        while (fieldDom.children.length > 2) {
            fieldDom.removeChild(fieldDom.children[1]);
        }
        EnemyGenE12S.phase = 0;
        EnemyGenE12S.role = Math.floor(Math.random() * 8);
        EnemyGenE12S.handMode = Math.floor(Math.random() * 2);
        fieldDom.style.borderRadius = "50%";
        EnemyGenE12S.addCircle();
        for(let i = 0; i < 16; i++) {
            EnemyGenE12S.addLine(i);
        }
        EnemyGenE12S.addLion(1, 10);
        EnemyGenE12S.addLion(4, 20);
        EnemyGenE12S.addLion(7, 10);
        EnemyGenE12S.addLion(9, 10);
        EnemyGenE12S.addLion(12, 20);
        EnemyGenE12S.addLion(15, 10);
        for (crystal of EnemyGenE12S.crystals) {
            EnemyGenE12S.addCrystal(crystal.color, crystal.x, crystal.y);
        }
        EnemyGenE12S.initStock();
        speed = 1.2;
        EnemyGenE12S.deadlySwamps = [];
    },

    maybeAddEnemy: (fieldDom) => {
        if (!initialized) {
            EnemyGenE12S.initialize(fieldDom);
            initialize();
      }
      EnemyGenE12S.addTimeline();
      EnemyGenE12S.checkAlive();
    },

    checkAlive: () => {
        const x = (player.x - 300) / 15;
        const y = (player.y - 300) / 15;

        // 外周
        if (x*x + y*y >= 20*20) {
            endGame();
        }

        // 沼
        EnemyGenE12S.deadlySwamps.forEach(({x, y}) => {
            const d = Math.sqrt((player.x - x) * (player.x - x) + (player.y - y) * (player.y - y)) / 15;
            if (d <= 5) {
                endGame();
            }
        });
    },

    addTimeline: () => {
        const time = Date.now() - startTime;

        EnemyGenE12S.updateTether();

        if (EnemyGenE12S.phase === 0 && time >= 3000) {
            EnemyGenE12S.addStock();
            EnemyGenE12S.addHand(EnemyGenE12S.handMode);
            EnemyGenE12S.addTether();
            EnemyGenE12S.phase = 1;
        }
        else if (EnemyGenE12S.phase === 1 && time >= 11000) {
            EnemyGenE12S.addBreaths(0);
            EnemyGenE12S.phase = 2;
        }
        else if (EnemyGenE12S.phase === 2 && time >= 12000) {
            EnemyGenE12S.addFukitobashi();
            EnemyGenE12S.phase = 3;
        }
        else if (EnemyGenE12S.phase === 3 && time >= 20000) {
            EnemyGenE12S.addBreaths(1);
            EnemyGenE12S.phase = 4;
        }
        else if (EnemyGenE12S.phase === 4 && time >= 25000) {
            EnemyGenE12S.addRelease();
            EnemyGenE12S.phase = 5;
        }
        else if (EnemyGenE12S.phase === 5 && time >= 29000) {
            EnemyGenE12S.addBreaths(2);
            EnemyGenE12S.addHand(Math.floor(Math.random() * 2));
            EnemyGenE12S.phase = 6;
        }
        else if (EnemyGenE12S.phase === 6 && time >= 37000) {
            EnemyGenE12S.addBreaths(3);
            EnemyGenE12S.phase = 7;
        }
    },

    addStock: () => {
        for (let i = 0; i < 4; i++) {
            if (EnemyGenE12S.stock[i]) {
                const crystal = EnemyGenE12S.crystals[i];
                const endX = crystal.x + 15;
                const endY = crystal.y + 15;
                const startX = 300;
                const startY = 300;

                const x = endX - startX;
                const y = endY - startY;
                const rotdeg = Math.atan2(y, x) / Math.PI * 180;

                const length = Math.sqrt(x*x + y*y);

                const line = document.createElement("div");
                line.style.width = `${length}px`;
                line.style.height = `2px`;
                line.style.backgroundColor = crystal.color;
                line.style.left = `${startX}px`;
                line.style.top = `${startY - 1}px`;
                line.style.display = "inline-block";
                line.style.position = "absolute";
                line.style.transformOrigin = "left center";
                line.style.transform = `rotate(${rotdeg}deg)`;
                fieldDom.appendChild(line);
                setTimeout(() => {
                    fieldDom.removeChild(line);
                }, 8000);
            }
        }
    },

    addRelease: () => {
        for (let i = 0; i < 4; i++) {
            if (EnemyGenE12S.stock[i]) {
                if (i === 0) {
                    const circle = document.createElement("div");
                    circle.style.width = `600px`;
                    circle.style.height = `600px`;
                    circle.style.left = `0px`;
                    circle.style.top = `0px`;
                    circle.style.borderRadius = `300px`;
                    circle.style.display = "inline-block";
                    circle.style.position = "absolute";
                    circle.style.backgroundImage = `linear-gradient(
                        to right,
                        rgba(255,105,0, 0.5) 0,
                        rgba(255,105,0, 0.5) 37.5%,
                        rgba(0, 0, 0, 0) 37.5%,
                        rgba(0, 0, 0, 0) 62.5%,
                        rgba(255,105,0, 0.5) 62.5%,
                        rgba(255,105,0, 0.5) 100%
                    )`;
                    fieldDom.appendChild(circle);
                    setTimeout(() => {
                        fieldDom.removeChild(circle);
                    }, 500);
                    setTimeout(() => {
                        const x = (player.x - 300) / 15;
                        const y = (player.y - 300) / 15;
                        if (x <= -5 || x >= 5) {
                            endGame();
                        }
                    }, 10);
                }
                else if (i === 1) {
                    const circle = document.createElement("div");
                    circle.style.width = `600px`;
                    circle.style.height = `600px`;
                    circle.style.left = `0px`;
                    circle.style.top = `0px`;
                    circle.style.borderRadius = `300px`;
                    circle.style.display = "inline-block";
                    circle.style.position = "absolute";
                    circle.style.backgroundImage = `conic-gradient(
                        rgba(255,105,0, 0.5) 0,
                        rgba(255,105,0, 0.5) 6.25%,
                        rgba(0, 0, 0, 0) 6.25%,
                        rgba(0, 0, 0, 0) 18.75%,
                        rgba(255,105,0, 0.5) 18.75%,
                        rgba(255,105,0, 0.5) 31.25%,
                        rgba(0, 0, 0, 0) 31.25%,
                        rgba(0, 0, 0, 0) 43.75%,
                        rgba(255,105,0, 0.5) 43.75%,
                        rgba(255,105,0, 0.5) 56.25%,
                        rgba(0, 0, 0, 0) 56.25%,
                        rgba(0, 0, 0, 0) 68.75%,
                        rgba(255,105,0, 0.5) 68.75%,
                        rgba(255,105,0, 0.5) 81.25%,
                        rgba(0, 0, 0, 0) 81.25%,
                        rgba(0, 0, 0, 0) 93.75%,
                        rgba(255,105,0, 0.5) 93.75%,
                        rgba(255,105,0, 0.5) 100%
                    )`;
                    fieldDom.appendChild(circle);
                    setTimeout(() => {
                        fieldDom.removeChild(circle);
                    }, 500);
                    setTimeout(() => {
                        const x = (player.x - 300) / 15;
                        const y = (player.y - 300) / 15;
                        const rad = Math.acos(x / Math.sqrt(x*x + y*y));
                        if (rad <= Math.PI / 8 || rad >= Math.PI * 3 / 8 && rad <= Math.PI * 5 / 8 || rad >= Math.PI * 7 / 8) {
                            endGame();
                        }
                    }, 10);
                }
                else if (i === 2) {
                    const circle = document.createElement("div");
                    circle.style.width = `300px`;
                    circle.style.height = `300px`;
                    circle.style.backgroundColor = "rgba(255,105,0, 0.5)";
                    circle.style.left = `150px`;
                    circle.style.top = `150px`;
                    circle.style.borderRadius = `150px`;
                    circle.style.display = "inline-block";
                    circle.style.position = "absolute";
                    fieldDom.appendChild(circle);
                    setTimeout(() => {
                        fieldDom.removeChild(circle);
                    }, 500);
                    setTimeout(() => {
                        const x = (player.x - 300) / 15;
                        const y = (player.y - 300) / 15;
                        if (x*x+y*y <= 10*10) {
                            endGame();
                        }
                    }, 10);
                }
                else if (i === 3) {
                    const circle = document.createElement("div");
                    circle.style.width = `600px`;
                    circle.style.height = `600px`;
                    circle.style.left = `0px`;
                    circle.style.top = `0px`;
                    circle.style.borderRadius = `300px`;
                    circle.style.display = "inline-block";
                    circle.style.position = "absolute";
                    circle.style.backgroundImage = `conic-gradient(
                        rgba(255,105,0, 0.5) 0,
                        rgba(255,105,0, 0.5) 21%,
                        rgba(0, 0, 0, 0) 21%,
                        rgba(0, 0, 0, 0) 29%,
                        rgba(255,105,0, 0.5) 29%,
                        rgba(255,105,0, 0.5) 71%,
                        rgba(0, 0, 0, 0) 71%,
                        rgba(0, 0, 0, 0) 79%,
                        rgba(255,105,0, 0.5) 79%,
                        rgba(255,105,0, 0.5) 100%
                    )`;
                    fieldDom.appendChild(circle);
                    setTimeout(() => {
                        fieldDom.removeChild(circle);
                    }, 500);
                    setTimeout(() => {
                        const x = (player.x - 300) / 15;
                        const y = (player.y - 300) / 15;
                        const rad = Math.acos(x / Math.sqrt(x*x + y*y));
                        if (rad >= Math.PI / 12 && rad <= Math.PI * 11 / 12) {
                            endGame();
                        }
                    }, 10);
                }
            }
        }
    },

    addLine: (rot) => {
        const line = document.createElement("div");
        line.style.width = `300px`;
        line.style.height = `2px`;
        line.style.backgroundColor = "darkgray";
        line.style.left = `300px`;
        line.style.top = `299px`;
        line.style.display = "inline-block";
        line.style.position = "absolute";
        line.style.transformOrigin = "left center";
        line.style.transform = `rotate(${rot * 22.5}deg)`;
        fieldDom.appendChild(line);
    },

    addCrystal: (color, x, y) => {
        const circle = document.createElement("div");
        circle.style.width = `30px`;
        circle.style.height = `30px`;
        circle.style.left = `${x}px`;
        circle.style.top = `${y}px`;
        circle.style.borderRadius = `15px`;
        circle.style.display = "inline-block";
        circle.style.position = "absolute";
        circle.style.backgroundColor = color;
        fieldDom.appendChild(circle);
    },

    addFukitobashi: () => {
        const circle = document.createElement("div");
        circle.style.width = `600px`;
        circle.style.height = `600px`;
        circle.style.left = `0px`;
        circle.style.top = `0px`;
        circle.style.borderRadius = `300px`;
        circle.style.display = "inline-block";
        circle.style.position = "absolute";
        circle.style.background = `radial-gradient(circle at center, rgba(255,105,0, 0.5) 0, rgba(255,255,0, 0.5), rgba(255,105,0, 0.5), rgba(255,255,0, 0.5) 100%)`;
        fieldDom.appendChild(circle);
        setTimeout(() => {
            fieldDom.removeChild(circle);
            if (surecastBuff > 0) return;
            // 吹き飛ばし 15m = 225px
            // 中央 (300, 300)
            const theta = Math.atan2(player.y - 300, player.x - 300);
            const dx = 225 * Math.cos(theta);
            const dy = 225 * Math.sin(theta);
            player.x = player.x + dx;
            player.y = player.y + dy;
        }, 5000);
    },

    addCircle: () => {
        const circle = document.createElement("div");
        circle.style.width = `300px`;
        circle.style.height = `300px`;
        circle.style.backgroundColor = "lightgray";
        circle.style.left = `150px`;
        circle.style.top = `150px`;
        circle.style.borderRadius = `150px`;
        circle.style.borderColor = "darkgray"
        circle.style.borderWidth = "2px";
        circle.style.display = "inline-block";
        circle.style.position = "absolute";
        fieldDom.appendChild(circle);
    },

    addLion: (rot, size) => {
        const left = 300 - size + (300 - size) * Math.cos(Math.PI / 8 * rot);
        const top = 300 - size + (300 - size) * Math.sin(Math.PI / 8 * rot);
        const enemy = document.createElement("div");
        enemy.style.borderRadius = `${size}px`;
        enemy.style.width = `${size * 2}px`;
        enemy.style.height = `${size * 2}px`;
        enemy.style.backgroundColor = "orange";
        enemy.style.left = `${left}px`;
        enemy.style.top = `${top}px`;
        enemy.style.display = "inline-block";
        enemy.style.position = "absolute";
        fieldDom.appendChild(enemy);
    },

    distance: (x1, y1, x2, y2) => {
        const x = x1 - x2;
        const y = y1 - y2;
        return Math.sqrt(x*x + y*y);
    },

    addBreaths: (num) => {
        // 小獅子
        for (let i = 0; i < 4; i++) {
            const correctPos = [
                [
                    { x: 300 + 120 * Math.cos(Math.PI / 8 * 1), y: 300 + 120 * Math.sin(Math.PI / 8 * 1) }, 
                    { x: 300 + 150 * Math.cos(Math.PI / 8 * 4), y: 300 + 150 * Math.sin(Math.PI / 8 * 4) },
                    { x: 300 + 150 * Math.cos(Math.PI / 8 * 12), y: 300 + 150 * Math.sin(Math.PI / 8 * 12) },
                    { x: 300 + 120 * Math.cos(Math.PI / 8 * 15), y: 300 + 120 * Math.sin(Math.PI / 8 * 15) }
                ],
                [
                    { x: 300 + 150 * Math.cos(Math.PI / 8 * 4), y: 300 + 150 * Math.sin(Math.PI / 8 * 4)  },
                    { x: 300 + 120 * Math.cos(Math.PI / 8 * 7), y: 300 + 120 * Math.sin(Math.PI / 8 * 7)  },
                    { x: 300 + 120 * Math.cos(Math.PI / 8 * 9), y: 300 + 120 * Math.sin(Math.PI / 8 * 9)  },
                    { x: 300 + 150 * Math.cos(Math.PI / 8 * 12), y: 300 + 150 * Math.sin(Math.PI / 8 * 12)  }
                ]
            ][EnemyGenE12S.handMode ^ (num >= 2 ? 1 : 0)][i];
            const target = (i === EnemyGenE12S.role) ? player : correctPos;
            console.log(i);
            console.log(target);

            const rot = EnemyGenE12S.lions[i];
            console.log(rot);
            const centerX = 300 + 290 * Math.cos(Math.PI / 8 * rot);
            const centerY = 300 + 290 * Math.sin(Math.PI / 8 * rot);
            EnemyGenE12S.addBreath(centerX, centerY, target.x, target.y, num, i === EnemyGenE12S.role ? correctPos : null);
        }

        // 大獅子
        const d1 = EnemyGenE12S.distance(player.x, player.y, 300, 10);
        {
            const pos = [
                [
                    { x: 300 - 45, y: 10 + 10 },
                    { x: 300 - 75, y: 10 + 70 },
                    { x: 300 + 45, y: 10 + 10 },
                    { x: 300 + 75, y: 10 + 70 }
                ],
                [
                    { x: 300 + 45, y: 10 + 10 },
                    { x: 300 + 75, y: 10 + 70 },
                    { x: 300 - 45, y: 10 + 10 },
                    { x: 300 - 75, y: 10 + 70 }
                ]
            ][EnemyGenE12S.handMode][num];
            if (d1 < 130) {
                EnemyGenE12S.addBreath(300, 10, player.x, player.y, num, pos);
                EnemyGenE12S.addSwamp(player.x, player.y);
            } else {
                EnemyGenE12S.addBreath(300, 10, pos.x, pos.y, num, null);
                EnemyGenE12S.addSwamp(pos.x, pos.y);
            }
        }
        {
            const pos = [
                [
                    { x: 300 - 45, y: 600 - 10 },
                    { x: 300 - 75, y: 600 - 70 },
                    { x: 300 + 45, y: 600 - 10 },
                    { x: 300 + 75, y: 600 - 70 }
                ],
                [
                    { x: 300 + 45, y: 600 - 10 },
                    { x: 300 + 75, y: 600 - 70 },
                    { x: 300 - 45, y: 600 - 10 },
                    { x: 300 - 75, y: 600 - 70 }
                ],
            ][EnemyGenE12S.handMode][num];
            const d2 = EnemyGenE12S.distance(player.x, player.y, 300, 590);
            if (d2 < 130) {
                EnemyGenE12S.addBreath(300, 590, player.x, player.y, num, pos);
                EnemyGenE12S.addSwamp(player.x, player.y);
            } else {
                EnemyGenE12S.addBreath(300, 590, pos.x, pos.y, num, null);
                EnemyGenE12S.addSwamp(pos.x, pos.y);
            }
        }
    },

    addSwamp: (x, y) => {
        const circle = document.createElement("div");
        circle.style.width = `150px`;
        circle.style.height = `150px`;
        circle.style.backgroundColor = "rgba(255, 110, 110, 0.5)";
        circle.style.left = `${x - 75}px`;
        circle.style.top = `${y - 75}px`;
        circle.style.borderRadius = `75px`;
        circle.style.display = "inline-block";
        circle.style.position = "absolute";
        fieldDom.appendChild(circle);
        setTimeout(() => {
            EnemyGenE12S.deadlySwamps.push({x, y});
        }, 2000);
    },

    addBreath: (centerX, centerY, targetX, targetY, num, correctPos) => {
        console.log(targetY, centerY, targetX, centerX);
        const rotdeg = Math.atan2(targetY - centerY, targetX - centerX) / Math.PI * 180;
        console.log(rotdeg);
        let startPercent = Math.round((90 + rotdeg - 15) / 360 * 100);
        let endPercent = Math.round((90 + rotdeg + 15) / 360 * 100);
        console.log(startPercent);
        console.log(endPercent);

        if (startPercent < 0 && endPercent < 0) {
            startPercent += 100;
            endPercent += 100;
        }

        const circle = document.createElement("div");
        circle.style.width = `1200px`;
        circle.style.height = `1200px`;
        circle.style.left = `${centerX - 600}px`;
        circle.style.top = `${centerY - 600}px`;
        circle.style.borderRadius = `600px`;
        circle.style.borderColor = "red"
        circle.style.borderWidth = "2px";
        circle.style.display = "inline-block";
        circle.style.position = "absolute";

        if (startPercent < 0) {
            const bgImage = `conic-gradient(
                rgba(255,105,0, 0.5) 0,
                rgba(255,105,0, 0.5) ${endPercent}%,
                rgba(0, 0, 0, 0) ${endPercent}%,
                rgba(0, 0, 0, 0) ${100 + startPercent}%,
                rgba(255,105,0, 0.5) ${100 + startPercent}%,
                rgba(255,105,0, 0.5) 100%
            )`;
            console.log(bgImage);
            circle.style.backgroundImage = bgImage;
        }
        else if (endPercent > 100) {
            const bgImage = `conic-gradient(
                rgba(255,105,0, 0.5) 0,
                rgba(255,105,0, 0.5) ${endPercent - 100}%,
                rgba(0, 0, 0, 0) ${endPercent - 100}%,
                rgba(0, 0, 0, 0) ${startPercent}%,
                rgba(255,105,0, 0.5) ${startPercent}%,
                rgba(255,105,0, 0.5) 100%
            )`;
            console.log(bgImage);
            circle.style.backgroundImage = bgImage;
        }
        else {
            const bgImage = `conic-gradient(
                rgba(0, 0, 0, 0) 0,
                rgba(0, 0, 0, 0) ${startPercent}%,
                rgba(255,105,0, 0.5) ${startPercent}%,
                rgba(255,105,0, 0.5) ${endPercent}%,
                rgba(0, 0, 0, 0) ${endPercent}%,
                rgba(0, 0, 0, 0) 100%
            )`;
            circle.style.backgroundImage = bgImage;
        }

        fieldDom.appendChild(circle);
        setTimeout(() => {
            fieldDom.removeChild(circle);
        }, 1000);
        setTimeout(() => {
            if (correctPos) {
                const dpsPos = [
                    [
                        { x: 300 + 120 * Math.cos(Math.PI / 8 * 1), y: 300 + 120 * Math.sin(Math.PI / 8 * 1) }, 
                        { x: 300 + 150 * Math.cos(Math.PI / 8 * 4), y: 300 + 150 * Math.sin(Math.PI / 8 * 4) },
                        { x: 300 + 150 * Math.cos(Math.PI / 8 * 12), y: 300 + 150 * Math.sin(Math.PI / 8 * 12) },
                        { x: 300 + 120 * Math.cos(Math.PI / 8 * 15), y: 300 + 120 * Math.sin(Math.PI / 8 * 15) },
                        { x: 300 + 150 * Math.cos(Math.PI / 8 * 0), y: 300 + 150 * Math.sin(Math.PI / 8 * 0) },
                    ],
                    [
                        { x: 300 + 150 * Math.cos(Math.PI / 8 * 4), y: 300 + 150 * Math.sin(Math.PI / 8 * 4)  },
                        { x: 300 + 120 * Math.cos(Math.PI / 8 * 7), y: 300 + 120 * Math.sin(Math.PI / 8 * 7)  },
                        { x: 300 + 120 * Math.cos(Math.PI / 8 * 9), y: 300 + 120 * Math.sin(Math.PI / 8 * 9)  },
                        { x: 300 + 150 * Math.cos(Math.PI / 8 * 12), y: 300 + 150 * Math.sin(Math.PI / 8 * 12)  },
                        { x: 300 + 150 * Math.cos(Math.PI / 8 * 8), y: 300 + 150 * Math.sin(Math.PI / 8 * 8) },
                    ]
                ][EnemyGenE12S.handMode ^ (num >= 2 ? 1 : 0)];
                console.log("B", correctPos.x, correctPos.y);
                dpsPos.forEach(({x, y}) => {
                    console.log("C", x, y);
                    if (correctPos.x === x && correctPos.y === y) { return; }
                    const hisrotdeg = Math.atan2(y - centerY, x - centerX) / Math.PI * 180;
                    console.log("A", rotdeg, hisrotdeg);
                    if (Math.abs(rotdeg - hisrotdeg) <= 15 || Math.abs(rotdeg - hisrotdeg) >= 360-15) {
                        endGame();
                    }
                });
                {
                    const {x, y} = [
                        [
                            { x: 300 - 45, y: 10 + 10 },
                            { x: 300 - 75, y: 10 + 70 },
                            { x: 300 + 45, y: 10 + 10 },
                            { x: 300 + 75, y: 10 + 70 }
                        ],
                        [
                            { x: 300 + 45, y: 10 + 10 },
                            { x: 300 + 75, y: 10 + 70 },
                            { x: 300 - 45, y: 10 + 10 },
                            { x: 300 - 75, y: 10 + 70 }
                        ]
                    ][EnemyGenE12S.handMode][num];
                    const hisrotdeg = Math.atan2(y - centerY, x - centerX) / Math.PI * 180;
                    if (Math.abs(rotdeg - hisrotdeg) <= 15 || Math.abs(rotdeg - hisrotdeg) >= 360-15) {
                        hitCount += 1;
                    }
                }
                {
                    const {x, y} = [
                        [
                            { x: 300 - 45, y: 600 - 10 },
                            { x: 300 - 75, y: 600 - 70 },
                            { x: 300 + 45, y: 600 - 10 },
                            { x: 300 + 75, y: 600 - 70 }
                        ],
                        [
                            { x: 300 + 45, y: 600 - 10 },
                            { x: 300 + 75, y: 600 - 70 },
                            { x: 300 - 45, y: 600 - 10 },
                            { x: 300 - 75, y: 600 - 70 }
                        ],
                    ][EnemyGenE12S.handMode][num];
                    const hisrotdeg = Math.atan2(y - centerY, x - centerX) / Math.PI * 180;
                    if (Math.abs(rotdeg - hisrotdeg) <= 15 || Math.abs(rotdeg - hisrotdeg) >= 360-15) {
                        hitCount += 1;
                    }
                }
            } else {
                const myrotdeg = Math.atan2(player.y - centerY, player.x - centerX) / Math.PI * 180;
                console.log(rotdeg, myrotdeg);
                if (Math.abs(rotdeg - myrotdeg) <= 15 || Math.abs(rotdeg - myrotdeg) >= 360-15) {
                    endGame();
                }
            }
        }, 10);
    },

    addHand: (side) => {
        const circle = document.createElement("div");
        circle.style.width = `600px`;
        circle.style.height = `600px`;
        circle.style.left = `0px`;
        circle.style.top = `0px`;
        circle.style.borderRadius = `300px`;
        circle.style.borderColor = "red"
        circle.style.borderWidth = "2px";
        circle.style.display = "inline-block";
        circle.style.position = "absolute";

        if (side === 0) {
            circle.style.backgroundImage = `conic-gradient(
                rgba(255,165,0, 0.5) 0,
                rgba(255,165,0, 0.5) 6%,
                rgba(0, 0, 0, 0) 6%,
                rgba(0, 0, 0, 0) 44%,
                rgba(255,165,0, 0.5) 44%,
                rgba(255,165,0, 0.5) 100%
            )`;
        } else {
            circle.style.backgroundImage = `conic-gradient(
                rgba(255,165,0, 0.5) 0,
                rgba(255,165,0, 0.5) 56%,
                rgba(0, 0, 0, 0) 56%,
                rgba(0, 0, 0, 0) 94%,
                rgba(255,165,0, 0.5) 94%,
                rgba(255,165,0, 0.5) 100%
            )`;
        }
        setTimeout(() => {
            fieldDom.removeChild(circle);
            if (side === 0) {
                const x = (player.x - 300) / 15;
                const y = (player.y - 300) / 15;
                const rad = Math.acos(x / Math.sqrt(x*x + y*y));
                if (rad >= Math.PI * 5 / 12) {
                    endGame();
                }
            } else {
                const x = (player.x - 300) / 15;
                const y = (player.y - 300) / 15;
                const rad = Math.acos(x / Math.sqrt(x*x + y*y));
                if (rad <= Math.PI * 7 / 12) {
                    endGame();
                }
            }
        }, 4000);
        fieldDom.appendChild(circle);

    },

    tether: null,

    addTether: () => {
        if (EnemyGenE12S.role >= 4) {
            return;
        }
        const rot = EnemyGenE12S.lions[EnemyGenE12S.role];
        const endX = 300 + 300 * Math.cos(Math.PI / 8 * rot);
        const endY = 300 + 300 * Math.sin(Math.PI / 8 * rot);
        const startX = player.x;
        const startY = player.y;
        
        const x = endX - startX;
        const y = endY - startY;
        const rotdeg = Math.atan2(y, x) / Math.PI * 180;

        const length = Math.sqrt(x*x + y*y);

        const line = document.createElement("div");
        line.style.width = `${length}px`;
        line.style.height = `2px`;
        line.style.backgroundColor = "orange";
        line.style.left = `${startX}px`;
        line.style.top = `${startY - 1}px`;
        line.style.display = "inline-block";
        line.style.position = "absolute";
        line.style.transformOrigin = "left center";
        line.style.transform = `rotate(${rotdeg}deg)`;
        fieldDom.appendChild(line);
        EnemyGenE12S.tether = line;
    },

    updateTether: () => {
        if (EnemyGenE12S.tether == null) {
            return;
        }
        if (EnemyGenE12S.role >= 4) {
            return;
        }
        const rot = EnemyGenE12S.lions[EnemyGenE12S.role];
        const endX = 300 + 290 * Math.cos(Math.PI / 8 * rot);
        const endY = 300 + 290 * Math.sin(Math.PI / 8 * rot);
        const startX = player.x;
        const startY = player.y;
        
        const x = endX - startX;
        const y = endY - startY;
        const rotdeg = Math.atan2(y, x) / Math.PI * 180;

        const length = Math.sqrt(x*x + y*y);

        EnemyGenE12S.tether.style.width = `${length}px`;
        EnemyGenE12S.tether.style.left = `${startX}px`;
        EnemyGenE12S.tether.style.top = `${startY - 1}px`;
        EnemyGenE12S.tether.style.transform = `rotate(${rotdeg}deg)`;
    },
};
