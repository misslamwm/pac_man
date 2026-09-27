// ============================================================================
// 指數吃豆人：跨平台終極挑戰 (Indices PAC-MAN Ultimate) - 核心遊戲引擎
// ============================================================================

// 1. 關卡與題庫設定 (標準 LaTeX 格式，新增各題專屬防禦迷思與鞏固解析)
const QUESTIONS = {
    1: [
        { q: "a^5 \\times a^3", options: ["a^8", "a^{15}", "a^2", "a^{16}"], ans: "a^8", explanation: "避免將指數相乘（誤答 a^{15}）。底數相同相乘時，指數應該「相加」：5 + 3 = 8。" },
        { q: "y^7 \\times y^4", options: ["y^{11}", "y^{28}", "y^3", "y^{12}"], ans: "y^{11}", explanation: "鞏固「底數相同，指數相加」：7 + 4 = 11。" },
        { q: "x^{10} \\div x^2", options: ["x^8", "x^5", "x^{12}", "x^{20}"], ans: "x^8", explanation: "避免將指數相除（誤答 x^5）。同底數相除時，指數應該「相減」：10 - 2 = 8。" },
        { q: "m^6 \\div m^5", options: ["m", "m^0", "m^{11}", "1"], ans: "m", explanation: "當指數相減為 1 時 (6 - 5 = 1)，m^1 通常省略記作 m（避免誤答 m^0 或 m^{11}）。" },
        { q: "(k^3)^4", options: ["k^{12}", "k^7", "k^{81}", "k^1"], ans: "k^{12}", explanation: "乘方的乘方规则是「指數相乘」：3 \\times 4 = 12。避免與「同底相乘」指數相加混淆。" },
        { q: "(n^5)^3", options: ["n^{15}", "n^8", "n^{125}", "n^2"], ans: "n^{15}", explanation: "底數的乘方相乘規則：(n^a)^b = n^{a \\times b}，即 5 \\times 3 = 15。" },
        { q: "(ab)^6", options: ["a^6b^6", "ab^6", "a^6b", "a^1b^6"], ans: "a^6b^6", explanation: "積的乘方指數分配律：括號外的指數必須分配給裡面「每一個」因式：(ab)^6 = a^6b^6。" },
        { q: "(xy)^3", options: ["x^3y^3", "xy^3", "x^3y", "3xy"], ans: "x^3y^3", explanation: "積的乘方指數分配率：(xy)^3 = x^3y^3。" },
        { q: "(p/q)^4", options: ["p^4/q^4", "p^4/q", "p/q^4", "p^4q^4"], ans: "p^4/q^4", explanation: "商的乘方指數分配率：分子和分母都要分配到指數：(p/q)^4 = p^4 / q^4。" },
        { q: "(u/v)^7", options: ["u^7/v^7", "u^7/v", "u/v^7", "uv^7"], ans: "u^7/v^7", explanation: "商的乘方指數分配率：分子和分母都要分配到指數：(u/v)^7 = u^7 / v^7。" }
    ],
    2: [
        { q: "x^{-3}", options: ["1/x^3", "-x^3", "-3x", "x^3"], ans: "1/x^3", explanation: "負指數代表「倒數」，即 x^{-n} = \\frac{1}{x^n}。徹底破除「負指數代表負數」的迷思！" },
        { q: "k^0 (k \\neq 0)", options: ["1", "0", "k", "-1"], ans: "1", explanation: "任何非零底數的 0 次方結果均為 1。破除「0 次方結果為 0」或「結果為底數本身」的迷思。" },
        { q: "y^{-5} \\times y^9", options: ["y^4", "y^{-14}", "1/y^4", "y^{45}"], ans: "y^4", explanation: "負數與正數的相加運算：底數相同相乘，指數相加為 -5 + 9 = 4。" },
        { q: "a^2 \\div a^{-4}", options: ["a^6", "a^{-2}", "1/a^2", "a^{-6}"], ans: "a^6", explanation: "同底相除，指數相減：2 - (-4) = 2 + 4 = 6。注意雙重負號產生的加法！" },
        { q: "(p^{-3})^4", options: ["1/p^{12}", "p^{-7}", "p^{12}", "-p^{12}"], ans: "1/p^{12}", explanation: "乘方的乘方指數相乘：-3 \\times 4 = -12。再將負指數轉換為倒數分數形式：1 / p^{12}。" },
        { q: "4b^0 (b \\neq 0)", options: ["4", "1", "0", "4b"], ans: "4", explanation: "要區分 4(b^0) 與 (4b)^0，只有緊鄰的底數 b 受 0 次方影響：4 \\times b^0 = 4 \\times 1 = 4。" },
        { q: "w^{-6} \\times w^6", options: ["1", "w^{12}", "w^{-12}", "0"], ans: "1", explanation: "指數相加為 0：-6 + 6 = 0。進而 w^0 轉化為 1。" },
        { q: "(xy)^{-2}", options: ["1/(x^2y^2)", "x^{-2}y^{-2}", "-x^2y^2", "x^2y^2"], ans: "1/(x^2y^2)", explanation: "積的乘方分配：x^{-2}y^{-2}，再將負指數化為分母倒數分式：1 / (x^2y^2)。" },
        { q: "(a^{-2})^{-3}", options: ["a^6", "a^{-5}", "1/a^6", "a^{-6}"], ans: "a^6", explanation: "負負得正的指數相乘：-2 \\times (-3) = 6，故結果為 a^6。" },
        { q: "(x/y)^{-3}", options: ["y^3/x^3", "x^3/y^3", "1/(x^3y^3)", "-x^3/y^3"], ans: "y^3/x^3", explanation: "負指數代表倒數，會使分數分子與分母顛倒，然後各分配合方：(x/y)^{-3} = (y/x)^3 = y^3 / x^3。" }
    ]
};

