import "./style.css";
import * as Matter from "matter-js";
import { sentences } from "./data.ts";
//@ts-expect-error unused import
import coinImage from "../public/Mark.png";

const collisionTypes = {
  CHAIN_END: 0x0001,
  DRAGGABLE: 0x0002,
  OTHER: 0x0004,
  COIN: 0x0008,
  SENSOR: 0x0010,
} as const;
// module aliases
const Engine = Matter.Engine,
  Render = Matter.Render,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite;

const main = document.querySelector("main") as HTMLElement;
const audio = document.getElementById("audioElement") as HTMLAudioElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const width = 1000,
  height = 1000;

canvas.width = width;
canvas.height = height;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const matterStyle = {
  fillStyle: "transparent",
  strokeStyle: "transparent",
};

window.addEventListener("resize", function () {
  canvas.width = main.clientWidth;
  canvas.height = main.clientHeight;
});

let counter = 0;

const textBox = document.querySelector<HTMLButtonElement>("#textBox")!;
textBox.innerHTML = sentences[counter];

const nextSentence = () => {
  counter++;
  textBox.innerHTML = sentences[counter % sentences.length];
  slowlyRemoveTextHightlight(highlightText(textBox));
};

// higlight all chars of textBox with black on char at the time so we can animate it per char
const highlightText = (element: HTMLElement) => {
  const text = element.innerHTML;
  element.innerHTML = "";

  const chars = text.split("");
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    // set a span per char with highlight
    const span = document.createElement("span");
    span.innerHTML = char;
    span.style.backgroundColor = "black";
    textBox.appendChild(span);
  }
  return element;
};

const slowlyRemoveTextHightlight = (element: HTMLElement) => {
  // get all spans with highlight
  const spans = element.querySelectorAll("span");
  spans.forEach((span, index) => {
    // wait ~ 50ms per span
    setTimeout(() => {
      span.style.backgroundColor = "transparent";
    }, 100 * index * Math.random());
  });
};

// create an engine
const engine = Engine.create();

// create a renderer
const render = Render.create({
  canvas: canvas,
  element: main,
  engine: engine,
  options: {
    wireframes: false,
    background: undefined,
  },
});

// var group = Matter.Body.nextGroup(true);

const slotConfig = {
  width: 32,
  height: 230,
  x: width / 2,
  y: height / 2,
};

const slot = {
  body: Matter.Bodies.rectangle(
    slotConfig.x,
    slotConfig.y,
    slotConfig.width,
    slotConfig.height,
    {
      isSensor: true,
      isStatic: true,
      render: matterStyle,
    }
  ),
  elem: document.querySelector("#slot") as HTMLDivElement,
  render() {
    const { x, y } = this.body.position;
    this.elem.style.width = `${slotConfig.width}px`;
    this.elem.style.height = `${slotConfig.height}px`;
    this.elem.style.left = `${x - slotConfig.width / 2}px`;
    this.elem.style.top = `${y - slotConfig.height / 2}px`;
    this.elem.style.transform = `rotate(${this.body.angle}rad)`;
  },
};

const coinDestroyField = {
  body: Matter.Bodies.fromVertices(
    slotConfig.x + 76,
    slotConfig.y + 64,
    // starts at the top right of the slot
    [
      [
        { x: 0, y: 0 },
        { x: 121.5, y: 121.5 },
        { x: 121.5, y: 320 },
        { x: 0, y: 200 },
      ],
    ],
    {
      isSensor: true,
      isStatic: true,
      label: "Sensor",
      render: matterStyle,
      collisionFilter: {
        category: collisionTypes.SENSOR,
      },
    },
    true
  ),
  elem: document.querySelector("#coinDestroyField") as HTMLDivElement,
  render() {
    const { x, y } = this.body.position;
    this.elem.style.left = `${x - 60}px`;
    this.elem.style.top = `${y - 348 / 2}px`;
    this.elem.style.transform = `rotate(${this.body.angle}rad)`;
    this.elem.style.zIndex = "5";
  },
};

// two colliders that hold the coin
const coinHolder1 = {
  body: Matter.Bodies.rectangle(
    slotConfig.x + 50,
    slotConfig.y + 160,
    slotConfig.width / 2,
    slotConfig.height * 0.8,
    {
      isStatic: true,
      render: matterStyle,
    }
  ),
  elem: document.querySelector("#coinHolder1") as HTMLDivElement,
};
Matter.Body.rotate(coinHolder1.body, Math.PI / -4);

