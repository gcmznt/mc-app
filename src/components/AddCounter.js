import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import "../styles/suggestions.css";

import { COUNTER_TYPES as CTYPES } from "../utils/constants";
import Suggestions from "./Suggestions";

import Box from "./ui/Box";
import Modal from "./ui/Modal";
import Option from "./ui/Option";

export default function AddCounter({
  canRestart,
  open,
  onClose,
  createCounter,
  sets,
}) {
  const inputRef = useRef();
  const [custom, setCustom] = useState("");
  const [customType, setCustomType] = useState(CTYPES.ALLY);
  const { t } = useTranslation();

  const handleAdd = (type, config) => {
    createCounter(type, config.name, config);
    inputRef.current.focus();
    setCustom("");
  };

  const handleChange = (type) => {
    setCustomType(type);
    inputRef.current.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Modal onClose={onClose} open={open}>
      <Box key="Add counters" title={t("Add counters")}>
        <fieldset>
          <form>
            <div>
              {[CTYPES.ALLY, CTYPES.MINION, CTYPES.SIDE_SCHEME].map((type) => (
                <Option
                  checked={type === customType}
                  key={type}
                  label={t(type)}
                  mod={type}
                  onChange={() => handleChange(type)}
                  type="radio"
                  value={customType}
                  variant="inline"
                />
              ))}
            </div>
            <div>
              {[CTYPES.SUPPORT, CTYPES.UPGRADE, CTYPES.CUSTOM].map((type) => (
                <Option
                  checked={type === customType}
                  key={type}
                  label={t(type)}
                  mod={type}
                  onChange={() => handleChange(type)}
                  type="radio"
                  value={customType}
                  variant="inline"
                />
              ))}
            </div>
            <footer>
              <input
                placeholder={t("Name")}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                type="text"
                required={customType === CTYPES.CUSTOM}
                ref={inputRef}
              />
            </footer>
            <section className="suggestions">
              <Suggestions
                filter={custom}
                handleAdd={handleAdd}
                type={customType}
              />
            </section>
          </form>
        </fieldset>
      </Box>
    </Modal>
  );
}