// 2. 地圖設定 (第一關：經典街機迷宮；第二關：深紫霓虹交錯全新地圖結構)
const MAP_L1 = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,0,0,0,1,1,0,1,1,0,0,0,1],
    [1,1,1,0,1,0,0,0,1,0,1,1,1],
    [1,0,0,0,1,0,2,0,1,0,0,0,1],
    [1,1,1,0,1,1,1,1,1,0,1,1,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const MAP_L2 = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,1,2,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let activeMap = MAP_L1;
const TILE_SIZE = 40; // 520 px 寬高 (13 * 40 px)

// 3. 遊戲狀態與角色實體
let currentLevel = 1;
let currentQuestionIndex = 0;
let score = 0;
let hp = 3; // LIVES 轉為 HP
let gameOver = false;
let gameInterval = null;
let player = null;
let ghosts = [];
const ghostColors = ["#ff0000", "#ffb8ff", "#00ffff", "#ffb852"]; // 紅、粉、青、橘

// 防二次觸發鎖
let isTransitioning = false;

// 4. 輔助函數：將分數上標格式、LaTeX 乘除號轉換為 Unicode 數學字型
// 【特別修正】：徹底破除電腦次方符號 '^'，利用正則表達式精準將任何 '^' 後續的整數或括號完美替換為學術上標字元！
function formatLatexToUnicode(str) {
    if (!str) return "";
    let res = str;
    
    // 替換數學常用乘除符號
    res = res.replace(/\\times/g, ' × ');
    res = res.replace(/\\div/g, ' ÷ ');
    res = res.replace(/\\cdot/g, ' · ');
    res = res.replace(/\\neq/g, ' ≠ ');
    
    // 替換分數 \frac{A}{B} 格式
    res = res.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2');
    res = res.replace(/[{}]/g, ''); // 移除多餘 LaTeX 大括號
    
    // Unicode 上標對照表 (完整支援任何字母與正負符號)
    const superscripts = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', 
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
        '-': '⁻', 'a': 'ᵃ', 'b': 'ᵇ', 'n': 'ⁿ', 'm': 'ᵐ',
        'x': 'ˣ', 'y': 'ʸ'
    };
    
    let output = "";
    for (let i = 0; i < res.length; i++) {
        if (res[i] === '^') {
            i++;
            let power = "";
            if (res[i] === '(') {
                i++;
                while (i < res.length && res[i] !== ')') {
                    power += res[i];
                    i++;
                }
            } else {
                while (i < res.length && /[a-zA-Z0-9\\-–]/.test(res[i])) {
                    power += res[i];
                    i++;
                }
                i--; // 退回一步
            }
            
            for (let char of power) {
                output += superscripts[char] || char;
            }
        } else {
            output += res[i];
        }
    }
    return output;
}

