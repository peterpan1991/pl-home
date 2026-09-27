"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, TransformControls, useGLTF } from "@react-three/drei";
import {
  MathUtils,
  Object3D,
  PerspectiveCamera as ThreePerspectiveCamera,
  Plane,
  Raycaster,
  Vector2,
  Vector3,
  type DirectionalLight,
  type Group,
  type Mesh,
} from "three";
import { Suspense, useCallback, useEffect, useRef, useState, type ComponentRef } from "react";
import { SceneHeader } from "../components/SiteHeaders";
import { sitePath } from "../lib/sitePath";
import { useTheme, type ThemeMode } from "../lib/useTheme";

type AboutSectionId = "overview" | "interests" | "skills" | "projects";
type DebugMode = "off" | "camera" | "cat";
type TransformMode = "translate" | "rotate" | "scale";
type VectorTuple = [number, number, number];

type CameraDebugValues = {
  position: VectorTuple;
  target: VectorTuple;
  fov: number;
};

type CatDebugValues = {
  position: VectorTuple;
  rotation: VectorTuple;
  scale: VectorTuple;
};

type AboutSection = {
  id: AboutSectionId;
  index: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  focus: string;
};

const MODEL_PATH = sitePath("/models/about-cat.glb");

const aboutSections: AboutSection[] = [
  {
    id: "overview",
    index: "00",
    label: "About me",
    eyebrow: "A SMALL INTRODUCTION",
    title: "关于我",
    description: "10+ 年 Web 全栈开发经验，从企业系统、电商平台到支付网关，长期参与产品从 0 到 1 的设计、开发与落地。\n画过UI、做过前端、写过后端、折腾过服务器。\n现在主要探索 Python、AI 应用与独立产品开发。",
    focus: "角色全身",
  },
  {
    id: "interests",
    index: "01",
    label: "Interests",
    eyebrow: "THINGS I ENJOY",
    title: "兴趣爱好",
    description: "关注 AI 应用、漫画与叙事、插画与视觉表达，也享受拆解需求、优化工作流和制作小工具的过程。",
    focus: "猫咪头部",
  },
  {
    id: "skills",
    index: "02",
    label: "Skills",
    eyebrow: "WHAT IS IN THE BAG",
    title: "技能池",
    description: "从前端到后端，从传统开发到vibe coding，从web到AI，能够独立完成需求拆解、架构设计、开发联调、测试部署和持续维护。技能跟着需求走。",
    focus: "旅行背包",
  },
  {
    id: "projects",
    index: "03",
    label: "Projects",
    eyebrow: "SELECTED PROJECTS",
    title: "做过的项目",
    description: "官网、企业系统、电商、支付网关、公众号、小程序、桌面应用、小游戏等等。",
    focus: "角色胸前",
  },
];

const cameraPresets: Record<AboutSectionId, { position: [number, number, number]; target: [number, number, number]; fov: number }> = {
  overview: { position: [2.97, -0.1, -4.05], target: [0.9, -0.46, -3.59], fov: 34 },
  // overview: { position: [2.07, -0.25, -2.1], target: [0.89, -0.28, -2.31], fov: 18 },
  interests: { position: [-0.56, -0.27, -4.19], target: [-3.42, -1.65, -1.45], fov: 34 },
  skills: { position: [-4.01, 0.58, -4.27], target: [-1.68, -1.04, -1.47], fov: 34 },
  projects: { position: [-0.35, -1.69, -0.31], target: [-1.1, -0.74, -1.97], fov: 34 },
};

const initialCatTransform: CatDebugValues = {
  position: [-1.7, -2.197, -2.268],
  rotation: [0, 1.399, 0],
  scale: [2.152, 2.152, 1.813],  
};

const roundVector = (values: number[], precision = 2): VectorTuple =>
  values.map((value) => Number(value.toFixed(precision))) as VectorTuple;

const interestItems = ["AI 应用实验", "漫画与叙事", "插画与视觉", "效率工具", "工作流优化", "持续学习"];

const skillGroups = [
  { name: "AI 应用", items: "Python · FastAPI · LangChain · Ollama · RAG · ChromaDB · FAISS · EasyOCR · Chinese-CLIP" },
  { name: "全栈后端", items: "PHP · Laravel · ThinkPHP · REST API · MySQL · Redis · 支付 / 订单 / 队列" },
  { name: "前端 / 客户端", items: "React · Vue 3 · TypeScript · Electron · uni-app · Ant Design" },
  { name: "工程交付", items: "Docker · Linux · 数据库设计 · 日志与异常处理 · 需求拆解 · 部署运维" },
];

