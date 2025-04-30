import { useState } from "react";
import ControlPanel from "./components/ControlPanel";
import { useWindowSize } from "./hooks/useWindowSize";
import GraphCanvas from "./components/GraphCanvas";

const cellSize = 20;

export default function App() {
  const [p, setP] = useState(0);
  const { width, height } = useWindowSize();
  const graphWidth = width;
  const graphHeight = height;

  return (
    <div className="flex h-screen w-screen bg-[#fef5e3] relative">
      <GraphCanvas
        p={p}
        width={graphWidth}
        height={graphHeight}
        cellSize={cellSize}
      />

      <div className="h-[95%] absolute right-4 top-1/2 -translate-y-1/2">
        <ControlPanel p={p} setP={setP} />
      </div>
    </div>
  );
}