// 吃豆人類別 (Pacman)
class Pacman {
    constructor(gridX, gridY) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.x = gridX * TILE_SIZE + TILE_SIZE / 2;
        this.y = gridY * TILE_SIZE + TILE_SIZE / 2;
        this.radius = 16;
        this.speed = 2; // 微調後的極佳操控速度，絕不 overshoot
        this.dirX = 0;
        this.dirY = 0;
        this.nextDirX = 0;
        this.nextDirY = 0;
        this.angle = 0.2; // 嘴巴開合角度
        this.mouthClosing = false;
    }

    update() {
        const isAligned = ((this.x - TILE_SIZE/2) % TILE_SIZE === 0 && (this.y - TILE_SIZE/2) % TILE_SIZE === 0);
        
        if (isAligned) {
            this.gridX = Math.round((this.x - TILE_SIZE/2) / TILE_SIZE);
            this.gridY = Math.round((this.y - TILE_SIZE/2) / TILE_SIZE);

            if (this.canMove(this.nextDirX, this.nextDirY)) {
                this.dirX = this.nextDirX;
                this.dirY = this.nextDirY;
            } else if (!this.canMove(this.dirX, this.dirY)) {
                this.dirX = 0;
                this.dirY = 0;
            }
        }
        
        if (this.nextDirX === -this.dirX && this.nextDirY === -this.dirY && (this.nextDirX !== 0 || this.nextDirY !== 0)) {
            this.dirX = this.nextDirX;
            this.dirY = this.nextDirY;
        }

        this.x += this.dirX * this.speed;
        this.y += this.dirY * this.speed;

        if (this.dirX !== 0 || this.dirY !== 0) {
            if (this.mouthClosing) {
                this.angle -= 0.02;
                if (this.angle <= 0.05) this.mouthClosing = false;
            } else {
                this.angle += 0.02;
                if (this.angle >= 0.25) this.mouthClosing = true;
            }
        } else {
            this.angle = 0.08;
        }
    }

    canMove(dx, dy) {
        if (dx === 0 && dy === 0) return false;
        const nextGridX = this.gridX + dx;
        const nextGridY = this.gridY + dy;
        if (nextGridX < 0 || nextGridX >= activeMap[0].length || nextGridY < 0 || nextGridY >= activeMap.length) return false;
        return activeMap[nextGridY][nextGridX] !== 1;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        let rotation = 0;
        if (this.dirX === 1) rotation = 0;
        else if (this.dirX === -1) rotation = Math.PI;
        else if (this.dirY === 1) rotation = Math.PI / 2;
        else if (this.dirY === -1) rotation = -Math.PI / 2;
        ctx.rotate(rotation);

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, this.angle * Math.PI, (2 - this.angle) * Math.PI);
        ctx.lineTo(0, 0);
        ctx.fillStyle = '#ffea00';
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(2, -8, 2.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    }
}

