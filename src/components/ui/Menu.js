import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

import Actions, { Action } from "./Actions";
import { ReactComponent as HomeIcon } from "../../images/home.svg";
import { ReactComponent as SettingsIcon } from "../../images/settings.svg";
import { ReactComponent as StatsIcon } from "../../images/stats.svg";

import { PAGES } from "../../utils/constants";
import Navbar from "./NavBar";

export default function Menu() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();

  return (
    <Navbar>
      <Actions>
        <Action
          icon={<HomeIcon />}
          label={t("Home")}
          active={location === PAGES.MAIN}
          onClick={() => setLocation(PAGES.MAIN)}
        />
        <Action
          icon={<StatsIcon />}
          label={t("Stats")}
          active={location === PAGES.STATISTICS}
          onClick={() => setLocation(PAGES.STATISTICS)}
        />
        <Action
          icon={<SettingsIcon />}
          label={t("Options")}
          active={location === PAGES.OPTIONS}
          onClick={() => setLocation(PAGES.OPTIONS)}
        />
      </Actions>
    </Navbar>
  );
}
