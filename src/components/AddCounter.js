import { useState } from "react";
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
  const [custom, setCustom] = useState("");
  const [customType, setCustomType] = useState(CTYPES.ALLY);
  const { t } = useTranslation();
  const { data } = useData();

  const handleAdd = (type, config) => {
    createCounter(type, config.name, config);
    setCustom("");
  };

  const handleSubmitCounter = (e) => {
    e.preventDefault();
    custom && createCounter(customType, custom);
    setCustom("");
  };

  return (
    open && (
      <Modal onClose={onClose}>
        <Box key="Add counters" title={t("Add counters")} flat flag>
          <fieldset>
            <form onSubmit={handleSubmitCounter}>
              {[
                CTYPES.ALLY,
                CTYPES.MINION,
                CTYPES.SIDE_SCHEME,
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
              <section className="suggestions">
                <div>
                  {custom.length > 1 && customType === CTYPES.ALLY && (
                    <Suggestions
                      data={data.allies}
                      filter={custom}
                      handleAdd={handleAdd}
                      type={CTYPES.ALLY}
                    />
                  )}
                  {custom.length > 1 && customType === CTYPES.MINION && (
                    <Suggestions
                      data={data.minions}
                      filter={custom}
                      handleAdd={handleAdd}
                      type={CTYPES.MINION}
                    />
                  )}
                  {custom.length > 1 && customType === CTYPES.SIDE_SCHEME && (
                    <Suggestions
                      data={Object.values(data.sideSchemes)}
                      filter={custom}
                      handleAdd={handleAdd}
                      type={CTYPES.SIDE_SCHEME}
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
