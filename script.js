"use strict";

let scroller = new Scroller();
Player.prototype = scroller;
Alien.prototype = scroller;

const W = 31;
const H = 31;
const GAMECLEAR = 1;
const GAMEOVER = 2;
const maze = [];
const player = new Player(1,1);
const aliens = [new Alien(W - 2, 1), new Alien(1, W - 2)];

let ctx;
let keyCode = 0;
let status = 0;
let frame = 0;
let timer = NaN;

let height;
let width;
let canvas;
let div1;
let div2;
let canvasSize = 600; // 自由に変更してね！canvasの大きさだよ！

const BASE_WIDTH = 900;
const BASE_HEIGHT = 600;

window.addEventListener("load", () => {
    init();
    canvas = document.getElementById("maze");
    width = window.innerWidth;
    height = window.innerHeight;
    div1 = document.getElementsByClassName("header")[0];
    div2 = document.getElementsByClassName("footer")[0];
    
    if (width < 600) {
        canvasSize = width;
    }
    
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    div1.style.height = (height - canvasSize) / 2 + "px";
    div2.style.height = (height - canvasSize) / 2 + "px";
    div1.style.width = canvasSize + "px";
    div2.style.width = canvasSize + "px";
});

function Scroller() {
    this.doScroll = function() {
        if (this.dx == 0 && this.dy == 0) {
            return;
        }
        
        if (++this.scrollCount >= 5) {
            this.x = this.x + this.dx;
            this.y = this.y + this.dy;
            this.dx = 0;
            this.dy = 0;
            this.scrollCount = 0;
        }
    };

    this.getScrollX = function() {
        return this.x * 50 + this.dx * this.scrollCount * 10;
    };
    this.getScrollY = function() {
        return this.y * 50 + this.dy * this.scrollCount * 10;
    };
}

function Player(x, y) {
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.dir = 0;
    this.scrollCount = 0;

    this.update = function() {
        this.doScroll();
        if (this.scrollCount > 0 ) {
            return;
        }

        if (this.x == W - 2 && this.y == H - 2) {
            clearInterval(timer);
            status = GAMECLEAR;
            document.getElementById("bgm").pause();
            repaint();
        }

        this.dx = 0;
        this.dy = 0;
        let nx = 0;
        let ny = 0;
        switch (keyCode) {
            case 37: nx = -1; this.dir = 2; break;
            case 38: ny = -1; this.dir = 0; break;
            case 39: nx = +1; this.dir = 3; break;
            case 40: ny = +1; this.dir = 1; break;
        }
        if (maze[this.y + ny][this.x + nx] == 0) {
            this.dx = nx;
            this.dy = ny;
        };
    };

    this.paint = function(gc ,x, y, w, h) {
        let img = document.getElementById("hero" + this.dir);
        gc.drawImage(img, x, y, w, h);
    };
}

function Alien(x, y) {
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.dir = 0;
    this.scrollCount = 0;

    this.update = function() {
        this.doScroll();

        let diffX = Math.abs(player.getScrollX() - this.getScrollX());
        let diffY = Math.abs(player.getScrollY() - this.getScrollY());
        if (diffX <= 30 && diffY <= 30) {
            clearInterval(timer);
            status = GAMEOVER;
            document.getElementById("bgm").pause();
            repaint();
        }

        let gapx = player.x - this.x;
        let gapy = player.y - this.y;
        switch (random(4)) {
                case 0:
                this.dx = gapx > 0 ? 1 : -1;
                this.dir = this.dx == -1 ? 2 : 3;
                break;
            case 1:
                this.dy = gapy > 0 ? 1 : -1;
                this.dir = this.dy == -1 ? 0 : 1;
                break;
            default:
                this.dx = 0;
                this.dy = 0;
                break;
        }
    };

    this.paint = function(gc, w, h) {
        let img = document.getElementById("alien" + this.dir);
        gc.drawImage(img, this.getScrollX(), this.getScrollY(), w, h);
    };
}

function random (v) {
    return Math.floor(Math.random() * v);
}

function init() {
    let maze = document.getElementById("maze");
    ctx = maze.getContext("2d");
    ctx.font = "bold 48px sans-serif";
    
    createMaze(W, H);
    repaint();
}

