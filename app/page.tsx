"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { DataTexture, LinearFilter, MathUtils, Object3D, OrthographicCamera as ThreeOrthographicCamera, Plane, Raycaster, RepeatWrapping, RGBAFormat, SRGBColorSpace, Vector2, Vector3, type DirectionalLight } from "three";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ContactShadows, OrbitControls, TransformControls } from "@react-three/drei";
import type { Group } from "three";
import type { ComponentRef } from "react";
import { SceneHeader } from "./components/SiteHeaders";

type SectionId = "home" | "about" | "comics" | "works" | "tools" | "tutorials";
type ThemeMode = "day" | "night";

type Section = {
  id: SectionId;
  label: string;
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  focus: string;
  accent: string;
  stat: string;
  note: string;
};

const sections: Section[] = [
  {
    id: "home",
    label: "首页",
    index: "00",
    eyebrow: "WELCOME TO MY DESK",
    title: "一张桌子，一只猫，五个入口。",
    description: "把复杂的房间收起来，只留下最能代表我的东西。选择一个栏目，镜头会移动到对应物件。",
    action: "开始逛逛",
    focus: "桌面全景",
    accent: "#d76645",
    stat: "像素 3D 原型",
    note: "镜头正在浏览整张书桌",
  },
  {
    id: "comics",
    label: "漫画",
    index: "01",
    eyebrow: "COMIC BOOK",
    title: "蓝色漫画书里，放着适合慢慢读的故事。",
    description: "翻译与整理的漫画以章节形式在线阅读，保留进度、支持沉浸模式，但不提供原文件下载。",
    action: "打开漫画",
    focus: "漫画书",
    accent: "#3f8998",
    stat: "仅在线阅读",
    note: "镜头正在查看漫画封面",
  },
  {
    id: "tutorials",
    label: "笔记",
    index: "02",
    eyebrow: "OPEN NOTEBOOK",
    title: "摊开的笔记，写着我踩过的坑。",
    description: "教程、项目复盘与工作流会整理成可以照着完成的步骤，让后来的人少走一点弯路。",
    action: "阅读教程",
    focus: "开放笔记本",
    accent: "#bd8538",
    stat: "实践型教程",
    note: "镜头已聚焦笔记本",
  },
  {
    id: "tools",
    label: "工具",
    index: "03",
    eyebrow: "PENCIL CUP",
    title: "笔筒代表那些顺手、直接的小工具。",
    description: "这里收纳我开发的轻量工具：打开就能用，并记录它们解决了什么真实问题。",
    action: "试用工具",
    focus: "像素笔筒",
    accent: "#738353",
    stat: "免费使用",
    note: "镜头正在查看笔筒",
  },
  {
    id: "works",
    label: "作品",
    index: "04",
    eyebrow: "FRAMED WORKS",
    title: "画框里，收藏着每一次创作记录。",
    description: "壁纸、插画、视觉素材和实验作品会在这里展示，并附上构思与制作过程。",
    action: "浏览作品",
    focus: "桌面画框",
    accent: "#c65342",
    stat: "插画与视觉",
    note: "镜头已移动到画框",
  },
  {
    id: "about",
    label: "关于我",
    index: "05",
    eyebrow: "ABOUT ME",
    title: "站在桌边的猫，就是这个网站的主人。",
    description: "从技术栈、工作经历到创作偏好，在这里快速认识我，以及我正在寻找的合作方向。",
    action: "查看个人档案",
    focus: "站立猫咪",
    accent: "#df8256",
    stat: "设计 × 开发",
    note: "镜头已移动到猫咪",
  },
];

const sectionRoutes: Record<SectionId, string> = {
  home: "/",
  comics: "/comics",
  tutorials: "/notes",
  tools: "/tools/manga-translator",
  works: "/works",
  about: "/about",
};

