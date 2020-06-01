import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import World from "./src/World";
import { useGlobalEvent } from "./src/Emitter";

export default function App() {
  const isLoadingHidden = useGlobalEvent("loading.hidden");
  const isIntroHidden = useGlobalEvent("intro.hidden");
  const isReticleHidden = useGlobalEvent("reticle.hidden");
  const isHitHidden = useGlobalEvent("hit.hidden");

  return (
    <View style={{ flex: 1 }}>
      <GLApp />
      <Hint />
      <Ammo />
      {!isHitHidden && <WasHit />}
      {!isReticleHidden && <CrossHairs />}
      {!isIntroHidden && <Intro onPress={() => World.onIntroClick()} />}
      {!isLoadingHidden && <LoadingScreen />}
    </View>
  );
}

function WasHit() {
  return (
    <Text style={{ position: "absolute", top: 4, right: 4, opacity: 0.8 }}>
      HIT!
    </Text>
  );
}

function Ammo() {
  const value = useGlobalEvent("ammo");
  const { current, total } = value || {};
  return (
    <Text style={{ position: "absolute", bottom: 4, right: 4, opacity: 0.8 }}>
      Ammo: {current}/{total}
    </Text>
  );
}

function Hint() {
  return (
    <Text style={{ position: "absolute", bottom: 4, left: 4, opacity: 0.8 }}>
      Reload [r] | Move [w, a, s, d] | Shoot [click] | Leave [escape]
    </Text>
  );
}

function GLApp() {
  let timeout;

  React.useEffect(() => {
    // Clear the animation loop when the component unmounts
    return () => clearTimeout(timeout);
  }, []);

  const onContextCreate = async (gl) => {
    await World.init(gl);

    // Setup an animation loop
    const render = () => {
      timeout = requestAnimationFrame(render);
      World.update();
      // renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  return <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />;
}

function LoadingScreen() {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <Text>Loading...</Text>
    </View>
  );
}

function Intro({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <Text>Hey</Text>
    </TouchableOpacity>
  );
}

function CrossHairs() {
  const size = 46;
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { justifyContent: "center", alignItems: "center" },
      ]}
      pointerEvents="none"
    >
      <View
        style={{
          backgroundColor: "red",
          opacity: 0.3,
          width: size,
          height: size,
        }}
      />
    </View>
  );
}