// 幽靈類別 (Ghost)
class Ghost {
    constructor(gridX, gridY, color, label, isCorrect) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.x = gridX * TILE_SIZE + TILE_SIZE / 2;
        this.y = gridY * TILE_SIZE + TILE_SIZE / 2;
        this.radius = 16;
        this.speed = 1; 
        this.color = color;
        this.label = label;
        this.isCorrect = isCorrect;
        this.dirX = 0;
        this.dirY = -1;
    }

    update() {
        const isAligned = ((this.x - TILE_SIZE/2) % TILE_SIZE === 0 && (this.y - TILE_SIZE/2) % TILE_SIZE === 0);

        if (isAligned) {
            this.gridX = Math.round((this.x - TILE_SIZE/2) / TILE_SIZE);
            this.gridY = Math.round((this.y - TILE_SIZE/2) / TILE_SIZE);

            const directions = [
                {x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}
            ];
            
            const validDirs = directions.filter(d => {
                const nextGridX = this.gridX + d.x;
                const nextGridY = this.gridY + d.y;
                if (nextGridX < 0 || nextGridX >= activeMap[0].length || nextGridY < 0 || nextGridY >= activeMap.length) return false;
                if (activeMap[nextGridY][nextGridX] === 1) return false;
                if (d.x === -this.dirX && d.y === -this.dirY) return false;
                return true;
            });

            let chosenDir = null;
            if (validDirs.length > 0) {
                chosenDir = validDirs[Math.floor(Math.random() * validDirs.length)];
            } else {
                chosenDir = { x: -this.dirX, y: -this.dirY };
            }

            this.dirX = chosenDir.x;
            this.dirY = chosenDir.y;
        }

        this.x += this.dirX * this.speed;
        this.y += this.dirY * this.speed;
    }

    draw(ctx) {
        ctx.save();
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y - 2, this.radius, Math.PI, 0, false);
        ctx.lineTo(this.x + this.radius, this.y + this.radius);
        const waveY = this.y + this.radius;
        const waveStep = (this.radius * 2) / 3;
        ctx.lineTo(this.x + this.radius - waveStep * 0.5, waveY - 4);
        ctx.lineTo(this.x + this.radius - waveStep, waveY);
        ctx.lineTo(this.x - this.radius + waveStep, waveY - 4);
        ctx.lineTo(this.x - this.radius, waveY);
        ctx.lineTo(this.x - this.radius, this.y - 2);
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x - 6, this.y - 4, 4.5, 0, 2 * Math.PI);
        ctx.arc(this.x + 6, this.y - 4, 4.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = '#00f';
        ctx.beginPath();
        const pupilDx = this.dirX * 2;
        const pupilDy = this.dirY * 2;
        ctx.arc(this.x - 6 + pupilDx, this.y - 4 + pupilDy, 2, 0, 2 * Math.PI);
        ctx.arc(this.x + 6 + pupilDx, this.y - 4 + pupilDy, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        // 繪製頭頂答案框 (字型放大一倍至 24px)
        ctx.font = "bold 24px Arial";
        const displayLabel = formatLatexToUnicode(this.label);
        const textWidth = ctx.measureText(displayLabel).width;
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
        
        const boxW = textWidth + 18;
        const boxH = 34;
        const boxX = this.x - boxW / 2;
        const boxY = this.y - this.radius - 42;
        
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(displayLabel, this.x, boxY + boxH / 2);

        ctx.restore();
    }
}

// 5. 載入新題目
function loadQuestion() {
    const qList = QUESTIONS[currentLevel];
    if (currentQuestionIndex >= qList.length) {
        if (currentLevel === 1) {
            showOverlay('nextLevelOverlay');
        } else {
            showOverlay('victoryOverlay');
        }
        if (gameInterval) clearInterval(gameInterval);
        return;
    }

    const curQ = qList[currentQuestionIndex];
    renderMathQuestion(curQ.q);
    
    document.getElementById('progressText').innerText = `${currentQuestionIndex} / ${qList.length}`;
    document.getElementById('progressBar').style.width = `${(currentQuestionIndex / qList.length) * 100}%`;

    player = new Pacman(6, 6);

    ghosts = [];
    const spawnPositions = [
        {x: 1, y: 1}, {x: 11, y: 1}, {x: 1, y: 11}, {x: 11, y: 11}
    ];

    const shuffledOptions = [...curQ.options].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 4; i++) {
        const pos = spawnPositions[i];
        const opt = shuffledOptions[i];
        const isCorrect = (opt === curQ.ans);
        ghosts.push(new Ghost(pos.x, pos.y, ghostColors[i], opt, isCorrect));
    }
    
    isTransitioning = false;
}

function renderMathQuestion(latex) {
    const qEl = document.getElementById('questionText');
    if (!qEl) return;
    if (typeof katex !== 'undefined') {
        try {
            katex.render(latex, qEl, { throwOnError: false, displayMode: false });
        } catch (err) {
            qEl.innerText = formatLatexToUnicode(latex);
        }
    } else {
        qEl.innerText = formatLatexToUnicode(latex);
    }
}