const cameraPresets: Record<SectionId, { position: [number, number, number]; target: [number, number, number]; zoom: number }> = {
  home: { position: [6.78, 4.35, 6.81], target: [1.08, 1.05, -0.54], zoom: 142 },
  about: { position: [2.36, 7.92, -3.66], target: [0.54, 2.15, 1.2], zoom: 296 },
  comics: { position: [8.84, 4.35, 7.14], target: [1.62, 2.16, 0.79], zoom: 402 },
  works: { position: [-5.88, 6.49, 6.48], target: [1.15, 2.3, 0.98], zoom: 402 },
  tools: { position: [-4.13, 6.37, 7.48], target: [0.86, 1.99, 0.19], zoom: 402 },
  tutorials: { position: [0.18, 10.17, 6.38], target: [0.49, 2.1, 0.71], zoom: 402 },
};

function CameraDebugger({ active }: { active: SectionId }) {
  const { camera } = useThree();
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);

  useEffect(() => {
    const preset = cameraPresets[active];
    const orthographicCamera = camera as ThreeOrthographicCamera;

    camera.position.set(...preset.position);
    orthographicCamera.zoom = preset.zoom;
    orthographicCamera.updateProjectionMatrix();

    controls.current?.target.set(...preset.target);
    controls.current?.update();
  }, [active, camera]);

  const printCamera = () => {
    const target = controls.current?.target;
    const orthographicCamera = camera as ThreeOrthographicCamera;

    if (!target) return;

    const round = (value: number) => Number(value.toFixed(2));

    console.log(`${active}: {`);
    console.log(
      `  position: [${camera.position
        .toArray()
        .map(round)
        .join(", ")}],`,
    );
    console.log(
      `  target: [${target
        .toArray()
        .map(round)
        .join(", ")}],`,
    );
    console.log(`  zoom: ${Math.round(orthographicCamera.zoom)},`);
    console.log("}");
  };

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      onEnd={printCamera}
    />
  );
}
function PixelMaterial({ color, active = false }: { color: string; active?: boolean }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.92}
      metalness={0}
      flatShading
      emissive={active ? color : "#000000"}
      emissiveIntensity={active ? 0.15 : 0}
    />
  );
}

function CameraRig({ active, reducedMotion }: { active: SectionId; reducedMotion: boolean }) {
  const { camera, size } = useThree();
  const nextPosition = useRef(new Vector3(...cameraPresets.home.position));
  const nextTarget = useRef(new Vector3(...cameraPresets.home.target));
  const currentTarget = useRef(new Vector3(...cameraPresets.home.target));
  const nextZoom = useRef(cameraPresets.home.zoom);

  useEffect(() => {
    const preset = cameraPresets[active];
    const mobile = size.width < 760;
    nextPosition.current.set(...preset.position);
    nextTarget.current.set(...preset.target);
    nextZoom.current = preset.zoom * (mobile ? 0.68 : 1);
  }, [active, size.width]);

  useFrame((_, delta) => {
    const speed = reducedMotion ? 20 : 3.5;
    camera.position.x = MathUtils.damp(camera.position.x, nextPosition.current.x, speed, delta);
    camera.position.y = MathUtils.damp(camera.position.y, nextPosition.current.y, speed, delta);
    camera.position.z = MathUtils.damp(camera.position.z, nextPosition.current.z, speed, delta);
    currentTarget.current.x = MathUtils.damp(currentTarget.current.x, nextTarget.current.x, speed, delta);
    currentTarget.current.y = MathUtils.damp(currentTarget.current.y, nextTarget.current.y, speed, delta);
    currentTarget.current.z = MathUtils.damp(currentTarget.current.z, nextTarget.current.z, speed, delta);
    const orthographicCamera = camera as ThreeOrthographicCamera;
    orthographicCamera.zoom = MathUtils.damp(orthographicCamera.zoom, nextZoom.current, speed, delta);
    orthographicCamera.updateProjectionMatrix();
    camera.lookAt(currentTarget.current);
  });

  return null;
}

