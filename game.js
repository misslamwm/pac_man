// ============================================================================
// 指數吃豆人：跨平台終極挑戰 (Indices PAC-MAN Ultimate) - 核心遊戲引擎
// ============================================================================

// 1. 關卡與題庫設定 (更新自 CSV 檔案：Level 1 基礎指數定律, Level 2 綜合指數運算)
const QUESTIONS = {
    1: [
        { q: "a^5 \\times a^3", options: ["a^8", "a^{15}", "a^2", "a^{16}"], ans: "a^8" },
        { q: "y^7 \\times y^4", options: ["y^{11}", "y^{28}", "y^3", "y^{12}"], ans: "y^{11}" },
        { q: "x^{10} \\div x^2", options: ["x^8", "x^5", "x^{12}", "x^{20}"], ans: "x^8" },
        { q: "m^6 \\div m^5", options: ["m", "m^0", "m^{11}", "1"], ans: "m" },
        { q: "(k^3)^4", options: ["k^{12}", "k^7", "k^{81}", "k^1"], ans: "k^{12}" },
        { q: "(n^5)^3", options: ["n^{15}", "n^8", "n^{125}", "n^2"], ans: "n^{15}" },
        { q: "(ab)^6", options: ["a^6b^6", "ab^6", "a^6b", "a^1b^6"], ans: "a^6b^6" },
        { q: "(xy)^3", options: ["x^3y^3", "xy^3", "x^3y", "3xy"], ans: "x^3y^3" },
        { q: "(p/q)^4", options: ["p^4/q^4", "p^4/q", "p/q^4", "p^4q^4"], ans: "p^4/q^4" },
        { q: "(u/v)^7", options: ["u^7/v^7", "u^7/v", "u/v^7", "uv^7"], ans: "u^7/v^7" }
    ],
    2: [
        { q: "x^{-3}", options: ["1/x^3", "-x^3", "-3x", "x^3"], ans: "1/x^3" },
        { q: "k^0 (k \\neq 0)", options: ["1", "0", "k", "-1"], ans: "1" },
        { q: "y^{-5} \\times y^9", options: ["y^4", "y^{-14}", "1/y^4", "y^{45}"], ans: "y^4" },
        { q: "a^2 \\div a^{-4}", options: ["a^6", "a^{-2}", "1/a^2", "a^{-6}"], ans: "a^6" },
        { q: "(p^{-3})^4", options: ["1/p^{12}", "p^{-7}", "p^{12}", "-p^{12}"], ans: "1/p^{12}" },
        { q: "4b^0 (b \\neq 0)", options: ["4", "1", "0", "4b"], ans: "4" },
        { q: "w^{-6} \\times w^6", options: ["1", "w^{12}", "w^{-12}", "0"], ans: "1" },
        { q: "(xy)^{-2}", options: ["1/(x^2y^2)", "x^{-2}y^{-2}", "-x^2y^2", "x^2y^2"], ans: "1/(x^2y^2)" },
        { q: "(a^{-2})^{-3}", options: ["a^6", "a^{-5}", "1/a^6", "a^{-6}"], ans: "a^6" },
        { q: "(x/y)^{-3}", options: ["y^3/x^3", "x^3/y^3", "1/(x^3y^3)", "-x^3/y^3"], ans: "y^3/x^3" }
    ]
};

