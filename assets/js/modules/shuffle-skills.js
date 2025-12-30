import { shuffle } from './shuffle';

const hasReplaceChildren =
  typeof Element.prototype.replaceChildren === 'function';

function getSkills() {
  return Array.from(document.querySelectorAll('.skill-tag'));
}

function makeLast(allSkills, lastSkillClass) {
  const skills = [...allSkills];
  const lastSkillIndex = skills.findIndex((skill) =>
    Array.from(skill.classList).includes(lastSkillClass),
  );
  if (lastSkillIndex === -1) return skills;

  // Make a specific skill the last one
  const [lastSkill] = skills.splice(lastSkillIndex, 1);
  skills.push(lastSkill);
  return skills;
}

export function initShuffleSkills() {
  if (!hasReplaceChildren) return;
  const skills = getSkills();
  if (skills.length === 0) return;

  const shuffledSkills = makeLast(shuffle(skills), 'ellipsis');
  skills[0].parentNode.replaceChildren(...shuffledSkills);
}