function FocusGroup({
  active,
  position,
  children,
  onSelect,
}: {
  active: boolean;
  position: [number, number, number];
  children: ReactNode;
  onSelect?: () => void;
}) {
  const group = useRef<Object3D>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!hovered || !onSelect) return;
    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = previousCursor;
    };
  }, [hovered, onSelect]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const breathing = Math.sin(state.clock.elapsedTime * 2.35);
    const targetScale = active
      ? 1.052 + breathing * 0.012
      : hovered
        ? 1.028 + breathing * 0.008
        : 1;
    const scale = MathUtils.damp(group.current.scale.x, targetScale, hovered || active ? 6 : 8, delta);
    group.current.scale.setScalar(scale);
  });

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        const stillInsideGroup = event.intersections.some((intersection) => {
          let object: Object3D | null = intersection.object;
          while (object) {
            if (object === group.current) return true;
            object = object.parent;
          }
          return false;
        });
        if (!stillInsideGroup) setHovered(false);
      }}
      onClick={(event) => {
        if (!onSelect) return;
        event.stopPropagation();
        onSelect();
      }}
    >
      {children}
    </group>
  );
}

function Cube({ position, size, color, active = false, rotation = [0, 0, 0] }: { position: [number, number, number]; size: [number, number, number]; color: string; active?: boolean; rotation?: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <PixelMaterial color={color} active={active} />
    </mesh>
  );
}

function VoxelCat({ active, onSelect }: { active: boolean; onSelect: () => void }) {
  return (
    <FocusGroup active={active} position={[0.8, 0, 2.15]} onSelect={onSelect}>
      <group rotation={[0, 15.7, 0]}>
      <Cube position={[0, 0.72, 0]} size={[0.82, 1.15, 0.58]} color="#e7c99f" active={active} />
      <Cube position={[-0.31, 0.88, 0.31]} size={[0.22, 0.55, 0.16]} color="#d87a43" active={active} />
      <Cube position={[-0.52, 0.72, 0.03]} size={[0.22, 0.72, 0.24]} color="#e7c99f" active={active} />
      <Cube position={[0.52, 0.72, 0.03]} size={[0.22, 0.72, 0.24]} color="#e7c99f" active={active} />
      <Cube position={[-0.24, 0.12, 0.02]} size={[0.3, 0.25, 0.56]} color="#ead1ac" active={active} />
      <Cube position={[0.24, 0.12, 0.02]} size={[0.3, 0.25, 0.56]} color="#ead1ac" active={active} />

      <Cube position={[0, 1.68, 0]} size={[1.02, 0.88, 0.68]} color="#edcf9f" active={active} />
      {/* 猫耳朵 */}
      <Cube position={[-0.28, 2.05, -0.01]} size={[0.34, 0.34, 0.34]} color="#4f433c" active={active} rotation={[0, 0, -0.4]} />
      <Cube position={[0.28, 2.05, -0.01]} size={[0.34, 0.34, 0.34]} color="#dd7a3e" active={active} rotation={[0, 0, 0.4]} />
      
      <Cube position={[-0.29, 1.80, 0]} size={[0.49, 0.65, 0.7]} color="#51453e" active={active} />
      <Cube position={[0.29, 1.8, 0]} size={[0.49, 0.65, 0.7]} color="#dd7c3e" active={active} />
      <Cube position={[-0.22, 1.71, 0.41]} size={[0.27, 0.3, 0.08]} color="#fff5df" />
      <Cube position={[0.22, 1.71, 0.41]} size={[0.27, 0.3, 0.08]} color="#fff5df" />
      <Cube position={[-0.2, 1.73, 0.47]} size={[0.08, 0.13, 0]} color="#352820" />
      <Cube position={[0.2, 1.73, 0.47]} size={[0.08, 0.13, 0]} color="#352820" />
      <Cube position={[0, 1.53, 0.49]} size={[0.12, 0.09, 0.06]} color="#c75c4a" />
      <Cube position={[0, 1.23, 0.35]} size={[0.72, 0.12, 0.12]} color="#c95843" active={active} />
      <group position={[0.43, 0.72, -0.45]} rotation={[0, 0, -0.55]}>
        <Cube position={[0, 0, 0]} size={[0.2, 0.75, 0.22]} color="#d8753f" active={active} />
      </group>
      </group>
    </FocusGroup>
  );
}