function go() {
    console.log("go");
    window.onkeydown = mykeydown;
    window.onkeyup = mykeyup;

    let maze = document.getElementById("maze");
    maze.onmousedown = mymousedown;
    maze.onmouseup = mykeyup;
    maze.oncontextmenu = function(e) {
        e.preventDefault();
    };
    maze.addEventListener("touchstart", mymousedown);
    maze.addEventListener("touchend", mykeyup);

    timer = setInterval(tick, 30);
    document.getElementById("START").style.display = "none";
    document.getElementById("bgm").play();
}

function tick() {
    frame++;
    player.update();
    aliens.forEach((a) => a.update());
    repaint();
    // if (frame % 2 == 0) {
        
    // }
}

function createMaze(w, h) {
    for (let y = 0; y < h; y++) {
        maze[y] = [];
        for (let x = 0; x < w; x++) {
            maze[y][x] = x == 0 || x == w - 1 || y == 0 || y == h - 1 ? 1 : 0;
        }
    }

    for (let y = 2; y < h - 2; y += 2) {
        for (let x = 2; x < w - 2; x += 2) {
            maze[y][x] = 1;

            let dir = random(y == 2 ? 4 : 3);
            let px = x;
            let py = y;
            switch (dir) {
                case 0: py++; break;
                case 1: px--; break;
                case 2: px++; break;
                case 3: py--; break;
            }
            maze[py][px] = 1;
        }
    }
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

function repaint() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 900, 600);

    ctx.save();
    ctx.beginPath();
    ctx.arc(300, 300, 300, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = "brown";
    ctx.translate(6 * 50, 6 * 50);
    ctx.translate(-1 * player.getScrollX(), -1 * player.getScrollY());
    for (let x = 0; x < W; x++) {
        for (let y = 0; y < H; y++) {
            if (maze[y][x] == 1) {
                ctx.fillRect(x * 50, y * 50, 50, 50);
            }
        }
    }
    aliens.forEach((a) => a.paint(ctx, 50, 50))
    ctx.restore();

    ctx.fillStyle = "#eee";
    ctx.fillRect(650, 0, 250, 600);

    ctx.save();
    ctx.translate(670, 300);
    ctx.fillStyle = "brown";
    for (let x = 0; x < W; x++) {
        for (let y = 0; y < H; y++) {
            if (maze[y][x] == 1) {
                ctx.fillRect(x * 7, y * 7, 7, 7);
            }
        }
    }
    drawCircle(player.x * 7 + 3, player.y * 7 + 3, 3, "red");
    aliens.forEach ((a) => {
        drawCircle(a.x * 7 + 3, a.y * 7 + 3, 3, "purple");
    });

    ctx.restore();

    ctx.drawImage(arrows, 670, 70, 200, 200);
    let ax = -100;
    let ay = -100;
    switch (keyCode) {
        case 39:
            ax = 830;
            ay = 170;
            break;
        case 40:
            ax = 770;
            ay = 230;
            break;
        case 37:
            ax = 710;
            ay = 170;
            break;
        case 38:
            ax = 770;
            ay = 120;
            break;
    }
    drawCircle(ax, ay, 30, "yellow");

    player.paint(ctx, 300, 300, 50, 50);
    ctx.fillStyle = "yellow";
    if (status == GAMEOVER) {
        ctx.fillText("GAME OVER", 150, 200);
    } else if (status == GAMECLEAR) {
        ctx.fillText("GAME CLEAR", 150, 200);
    };
}

function mykeydown(e) {
    keyCode = e.keyCode;
}
function mykeyup(e) {
    keyCode = 0;
}
function mymousedown(e) {
    let x = !isNaN(e.offsetX) ? e.offsetX : e.touches[0].clientX;
    let y = !isNaN(e.offsetY) ? e.offsetY : e.touches[0].clientY;

    if (670 < x && x < 870 && 70 < y && y < 270) {
        x -= 770;
        y -= 170;

        if (Math.abs(x) > Math.abs(y)) {
            keyCode = x > 0 ? 39 : 37;
        } else {
            keyCode = y > 0 ? 40 : 38;
        }
    }
}