// two colliders that hold the coin
const coinHolder2 = {
  body: Matter.Bodies.rectangle(
    slotConfig.x + 130,
    slotConfig.y + 100,
    slotConfig.width,
    slotConfig.height,
    {
      isStatic: true,
      render: matterStyle,
    }
  ),
  elem: document.querySelector("#coinHolder2") as HTMLDivElement,
};

const coinHolder3 = {
  body: Matter.Bodies.rectangle(
    slotConfig.x + 70,
    slotConfig.y - 65,
    slotConfig.width / 2,
    slotConfig.height / 1.5,
    {
      isStatic: true,
      render: matterStyle,
    }
  ),
  elem: document.querySelector("#coinHolder2") as HTMLDivElement,
};

Matter.Body.rotate(coinHolder3.body, Math.PI / -4);

const coins: {
  body: Matter.Body;
  elem: HTMLDivElement;
  render: () => void;
}[] = [];
for (let i = 0; i < 7; i++) {
  // create coin div and add it to the DOM

  const coinEl = document.createElement("div");
  coinEl.id = `coin${i}`;
  coinEl.classList.add("coin");
  main.appendChild(coinEl);

  coins.push({
    body: Matter.Bodies.circle(
      (Math.random() * width) / 4 + 30,
      0 - i * 100,
      45,
      {
        // collisionFilter: { group: group },
        label: `coin${i}`,
        collisionFilter: {
          // group: group,
          category: collisionTypes.COIN,
        },
        render: {
          fillStyle: "transparent",
          strokeStyle: "transparent",
        },
      }
    ),
    elem: document.querySelector(`#coin${i}`) as HTMLDivElement,
    render() {
      const { x, y } = this.body.position;
      this.elem.style.top = `${y - 25}px`;
      this.elem.style.left = `${x - 25}px`;
      this.elem.style.transform = `rotate(${this.body.angle}rad)`;
    },
  });
}

const coinsBodies = coins.map((coin) => coin.body);

const boundaryConfig = {
  isStatic: true,
  collisionFilter: {
    category: collisionTypes.OTHER,
  },
  render: matterStyle,
};
// simplefy boundaries
const leftBoundary = Bodies.rectangle(
  -13,
  height + 200,
  26,
  height,
  boundaryConfig
);
const rightBoundary = Bodies.rectangle(
  -30,
  height / 2,
  26,
  height,
  boundaryConfig
);
const bottomGround = Bodies.rectangle(
  width / 2,
  height - 40,
  width * 2,
  180,
  boundaryConfig
);

// add mouse control
const mouse = Matter.Mouse.create(main),
  mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    // track document

    constraint: {
      stiffness: 0.2,

      render: {
        visible: false,
      },
    },
  });

// add all of the bodies to the world
Composite.add(engine.world, [
  ...coinsBodies,
  mouseConstraint,
  coinHolder3.body,
  coinHolder2.body,
  coinHolder1.body,
  coinDestroyField.body,
  slot.body,
  // ...boxes,
  bottomGround,
  leftBoundary,
  rightBoundary,
]);

// run the renderer
Render.run(render);

// on first load resize to window size
window.addEventListener("load", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

Matter.Events.on(engine, "collisionStart", function (event) {
  const pairs = event.pairs;

  const coin = pairs.find(
    (pair) =>
      pair.bodyA.collisionFilter.category === collisionTypes.COIN ||
      pair.bodyB.collisionFilter.category === collisionTypes.COIN
  );

  const sensor = pairs.find(
    (pair) =>
      pair.bodyA.collisionFilter.category === collisionTypes.SENSOR ||
      pair.bodyB.collisionFilter.category === collisionTypes.SENSOR
  );

  if (sensor && coin) {
    deleteCoin(coin);
    nextSentence();
  }
});

const deleteCoin = (coin: Matter.Pair) => {
  audio.play();
  const removeFromDom = (label: string) => {
    const coinEl = document.getElementById(`${label}`)!;
    coinEl.remove();
  };
  // remove the coin from the world after a delay
  setTimeout(() => {
    if (coin.bodyA.collisionFilter.category === collisionTypes.COIN) {
      Composite.remove(engine.world, coin.bodyA);
      // remove also from dom
      removeFromDom(coin.bodyA.label);
    } else {
      Composite.remove(engine.world, coin.bodyB);
      removeFromDom(coin.bodyB.label);
    }
  }, 1000);
};

const renderAllCoins = () => {
  for (const coin of coins) {
    coin.render();
  }
};

(function rerender() {
  coinDestroyField.render();
  slot.render();
  renderAllCoins();
  Matter.Engine.update(engine);
  requestAnimationFrame(rerender);
})();