function WoodDeskTop() {
  const woodTexture = useMemo(() => {
    const width = 256;
    const height = 128;
    const pixels = new Uint8Array(width * height * 4);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const broadGrain = Math.sin(y * 0.32 + Math.sin(x * 0.045) * 2.4);
        const fineGrain = Math.sin(y * 1.15 + x * 0.025) * 0.34;
        const knotDistance = Math.sqrt(((x - 184) / 1.7) ** 2 + ((y - 67) * 1.8) ** 2);
        const knot = Math.sin(knotDistance * 0.42) * Math.exp(-knotDistance * 0.035) * 0.65;
        const shade = broadGrain * 7 + fineGrain * 5 + knot * 8;
        const index = (y * width + x) * 4;

        pixels[index] = MathUtils.clamp(174 + shade, 0, 255);
        pixels[index + 1] = MathUtils.clamp(96 + shade * 0.62, 0, 255);
        pixels[index + 2] = MathUtils.clamp(62 + shade * 0.38, 0, 255);
        pixels[index + 3] = 255;
      }
    }

    const texture = new DataTexture(pixels, width, height, RGBAFormat);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(1.35, 1.1);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);

  useEffect(() => () => woodTexture.dispose(), [woodTexture]);

  return (
    <mesh position={[0, 1.352, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[4.24, 2.39]} />
      <meshStandardMaterial
        map={woodTexture}
        color="#f1c09a"
        roughness={0.88}
        metalness={0}
        polygonOffset
        polygonOffsetFactor={-1}
      />
    </mesh>
  );
}

function Desk() {
  return (
    <group position={[0.3, 0, 0]}>
      <Cube position={[0, 1.25, 0]} size={[4.3, 0.2, 2.45]} color="#a75f3f" />
      <WoodDeskTop />
      {[-2.0, 2.0].flatMap((x) => [-0.56, 0.56].map((z) => (
        <Cube key={`${x}-${z}`} position={[x, 0.61, z]} size={[0.2, 1.2, 0.2]} color="#744634" />
      )))}
    </group>
  );
}

function TutorialNotebook({ active, onSelect }: { active: boolean; onSelect: () => void }) {
  return (
    <FocusGroup active={active} position={[0.58, 1.39, 0.45]} onSelect={onSelect}>
      <group rotation={[0, -0.06, 0]}>
        <Cube position={[-0.32, 0, 0]} size={[0.62, 0.07, 0.76]} color="#fff0d0" active={active} rotation={[0, 0, 0.04]} />
        <Cube position={[0.32, 0, 0]} size={[0.62, 0.07, 0.76]} color="#fff7df" active={active} rotation={[0, 0, -0.04]} />
        <Cube position={[0, 0.052, 0]} size={[0.026, 0, 0.76]} color="#805744" />
        {[-0.17, 0, 0.17].map((z) => (
          <group key={z}>
            <Cube position={[-0.32, 0.055, z]} size={[0.38, 0, 0.025]} color="#d58b67" />
            <Cube position={[0.32, 0.055, z]} size={[0.38, 0, 0.025]} color="#6e99a0" />
          </group>
        ))}
      </group>
    </FocusGroup>
  );
}

