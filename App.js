import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as React from "react";
import { StyleSheet, View } from "react-native";

import World from "./src/World";

export default function App() {
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
