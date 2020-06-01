import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as React from "react";
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  View,
} from "react-native";

import World from "./src/World";
import { useGlobalEvent } from "./src/Emitter";
import * as Animatable from "react-native-animatable";
import { useDimensions } from "react-native-web-hooks";

export default function App() {
  const isIntroHidden = useGlobalEvent("intro.hidden");
  const isReticleHidden = useGlobalEvent("reticle.hidden") ?? true;

  return (
    <View style={{ flex: 1 }}>
      <GLApp />
      <Hint />
      <Ammo />
      <WasHit />
      {!isReticleHidden && <CrossHairs />}
      {!isIntroHidden && <Intro onPress={() => World.onIntroClick()} />}
      <LoadingScreen />
    </View>
  );
}

function WasHit() {
  const isHitHidden = useGlobalEvent("hit.hidden") ?? true;

  return (
    <Animatable.View
      animation={isHitHidden ? "fadeOutUp" : "bounceIn"}
      duration={isHitHidden ? 300 : 1000}
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: 24,
          left: 0,
          right: 0,
          bottom: "70%",
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 16,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <Text
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: 24,
            textAlign: "center",
          }}
        >
          HIT!
        </Text>
      </View>
    </Animatable.View>
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

import { H1 } from "@expo/html-elements";

function LoadingScreen() {
  const isLoadingHidden = useGlobalEvent("loading.hidden");

  return (
    <Animatable.View
      animation={isLoadingHidden ? "fadeOut" : undefined}
      pointerEvents={isLoadingHidden ? "none" : "auto"}
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: "gray",
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <ActivityIndicator color="white" style={{ marginRight: 8 }} />
        <H1 style={{ color: "white" }}>Loading...</H1>
      </View>
    </Animatable.View>
  );
}

function Intro({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <Text style={{ fontSize: 24, color: "white" }}>
        Welcome to Yuka + Expo
      </Text>
    </TouchableOpacity>
  );
}

function CrossHairs() {
  const { window } = useDimensions();
  const size = Math.min(window.width, window.height) * 0.1;

  const thiccness = 1;
  const color = "rgba(255,0,0,0.25)";
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { justifyContent: "center", alignItems: "center" },
      ]}
      pointerEvents="none"
    >
      <View style={{ width: size, height: size }}>
        <View
          style={{
            backgroundColor: color,
            height: thiccness,
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            transform: [{ translateY: "-50%" }],
          }}
        />
        <View
          style={{
            backgroundColor: color,
            width: thiccness,
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            transform: [{ translateX: "-50%" }],
          }}
        />
      </View>
    </View>
  );
}