// 6. 遊戲控制與關卡背景顏色動態設定
function startGame(level) {
    currentLevel = level;
    currentQuestionIndex = 0;
    
    // 重設分與 HP 狀態
    if (level === 1) {
        score = 0;
    }
    hp = 3;
    gameOver = false;
    isTransitioning = false;

    // 【應需求修改】第二關轉深紫色背景
    const wrapper = document.getElementById('gameWrapper');
    if (level === 2) {
        activeMap = MAP_L2;
        // 動態將背景切換成深紫色與霓虹紫邊框，帶來全新視覺體驗
        document.body.style.background = "#14051a";
        document.body.style.backgroundImage = "radial-gradient(at 0% 0%, rgba(176, 38, 255, 0.2) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(255, 0, 127, 0.15) 0px, transparent 50%)";
        wrapper.style.borderColor = "var(--neon-purple)";
        wrapper.style.boxShadow = "0 0 30px rgba(176, 38, 255, 0.4), inset 0 0 15px rgba(176, 38, 255, 0.1)";
    } else {
        activeMap = MAP_L1;
        // 第一關還原為經典街機深藍色
        document.body.style.background = "#090a15";
        document.body.style.backgroundImage = "radial-gradient(at 0% 0%, rgba(0, 240, 255, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(255, 0, 127, 0.15) 0px, transparent 50%)";
        wrapper.style.borderColor = "var(--neon-blue)";
        wrapper.style.boxShadow = "0 0 30px rgba(0, 240, 255, 0.4), inset 0 0 15px rgba(0, 240, 255, 0.1)";
    }

    document.getElementById('levelBadge').innerText = `Level ${level}`;
    document.getElementById('scoreVal').innerText = score;
    updateHpUI();
    hideAllOverlays();
    
    loadQuestion();

    window.focus();
    const canvas = document.getElementById('gameCanvas');
    if (canvas) canvas.focus();

    // 啟動主渲染引擎
    const ctx = canvas.getContext('2d');
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        updateGame(ctx, canvas);
    }, 1000 / 60);
}

function updateHpUI() {
    let hearts = "";
    for (let i = 0; i < hp; i++) hearts += "❤️";
    document.getElementById('hpVal').innerText = hearts || "💀";
}

function setDirection(dir) {
    if (!player) return;
    switch(dir) {
        case 'up': player.nextDirX = 0; player.nextDirY = -1; break;
        case 'down': player.nextDirX = 0; player.nextDirY = 1; break;
        case 'left': player.nextDirX = -1; player.nextDirY = 0; break;
        case 'right': player.nextDirX = 1; player.nextDirY = 0; break;
    }
}

// 7. 【答錯防禦講解模態框控制】
function triggerWrongAnswerExplanation(chosenLabel, correctAns, explanationText) {
    // A. 停止主遊戲循環
    if (gameInterval) clearInterval(gameInterval);
    
    // B. 動態載入公式
    const wrongQEl = document.getElementById('wrongQuestion');
    const wrongAnEl = document.getElementById('wrongAnswer');
    const explanationBody = document.getElementById('wrongExplanation');
    
    const curQ = QUESTIONS[currentLevel][currentQuestionIndex];
    
    // 渲染 LaTeX 目標
    if (typeof katex !== 'undefined') {
        katex.render(curQ.q, wrongQEl, { throwOnError: false });
        katex.render(correctAns, wrongAnEl, { throwOnError: false });
    } else {
        wrongQEl.innerText = formatLatexToUnicode(curQ.q);
        wrongAnEl.innerText = formatLatexToUnicode(correctAns);
    }
    
    // 載入教師迷宮防禦分析講解
    explanationBody.innerText = explanationText;

    // C. 顯示答錯卡 Overlay
    showOverlay('explanationOverlay');
}

// 學生點擊「我懂了！繼續下一題」按鈕後觸發
function closeExplanationOverlay() {
    // 隱藏答錯卡
    document.getElementById('explanationOverlay').style.display = 'none';
    
    // 答錯進入下一題
    currentQuestionIndex++;
    
    // 重啟遊戲
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    loadQuestion();
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        updateGame(ctx, canvas);
    }, 1000 / 60);
    
    canvas.focus();
}

