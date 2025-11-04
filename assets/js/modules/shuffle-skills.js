import { shuffle } from "./shuffle";

const hasReplaceChildren = typeof Element.prototype.replaceChildren === 'function';

function getSkills() {
  return Array.from(document.querySelectorAll('.skill-tag'));
}

export function initShuffleSkills() {
  if (!hasReplaceChildren) return;
  const skills = getSkills();
  if (skills.length === 0) return;

  skills[0].parentNode.replaceChildren(...shuffle(skills));
}