function ComicRow({ active, onSelect }: { active: boolean; onSelect: () => void }) {
  const colors = ["#d86049", "#e99b4e", "#e5bb55", "#6e8c58", "#438a9d", "#6e79a0", "#9a5d78"];
  return (
    <FocusGroup active={active} position={[-0.55, 1.69, -0.56]} onSelect={onSelect}>
      {[-0.57, -0.38, -0.19, 0, 0.19, 0.38, 0.57].map((x, index) => (
        <group key={x} position={[x, 0, 0]} rotation={[0, -0.05 + index * 0.016, 0]}>
          <Cube position={[0, 0, 0]} size={[0.16, 0.76 + (index % 3) * 0.08, 0.42]} color={colors[index]} active={active} />
          <Cube position={[0, 0.04, 0.225]} size={[0.07, 0.32, 0.01]} color="#f4dfb7" active={active} />
        </group>
      ))}
    </FocusGroup>
  );
}

function WorkFrame({ active, onSelect }: { active: boolean; onSelect: () => void }) {
  const frameRef = useRef<Group>(null);
  const DEBUG = false;

  const printTransform = () => {
    const object = frameRef.current;
    if (!object) return;

    const round = (value: number) => Number(value.toFixed(3));

    console.log({
      position: object.position.toArray().map(round),
      rotation: [
        round(object.rotation.x),
        round(object.rotation.y),
        round(object.rotation.z),
      ],
      scale: object.scale.toArray().map(round),
    });
  };

  return (
    <>
      <FocusGroup
        active={DEBUG ? false : active}
        position={[2.16, 1.52, 0.02]}
        onSelect={onSelect}
      >
        <group
          ref={frameRef}
          position={[-0.138, 0.27, -0.164]}
          rotation={[-0.35, -0.442, -0.145]}
          scale={[1, 1, 1]}
        >
          <Cube
            position={[0, 0, 0]}
            size={[0.72, 0.92, 0.13]}
            color="#714638"
            active={active}
          />

          <Cube
            position={[0, 0, 0.08]}
            size={[0.54, 0.72, 0]}
            color="#f1d2a2"
            active={active}
          />

          <Cube
            position={[-0.12, -0.08, 0.11]}
            size={[0.24, 0.25, 0]}
            color="#718558"
          />

          <Cube
            position={[0.13, 0.1, 0.11]}
            size={[0.2, 0.3, 0]}
            color="#d86b48"
          />

          <Cube
            position={[0, -0.1, -0.22]}
            size={[0.12, 0.5, 0.08]}
            color="#6a4638"
            rotation={[0.58, 0, 0]}
          />
        </group>
      </FocusGroup>

      {DEBUG && (
        <TransformControls
          object={frameRef}
          mode="rotate" //translate rotate scale
          onObjectChange={printTransform}
          onMouseUp={printTransform}
        />
      )}
    </>
  );
}

function PencilCup({ active, onSelect }: { active: boolean; onSelect: () => void }) {
  return (
    <FocusGroup active={active} position={[1.0, 1.61, -0.52]} onSelect={onSelect}>
      <Cube position={[0, 0, 0]} size={[0.46, 0.52, 0.46]} color="#73845c" active={active} />
      <Cube position={[-0.11, 0.43, 0]} size={[0.08, 0.72, 0.08]} color="#d85d45" active={active} rotation={[0, 0, 0.12]} />
      <Cube position={[0.03, 0.56, 0]} size={[0.08, 0.78, 0.08]} color="#e9aa4f" active={active} rotation={[0, 0, 0.04]} />
      <Cube position={[0.19, 0.49, 0]} size={[0.08, 0.64, 0.08]} color="#4b8497" active={active} rotation={[0, 0, -0.23]} />
    </FocusGroup>
  );
}

