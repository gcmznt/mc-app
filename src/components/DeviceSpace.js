import { useEffect, useState } from "react";

import "../styles/device-space.css";

export default function DeviceSpace() {
  const [usage, setUsage] = useState(0);
  const [quota, setQuota] = useState(1);

  useEffect(() => {
    navigator.storage.estimate().then((estimate) => {
      setQuota(estimate.quota);
      setUsage(estimate.usage);
    });
  }, []);

  return (
    <div className="device-space">
      <div
        className="device-space__bar"
        style={{ "--perc": (usage / quota) * 100 }}
      />
      {((usage / quota) * 100).toFixed(2)}%
    </div>
  );
}
