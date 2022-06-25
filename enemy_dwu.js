const EnemyGenDWU = {
    /**
     * 0: 初期状態
     * 1: 堕天のドラゴンダイブ詠唱開始
     * 2: (牙尾|尾牙)の連旋詠唱開始
     * 3: 強攻撃+ダーク1
     * 4: 牙尾
     * 5: 牙尾+塔1
     * 6: ダーク2
     * 7: ゲイル1
     * 8: 塔2
     * 9: 強攻撃+ダーク3
     * 10: 牙尾+ゲイル2
     * 11: 牙尾+塔3
     * 12: ゲイル3
     */
    phase: 0,
    role: 0,
    biga: 0,
    debuff: undefined,
    partyListDiv: undefined,
    castDiv: undefined,
    cast2Div: undefined,
    activeAoEs: [],

    debuffIncludes: (dbf) => {
        return EnemyGenDWU.debuff.some((d) => {
            return d[0] === dbf[0] && d[1] === dbf[1];
        });
    },

    initDebuff: () => {
        const dwuRole = document.getElementById("dwu_role").selectedIndex;
        if (dwuRole != 0) {
            const fixedPatterns = [
                [[1, '↑'],[1, '↓'],[1, 'o'],[2, '↑'],[2, '↓'],[3, 'o'],[3, 'o'],[3, 'o']],
                [[1, 'o'],[1, '↑'],[1, '↓'],[2, '↑'],[2, '↓'],[3, 'o'],[3, 'o'],[3, 'o']],
                [[1, '↓'],[1, '↑'],[1, 'o'],[2, '↑'],[2, '↓'],[3, 'o'],[3, 'o'],[3, 'o']],
                [[2, '↑'],[1, '↑'],[1, '↓'],[1, 'o'],[2, '↓'],[3, 'o'],[3, 'o'],[3, 'o']],
                [[2, '↓'],[1, '↑'],[1, '↓'],[1, 'o'],[2, '↑'],[3, 'o'],[3, 'o'],[3, 'o']],
                [[3, '↑'],[1, 'o'],[1, 'o'],[1, 'o'],[2, 'o'],[2, 'o'],[3, '↓'],[3, 'o']],
                [[3, 'o'],[1, 'o'],[1, 'o'],[1, 'o'],[2, 'o'],[2, 'o'],[3, '↑'],[3, '↓']],
                [[3, '↓'],[1, 'o'],[1, 'o'],[1, 'o'],[2, 'o'],[2, 'o'],[3, '↑'],[3, 'o']]
            ];
            const p = fixedPatterns[dwuRole-1];
            const me = p[0];
            const others = p.slice(1);
            console.log(me);
            console.log(others);
            Util.shuffle(others);
            EnemyGenDWU.debuff = [me, ...others];
        }
        else {
            const r = Math.floor(Math.random() * 2);
            const patterns = [
                [[1, '↑'],[1, '↓'],[1, 'o'],[2, '↑'],[2, '↓'],[3, 'o'],[3, 'o'],[3, 'o']],
                [[1, 'o'],[1, 'o'],[1, 'o'],[2, 'o'],[2, 'o'],[3, '↑'],[3, '↓'],[3, 'o']]
            ];
            const pat = patterns[r];
            EnemyGenDWU.debuff = Util.shuffle(pat);
        }
        
    },

    getExpectedJob: (phase, place) => {
        const phaseToIndex = {
            1: 0,
            2: 1,
            3: 2,
        };
        const placeToIndex = {
            '↑': 0,
            'o': 1,
            '↓': 2
        };
        const orderedPartyMembers = [];
        const myJob = EnemyGenDWU.getMyJob();
        orderedPartyMembers.push(myJob);
        for (let i = 0; i < 8; i++) {
            const job = EnemyGenDWU.partyMembers[i];
            if (job != myJob) {
                orderedPartyMembers.push(job);
            }
        }
        const jobIndexes = [0, 1, 2, 3, 4, 5, 6, 7];
        jobIndexes.sort((a, b) => {
            const aDebuff = EnemyGenDWU.debuff[a];
            const bDebuff = EnemyGenDWU.debuff[b];
            const ap = phaseToIndex[aDebuff[0]] * 10 + placeToIndex[aDebuff[1]] + EnemyGenDWU.partyMembers.indexOf(orderedPartyMembers[a]) / 10;
            const bp = phaseToIndex[bDebuff[0]] * 10 + placeToIndex[bDebuff[1]] + EnemyGenDWU.partyMembers.indexOf(orderedPartyMembers[b]) / 10;
            return ap - bp;
        });
        console.log(jobIndexes);
        let t = phaseToIndex[phase] * 3 + placeToIndex[place]
        if (t > 4) {
            t -= 1;
        }
        return orderedPartyMembers[jobIndexes[t]];
    },

    initBiga: () => {
        EnemyGenDWU.biga = Math.floor(Math.random() * 2);
    },

    initAoEs: () => {
        activeAoEs = [];
    },

    getMyJob: () => {
        return document.getElementById("dwu_job").value;
    },

    partyMembers: [
        "Warrior",
        "Paladin",
        "WhiteMage",
        "Sage",
        "Reaper",
        "RedMage",
        "Summoner",
        "Dancer"
    ],

    addPartyList: () => {
        const partyList = document.createElement("div");

        const addJob = (job) => {
            const partyMemberDiv = document.createElement("div");
            const jobIcon = document.createElement("img");
            jobIcon.src = `img/jobIcons/${job}.png`;
            jobIcon.style.width = "50px";
            partyMemberDiv.appendChild(jobIcon);
            partyList.appendChild(partyMemberDiv);
        };

        const myJob = EnemyGenDWU.getMyJob();
        addJob(myJob);

        for (let i = 0; i < 8; i++) {
            const job = EnemyGenDWU.partyMembers[i];
            if (job != myJob) {
                addJob(job);
            }
        }

        partyList.style.width = `200px`;
        partyList.style.left = 620;
        partyList.style.top = 140;
        partyList.style.display = "inline-block";
        partyList.style.position = "absolute";
        EnemyGenDWU.partyListDiv = partyList;
        fieldDom.appendChild(partyList);
    },

    addCastBar: () => {
        const castDiv = document.createElement("div");
        const castName = document.createElement("div");
        castName.style.width = "400px";
        castName.style.height = "30px";
        const castBar = document.createElement("div");
        castBar.style.width = "400px";
        castBar.style.height = "20px";
        castBar.style.border = "1px solid rgba(0, 0, 0, 1)";
        castBar.style.backgroundColor = "rgba(0, 0, 0, 0)";
        castDiv.appendChild(castName);
        castDiv.appendChild(castBar);

        castDiv.style.width = `200px`;
        castDiv.style.left = 620;
        castDiv.style.top = 20;
        castDiv.style.display = "inline-block";
        castDiv.style.position = "absolute";
        EnemyGenDWU.castDiv = castDiv;
        fieldDom.appendChild(castDiv);
    },

    addCastBar2: () => {
        const castDiv = document.createElement("div");
        const castName = document.createElement("div");
        castName.style.width = "270px";
        castName.style.height = "20px";
        const castBar = document.createElement("div");
        castBar.style.width = "270px";
        castBar.style.height = "12px";
        castBar.style.border = "1px solid rgba(0, 0, 0, 1)";
        castBar.style.backgroundColor = "rgba(0, 0, 0, 0)";
        castDiv.appendChild(castName);
        castDiv.appendChild(castBar);

        castDiv.style.width = `200px`;
        castDiv.style.left = 620;
        castDiv.style.top = 100;
        castDiv.style.display = "inline-block";
        castDiv.style.position = "absolute";
        EnemyGenDWU.cast2Div = castDiv;
        fieldDom.appendChild(castDiv);
    },

    startCast: (name, duration) => {
        const castName = EnemyGenDWU.castDiv.children[0];
        const castBar = EnemyGenDWU.castDiv.children[1];
        castName.textContent = name;
        const CastStartTime = Date.now();
        const interval = setInterval(() => {
            const progress = (Date.now() - CastStartTime) / duration;
            if (progress >= 0 && progress < 1) {
                const p100 = Math.floor(progress * 1000) / 10;
                castBar.style.backgroundImage =
                  `linear-gradient(` +
                  `to right,` +
                  `rgba(255, 0, 0, 1),` +
                  `rgba(255, 0, 0, 1) ${p100}%,` +
                  `rgba(0, 0, 0, 0) ${p100}%,` +
                  `rgba(0, 0, 0, 0) 100%)`;
            }
            if (progress >= 1) {
                clearInterval(interval);
                castName.textContent = "";
                castBar.style.backgroundImage = null;
            }
        }, 1000/30); // 30 FPS
    },

    startCast2: (name, duration) => {
        const castName = EnemyGenDWU.cast2Div.children[0];
        const castBar = EnemyGenDWU.cast2Div.children[1];
        castName.textContent = name;
        const CastStartTime = Date.now();
        const interval = setInterval(() => {
            const progress = (Date.now() - CastStartTime) / duration;
            if (progress >= 0 && progress < 1) {
                const p100 = Math.floor(progress * 1000) / 10;
                castBar.style.backgroundImage =
                  `linear-gradient(` +
                  `to right,` +
                  `rgba(255, 0, 0, 1),` +
                  `rgba(255, 0, 0, 1) ${p100}%,` +
                  `rgba(0, 0, 0, 0) ${p100}%,` +
                  `rgba(0, 0, 0, 0) 100%)`;
            }
            if (progress >= 1) {
                clearInterval(interval);
                castName.textContent = "";
                castBar.style.backgroundImage = null;
            }
        }, 1000/30); // 30 FPS
    },

    addTargetingDebuff: () => {
        for (let i = 0; i < 8; i++) {
            const partyMemberDiv = EnemyGenDWU.partyListDiv.children[i];
            const debuffIcon1 = document.createElement("img");
            debuffIcon1.src = `img/dragonSongWar/target${EnemyGenDWU.debuff[i][0]}.png`;
            debuffIcon1.style.height = "50px";
            partyMemberDiv.appendChild(debuffIcon1);
        }
    },

    addDarkDebuff: () => {
        for (let i = 0; i < 8; i++) {
            const partyMemberDiv = EnemyGenDWU.partyListDiv.children[i];
            const debuffIcon2 = document.createElement("img");
            debuffIcon2.src = `img/dragonSongWar/${EnemyGenDWU.debuff[i][1]}.png`;
            debuffIcon2.style.height = "50px";
            partyMemberDiv.appendChild(debuffIcon2);
        }
    },

    addEyeOfTyrant: (x, y) => {
        const eyeOfTyrantEffect = Util.addCircle(300 + x, 300 + y, Util.tile(6));
        Util.removeLater(eyeOfTyrantEffect, 1000);
    },

    addDarkJump: (x, y, expectedJob) => {
        console.log("addDarkJump", x, y, expectedJob);
        const effect = Util.addCircle(300 + x, 300 + y, Util.tile(4));
        if (EnemyGenDWU.getMyJob() === expectedJob) {
            activeAoEs.push(Util.donutAoE(300 + x, 300 + y, Util.tile(2), Util.tile(999), 'ダークハイジャンプをまき散らしました'))
        } else {
            activeAoEs.push(Util.circleAoE(300 + x, 300 + y, Util.tile(4), 'ダークハイジャンプに巻き込まれました'))
        }
        Util.removeLater(effect, 1000);
    },

    addZako: (phase, place) => {
        const props = {
            1: {
                '↑': { x: Util.tile(7), y: 0, fromRot: Math.random() * 360, toRot: 90 },
                '↓': { x: Util.tile(-7), y: 0, fromRot: Math.random() * 360, toRot: 270 },
                'o': { x: 0, y: Util.tile(7), fromRot: Math.random() * 360, toRot: 180 }
            },
            2: {
                '↑': { x: Util.tile(6), y: Util.tile(-7), fromRot: Math.random() * 360, toRot: 90 },
                '↓': { x: Util.tile(-6), y: Util.tile(-7), fromRot: Math.random() * 360, toRot: 270 },
            },
            3: {
                '↑': { x: Util.tile(7), y: 0, fromRot: Math.random() * 360, toRot: 90 },
                '↓': { x: Util.tile(-7), y: 0, fromRot: Math.random() * 360, toRot: 270 },
                'o': { x: 0, y: Util.tile(7), fromRot: Math.random() * 360, toRot: 180 }
            },
        };

        const prop = props[phase][place];

        const img = Util.addImage('img/enemy.png', 300 + prop.x, 300 + prop.y, Util.tile(3), Util.tile(3));
        img.style.transformOrigin = "center center";
        img.style.transform = `rotate(${prop.fromRot}deg)`;

        setTimeout(() => {
            const castStartTime = Date.now();
            const interval = setInterval(() => {
                const duration = 500;
                const progress = (Date.now() - castStartTime) / duration;
                if (progress >= 0 && progress < 1) {
                    const rot = (prop.fromRot + (prop.toRot - prop.fromRot) * progress);
                    img.style.transform = `rotate(${rot}deg)`;
                }
                if (progress >= 1) {
                    clearInterval(interval);
                }
            }, 1000/60); // 60 FPS
        }, 2600);
        
        Util.removeLater(img, 8000);
    },

    addDarkDragonDivePrep: (x, y) => {
        const effect = Util.addCircle(300 + x, 300 + y, Util.tile(4), 'rgba(0, 255, 0, 0.5)');
        Util.removeLater(effect, 2200);
    },

    addDarkDragonDiveHit: (x, y, expectedJob) => {
        console.log("addDarkDragonDiveHit", x, y, expectedJob);
        const effect = Util.addCircle(300 + x, 300 + y, Util.tile(4));
        if (EnemyGenDWU.getMyJob() === expectedJob) {
            activeAoEs.push(Util.donutAoE(300 + x, 300 + y, Util.tile(4), Util.tile(999), '塔を踏み忘れました'))
        } else {
            activeAoEs.push(Util.circleAoE(300 + x, 300 + y, Util.tile(4), '塔に巻き込まれました'))
        }
        Util.removeLater(effect, 1000);
    },

    addTargetCircle: () => {
        Util.strokeCircle(300, 300, Util.tile(7));
        Util.strokeCircle(300, 300, Util.tile(6));
    },
    
    addKoga: () => {
        const effect = Util.addCircle(300, 300, Util.tile(7));
        activeAoEs.push(Util.circleAoE(300, 300, Util.tile(7), '大車輪・咬牙を踏みました'))
        Util.removeLater(effect, 1000);
    },

    addJabi: () => {
        const effect = Util.addDonut(300, 300, Util.tile(7), Util.tile(20));
        activeAoEs.push(Util.donutAoE(300, 300, Util.tile(7), Util.tile(20), '大車輪・邪尾を踏みました'))
        Util.removeLater(effect, 1000);
    },

    addGeirskogul: (x1, y1, x2, y2) => {
        const effect = Util.addBoldLine(300 + x1, 300 + y1, 300 + x2, 300 + y2, Util.tile(6), Util.tile(40));
        Util.removeLater(effect, 1000);
    },

    addGeirskogulPrepAoE: (phase, place) => {
        if (EnemyGenDWU.getMyJob() === EnemyGenDWU.getExpectedJob(phase, place)) {
            activeAoEs.push({
                collision: (px, py) => {
                    console.log("addGeirskogulPrepAoE", px, py, Util.tile(7))
                    if (place === '↑') {
                        return px < 300 + Util.tile(7);
                    }
                    else if (place === '↓') {
                        return px > 300 - Util.tile(7);
                    }
                    else { // place === 'o'
                        return py < 300 + Util.tile(7);
                    }
                },
                reason: 'ゲイルスコグルは外に向けてください'
            });
        }
        else {
            const reason = '他人のゲイルスコグルを誘導しないでください';
            const aoe = {
                '↑': Util.circleAoE(300 + Util.tile(7), 300, Util.tile(3), reason),
                '↓': Util.circleAoE(300 + Util.tile(-7), 300, Util.tile(3), reason),
                'o': Util.circleAoE(300, 300 + Util.tile(7), Util.tile(3), reason)
            }
            activeAoEs.push(aoe[place]);
        }
    },

    addGeirskogul2PrepAoE: (expectedJob) => {
        if (EnemyGenDWU.getMyJob() === expectedJob) {
            activeAoEs.push({
                collision: (px, py) => {
                    return py > 300 + Util.tile(-6) || Math.abs(px - 300) < Util.tile(6);
                },
                reason: '２回目ゲイルスコグルは外に向けてください'
            });
        }
    },

    addGeirskogulAoE: (place) => {
        const reason = 'ゲイルスコグルを踏みました';
        const aoe = {
            '↑': Util.rectAoe(300 + Util.tile(7), 300 + Util.tile(3), 300 + Util.tile(40), 300 + Util.tile(-3), reason),
            '↓': Util.rectAoe(300 + Util.tile(-40), 300 + Util.tile(3), 300 + Util.tile(-7), 300 + Util.tile(-3), reason),
            'o': Util.rectAoe(300 + Util.tile(-3), 300 + Util.tile(7), 300 + Util.tile(3), 300 + Util.tile(40), reason)
        }

        activeAoEs.push(aoe[place]);
    },

    addGeirskogul2AoE: () => {
        activeAoEs.push({
            collision: (px, py) => {
                return (py < 300 + Util.tile(-7) + Util.tile(3)) && (Math.abs(px - 300) > Util.tile(6));
            },
            reason: 'ゲイルスコグルを踏みました'
        });
    },

    addEyeOfTyrantAoE: (phase) => {
        const myDebuff = EnemyGenDWU.debuff[0];
        console.log("addEyeOfTyrantAoE", myDebuff, phase);
        if (myDebuff[0] !== phase) {
            activeAoEs.push(Util.donutAoE(300, 300 - Util.tile(7), Util.tile(2), Util.tile(40), 'アイオブタイラントに集合してください'));
        }
    },

    initialize: () => {
        while (fieldDom.children.length > 2) {
            fieldDom.removeChild(fieldDom.children[1]);
        }
        EnemyGenDWU.initDebuff();
        EnemyGenDWU.initBiga();
        EnemyGenDWU.initAoEs();
        speed = 1.2;

        for (let i = -19; i <= 19; i++) {
            if (i === 6) {
                const x = 300 + Util.tile(i - 0.2);
                Util.strokeRect(x - 1, 0, x + 1, 600);
            }
            else if (i === -6) {
                const x = 300 + Util.tile(i + 0.2);
                Util.strokeRect(x - 1, 0, x + 1, 600);
            }
            else {
                const x = 300 + Util.tile(i);
                Util.strokeRect(x - 1, 0, x + 1, 600);
            }
        }

        for (let i = -19; i <= 19; i++) {
            const y = 300 + Util.tile(i);
            Util.strokeRect(0, y - 1, 600, y + 1);
        }

        EnemyGenDWU.addTargetCircle();
        EnemyGenDWU.addPartyList();
        EnemyGenDWU.addCastBar();
        EnemyGenDWU.addCastBar2();
    },

    maybeAddEnemy: (fieldDom) => {
        if (!initialized) {
            EnemyGenDWU.initialize(fieldDom);
            initialize();
        }
        EnemyGenDWU.addTimeline();
        EnemyGenDWU.checkAlive();
    },

    checkAlive: () => {
        const x = Util.pixelToMeter(player.x - 300);
        const y = Util.pixelToMeter(player.y - 300);

        // 外周
        if (x < -20  || x > 20 || y < -20  || y > 20) {
            endGame();
        }

        for (const aoe of activeAoEs) {
            if (aoe.collision(player.x, player.y)) {
                if (aoe.reason) {
                    alert(aoe.reason);
                }
                endGame();
            }
        }
        activeAoEs = [];
    },

    /**
     *  0:  0000 初期状態
     *  1:  3400 堕天のドラゴンダイブ詠唱開始
     *  2:  9000 ジャンプ系デバフ付与
     *  3: 10700 (牙尾|尾牙)の連旋詠唱開始
     *  4: 18000 ダーク1
     *  5: 18300 アイ・オブ・タイラント1
     *  6: 21700 牙尾
     *  7: 22400 塔1出現
     *  8: 24600 塔1
     *  9: 24800 牙尾
     * 10: 27600 ゲイル1詠唱開始
     * 11: 28000 ダーク2
     * 12: 31800 ゲイル1
     * 13: 32200 (牙尾|尾牙)の連旋詠唱開始
     * 14: 32400 塔2出現
     * 15: 34600 塔2
     * 16: 37600 ゲイル2詠唱開始
     * 17: 39000 ダーク3
     * 18: 39800 アイ・オブ・タイラント2
     * 19: 41800 ゲイル2
     * 20: 43200 牙尾
     * 21: 43400 塔3出現
     * 22: 45600 塔3
     * 23: 46300 牙尾
     * 24: 48600 ゲイル3詠唱開始
     * 25: 52800 ゲイル3
     */
    addTimeline: () => {
        const time = Date.now() - startTime;

        if (EnemyGenDWU.phase === 0 && time >= 3400) {
            // ターゲッティングデバフ付与
            EnemyGenDWU.startCast("堕天のドラゴンダイブ", 5400);
            EnemyGenDWU.addTargetingDebuff();
            EnemyGenDWU.phase = 1;
        }
        else if (EnemyGenDWU.phase === 1 && time >= 9000) {
            // ジャンプ系デバフ付与
            EnemyGenDWU.addDarkDebuff();
            EnemyGenDWU.phase = 2;
        }
        else if (EnemyGenDWU.phase === 2 && time >= 10700) {
            // 連旋詠唱開始
            EnemyGenDWU.startCast(["牙尾の連旋", "尾牙の連旋"][EnemyGenDWU.biga], 7300);
            EnemyGenDWU.phase = 3;
        }
        else if (EnemyGenDWU.phase === 3 && time >= 18000) {
            const isSpineElusivePattern = EnemyGenDWU.debuffIncludes([1, '↑']);
            const x = isSpineElusivePattern ? Util.tile(5) : Util.tile(7);

            console.log("@@@", x);

            // ダーク1
            // EnemyGenDWU.addEyeOfTyrant(0, -Util.tile(7));
            // EnemyGenDWU.addEyeOfTyrantAoE(1);
            EnemyGenDWU.addDarkJump(x, 0, EnemyGenDWU.getExpectedJob(1, '↑'));
            EnemyGenDWU.addDarkJump(-x, 0, EnemyGenDWU.getExpectedJob(1, '↓'));
            EnemyGenDWU.addDarkJump(0, Util.tile(7), EnemyGenDWU.getExpectedJob(1, 'o'));
            EnemyGenDWU.phase = 4;
        }
        else if (EnemyGenDWU.phase === 4 && time >= 18300) {
            // アイ・オブ・タイラント
            EnemyGenDWU.addEyeOfTyrant(0, -Util.tile(7));
            EnemyGenDWU.addEyeOfTyrantAoE(1);
            EnemyGenDWU.phase = 5;
        }
        else if (EnemyGenDWU.phase === 5 && time >= 21700) {
            // 牙 or 尾
            if (EnemyGenDWU.biga == 0) {
                EnemyGenDWU.addKoga();
            } else {
                EnemyGenDWU.addJabi();
            }
            EnemyGenDWU.phase = 6;
        }
        else if (EnemyGenDWU.phase === 6 && time >= 22400) {
            // 塔1出現
            EnemyGenDWU.addDarkDragonDivePrep(Util.tile(7), 0);
            EnemyGenDWU.addDarkDragonDivePrep(Util.tile(-7), 0);
            EnemyGenDWU.addDarkDragonDivePrep(0, Util.tile(7));
            EnemyGenDWU.phase = 7;
        }
        else if (EnemyGenDWU.phase === 7 && time >= 24600) {
            // 塔1
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(7), 0, EnemyGenDWU.getExpectedJob(3, '↑'));
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(-7), 0, EnemyGenDWU.getExpectedJob(3, '↓'));
            EnemyGenDWU.addDarkDragonDiveHit(0, Util.tile(7), EnemyGenDWU.getExpectedJob(3, 'o'));
            EnemyGenDWU.addZako(1, '↑');
            EnemyGenDWU.addZako(1, '↓');
            EnemyGenDWU.addZako(1, 'o');
            EnemyGenDWU.phase = 8;
        }
        else if (EnemyGenDWU.phase === 8 && time >= 24800) {
            // 牙尾
            if (EnemyGenDWU.biga == 0) {
                EnemyGenDWU.addJabi();
            } else {
                EnemyGenDWU.addKoga();
            }
            EnemyGenDWU.phase = 9;
        }
        else if (EnemyGenDWU.phase === 9 && time >= 27600) {
            // ゲイル1 詠唱開始 (ゲイルの方向確定)

            EnemyGenDWU.addGeirskogulPrepAoE(3, '↑');
            EnemyGenDWU.addGeirskogulPrepAoE(3, '↓');
            EnemyGenDWU.addGeirskogulPrepAoE(3, 'o');

            EnemyGenDWU.startCast2("ゲイルスコグル", 4200);
            EnemyGenDWU.phase = 10;
        }
        else if (EnemyGenDWU.phase === 10 && time >= 28000) {
            // ダーク2

            EnemyGenDWU.addDarkJump(Util.tile(6), Util.tile(-7), EnemyGenDWU.getExpectedJob(2, '↑'));
            EnemyGenDWU.addDarkJump(Util.tile(-6), Util.tile(-7), EnemyGenDWU.getExpectedJob(2, '↓'));

            EnemyGenDWU.phase = 11;
        }

        else if (EnemyGenDWU.phase == 11 && time >= 31800) {
            // ゲイル1
            EnemyGenDWU.addGeirskogul(Util.tile(7), 0, Util.tile(8), 0);
            EnemyGenDWU.addGeirskogul(Util.tile(-7), 0, Util.tile(-8), 0);
            EnemyGenDWU.addGeirskogul(0, Util.tile(7), 0, Util.tile(8));
            EnemyGenDWU.addGeirskogulAoE('↑');
            EnemyGenDWU.addGeirskogulAoE('↓');
            EnemyGenDWU.addGeirskogulAoE('o');
            EnemyGenDWU.phase = 12;
        }
        else if (EnemyGenDWU.phase === 12 && time >= 32200) {
            // 牙尾２回目詠唱
            EnemyGenDWU.startCast(["尾牙の連旋", "牙尾の連旋"][EnemyGenDWU.biga], 7300);
            EnemyGenDWU.phase = 13;
        }
        else if (EnemyGenDWU.phase == 13 && time >= 32400) {
            // 塔2出現
            EnemyGenDWU.addDarkDragonDivePrep(Util.tile(6), Util.tile(-7));
            EnemyGenDWU.addDarkDragonDivePrep(Util.tile(-6), Util.tile(-7));
            EnemyGenDWU.phase = 14;
        }
        else if (EnemyGenDWU.phase == 14 && time >= 34600) {
            // 塔2
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(6), Util.tile(-7), EnemyGenDWU.getExpectedJob(1, '↑'));
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(-6), Util.tile(-7), EnemyGenDWU.getExpectedJob(1, '↓'));
            EnemyGenDWU.addZako(2, '↑');
            EnemyGenDWU.addZako(2, '↓');
            EnemyGenDWU.phase = 15;
        }
        else if (EnemyGenDWU.phase === 15 && time >= 37600) {
            // ゲイル2 詠唱開始 (ゲイルの方向確定)

            EnemyGenDWU.addGeirskogul2PrepAoE(EnemyGenDWU.getExpectedJob(1, '↑'));
            EnemyGenDWU.addGeirskogul2PrepAoE(EnemyGenDWU.getExpectedJob(1, '↓'));

            EnemyGenDWU.startCast2("ゲイルスコグル", 4200);
            EnemyGenDWU.phase = 16;
        }
        else if (EnemyGenDWU.phase == 16 && time >= 39000) {
            // ダーク3
            const isSpineElusivePattern = EnemyGenDWU.debuffIncludes([3, '↑']);
            const x = isSpineElusivePattern ? Util.tile(5) : Util.tile(7);

            EnemyGenDWU.addDarkJump(x, 0, EnemyGenDWU.getExpectedJob(3, '↑'));
            EnemyGenDWU.addDarkJump(-x, 0, EnemyGenDWU.getExpectedJob(3, '↓'));
            EnemyGenDWU.addDarkJump(0, Util.tile(7), EnemyGenDWU.getExpectedJob(3, 'o'));
            EnemyGenDWU.phase = 17;
        }
        else if (EnemyGenDWU.phase == 17 && time >= 39800) {
            // アイ・オブ・タイラント
            EnemyGenDWU.addEyeOfTyrant(0, -Util.tile(7));
            EnemyGenDWU.addEyeOfTyrantAoE(3);
            EnemyGenDWU.phase = 18;
        }
        else if (EnemyGenDWU.phase == 18 && time >= 41800) {
            // ゲイル2
            EnemyGenDWU.addGeirskogul(Util.tile(6), Util.tile(-7), Util.tile(12), Util.tile(-7));
            EnemyGenDWU.addGeirskogul(Util.tile(-6), Util.tile(-7), Util.tile(-12), Util.tile(-7));
            EnemyGenDWU.addGeirskogul2AoE();
            EnemyGenDWU.phase = 19;
        }
        else if (EnemyGenDWU.phase == 19 && time >= 43200) {
            // 牙尾
            if (EnemyGenDWU.biga == 0) {
                EnemyGenDWU.addJabi();
            } else {
                EnemyGenDWU.addKoga();
            }
            EnemyGenDWU.phase = 20;
        }
        else if (EnemyGenDWU.phase == 20 && time >= 43400) {
            // 塔3出現
            EnemyGenDWU.addDarkDragonDivePrep(Util.tile(7), 0);
            EnemyGenDWU.addDarkDragonDivePrep(Util.tile(-7), 0);
            EnemyGenDWU.addDarkDragonDivePrep(0, Util.tile(7));
            EnemyGenDWU.phase = 21;
        }
        else if (EnemyGenDWU.phase == 21 && time >= 45600) {
            // 塔3
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(7), 0, EnemyGenDWU.getExpectedJob(2, '↑'));
            EnemyGenDWU.addDarkDragonDiveHit(Util.tile(-7), 0, EnemyGenDWU.getExpectedJob(2, '↓'));
            EnemyGenDWU.addDarkDragonDiveHit(0, Util.tile(7), EnemyGenDWU.getExpectedJob(1, 'o'));
            EnemyGenDWU.addZako(3, '↑');
            EnemyGenDWU.addZako(3, '↓');
            EnemyGenDWU.addZako(3, 'o');
            EnemyGenDWU.phase = 22;
        }
        else if (EnemyGenDWU.phase == 22 && time >= 46300) {
            // 牙尾
            if (EnemyGenDWU.biga == 0) {
                EnemyGenDWU.addKoga();
            } else {
                EnemyGenDWU.addJabi();
            }
            EnemyGenDWU.phase = 23;
        }
        else if (EnemyGenDWU.phase == 23 && time >= 48600) {
            // ゲイル3詠唱開始（ゲイルの方向確定）
            EnemyGenDWU.addGeirskogulPrepAoE(2, '↑');
            EnemyGenDWU.addGeirskogulPrepAoE(2, '↓');
            EnemyGenDWU.addGeirskogulPrepAoE(1, 'o');
            EnemyGenDWU.startCast2("ゲイルスコグル", 4200);

            EnemyGenDWU.phase = 24;
        }
        else if (EnemyGenDWU.phase === 24 && time >= 52800) {
            // ゲイル3
            EnemyGenDWU.addGeirskogul(Util.tile(7), 0, Util.tile(8), 0);
            EnemyGenDWU.addGeirskogul(Util.tile(-7), 0, Util.tile(-8), 0);
            EnemyGenDWU.addGeirskogul(0, Util.tile(7), 0, Util.tile(8));
            EnemyGenDWU.addGeirskogulAoE('↑');
            EnemyGenDWU.addGeirskogulAoE('↓');
            EnemyGenDWU.addGeirskogulAoE('o');
            EnemyGenDWU.phase = 25;
            gameActive = false;
            initialized = false;
        }
    }
};
