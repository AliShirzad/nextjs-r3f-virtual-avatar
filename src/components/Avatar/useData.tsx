import { IMessage, useChat } from "@/hooks/useChat";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFResult } from ".";
import { facialExpressions } from "@/constants/facialExpressions";
import { corresponding } from "@/constants/corresponding";
import { button, useControls } from "leva";
import { useFrame } from "@react-three/fiber";

let setupMode = false;

export function useData({
  nodes,
  scene,
}: {
  nodes: GLTFResult["nodes"];
  scene: GLTFResult["scene"];
}) {
  const { message, onMessagePlayed, chat } = useChat();

  const [lipsync, setLipsync] = useState<IMessage["lipsync"] | null>(null);

  useEffect(() => {
    console.log(message);
    if (!message) {
      setAnimation("Idle");
      return;
    }
    setAnimation(message.animation);
    setFacialExpression(message.facialExpression);
    setLipsync(message.lipsync);
    const audio = new Audio("data:audio/mp3;base64," + message.audio);
    audio.play();
    setAudio(audio);
    audio.onended = onMessagePlayed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  const { animations } = useGLTF("/models/animations.glb");

  const group = useRef(null);
  const { actions, mixer } = useAnimations(animations, group);
  const [animation, setAnimation] = useState(
    animations.find((a) => a.name === "Idle") ? "Idle" : animations[0].name // Check if Idle animation exists otherwise use first animation
  );
  // useEffect(() => {
  //   actions[animation]
  //     ?.reset()
  //     .fadeIn(mixer.stats.actions.inUse === 0 ? 0 : 0.5)
  //     .play();
  //   return () => actions[animation]?.fadeOut(0.5);
  // }, [animation]);

  const lerpMorphTarget = (target: string, value: any, speed = 0.1) => {
    scene.traverse((child) => {
      const _child = child as any;
      if (_child.isSkinnedMesh && _child.morphTargetDictionary) {
        const index = _child.morphTargetDictionary[target];
        if (
          index === undefined ||
          _child.morphTargetInfluences[index] === undefined
        ) {
          return;
        }
        _child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          _child.morphTargetInfluences[index],
          value,
          speed
        );

        if (!setupMode) {
          try {
            set({
              [target]: value,
            });
          } catch (e) {}
        }
      }
    });
  };

  const [blink, setBlink] = useState(false);
  const [winkLeft, setWinkLeft] = useState(false);
  const [winkRight, setWinkRight] = useState(false);
  const [facialExpression, setFacialExpression] =
    useState<keyof typeof facialExpressions>("default");
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useFrame(() => {
    if (nodes.EyeLeft.morphTargetDictionary) {
      !setupMode &&
        Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
          const mapping = facialExpressions[
            facialExpression
          ] as keyof (typeof facialExpressions)[typeof facialExpression];
          if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
            return; // eyes wink/blink are handled separately
          }
          if (mapping && mapping[key]) {
            lerpMorphTarget(key, mapping[key], 0.1);
          } else {
            lerpMorphTarget(key, 0, 0.1);
          }
        });

      lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
      lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);

      // LIPSYNC
      if (setupMode) {
        return;
      }

      const appliedMorphTargets: any[] = [];
      if (message && lipsync && audio) {
        const currentAudioTime = audio.currentTime;
        for (let i = 0; i < lipsync.mouthCues?.length; i++) {
          const mouthCue = lipsync.mouthCues[i];
          if (
            currentAudioTime >= mouthCue.start &&
            currentAudioTime <= mouthCue.end
          ) {
            appliedMorphTargets.push(corresponding[mouthCue.value]);
            lerpMorphTarget(corresponding[mouthCue.value], 1, 0.2);
            break;
          }
        }
      }

      Object.values(corresponding).forEach((value) => {
        if (appliedMorphTargets.includes(value)) {
          return;
        }
        lerpMorphTarget(value, 0, 0.1);
      });
    }
  });

  useControls("FacialExpressions", {
    chat: button(() => chat("hi")),
    winkLeft: button(() => {
      setWinkLeft(true);
      setTimeout(() => setWinkLeft(false), 300);
    }),
    winkRight: button(() => {
      setWinkRight(true);
      setTimeout(() => setWinkRight(false), 300);
    }),
    animation: {
      value: animation,
      options: animations.map((a) => a.name),
      onChange: (value) => setAnimation(value),
    },
    facialExpression: {
      options: Object.keys(facialExpressions),
      onChange: (value) => setFacialExpression(value),
    },
    enableSetupMode: button(() => {
      setupMode = true;
    }),
    disableSetupMode: button(() => {
      setupMode = false;
    }),
    logMorphTargetValues: button(() => {
      if (!nodes.EyeLeft.morphTargetDictionary) return;
      const emotionValues: { [key: string]: any } = {};
      Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return; // eyes wink/blink are handled separately
        }
        const value =
          nodes.EyeLeft.morphTargetInfluences![
            nodes.EyeLeft.morphTargetDictionary![key]
          ];
        if (value > 0.01) {
          emotionValues[key] = value;
        }
      });
      console.log(JSON.stringify(emotionValues, null, 2));
    }),
  });

  const [, set] = useControls("MorphTarget", () =>
    Object.assign(
      {},
      ...Object.keys(nodes.EyeLeft.morphTargetDictionary!).map((key) => {
        return {
          [key]: {
            label: key,
            value: 0,
            min: nodes.EyeLeft.morphTargetInfluences![
              nodes.EyeLeft.morphTargetDictionary![key]
            ],
            max: 1,
            onChange: (val: any) => {
              if (setupMode) {
                lerpMorphTarget(key, val, 1);
              }
            },
          },
        };
      })
    )
  );

  useEffect(() => {
    let blinkTimeout: any;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);
}
