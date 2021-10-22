import { useTranslation } from "react-i18next";

import { RESULT_TYPES } from "../utils/constants";
import Modal from "./ui/Modal";

export default function MatchMenu({ open, onClose, onQuit }) {
  const { t } = useTranslation();

  const handleDiscard = () => onQuit(false);
  const handleGiveUp = () => onQuit(RESULT_TYPES.GIVE_UP);
  const handleLostByScheme = () => onQuit(RESULT_TYPES.SCHEME);
  const handleHeroesDead = () => onQuit(RESULT_TYPES.DEFEATED);
  const handleVillainsDead = () => onQuit(RESULT_TYPES.WINNER);
  const handleWonByScheme = () => onQuit(RESULT_TYPES.SCHEME_WIN);

  return (
    open && (
      <Modal onClick={onClose}>
        <button onClick={handleGiveUp}>{t("Give up")}</button>
        <button onClick={handleLostByScheme}>{t("Lost by scheme")}</button>
        <button onClick={handleHeroesDead}>{t("All heroes dead")}</button>
        <button onClick={handleVillainsDead}>{t("Villain defeated")}</button>
        <button onClick={handleWonByScheme}>{t("Won by scheme")}</button>
        <button onClick={handleDiscard}>{t("Discard match")}</button>
        <button onClick={onClose}>{t("Close menu")}</button>
      </Modal>
    )
  );
}