// 2. 地圖設定 (13x13 經典迷宮網格，1=牆壁, 0=通道, 2=吃豆人起點)
const MAP = [
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

const TILE_SIZE = 40; // 520 px 寬高 (13 * 40 px)

// 3. 遊戲狀態與角色實體
let currentLevel = 1;
let currentQuestionIndex = 0;
let score = 0;
let lives = 3;
let gameOver = false;
let gameInterval = null;
let player = null;
let ghosts = [];
const ghostColors = ["#ff0000", "#ffb8ff", "#00ffff", "#ffb852"]; // 紅、粉、青、橘

// 【防二次觸發鎖】：防止在答對時於 150ms 延時內重疊碰撞，保證「答對一題只前進一格進度」
let isTransitioning = false;

// 4. 輔助函數：將分數上標格式、LaTeX 乘除號轉換為 Unicode 數學字型
function formatLatexToUnicode(str) {
    if (!str) return "";
    let res = str;
    
    // 替換數學符號 (修正正則表達式，對應單斜線 Unicode 翻譯)
    res = res.replace(/\\times/g, ' × ');
    res = res.replace(/\\div/g, ' ÷ ');
    res = res.replace(/\\cdot/g, ' · ');
    res = res.replace(/\\neq/g, ' ≠ ');
    
    // 替換分數 \frac{A}{B} 格式
    res = res.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2');
    res = res.replace(/[{}]/g, ''); // 移除多餘 LaTeX 大括號
    
    // Unicode 上標對照表
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
                power += '(';
                i++;
                while (i < res.length && res[i] !== ')') {
                    power += res[i];
                    i++;
                }
                power += ')';
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
        
        // 【控制優化】：降低速度至 2 (40可被其整除)，行進與轉彎感更細膩、不易衝過頭
        this.speed = 2; 
        
        this.dirX = 0;
        this.dirY = 0;
        this.nextDirX = 0;
        this.nextDirY = 0;
        this.angle = 0.2; // 嘴巴開合角度
        this.mouthClosing = false;
    }

    update() {
        // 當前位置是否完全對齊網格中心點（(x - 20) % 40 === 0）
        const isAligned = ((this.x - TILE_SIZE/2) % TILE_SIZE === 0 && (this.y - TILE_SIZE/2) % TILE_SIZE === 0);
        
        if (isAligned) {
            this.gridX = Math.round((this.x - TILE_SIZE/2) / TILE_SIZE);
            this.gridY = Math.round((this.y - TILE_SIZE/2) / TILE_SIZE);

            // 【預輸入與轉彎緩衝】：若玩家先前按下了新方向，且該方向有通路，則在格子中心完美轉彎
            if (this.canMove(this.nextDirX, this.nextDirY)) {
                this.dirX = this.nextDirX;
                this.dirY = this.nextDirY;
            } else if (!this.canMove(this.dirX, this.dirY)) {
                // 如果目前的行進方向撞牆，則停止
                this.dirX = 0;
                this.dirY = 0;
            }
        }
        
        // 支援即時反向（在任何時候按下相反方向，均能直接回頭，不用等待對齊中心）
        if (this.nextDirX === -this.dirX && this.nextDirY === -this.dirY && (this.nextDirX !== 0 || this.nextDirY !== 0)) {
            this.dirX = this.nextDirX;
            this.dirY = this.nextDirY;
        }

        // 執行座標位移
        this.x += this.dirX * this.speed;
        this.y += this.dirY * this.speed;

        // 嘴巴動畫邏輯
        if (this.dirX !== 0 || this.dirY !== 0) {
            if (this.mouthClosing) {
                this.angle -= 0.02;
                if (this.angle <= 0.05) this.mouthClosing = false;
            } else {
                this.angle += 0.02;
                if (this.angle >= 0.25) this.mouthClosing = true;
            }
        } else {
            this.angle = 0.08; // 靜止時微張
        }
    }

    canMove(dx, dy) {
        if (dx === 0 && dy === 0) return false;
        const nextGridX = this.gridX + dx;
        const nextGridY = this.gridY + dy;
        if (nextGridX < 0 || nextGridX >= MAP[0].length || nextGridY < 0 || nextGridY >= MAP.length) return false;
        return MAP[nextGridY][nextGridX] !== 1; // 1是牆壁
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // 根據移動方向旋轉畫布嘴巴朝向
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

        // 畫眼睛
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
        
        // 幽靈速度設為 1 (40可被整除)，確保其與吃豆人完美對齊，移動慢更易躲避
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

            // 尋求路徑方向分支 (不走回頭路優先)
            const directions = [
                {x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}
            ];
            
            const validDirs = directions.filter(d => {
                const nextGridX = this.gridX + d.x;
                const nextGridY = this.gridY + d.y;
                if (nextGridX < 0 || nextGridX >= MAP[0].length || nextGridY < 0 || nextGridY >= MAP.length) return false;
                if (MAP[nextGridY][nextGridX] === 1) return false;
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
        
        // 1. 繪製幽靈身體
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

        // 2. 繪製白眼眶與藍瞳孔
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

        // 3. 繪製頭頂的題目答案圓角對話框 (數學好讀排版)
        // 【特別修改優化】：應需求「答案字型放大一倍」，從 bold 13px Arial 調升為 bold 24px Arial，寬高、位置按比例同等放大，極致清晰！
        ctx.font = "bold 24px Arial";
        const displayLabel = formatLatexToUnicode(this.label);
        const textWidth = ctx.measureText(displayLabel).width;
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
        
        const boxW = textWidth + 18;
        const boxH = 34;
        const boxX = this.x - boxW / 2;
        const boxY = this.y - this.radius - 42; // 將泡泡外移拉高，防止遮擋幽靈眼睛
        
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

// 5. 核心邏輯：讀取新題目並分配幽靈
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
    
    // 使用 KaTeX 渲染 HTML 的數學化化簡目標
    renderMathQuestion(curQ.q);
    
    // 進度更新
    document.getElementById('progressText').innerText = `${currentQuestionIndex} / ${qList.length}`;
    document.getElementById('progressBar').style.width = `${(currentQuestionIndex / qList.length) * 100}%`;

    // 每次重置吃豆人在地圖正中心
    player = new Pacman(6, 6);

    // 在迷宮 4 個角落擺放攜帶答案的幽靈
    ghosts = [];
    const spawnPositions = [
        {x: 1, y: 1}, {x: 11, y: 1}, {x: 1, y: 11}, {x: 11, y: 11}
    ];

    // 打亂答案選項排序
    const shuffledOptions = [...curQ.options].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 4; i++) {
        const pos = spawnPositions[i];
        const opt = shuffledOptions[i];
        const isCorrect = (opt === curQ.ans);
        ghosts.push(new Ghost(pos.x, pos.y, ghostColors[i], opt, isCorrect));
    }
    
    // 【答對跳關鎖解除】：新問題成功加載後，立刻解鎖
    isTransitioning = false;
}

// 6. 呼叫 KaTeX 渲染化簡目標
function renderMathQuestion(latex) {
    const qEl = document.getElementById('questionText');
    if (!qEl) return;
    
    // 檢查 KaTeX 庫是否加載成功
    if (typeof katex !== 'undefined') {
        try {
            katex.render(latex, qEl, {
                throwOnError: false,
                displayMode: false
            });
        } catch (err) {
            console.error("KaTeX error:", err);
            qEl.innerText = formatLatexToUnicode(latex);
        }
    } else {
        // 備用方案 (離線/CDN被擋狀態)
        qEl.innerText = formatLatexToUnicode(latex);
    }
}

// 7. 遊戲全域控制
function startGame(level) {
    currentLevel = level;
    currentQuestionIndex = 0;
    score = 0;
    lives = 3;
    gameOver = false;
    isTransitioning = false;

    // UI 設定
    document.getElementById('levelBadge').innerText = `Level ${level}`;
    document.getElementById('scoreVal').innerText = score;
    updateLivesUI();
    hideAllOverlays();
    
    loadQuestion();

    // 【控制聚焦】：主動將鍵盤焦點鎖定至 window ＆ Canvas，保證玩家能立即用 WASD / 方向鍵玩！
    window.focus();
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        canvas.focus();
    }

    // 啟動每秒 60 幀渲染畫布的主循環
    const ctx = canvas.getContext('2d');
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        updateGame(ctx, canvas);
    }, 1000 / 60);
}