function MouseFollowLight({ reducedMotion, theme }: { reducedMotion: boolean; theme: ThemeMode }) {
  const { camera } = useThree();
  const light = useRef<DirectionalLight>(null);
  const lightTarget = useRef<Object3D>(null);
  const pointer = useRef(new Vector2(-0.78, -0.72));
  const raycaster = useRef(new Raycaster());
  const cursorPlane = useRef(new Plane(new Vector3(0, 1, 0), -1.15));
  const cursorWorld = useRef(new Vector3());
  const desiredPosition = useRef(new Vector3(-4, 8, 6));

  useEffect(() => {
    if (light.current && lightTarget.current) {
      light.current.target = lightTarget.current;
    }
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      pointer.current.set(-0.78, -0.72);
      return;
    }

    const updatePointer = (event: PointerEvent) => {
      pointer.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        1 - (event.clientY / window.innerHeight) * 2,
      );
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => window.removeEventListener("pointermove", updatePointer);
  }, [reducedMotion]);

  useFrame((_, delta) => {
    if (!light.current || !lightTarget.current) return;

    raycaster.current.setFromCamera(pointer.current, camera);
    const hit = raycaster.current.ray.intersectPlane(cursorPlane.current, cursorWorld.current);

    if (hit) {
      const target = lightTarget.current.position;
      const directionScale = 1.35;
      desiredPosition.current.set(
        target.x + MathUtils.clamp(hit.x - target.x, -7, 7) * directionScale,
        8.5,
        target.z + MathUtils.clamp(hit.z - target.z, -7, 7) * directionScale,
      );
    }

    const speed = reducedMotion ? 18 : 5.5;

    light.current.position.x = MathUtils.damp(light.current.position.x, desiredPosition.current.x, speed, delta);
    light.current.position.y = MathUtils.damp(light.current.position.y, desiredPosition.current.y, speed, delta);
    light.current.position.z = MathUtils.damp(light.current.position.z, desiredPosition.current.z, speed, delta);
    lightTarget.current.updateMatrixWorld();
  });

  return (
    <>
      <object3D ref={lightTarget} position={[0.2, 1.05, 0.2]} />
      <directionalLight
        ref={light}
        castShadow
        position={[-4, 8, 6]}
        intensity={theme === "night" ? 4.4 : 3.6}
        color={theme === "night" ? "#ffb66e" : "#fff0d5"}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-3}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-bias={-0.00025}
        shadow-normalBias={0.02}
      />
    </>
  );
}

