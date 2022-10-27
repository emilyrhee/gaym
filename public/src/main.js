const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
class MapRegion {
  constructor (src) {
    this.img = new Image();
    this.img.src = "images/" + src + ".png";
    this.w = this.img.width;
    this.h = this.img.height;
  }
  
  draw () {
    ctx.drawImage(this.img, 0, 0);
  }
}

const map = new MapRegion("grass");
map.w = 1600;
map.h = 800;

const inventory = {
  holdLimit: 1,
  items: []
}
class Sprite {
  constructor(x, y, src, w, h) {
    this.x = x;
    this.y = y;
    this.w = w || 80;
    this.h = h || 80;
    this.img = new Image();
    this.img.src = "images/" + src + ".png";
    this.speed = 3;
  }
  draw() {
    ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
  }

  enclose(map) {
    if (this.x < 0) {
      this.x = 0
    } else if (this.x > 1600 - this.w) {
      this.x = 1600 - this.w
    }
  
    if (this.y < 0) {
      this.y = 0
    } else if (this.y > 800 - this.h) {
      this.y = 800 - this.h
    }
  }
  
  update (map) {
    this.enclose(map);
  }
}

const player = new Sprite(30, 40, "player");
const potionBlue = new Sprite(200, 200, "potion_blue");
const potionBlue2 = new Sprite(300, 200, "potion_blue");

const items = [potionBlue, potionBlue2];

function collision(thing) {
  let halfWidth = thing.w / 2;
  let halfHeight = thing.h / 2;
  if (player.x + player.w < thing.x + halfWidth ||    // left
      player.x > thing.x + thing.w - halfWidth ||     // right
      player.y + player.h < thing.y + halfHeight ||   // top
      player.y > thing.y + thing.h - halfHeight) {    // bottom
  return;
  }
  if (inventory.holdLimit > inventory.items.length) {
    thing.x = -80;
    thing.y = -80;
  }
  inventory.items.push(thing);
}

const menu = {
  canvas: document.getElementById('menu-canvas'),
  ctx: canvas.getContext('2d'),
  isShown: false,
  x: -100,
  y: -100,
  w: 150,
  h: 100,
  draw: function() {
    this.ctx.beginPath();
    this.ctx.rect(menu.x, menu.y, menu.w, menu.h);
    this.ctx.stroke();
  },
  toggle: function() {
    if (menu.isShown) {
      this.isShown = false;
      this.x = -100;
      this.y = -100;
    } else {
      this.isShown = true;
      this.x = 200;
      this.y = 200;
    }
  } 
}

var pressKeyMap = {};
var holdDownKeyMap = {};

document.addEventListener("keydown", (event) => {
  pressKeyMap[event.key] = event.type == "keydown"; // true
  holdDownKeyMap[event.key] = event.type == "keydown"; // true
});

document.addEventListener("keyup", (event) => {
  if (pressKeyMap[event.key]) {
    if (pressKeyMap["e"]) menu.toggle();

    pressKeyMap[event.key] = event.type == "keydown"; // false
  }
  
  holdDownKeyMap[event.key] = event.type == "keydown"; // false
});

function holdDownKeys() {
  if (holdDownKeyMap["w"]) player.y -= player.speed;
  if (holdDownKeyMap["a"]) player.x -= player.speed;
  if (holdDownKeyMap["s"]) player.y += player.speed;
  if (holdDownKeyMap["d"]) player.x += player.speed;
} 

const camera = {
  x: 0,
  y: 0,
  focus: function(canvas, map, player) {
    this.x = this.clamp(player.x - canvas.width / 2 + player.w / 2, 0, map.w - canvas.width);
    this.y = this.clamp(player.y - canvas.height / 2 + player.h / 2, 0, map.h - canvas.height);
  },
  clamp: function(coord, min, max) {
    if (coord < min) {
      return min
    } else if (coord > max) {
      return max
    } else {
      return coord
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  menu.ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.update(map);

  camera.focus(canvas, map, player);

  ctx.translate(-camera.x, -camera.y);

  holdDownKeys();

  map.draw();
  for (let i = 0; i < items.length; i++) {
    items[i].draw();
  }
  player.draw();  

  for (let i = 0; i < items.length; i++) {
    collision(items[i]);
  }

  menu.draw();
}
animate();