const projectItems = [
  { name: "Telegram 聊天记录智能分析", type: "RAG · FASTAPI · REACT", summary: "独立实现消息清洗、Map-Reduce 全局分析、混合检索、来源引用与RAG问答。" },
  { name: "英国支付网关", type: "PAYMENTS · API · 3DS V2", summary: "长期参与多渠道支付、多语言 SDK、Docker 部署及线上故障处理。" },
  { name: "网页取证桌面应用", type: "ELECTRON · REACT · SM3", summary: "实现多标签浏览、截图录屏、文件哈希、证据上传、区块链存证与可追溯的完整性校验。" },
];

function AboutCatModel({
  debugMode,
  transformMode,
  transform,
  onTransformChange,
}: {
  debugMode: DebugMode;
  transformMode: TransformMode;
  transform: CatDebugValues;
  onTransformChange: (values: CatDebugValues) => void;
}) {
  const { scene } = useGLTF(MODEL_PATH, false, true);
  const model = useRef<Group>(null!);

  useEffect(() => {
    scene.traverse((object) => {
      const mesh = object as Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  const reportTransform = () => {
    if (!model.current) return;
    onTransformChange({
      position: roundVector(model.current.position.toArray(), 3),
      rotation: roundVector([model.current.rotation.x, model.current.rotation.y, model.current.rotation.z], 3),
      scale: roundVector(model.current.scale.toArray(), 3),
    });
  };

  return (
    <>
      <group
        ref={model}
        position={transform.position}
        rotation={transform.rotation}
        scale={transform.scale}
      >
        <primitive object={scene} />
      </group>
      {debugMode === "cat" && (
        <TransformControls
          object={model}
          mode={transformMode}
          size={0.72}
          onObjectChange={reportTransform}
          onMouseUp={reportTransform}
        />
      )}
    </>
  );
}

function AboutCameraDebugger({
  active,
  fov,
  resetVersion,
  onChange,
}: {
  active: AboutSectionId;
  fov: number;
  resetVersion: number;
  onChange: (values: CameraDebugValues) => void;
}) {
  const { camera } = useThree();
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);

  const reportCamera = useCallback(() => {
    const target = controls.current?.target;
    if (!target) return;
    const perspectiveCamera = camera as ThreePerspectiveCamera;
    onChange({
      position: roundVector(camera.position.toArray()),
      target: roundVector(target.toArray()),
      fov: Number(perspectiveCamera.fov.toFixed(1)),
    });
  }, [camera, onChange]);

  useEffect(() => {
    const preset = cameraPresets[active];
    const perspectiveCamera = camera as ThreePerspectiveCamera;
    camera.position.set(...preset.position);
    perspectiveCamera.fov = preset.fov;
    perspectiveCamera.updateProjectionMatrix();
    controls.current?.target.set(...preset.target);
    controls.current?.update();
    onChange({ position: [...preset.position], target: [...preset.target], fov: preset.fov });
  }, [active, camera, onChange, resetVersion]);

  useEffect(() => {
    const perspectiveCamera = camera as ThreePerspectiveCamera;
    perspectiveCamera.fov = fov;
    perspectiveCamera.updateProjectionMatrix();
    reportCamera();
  }, [camera, fov, reportCamera]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={1.2}
      maxDistance={24}
      onChange={reportCamera}
    />
  );
}

function AboutCameraRig({ active, reducedMotion }: { active: AboutSectionId; reducedMotion: boolean }) {
  const { camera, size } = useThree();
  const desiredPosition = useRef(new Vector3(...cameraPresets.overview.position));
  const desiredTarget = useRef(new Vector3(...cameraPresets.overview.target));
  const currentTarget = useRef(new Vector3(...cameraPresets.overview.target));
  const desiredFov = useRef(cameraPresets.overview.fov);

  useEffect(() => {
    const preset = cameraPresets[active];
    const target = new Vector3(...preset.target);
    const position = new Vector3(...preset.position);

    if (size.width < 720) {
      position.sub(target).multiplyScalar(1.35).add(target);
    }

    desiredPosition.current.copy(position);
    desiredTarget.current.copy(target);
    desiredFov.current = preset.fov + (size.width < 720 ? 5 : 0);
  }, [active, size.width]);

  useFrame((_, delta) => {
    const speed = reducedMotion ? 24 : 3.7;
    camera.position.x = MathUtils.damp(camera.position.x, desiredPosition.current.x, speed, delta);
    camera.position.y = MathUtils.damp(camera.position.y, desiredPosition.current.y, speed, delta);
    camera.position.z = MathUtils.damp(camera.position.z, desiredPosition.current.z, speed, delta);
    currentTarget.current.x = MathUtils.damp(currentTarget.current.x, desiredTarget.current.x, speed, delta);
    currentTarget.current.y = MathUtils.damp(currentTarget.current.y, desiredTarget.current.y, speed, delta);
    currentTarget.current.z = MathUtils.damp(currentTarget.current.z, desiredTarget.current.z, speed, delta);

    const perspectiveCamera = camera as ThreePerspectiveCamera;
    perspectiveCamera.fov = MathUtils.damp(perspectiveCamera.fov, desiredFov.current, speed, delta);
    perspectiveCamera.updateProjectionMatrix();
    camera.lookAt(currentTarget.current);
  });

  return null;
}

function AboutMouseLight({
  theme,
  reducedMotion,
  targetPosition,
}: {
  theme: ThemeMode;
  reducedMotion: boolean;
  targetPosition: VectorTuple;
}) {
  const { camera } = useThree();
  const light = useRef<DirectionalLight>(null);
  const lightTarget = useRef<Object3D>(null);
  const pointer = useRef(new Vector2(-0.78, -0.72));
  const raycaster = useRef(new Raycaster());
  const cursorPlane = useRef(new Plane(new Vector3(0, 1, 0), -targetPosition[1]));
  const planeNormal = useRef(new Vector3(0, 1, 0));
  const cursorWorld = useRef(new Vector3());
  const desiredPosition = useRef(new Vector3(targetPosition[0] - 4, targetPosition[1] + 7.5, targetPosition[2] + 4.5));

  useEffect(() => {
    if (light.current && lightTarget.current) light.current.target = lightTarget.current;
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
    const target = lightTarget.current.position;
    cursorPlane.current.set(planeNormal.current, -target.y);
    raycaster.current.setFromCamera(pointer.current, camera);
    const hit = raycaster.current.ray.intersectPlane(cursorPlane.current, cursorWorld.current);
    if (hit) {
      const directionScale = 0.86;
      desiredPosition.current.set(
        target.x + MathUtils.clamp(hit.x - target.x, -5.5, 5.5) * directionScale,
        target.y + 7.5,
        target.z + MathUtils.clamp(hit.z - target.z, -5.5, 5.5) * directionScale,
      );
    }

    const speed = reducedMotion ? 20 : 5;
    light.current.position.x = MathUtils.damp(light.current.position.x, desiredPosition.current.x, speed, delta);
    light.current.position.y = MathUtils.damp(light.current.position.y, desiredPosition.current.y, speed, delta);
    light.current.position.z = MathUtils.damp(light.current.position.z, desiredPosition.current.z, speed, delta);
    lightTarget.current.updateMatrixWorld();
  });

  return (
    <>
      <object3D ref={lightTarget} position={targetPosition} />
      <directionalLight
        ref={light}
        castShadow
        position={[targetPosition[0] - 4, targetPosition[1] + 7.5, targetPosition[2] + 4.5]}
        intensity={theme === "night" ? 4.2 : 3.5}
        color={theme === "night" ? "#ffb66e" : "#fff0d5"}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-4.5}
        shadow-camera-right={4.5}
        shadow-camera-top={5}
        shadow-camera-bottom={-4}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
        shadow-bias={-0.00012}
        shadow-normalBias={0.008}
      />
    </>
  );
}

function AboutScene({
  active,
  theme,
  reducedMotion,
  debugMode,
  transformMode,
  catTransform,
  cameraDebug,
  cameraResetVersion,
  onCatTransformChange,
  onCameraDebugChange,
}: {
  active: AboutSectionId;
  theme: ThemeMode;
  reducedMotion: boolean;
  debugMode: DebugMode;
  transformMode: TransformMode;
  catTransform: CatDebugValues;
  cameraDebug: CameraDebugValues;
  cameraResetVersion: number;
  onCatTransformChange: (values: CatDebugValues) => void;
  onCameraDebugChange: (values: CameraDebugValues) => void;
}) {
  const night = theme === "night";
  const groundY = catTransform.position[1] - 0.015;
  const shadowPosition: VectorTuple = [catTransform.position[0], groundY, catTransform.position[2]];
  const lightTargetPosition: VectorTuple = [
    catTransform.position[0],
    catTransform.position[1] + catTransform.scale[1] * 0.54,
    catTransform.position[2],
  ];
  const contactShadowScale = Math.max(2.8, Math.max(catTransform.scale[0], catTransform.scale[2]) * 1.55);
  const contactShadowFar = Math.max(1.4, catTransform.scale[1] * 0.72);

  return (
    <Canvas
      dpr={[1, 1.6]}
      shadows
      camera={{ position: cameraPresets.overview.position, fov: cameraPresets.overview.fov, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[night ? "#172231" : "#efd9c4"]} />
      <ambientLight intensity={night ? 0.42 : 1.05} color={night ? "#8798bb" : "#ffffff"} />
      <hemisphereLight
        intensity={night ? 0.38 : 0.62}
        color={night ? "#91a9d2" : "#fff6e7"}
        groundColor={night ? "#0d141f" : "#93604b"}
      />
      <AboutMouseLight theme={theme} reducedMotion={reducedMotion} targetPosition={lightTargetPosition} />
      <Suspense fallback={null}>
        <AboutCatModel
          debugMode={debugMode}
          transformMode={transformMode}
          transform={catTransform}
          onTransformChange={onCatTransformChange}
        />
      </Suspense>
      <mesh position={shadowPosition} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 16]} />
        <shadowMaterial transparent opacity={night ? 0.46 : 0.26} color={night ? "#050910" : "#704332"} depthWrite={false} />
      </mesh>
      <ContactShadows
        position={shadowPosition}
        opacity={night ? 0.26 : 0.18}
        scale={contactShadowScale}
        blur={3.2}
        far={contactShadowFar}
        resolution={1024}
        color={night ? "#060a11" : "#81503d"}
      />
      {debugMode === "camera" ? (
        <AboutCameraDebugger
          active={active}
          fov={cameraDebug.fov}
          resetVersion={cameraResetVersion}
          onChange={onCameraDebugChange}
        />
      ) : debugMode === "off" ? (
        <AboutCameraRig active={active} reducedMotion={reducedMotion} />
      ) : null}
    </Canvas>
  );
}

function SectionDetails({ active }: { active: AboutSectionId }) {
  if (active === "interests") {
    return <div className="about-tag-list">{interestItems.map((item) => <span key={item}>{item}</span>)}</div>;
  }

  if (active === "skills") {
    return (
      <div className="about-skill-list">
        {skillGroups.map((group) => (
          <div key={group.name}><strong>{group.name}</strong><span>{group.items}</span></div>
        ))}
      </div>
    );
  }

  if (active === "projects") {
    return (
      <div className="about-project-list">
        {projectItems.map((project) => (
          <button type="button" key={project.name}>
            <span>{project.type}</span><strong>{project.name}</strong><small>{project.summary}</small><i aria-hidden="true">↗</i>
          </button>
        ))}
        <a href="">了解更多 ↗</a>
      </div>
    );
  }

  return (
    <div className="about-principles" aria-label="创作关键词">
      <span>web全栈开发工程师</span><span>AI应用开发工程师</span><span>一站式开发</span>
    </div>
  );
}

useGLTF.preload(MODEL_PATH, false, true);

export default function AboutPage() {
  const [activeId, setActiveId] = useState<AboutSectionId>("overview");
  const { theme, toggleTheme, noTransition } = useTheme();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [debugAvailable, setDebugAvailable] = useState(false);
  const [debugMode, setDebugMode] = useState<DebugMode>("off");
  const [transformMode, setTransformMode] = useState<TransformMode>("translate");
  const [catTransform, setCatTransform] = useState<CatDebugValues>(initialCatTransform);
  const [cameraDebug, setCameraDebug] = useState<CameraDebugValues>(cameraPresets.overview);
  const [cameraResetVersion, setCameraResetVersion] = useState(0);
  const [copyStatus, setCopyStatus] = useState("复制参数");
  const wheelLock = useRef(false);
  const wheelDistance = useRef(0);
  const wheelUnlockTimer = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const active = aboutSections.find((section) => section.id === activeId) ?? aboutSections[0];

  const updateCameraDebug = useCallback((values: CameraDebugValues) => {
    setCameraDebug(values);
  }, []);

  useEffect(() => {
    setDebugAvailable(["localhost", "127.0.0.1"].includes(window.location.hostname));

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    if (debugMode !== "cat") return;
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, button")) return;
      const nextMode: TransformMode | undefined = {
        w: "translate",
        e: "rotate",
        r: "scale",
      }[event.key.toLowerCase()] as TransformMode | undefined;
      if (nextMode) setTransformMode(nextMode);
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [debugMode]);

  const moveToAdjacentSection = useCallback((direction: -1 | 1) => {
    setActiveId((current) => {
      const currentIndex = aboutSections.findIndex((section) => section.id === current);
      const nextIndex = MathUtils.clamp(currentIndex + direction, 0, aboutSections.length - 1);
      return aboutSections[nextIndex].id;
    });
  }, []);

  useEffect(() => {
    if (debugMode !== "off") return;

    const unlockWheel = () => {
      wheelLock.current = false;
      wheelDistance.current = 0;
      wheelUnlockTimer.current = null;
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      if (wheelLock.current) return;

      const multiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? window.innerHeight
          : 1;
      wheelDistance.current += event.deltaY * multiplier;
      if (Math.abs(wheelDistance.current) < 34) return;

      moveToAdjacentSection(wheelDistance.current > 0 ? 1 : -1);
      wheelLock.current = true;
      wheelDistance.current = 0;
      wheelUnlockTimer.current = window.setTimeout(unlockWheel, reducedMotion ? 180 : 720);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, button, a, [contenteditable='true']")) return;

      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        moveToAdjacentSection(1);
      } else if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        moveToAdjacentSection(-1);
      } else if (event.key === "Home") {
        event.preventDefault();
        setActiveId(aboutSections[0].id);
      } else if (event.key === "End") {
        event.preventDefault();
        setActiveId(aboutSections[aboutSections.length - 1].id);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (touchStartY.current === null) return;
      const endY = event.changedTouches[0]?.clientY;
      if (endY === undefined) return;
      const distance = touchStartY.current - endY;
      touchStartY.current = null;
      if (Math.abs(distance) >= 52) moveToAdjacentSection(distance > 0 ? 1 : -1);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      if (wheelUnlockTimer.current !== null) window.clearTimeout(wheelUnlockTimer.current);
      unlockWheel();
    };
  }, [debugMode, moveToAdjacentSection, reducedMotion]);

  const copyDebugValues = async () => {
    const tuple = (values: VectorTuple) => `[${values.join(", ")}]`;
    const text = debugMode === "cat"
      ? `position={${tuple(catTransform.position)}} rotation={${tuple(catTransform.rotation)}} scale={${tuple(catTransform.scale)}}`
      : `${activeId}: { position: ${tuple(cameraDebug.position)}, target: ${tuple(cameraDebug.target)}, fov: ${cameraDebug.fov} },`;

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("已复制");
      window.setTimeout(() => setCopyStatus("复制参数"), 1400);
    } catch {
      setCopyStatus("复制失败");
    }
  };

  return (
    <main className={`about-page${noTransition ? " no-transition" : ""}`} data-theme={theme} suppressHydrationWarning>
      <div className={`about-model-stage${debugMode !== "off" ? " is-debugging" : ""}`} role="img" aria-label={`阿橘三维角色，当前镜头聚焦${active.focus}`}>
        <AboutScene
          active={activeId}
          theme={theme}
          reducedMotion={reducedMotion}
          debugMode={debugMode}
          transformMode={transformMode}
          catTransform={catTransform}
          cameraDebug={cameraDebug}
          cameraResetVersion={cameraResetVersion}
          onCatTransformChange={setCatTransform}
          onCameraDebugChange={updateCameraDebug}
        />
        <div className="about-scene-vignette" aria-hidden="true" />
      </div>

      <SceneHeader
        variant="about"
        subtitle="ABOUT THE CREATOR"
        theme={theme}
        onToggleTheme={toggleTheme}
        activeHref="/about"
        leadingAction={debugAvailable ? (
            <button
              className={`about-debug-toggle${debugMode !== "off" ? " is-active" : ""}`}
              type="button"
              onClick={() => setDebugMode((current) => current === "off" ? "camera" : "off")}
              aria-pressed={debugMode !== "off"}
            >
              {debugMode === "off" ? "调试" : "退出调试"}
            </button>
        ) : undefined}
      />

      {debugAvailable && debugMode !== "off" && (
        <aside className="about-debug-panel" aria-label="三维场景调试面板">
          <div className="about-debug-heading">
            <div><span>DEV TOOLS</span><strong>场景调试</strong></div>
            <button type="button" onClick={() => setDebugMode("off")} aria-label="关闭调试面板">×</button>
          </div>

          <div className="about-debug-tabs">
            <button type="button" className={debugMode === "camera" ? "is-active" : ""} onClick={() => setDebugMode("camera")}>镜头</button>
            <button type="button" className={debugMode === "cat" ? "is-active" : ""} onClick={() => setDebugMode("cat")}>猫咪</button>
          </div>

          {debugMode === "camera" ? (
            <div className="about-debug-body">
              <p className="about-debug-help">左键旋转 · 右键平移 · 滚轮缩放</p>
              <dl className="about-debug-values">
                <div><dt>position</dt><dd>[{cameraDebug.position.join(", ")}]</dd></div>
                <div><dt>target</dt><dd>[{cameraDebug.target.join(", ")}]</dd></div>
              </dl>
              <label className="about-debug-range">
                <span>FOV <b>{cameraDebug.fov}</b></span>
                <input
                  type="range"
                  min="18"
                  max="55"
                  step="1"
                  value={cameraDebug.fov}
                  onChange={(event) => setCameraDebug((current) => ({ ...current, fov: Number(event.target.value) }))}
                />
              </label>
              <div className="about-debug-actions">
                <button type="button" onClick={() => setCameraResetVersion((value) => value + 1)}>重置本栏目</button>
                <button type="button" className="is-primary" onClick={copyDebugValues}>{copyStatus}</button>
              </div>
            </div>
          ) : (
            <div className="about-debug-body">
              <p className="about-debug-help">拖动三轴手柄 · W 移动 · E 旋转 · R 缩放</p>
              <div className="about-transform-modes">
                {(["translate", "rotate", "scale"] as TransformMode[]).map((mode) => (
                  <button type="button" key={mode} className={transformMode === mode ? "is-active" : ""} onClick={() => setTransformMode(mode)}>
                    {mode === "translate" ? "移动 W" : mode === "rotate" ? "旋转 E" : "缩放 R"}
                  </button>
                ))}
              </div>
              <dl className="about-debug-values">
                <div><dt>position</dt><dd>[{catTransform.position.join(", ")}]</dd></div>
                <div><dt>rotation</dt><dd>[{catTransform.rotation.join(", ")}]</dd></div>
                <div><dt>scale</dt><dd>[{catTransform.scale.join(", ")}]</dd></div>
              </dl>
              <div className="about-debug-actions">
                <button type="button" onClick={() => setCatTransform({ ...initialCatTransform, position: [...initialCatTransform.position], rotation: [...initialCatTransform.rotation], scale: [...initialCatTransform.scale] })}>重置猫咪</button>
                <button type="button" className="is-primary" onClick={copyDebugValues}>{copyStatus}</button>
              </div>
            </div>
          )}
        </aside>
      )}

      <nav className="about-timeline" aria-label="关于我时间线">
        <span className="about-timeline-hint" aria-hidden="true">SCROLL</span>
        <div className="about-timeline-track" aria-hidden="true" />
        {aboutSections.map((section) => (
          <button
            type="button"
            key={section.id}
            className={section.id === activeId ? "is-active" : ""}
            aria-label={`切换到${section.label}`}
            aria-current={section.id === activeId ? "step" : undefined}
            onClick={() => setActiveId(section.id)}
          >
            <span className="about-timeline-copy"><small>{section.index}</small>{section.label}</span>
            <i aria-hidden="true" />
          </button>
        ))}
      </nav>

      <aside className="about-bubble" key={active.id} aria-live="polite">
        <div className="about-bubble-topline"><p>{active.eyebrow}</p><span>{active.index} / 03</span></div>
        <h1>{active.title}</h1>
        <p className="about-description">{active.description}</p>
        <SectionDetails active={activeId} />
      </aside>

      <footer className="about-footer">
        {/* <span><i /> 当前焦点：{active.focus}</span> */}
        <span></span>
      </footer>
    </main>
  );
}
