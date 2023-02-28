import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import "../styles/suggestions.css";

import { COUNTER_TYPES as CTYPES } from "../utils/constants";
import { useData } from "../context/data";

import Dot from "./ui/Dot";

const addType = (type) => (el) => ({ ...el, _type: type });

const Suggestion = ({ el, onClick }) => {
  const { t } = useTranslation();

  return (
    <div
      key={el.key || el.name}
      onClick={() => onClick(el._type, el)}
      className="option"
    >
      <span>
        <Dot type={el._type} small />
        {t(el.name)}
        {el.subTitle ? ` | ${t(el.subTitle)}` : ""}
      </span>
      <small>
        {Array.isArray(el.set) ? `${el.set.length} sets` : t(el.set)}
      </small>
    </div>
  );
};

export default function Suggestions({ filter, type, handleAdd }) {
  const { t } = useTranslation();
  const { data } = useData();

  const suggestionsData = useMemo(
    () => [
      ...data.allies.map(addType(CTYPES.ALLY)),
      ...data.minions.map(addType(CTYPES.MINION)),
      ...Object.values(data.sideSchemes).map(addType(CTYPES.SIDE_SCHEME)),
      ...Object.values(data.supports).map(addType(CTYPES.SUPPORT)),
      ...Object.values(data.upgrades).map(addType(CTYPES.UPGRADE)),
    ],
    [data]
  );

  const byPriority = (a, b) => {
    const nameA = t(a.name).toLowerCase();
    const nameB = t(b.name).toLowerCase();
    const lowerFilter = filter.toLowerCase();
    if (a._type !== b._type) {
      return a._type === type ? -1 : 1;
    }
    if (nameA.startsWith(lowerFilter) !== nameB.startsWith(lowerFilter)) {
      return nameA.startsWith(lowerFilter) ? -1 : 1;
    }
    return nameA.localeCompare(nameB);
  };

  const matchSearch = (el) =>
    !filter ||
    t(el.name).toLowerCase().includes(filter.toLowerCase()) ||
    t(el.subTitle).toLowerCase().includes(filter.toLowerCase());

  return (
    filter.length > 1 && (
      <div>
        <div
          onClick={() => handleAdd(type, { name: filter })}
          className="option"
        >
          <div>
            <small>{t("Create counter type", { type: t(type) })} ▸ </small>
            {filter}
          </div>
        </div>
        {suggestionsData
          .filter(matchSearch)
          .sort(byPriority)
          .map((el) => (
            <Suggestion el={el} onClick={handleAdd} key={el.key || el.name} />
          ))}
      </div>
    )
  );
}
