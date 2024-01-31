"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { UI, Experience } from "@/components";
import { Loader } from "@react-three/drei";
import { Leva } from "leva";

export default function Page() {
  return (
    <>
      <Loader />
      <Leva hidden />

      <UI />
      <Canvas
        style={{ height: "100vh", width: "100vw" }}
        shadows
        camera={{ position: [0, 0, 1], fov: 30 }}
      >
        <Experience />
      </Canvas>
    </>
  );
}
