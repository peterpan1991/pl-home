# 阿橘 3D 模型

`aju-explorer-cat-v2.glb` 是根据角色正面参考图与三视图制作的第二版网页角色模型。可编辑源文件位于 `models/aju-explorer-cat-v2.blend`。

## 当前内容

- 更接近参考图的梨形身体、宽脸、短腿和大眼比例
- 圆润猫咪头部、耳朵、眼睛、双层嘴套、胡须与尾巴
- 黑灰与橘色拼色面部
- 红色围巾
- 帆布背包、肩带、扣具、卷垫与侧袋
- 鱼形挂件
- 轻微黏土质感材质
- 71 个可编辑、独立命名的网格部件
- Blender 文件内附正面、侧面、背面三张参考图

## 模型状态

当前版本尚未绑定骨骼，也没有动画。下一阶段将在 Blender 中完成骨骼、权重和动作片段。

## 编辑与重新生成

直接打开 `models/aju-explorer-cat-v2.blend` 可继续调整。运行下面的命令会根据脚本重新生成 Blend、GLB 和预览图：

```bash
/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/blender/build_aju_v2.py
```

## 导入 Blender

推荐直接打开 `models/aju-explorer-cat-v2.blend`。若只需发布版本，可选择 `文件 → 导入 → glTF 2.0`，然后导入 `aju-explorer-cat-v2.glb`。