function updateLivesUI() {
    let hearts = "";
    for (let i = 0; i < lives; i++) hearts += "❤️";
    document.getElementById('livesVal').innerText = hearts || "💀";
}

// 【方向控制轉向】
function setDirection(dir) {
    if (!player) return;
    switch(dir) {
        case 'up': player.nextDirX = 0; player.nextDirY = -1; break;
        case 'down': player.nextDirX = 0; player.nextDirY = 1; break;
        case 'left': player.nextDirX = -1; player.nextDirY = 0; break;
        case 'right': player.nextDirX = 1; player.nextDirY = 0; break;
    }
}

// 【控制焦點守護者】：點擊頁面任何位置，都會立刻把鍵盤焦點拉回到 canvas 上
document.addEventListener('click', () => {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) canvas.focus();
});

// 【鍵盤控制監聽】：完美支援 WASD 與電腦鍵盤方向鍵
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
        e.preventDefault(); // 防止鍵盤方向鍵捲動網頁
    }
});

// 8. 主運作與更新引擎
function updateGame(ctx, canvas) {
    if (gameOver) return;

    player.update();
    ghosts.forEach(ghost => ghost.update());

    // 碰撞檢查 (吃豆人與幽靈相撞)
    if (!isTransitioning) {
        for (let i = 0; i < ghosts.length; i++) {
            const ghost = ghosts[i];
            const dist = Math.sqrt((player.x - ghost.x)**2 + (player.y - ghost.y)**2);
            
            if (dist < 22) { // 判定相碰
                // 鎖定狀態：防止多幀連續判定，徹底杜絕一答對就跳至進度8的漏洞！
                isTransitioning = true; 

                if (ghost.isCorrect) {
                    // 吃對答案：加分、閃綠光並前進一題
                    score += 10;
                    document.getElementById('scoreVal').innerText = score;
                    currentQuestionIndex++;
                    drawScreenFlash(ctx, canvas, "rgba(57, 255, 20, 0.3)");
                    
                    setTimeout(() => {
                        loadQuestion();
                    }, 500); // 增加 500 毫秒舒適的答對延遲反饋
                } else {
                    // 吃錯答案：扣血、閃紅光、重新分配起點
                    lives--;
                    updateLivesUI();
                    drawScreenFlash(ctx, canvas, "rgba(255, 0, 127, 0.4)");

                    if (lives <= 0) {
                        gameOver = true;
                        showOverlay('gameOverOverlay');
                        if (gameInterval) clearInterval(gameInterval);
                    } else {
                        // 還留有生命，僅重置角色與幽靈位置
                        player = new Pacman(6, 6);
                        ghosts.forEach((g, idx) => {
                            const spawnPositions = [
                                {x: 1, y: 1}, {x: 11, y: 1}, {x: 1, y: 11}, {x: 11, y: 11}
                            ];
                            g.gridX = spawnPositions[idx].x;
                            g.gridY = spawnPositions[idx].y;
                            g.x = g.gridX * TILE_SIZE + TILE_SIZE / 2;
                            g.y = g.gridY * TILE_SIZE + TILE_SIZE / 2;
                            g.dirX = 0;
                            g.dirY = -1;
                        });
                        
                        // 扣血重置後 800 毫秒無敵/過渡，解除鎖定
                        setTimeout(() => {
                            isTransitioning = false;
                        }, 800);
                    }
                }
                break;
            }
        }
    }

    // 繪製迷宮與角色
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap(ctx);
    drawBackgroundDots(ctx);
    player.draw(ctx);
    ghosts.forEach(ghost => ghost.draw(ctx));
}

