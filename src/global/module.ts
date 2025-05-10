import { ModuleJSON } from '@/interface/module';
import * as Cesium from 'cesium'

export const renderRelativeModel = (jsonData: ModuleJSON, viewer: Cesium.Viewer, scale: number = 1.0): void => {
  const basePosition = Cesium.Cartesian3.fromDegrees(...jsonData.basePosition);
  const baseMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(basePosition);

  // 创建 LabelCollection 用于标签
  const labelCollection = viewer.scene.primitives.add(new Cesium.LabelCollection());

  jsonData.objects.forEach(obj => {
    // 相对位置
    const offset = new Cesium.Cartesian3(...obj.position.map(v => v * scale));
    const modelMatrix = Cesium.Matrix4.multiplyByTranslation(baseMatrix, offset, new Cesium.Matrix4());

    if (obj.type === "box") {
      const dimensions = new Cesium.Cartesian3(...obj.dimensions.map(v => v * scale));
      const color = Cesium.Color.fromBytes(
        obj.color[0] * 255,
        obj.color[1] * 255,
        obj.color[2] * 255,
        obj.color[3] * 255
      );

      const geometry = Cesium.BoxGeometry.fromDimensions({
        dimensions,
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
      });

      const instance = new Cesium.GeometryInstance({
        geometry,
        modelMatrix,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
        }
      });

      // 如果该模型有标签，添加标签
      if (obj.label) {
        const { label } = obj
        labelCollection.add({
          position: Cesium.Cartesian3.fromDegrees(label.position[0], label.position[1], label.position[2]),
          text: label.text,
          font: label.font,
          fillColor: Cesium.Color.fromCssColorString(label.color),
          scale: 1.0,
        });
      }

      viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances: instance,
        appearance: new Cesium.PerInstanceColorAppearance({ closed: true })
      }));
    }
    
    // 如果是整体模型名称标签     
    if (obj.type === "label") {
      // 相对位置
      const offset = new Cesium.Cartesian3(...obj.position.map(v => v * scale));
      const labelMatrix = Cesium.Matrix4.multiplyByPoint(baseMatrix, offset, new Cesium.Cartesian3());
      labelCollection.add({
        position: labelMatrix,
        text: obj.text,
        font: obj.font,
        fillColor: Cesium.Color.fromCssColorString(obj.color),
        scale: 1,
      });
    }

    if (obj.type === "model") {
      Cesium.Model.fromGltfAsync({
        url: obj.url,
        modelMatrix,
        scale: (obj.scale ?? 1.0) * scale
      }).then(model => {
        viewer.scene.primitives.add(model);
      });
    }
  });
}