// 8. 主引擎更新
function updateGame(ctx, canvas) {
    if (gameOver) return;

    player.update();
    ghosts.forEach(ghost => ghost.update());

    if (!isTransitioning) {
        for (let i = 0; i < ghosts.length; i++) {
            const ghost = ghosts[i];
            const dist = Math.sqrt((player.x - ghost.x)**2 + (player.y - ghost.y)**2);
            
            if (dist < 22) {
                isTransitioning = true; 

                if (ghost.isCorrect) {
                    // 【應需求修改】：每次答對一題加 100 分！
                    score += 100;
                    document.getElementById('scoreVal').innerText = score;
                    currentQuestionIndex++;
                    drawScreenFlash(ctx, canvas, "rgba(57, 255, 20, 0.3)");
                    
                    setTimeout(() => {
                        loadQuestion();
                    }, 500);
                } else {
                    // 答錯扣血
                    hp--;
                    updateHpUI();
                    drawScreenFlash(ctx, canvas, "rgba(255, 0, 127, 0.4)");

                    if (hp <= 0) {
                        gameOver = true;
                        showOverlay('gameOverOverlay');
                        if (gameInterval) clearInterval(gameInterval);
                    } else {
                        // 【應需求修改】答錯時彈出分析讲解，點擊按鈕才能繼續
                        const curQObj = QUESTIONS[currentLevel][currentQuestionIndex];
                        triggerWrongAnswerExplanation(ghost.label, curQObj.ans, curQObj.explanation);
                    }
                }
                break;
            }
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap(ctx);
    drawBackgroundDots(ctx);
    player.draw(ctx);
    ghosts.forEach(ghost => ghost.draw(ctx));
}

function drawScreenFlash(ctx, canvas, colorStyle) {
    ctx.fillStyle = colorStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 繪製地圖 (支援 Level 2 紫色霓虹風格)
function drawMap(ctx) {
    for (let r = 0; r < activeMap.length; r++) {
        for (let c = 0; c < activeMap[r].length; c++) {
            if (activeMap[r][c] === 1) {
                // 第二關轉深紫色牆壁與亮紫描邊
                ctx.fillStyle = (currentLevel === 2) ? "#20032b" : "#121424";
                ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                
                ctx.strokeStyle = (currentLevel === 2) ? "#b026ff" : "#00f0ff";
                ctx.lineWidth = 2;
                ctx.strokeRect(c * TILE_SIZE + 2, r * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            }
        }
    }
}

function drawBackgroundDots(ctx) {
    for (let r = 0; r < activeMap.length; r++) {
        for (let c = 0; c < activeMap[r].length; c++) {
            if (activeMap[r][c] === 0) {
                if (r === 6 && c === 6) continue;
                ctx.beginPath();
                ctx.arc(c * TILE_SIZE + TILE_SIZE/2, r * TILE_SIZE + TILE_SIZE/2, 2.5, 0, 2 * Math.PI);
                // 第二關豆子呈微紫霓虹感
                ctx.fillStyle = (currentLevel === 2) ? "rgba(176, 38, 255, 0.4)" : "rgba(0, 240, 255, 0.4)";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

document.addEventListener('click', () => {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) canvas.focus();
});

document.addEventListener('keydown', (e) => {
    if (!player || gameOver) return;
    let handled = false;
    switch(e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
            setDirection('up');
            handled = true;
            break;
        case 's':
        case 'arrowdown':
            setDirection('down');
            handled = true;
            break;
        case 'a':
        case 'arrowleft':
            setDirection('left');
            handled = true;
            break;
        case 'd':
        case 'arrowright':
            setDirection('right');
            handled = true;
            break;
    }
    if (handled) {
        e.preventDefault();
    }
});

function showOverlay(id) {
    hideAllOverlays();
    document.getElementById(id).style.display = 'flex';
}

function hideAllOverlays() {
    const overlays = ['startOverlay', 'explanationOverlay', 'nextLevelOverlay', 'gameOverOverlay', 'victoryOverlay'];
    overlays.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function resetToHome() {
    if (gameInterval) clearInterval(gameInterval);
    showOverlay('startOverlay');
}

function retryCurrentLevel() {
    startGame(currentLevel);
}