// 繪圖輔助方法
function drawScreenFlash(ctx, canvas, colorStyle) {
    ctx.fillStyle = colorStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 繪製霓虹地圖
function drawMap(ctx) {
    for (let r = 0; r < MAP.length; r++) {
        for (let c = 0; c < MAP[r].length; c++) {
            if (MAP[r][c] === 1) {
                ctx.fillStyle = "#121424";
                ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                
                ctx.strokeStyle = "#00f0ff";
                ctx.lineWidth = 2;
                ctx.strokeRect(c * TILE_SIZE + 2, r * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            }
        }
    }
}

// 繪製豆子
function drawBackgroundDots(ctx) {
    for (let r = 0; r < MAP.length; r++) {
        for (let c = 0; c < MAP[r].length; c++) {
            if (MAP[r][c] === 0) {
                if (r === 6 && c === 6) continue;
                ctx.beginPath();
                ctx.arc(c * TILE_SIZE + TILE_SIZE/2, r * TILE_SIZE + TILE_SIZE/2, 2.5, 0, 2 * Math.PI);
                ctx.fillStyle = "rgba(0, 240, 255, 0.4)";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Overlay 畫面顯示輔助
function showOverlay(id) {
    hideAllOverlays();
    document.getElementById(id).style.display = 'flex';
}

function hideAllOverlays() {
    const overlays = ['startOverlay', 'nextLevelOverlay', 'gameOverOverlay', 'victoryOverlay'];
    overlays.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function resetToHome() {
    if (gameInterval) clearInterval(gameInterval);
    showOverlay('startOverlay');
}

// 重新挑戰目前關卡
function retryCurrentLevel() {
    startGame(currentLevel);
}
