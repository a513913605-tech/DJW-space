const canvasStage = document.querySelector(".canvas-stage");
const nodes = document.querySelectorAll(".workflow-node");
const inspectorTitle = document.querySelector(".panel-head h2");
const inspectorName = document.querySelector(".inspector input");
const zoomInput = document.querySelector(".canvas-controls input");
const zoomValue = document.querySelector("[data-zoom-value]");
const previewButton = document.querySelector("[data-action='preview']");
const runButton = document.querySelector("[data-action='run']");

const nodeLabels = {
  source: "输入素材",
  prompt: "提示词",
  model: "图像模型",
  edit: "局部重绘",
  merge: "图片融合",
  review: "人工筛选",
  output: "输出画面",
};

function selectNode(node) {
  nodes.forEach((item) => item.classList.toggle("is-selected", item === node));
  const label = nodeLabels[node.dataset.node] || "工作流节点";
  inspectorTitle.textContent = label;
  inspectorName.value = label;
}

function setZoom(value) {
  const zoom = Math.max(60, Math.min(120, Number(value)));
  document.documentElement.style.setProperty("--canvas-scale", zoom / 100);
  canvasStage.style.zoom = zoom / 100;
  zoomInput.value = zoom;
  zoomValue.textContent = `${zoom}%`;
}

nodes.forEach((node) => {
  node.addEventListener("click", () => selectNode(node));
});

document.querySelectorAll(".tool-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tool-button").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
  });
});

document.querySelector("[data-zoom='out']").addEventListener("click", () => {
  setZoom(Number(zoomInput.value) - 5);
});

document.querySelector("[data-zoom='in']").addEventListener("click", () => {
  setZoom(Number(zoomInput.value) + 5);
});

zoomInput.addEventListener("input", (event) => {
  setZoom(event.target.value);
});

previewButton.addEventListener("click", () => {
  canvasStage.scrollTo({ left: 360, top: 120, behavior: "smooth" });
});

runButton.addEventListener("click", () => {
  const output = document.querySelector("[data-node='output']");
  selectNode(output);
  output.animate(
    [
      { transform: "translateY(0)", boxShadow: "0 18px 46px rgba(31, 29, 25, 0.14)" },
      { transform: "translateY(-4px)", boxShadow: "0 24px 60px rgba(242, 164, 58, 0.22)" },
      { transform: "translateY(0)", boxShadow: "0 18px 46px rgba(31, 29, 25, 0.14)" },
    ],
    { duration: 620, easing: "ease-out" }
  );
});

setZoom(86);
canvasStage.scrollTo({ left: 0, top: 20 });
