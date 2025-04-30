import { useEffect, useState } from "react";
import { Slider, InputNumber } from "antd";

type Props = {
  p: number;
  setP: (p: number) => void;
};

export default function ControlPanel({ p, setP }: Props) {
  const [rawP, setRawP] = useState(p);

  // Debounce the real setP call
  useEffect(() => {
    const timeout = setTimeout(() => {
      setP(parseFloat(rawP.toFixed(2))); // round to match cache keys
    }, 500); // adjust as needed

    return () => clearTimeout(timeout);
  }, [rawP, setP]);

  // Keep rawP in sync if external p changes (e.g. via reset)
  useEffect(() => {
    setRawP(p);
  }, [p]);

  return (
    <div className="p-4 gap-4 flex flex-col items-center h-full text-black rounded-2xl bg-white shadow-md">
      <Slider
        vertical
        min={0}
        max={1}
        step={0.01}
        value={rawP}
        onChange={(value) => {
          if (typeof value === "number") setRawP(value);
        }}
        style={{ height: "100%" }}
      />

      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-medium text-gray-600">p =</span>
        <InputNumber
          min={0}
          max={1}
          step={0.01}
          value={rawP}
          onChange={(value) => {
            if (typeof value === "number") {
              setRawP(value);
              setP(value); // input field updates instantly
            }
          }}
          className="!w-[3rem]"
          size="small"
          controls={false}
        />
      </div>
    </div>
  );
}