function PixelDeskScene({
  active,
  reducedMotion,
  theme,
  onSelect,
}: {
  active: SectionId;
  reducedMotion: boolean;
  theme: ThemeMode;
  onSelect: (section: SectionId) => void;
}) {
  const CAMERA_DEBUG = false;
  const night = theme === "night";
  const CAT_ONLY = false;

  return (
    <Canvas
      orthographic
      dpr={[1, 1.75]}
      camera={{ position: cameraPresets.home.position, zoom: cameraPresets.home.zoom, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      shadows
    >
      <color attach="background" args={[night ? "#182433" : "#f1ddc7"]} />
      <ambientLight intensity={night ? 0.46 : 1.1} color={night ? "#899cc0" : "#ffffff"} />
      <hemisphereLight
        intensity={night ? 0.42 : 0.58}
        color={night ? "#91a9d2" : "#fff6e7"}
        groundColor={night ? "#101722" : "#8f5d48"}
      />
      <MouseFollowLight reducedMotion={reducedMotion} theme={theme} />
      <mesh position={[0, -0.095, 0.35]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 14]} />
        <shadowMaterial
          transparent
          opacity={night ? 0.44 : 0.26}
          color={night ? "#070b12" : "#704332"}
          depthWrite={false}
        />
      </mesh>
      <group position={[0, -0.08, 0]}>
        <VoxelCat active={active === "about"} onSelect={() => onSelect("about")} />
        {!CAT_ONLY && (
          <>
            <Desk />
            <TutorialNotebook
              active={active === "tutorials"}
              onSelect={() => onSelect("tutorials")}
            />
            <ComicRow
              active={active === "comics"}
              onSelect={() => onSelect("comics")}
            />
            <WorkFrame
              active={active === "works"}
              onSelect={() => onSelect("works")}
            />
            <PencilCup
              active={active === "tools"}
              onSelect={() => onSelect("tools")}
            />
          </>
        )}
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={night ? 0.42 : 0.3}
          scale={9}
          blur={2.5}
          far={5.5}
          resolution={1024}
          color={night ? "#080d14" : "#85533f"}
        />
      </group>
      {CAMERA_DEBUG ? (
        <CameraDebugger active={active} />
      ) : (
        <CameraRig active={active} reducedMotion={reducedMotion} />
      )}
    </Canvas>
  );
}

export default function Home() {
  const [activeId, setActiveId] = useState<SectionId>("home");
  const [armedSectionId, setArmedSectionId] = useState<SectionId | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("day");
  const active = sections.find((section) => section.id === activeId) ?? sections[0];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("creative-desk-theme");
    if (savedTheme === "day" || savedTheme === "night") setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const requestedSection = new URLSearchParams(window.location.search).get("section") as SectionId | null;
    if (requestedSection && sections.some((section) => section.id === requestedSection)) {
      setActiveId(requestedSection);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "day" ? "night" : "day";
      window.localStorage.setItem("creative-desk-theme", next);
      return next;
    });
  };

  const focusSection = (sectionId: SectionId) => {
    setActiveId(sectionId);
    setArmedSectionId(null);
  };

  const handleMenuSelect = (sectionId: SectionId) => {
    if (sectionId === "home") {
      focusSection("home");
      return;
    }

    if (armedSectionId === sectionId) {
      window.location.href = sectionRoutes[sectionId];
      return;
    }

    setActiveId(sectionId);
    setArmedSectionId(sectionId);
  };

  return (
    <main className="cat-site" data-theme={theme} style={{ "--accent": active.accent } as React.CSSProperties}>
      <SceneHeader
        variant="home"
        subtitle="PIXEL CREATIVE DESK"
        theme={theme}
        onToggleTheme={toggleTheme}
        onBrandActivate={() => focusSection("home")}
        navigation={
          <nav className="shared-home-section-nav" aria-label="选择探索栏目">
            {sections.map((section) => {
              const armed = section.id !== "home" && section.id === armedSectionId;

              return (
                <button
                  type="button"
                  key={section.id}
                  className={section.id === activeId ? "is-active" : ""}
                  aria-pressed={section.id === activeId}
                  aria-label={section.id === "home" ? "首页，回到桌面全景" : `${section.label}${armed ? "，再次点击进入页面" : "，点击聚焦"}`}
                  onClick={() => handleMenuSelect(section.id)}
                >
                  <span className="shared-home-menu-index">{section.index}</span>
                  <span className="shared-home-menu-label">{section.label}</span>
                  {armed && <span className="shared-home-menu-arrow" aria-hidden="true">↗</span>}
                </button>
              );
            })}
          </nav>
        }
      />

      <section className="cat-hero" aria-label="可探索的像素三维书桌">
        <div className="scene-column pixel-scene" role="img" aria-label={`简单像素三维书桌，当前镜头聚焦${active.focus}`}>
          <PixelDeskScene active={activeId} reducedMotion={reducedMotion} theme={theme} onSelect={focusSection} />
          <div className="scene-wash" aria-hidden="true" />
        </div>

        <aside className="content-column" id="contents" key={active.id} aria-live="polite">
          <article className="section-copy">
            <div className="copy-topline"><p>{active.eyebrow}</p><span>{active.index} / 05</span></div>
            <h1>{active.title}</h1>
            <p className="section-description">{active.description}</p>
            <div className="section-actions">
              <button
                type="button"
                className="primary-action"
                onClick={() => { window.location.href = sectionRoutes[active.id]; }}
              >
                {active.action}<span>↗</span>
              </button>
            </div>
          </article>
        </aside>
      </section>

      <footer className="cat-footer" id="contact"><span>© 2026 奇想书桌</span><span>把复杂的事，放进简单的桌面。</span></footer>
    </main>
  );
}
