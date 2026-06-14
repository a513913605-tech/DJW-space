const handles = [
  { direction: "top", type: "target" },
  { direction: "bottom", type: "source" },
  { direction: "right", type: "source" },
  { direction: "left", type: "target" },
];

const node = (
  id: string,
  content: string,
  x: number,
  y: number,
  order: number,
  background: string,
  width = 236,
  height = 76,
) => ({
  id,
  pid: "base",
  type: "Button",
  position: { x, y },
  data: {
    style: {
      text: {
        content,
        color: "rgba(246, 247, 250, 0.96)",
        fontSize: 15,
        bold: true,
        textAlign: "center",
        lineHeight: 1.45,
        italic: false,
        underline: false,
        through: false,
      },
      background,
      radius: 8,
      handles,
      mouse: "default",
    },
    animation: {},
    interaction: {},
    info: {},
    order,
  },
  selected: false,
  selectable: true,
  draggable: true,
  deletable: true,
  isConnectable: true,
  dragging: false,
  zIndex: order,
  parentId: "",
  width,
  height,
  measured: { width, height },
  resizing: false,
});

const edge = (id: string, source: string, target: string, animated = true) => ({
  id,
  source,
  target,
  type: "fm-edge",
  animated,
  sourceHandle: `source-right-${source}`,
  targetHandle: `target-left-${target}`,
  data: {
    style: {
      width: animated ? 2 : 1,
      color: "#f2a43a",
      labelBorder: true,
      style: "getSimpleBezierPath",
      text: {
        content: "",
        color: "",
        fontSize: 12,
        bold: false,
        textAlign: "center",
        lineHeight: 1.4,
        italic: false,
        underline: false,
        through: false,
      },
    },
  },
});

const initData = {
  title: "DJW Design AI Workflow",
  nodes: [
    node("ai_input", "01 素材输入\nReference / Brief", -30, 180, 1, "rgba(18, 23, 32, 0.76)"),
    node("ai_prompt", "02 提示词设定\nPrompt System", 300, 96, 2, "rgba(18, 23, 32, 0.76)"),
    node("ai_style", "03 风格锁定\nStyle Control", 300, 278, 3, "rgba(18, 23, 32, 0.76)"),
    node("ai_model", "04 图像生成\nImage Model", 650, 180, 4, "rgba(18, 23, 32, 0.76)"),
    node("ai_edit", "05 局部重绘\nInpaint / Extend", 990, 96, 5, "rgba(18, 23, 32, 0.76)"),
    node("ai_review", "06 人工筛选\nDesign Review", 990, 278, 6, "rgba(18, 23, 32, 0.76)"),
    node("ai_output", "07 输出入库\nExport / Archive", 1330, 180, 7, "rgba(18, 23, 32, 0.76)", 252, 82),
  ],
  edges: [
    edge("e_input_prompt", "ai_input", "ai_prompt"),
    edge("e_input_style", "ai_input", "ai_style"),
    edge("e_prompt_model", "ai_prompt", "ai_model"),
    edge("e_style_model", "ai_style", "ai_model"),
    edge("e_model_edit", "ai_model", "ai_edit"),
    edge("e_model_review", "ai_model", "ai_review"),
    edge("e_edit_output", "ai_edit", "ai_output"),
    edge("e_review_output", "ai_review", "ai_output"),
  ],
  used: false,
};

export default initData;
