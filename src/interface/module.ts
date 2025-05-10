export interface ModuleLabel {
  text: string,
  "position": [number, number, number],
  "font": string,
  "color": string
}

// 模型组件类型
export type ModuleObject =
  | {
      id: string;
      type: "box";
      position: [number, number, number];
      dimensions: [number, number, number];
      color: [number, number, number, number];
      label?: ModuleLabel
    }
  | {
      id: string;
      type: "model";
      position: [number, number, number];
      url: string;
      scale?: number;
    }
  | ({
    id: string;
    type: "label";
    } & ModuleLabel);

// 场景 JSON 结构
export interface ModuleJSON {
  basePosition: [number, number, number]; // 经纬度原点
  objects: ModuleObject[];
}
