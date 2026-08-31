"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import type { Mesh } from "three";
import { sitePath } from "../lib/sitePath";

const MODEL_PATH = sitePath("/models/aju-explorer-cat-v2.glb");

function AjuModel() {
  const { scene } = useGLTF(MODEL_PATH);

  useEffect(() => {
    scene.traverse((object) => {
      if ((object as Mesh).isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} position={[0, -2.38, 0]} rotation={[0, -0.08, 0]} />;
}

useGLTF.preload(MODEL_PATH);

export default function ModelPreview() {
  return (
    <main className="model-preview-page">
      <header className="model-preview-header">
        <a href={sitePath("/")} className="model-back-link">← 返回首页</a>
        <div>
          <span>CHARACTER MODEL · V2</span>
          <h1>阿橘 · 探险猫</h1>
        </div>
        <a className="model-file-link" href={MODEL_PATH} download>
          下载 GLB
        </a>
      </header>

      <section className="model-stage" aria-label="阿橘三维模型预览，可拖动旋转并滚轮缩放">
        <Canvas
          dpr={[1, 1.6]}
          shadows
          camera={{ position: [5.7, 2.8, 7.4], fov: 34, near: 0.1, far: 80 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#efb58f"]} />
          <fog attach="fog" args={["#efb58f", 12, 22]} />
          <ambientLight intensity={2.2} />
          <directionalLight
            castShadow
            position={[5, 8, 7]}
            intensity={3.8}
            color="#fff1d7"
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[-4, 3, 4]} intensity={2.2} color="#d97552" />
          <Suspense fallback={null}>
            <AjuModel />
          </Suspense>
          <mesh position={[0, -2.39, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[7, 64]} />
            <meshStandardMaterial color="#edb18b" roughness={1} />
          </mesh>
          <ContactShadows
            position={[0, -2.37, 0]}
            opacity={0.38}
            scale={8}
            blur={2.5}
            far={5}
            color="#68463b"
          />
          <OrbitControls
            makeDefault
            target={[0, 0, 0]}
            minDistance={5.2}
            maxDistance={12}
            minPolarAngle={Math.PI * 0.24}
            maxPolarAngle={Math.PI * 0.68}
            enablePan={false}
            dampingFactor={0.06}
          />
        </Canvas>

        <div className="model-preview-notes">
          <p><span>拖动</span> 旋转模型</p>
          <p><span>滚轮</span> 调整距离</p>
        </div>

        <aside className="model-spec-card">
          <p>MODEL STATUS</p>
          <dl>
            <div><dt>格式</dt><dd>GLB 2.0</dd></div>
            <div><dt>体积</dt><dd>2.4 MB</dd></div>
            <div><dt>节点</dt><dd>78</dd></div>
            <div><dt>网格</dt><dd>71</dd></div>
            <div><dt>状态</dt><dd>待绑定骨骼</dd></div>
          </dl>
        </aside>
      </section>
    </main>
  );
}
