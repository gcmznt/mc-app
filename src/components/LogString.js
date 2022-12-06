import { useTranslation } from "react-i18next";

import { COUNTER_TYPES, EVENTS } from "../utils/constants";
import {
  getAddTokenText,
  getCompleteText,
  getRemoveTokenText,
  getResText,
} from "../utils/texts";

const Status = ({ status }) => {
  const { t } = useTranslation();

  return <span className={`is-${status.toLowerCase()}`}>{t(status)}</span>;
};

const Stage = ({ name, type }) => {
  const { t } = useTranslation();
  const translate = (title) => title.split(" || ").map(t).join(" ");

  if (!name) return "";
  const typeClass = {
    [COUNTER_TYPES.HERO]: "is-hero",
    [COUNTER_TYPES.ALLY]: "is-ally",
    [COUNTER_TYPES.MINION]: "is-minion",
    [COUNTER_TYPES.SCENARIO]: "is-scheme",
    [COUNTER_TYPES.SIDE_SCHEME]: "is-scheme",
    [COUNTER_TYPES.VILLAIN]: "is-villain",
  }[type];

  return (
    <span className={`log__stage ${typeClass || ""}`}>{translate(name)}</span>
  );
};

const LogText = ({ count = 0, counter, info, event }) => {
  const { t } = useTranslation();

  switch (event) {
    case EVENTS.COMPLETE:
    case EVENTS.SIDE_CLEARED:
    case EVENTS.ALLY_DEFEATED:
    case EVENTS.MINION_DEFEATED:
      return t(getCompleteText(counter.type));
    case EVENTS.CREATE:
    case EVENTS.ENTER_ALLY:
    case EVENTS.ENTER_MINION:
    case EVENTS.ENTER_SUPPORT:
    case EVENTS.ENTER_UPGRADE:
    case EVENTS.ENTER:
    case EVENTS.ENTER_SCHEME:
    case EVENTS.FLIP_COUNTER:
      return t("Entered");
    case EVENTS.DECREASE:
      return t(getRemoveTokenText(counter.type), { count: -count });
    case EVENTS.DECREASE_LIMIT:
      return t("Decreased limit", { count: -count });
    case EVENTS.DISABLE:
      return t("Disabled");
    case EVENTS.EMPTY:
      return t("Empty");
    case EVENTS.RESET:
      return t("Reset");
    case EVENTS.LOCK:
      return t("Locked");
    case EVENTS.UNLOCK:
      return t("Unlocked");
    case EVENTS.FLIP:
    case EVENTS.FLIP_HERO:
    case EVENTS.FLIP_VILLAIN:
      return t("Flipped");
    case EVENTS.END:
      return `🟣 ${getResText(info)}`;
    case EVENTS.HIT:
    case EVENTS.INCREASE:
    case EVENTS.INCREASE_FROM:
    case EVENTS.VILLAIN_PHASE:
      return t(getAddTokenText(counter.type), { count });
    case EVENTS.INCREASE_LIMIT:
      return t("Increased limit", { count });
    case EVENTS.FIRST_PLAYER:
      return `❗️ ${t("First player")}`;
    case EVENTS.NEW_PHASE:
      return `🔴 ${t("Villain phase")}`;
    case EVENTS.NEW_ROUND:
      return `🔵 ${t("New round")}`;
    case EVENTS.NEXT:
      return t("Next stage");
    case EVENTS.RESTART:
      return `🟢 ${t("Match restarted")}`;
    case EVENTS.START:
      return `🟢 ${t("Match started")}`;
    case EVENTS.STATUS_DISABLE:
      return t("is no more", {
        status: <Status key="status" status={info.data} />,
      });
    case EVENTS.STATUS_ENABLE:
      return t("is", {
        status: <Status key="status" status={info.data} />,
      });

    default:
      return event || null;
  }
};

const getEntryName = (counter, info, event) => {
  switch (event) {
    case EVENTS.FLIP:
    case EVENTS.FLIP_HERO:
    case EVENTS.FLIP_VILLAIN:
      return info.data;
    case EVENTS.END:
    case EVENTS.FIRST_PLAYER:
    case EVENTS.NEW_PHASE:
    case EVENTS.NEW_ROUND:
    case EVENTS.RESTART:
    case EVENTS.START:
      return false;

    default:
      return counter?.name;
  }
};

export default function LogString({ count = 0, counter, info, event }) {
  const name = getEntryName(counter, info, event);
  return (
    <>
      {name ? <Stage name={name} type={counter?.type} /> : null}
      <LogText count={count} counter={counter} info={info} event={event} />
    </>
  );
}
