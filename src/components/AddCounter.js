import { useState } from "react";
import { useTranslation } from "react-i18next";

import { COUNTER_TYPES as CTYPES } from "../utils/constants";
import Box from "./ui/Box";
import Modal from "./ui/Modal";
import Option from "./ui/Option";

export default function AddCounter({
  canRestart,
  open,
  onClose,
  createCounter,
  sets,
  enableSide,
}) {
  const [custom, setCustom] = useState("");
  const [customType, setCustomType] = useState(CTYPES.ALLY);
  const { t } = useTranslation();

  const byName = (a, b) => t(a.name).localeCompare(t(b.name));

  const handleSubmitCounter = (e) => {
    e.preventDefault();
    if (customType !== CTYPES.CUSTOM) createCounter(customType, custom);
    else custom && createCounter(customType, custom);
    setCustom("");
  };

  return (
    open && (
      <Modal onClose={onClose}>
        <Box key="Add counters" title={t("Add counters")} flat flag>
          <fieldset>
            <legend>- {t("Side schemes")}</legend>
            {sets.sideSchemes
              .filter((c) => !c.active)
              .sort(byName)
              .map((counter) => (
                <div
                  key={counter.id}
                  onClick={() => enableSide(counter)}
                  className="option"
                >
                  {t(counter.name)}
                </div>
              ))}
          </fieldset>
          <fieldset>
            <legend>- {t("Custom")}</legend>
            <form onSubmit={handleSubmitCounter}>
              {[
                CTYPES.ALLY,
                CTYPES.MINION,
                CTYPES.SUPPORT,
                CTYPES.UPGRADE,
                CTYPES.CUSTOM,
              ].map((type) => (
                <Option
                  checked={type === customType}
                  key={type}
                  label={t(type)}
                  onChange={() => setCustomType(type)}
                  type="radio"
                  value={customType}
                />
              ))}
              <footer>
                <input
                  placeholder={t("Name")}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  type="text"
                  required={customType === CTYPES.CUSTOM}
                />{" "}
                <button
                  type="submit"
                  onClick={handleSubmitCounter}
                  className="small"
                >
                  +
                </button>
              </footer>
            </form>
          </fieldset>
        </Box>
      </Modal>
    )
  );
}
