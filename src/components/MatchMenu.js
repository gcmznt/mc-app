import { RESULT_TYPES } from "../utils/constants";
import Modal from "./ui/Modal";

export default function MatchMenu({ open, onClose, onQuit }) {
  const handleDiscard = () => onQuit(false);
  const handleGiveUp = () => onQuit(RESULT_TYPES.GIVE_UP);
  const handleLostByScheme = () => onQuit(RESULT_TYPES.SCHEME);
  const handleHeroesDead = () => onQuit(RESULT_TYPES.DEFEATED);
  const handleVillainsDead = () => onQuit(RESULT_TYPES.WINNER);
  const handleWonByScheme = () => onQuit(RESULT_TYPES.SCHEME_WIN);

  return (
    open && (
      <Modal onClick={onClose}>
        <button onClick={handleGiveUp}>Give up</button>
        <button onClick={handleLostByScheme}>Lost by scheme</button>
        <button onClick={handleHeroesDead}>All heroes dead</button>
        <button onClick={handleVillainsDead}>Villain defeated</button>
        <button onClick={handleWonByScheme}>Won by scheme</button>
        <button onClick={handleDiscard}>Discard match</button>
        <button onClick={onClose}>Close menu</button>
      </Modal>
    )
  );
}
