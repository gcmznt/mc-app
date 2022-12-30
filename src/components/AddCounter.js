import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import "../styles/suggestions.css";

import { COUNTER_TYPES as CTYPES } from "../utils/constants";
import { useData } from "../context/data";

import Box from "./ui/Box";
import Modal from "./ui/Modal";
import Option from "./ui/Option";

const Suggestions = ({ data, filter, type, handleAdd }) => {
  const { t } = useTranslation();

  const byPriority = (a, b) => {
    const nameA = t(a.name).toLowerCase();
    const nameB = t(b.name).toLowerCase();
    const lowerFilter = filter.toLowerCase();
    if (nameA.startsWith(lowerFilter) !== nameB.startsWith(lowerFilter)) {
      return nameA.startsWith(lowerFilter) ? -1 : 1;
    }
    return nameA.localeCompare(nameB);
  };

  const getName = (el) =>
    `${t(el.name)}${el.subTitle ? ` | ${t(el.subTitle)}` : ""}`;

  const matchSearch = (el) =>
    !filter || getName(el).toLowerCase().includes(filter.toLowerCase());

  const getLabel = (el) => {
    if (type === CTYPES.ALLY)
      return (
        <>
          {getName(el)} <small>{t(el.set)}</small>
        </>
      );

    if (type === CTYPES.MINION)
      return (
        <>
          {t(el.name)}{" "}
          <small>
            {Array.isArray(el.set) ? `${el.set.length} sets` : t(el.set)}
          </small>
        </>
      );
    return getName(el);
  };

  return (
    <>
      {data
        .filter(matchSearch)
        .sort(byPriority)
        .map((el) => (
          <div
            key={el.key || el.name}
            onClick={() => handleAdd(type, el)}
            className="option"
          >
            {getLabel(el)}
          </div>
        ))}
    </>
  );
};

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
  const { data } = useData();

  const handleAdd = (type, config) => {
    createCounter(type, config.name, config);
    inputRef.current.focus();
    setCustom("");
  };

  const handleChange = (type) => {
    setCustomType(type);
    inputRef.current.focus();
  };

  const handleSubmitCounter = (e) => {
    e.preventDefault();
    custom && createCounter(customType, custom);
    inputRef.current.focus();
    setCustom("");
  };

  const suggestionsData = {
    [CTYPES.ALLY]: data.allies,
    [CTYPES.MINION]: data.minions,
    [CTYPES.SIDE_SCHEME]: Object.values(data.sideSchemes),
    [CTYPES.SUPPORT]: Object.values(data.supports),
    [CTYPES.UPGRADE]: Object.values(data.upgrades),
  }[customType];

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef.current]);

  return (
    open && (
      <Modal onClose={onClose}>
        <Box key="Add counters" title={t("Add counters")}>
          <fieldset>
            <form onSubmit={handleSubmitCounter}>
              <div>
                {[CTYPES.ALLY, CTYPES.MINION, CTYPES.SIDE_SCHEME].map(
                  (type) => (
                    <Option
                      checked={type === customType}
                      key={type}
                      label={t(type)}
                      onChange={() => handleChange(type)}
                      type="radio"
                      value={customType}
                      variant="inline"
                    />
                  )
                )}
              </div>
              <div>
                {[CTYPES.SUPPORT, CTYPES.UPGRADE, CTYPES.CUSTOM].map((type) => (
                  <Option
                    checked={type === customType}
                    key={type}
                    label={t(type)}
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
                />{" "}
                <button
                  type="submit"
                  onClick={handleSubmitCounter}
                  className="small"
                >
                  +
                </button>
              </footer>
              <section className="suggestions">
                <div>
                  {custom.length > 1 && (
                    <Suggestions
                      data={suggestionsData || []}
                      filter={custom}
                      handleAdd={handleAdd}
                      type={customType}
                    />
                  )}
                </div>
              </section>
            </form>
          </fieldset>
        </Box>
      </Modal>
    )
  );
}
