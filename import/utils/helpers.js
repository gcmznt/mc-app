function upperCaseFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function findMatch(res, text) {
  for (let re of res) {
    const match = text.match(re)?.groups;

    if (match)
      return [
        {
          start: match.start,
          max: match.max,
          ...(match.tokenName && {
            tokenName: upperCaseFirstLetter(match.tokenName + " counters"),
          }),
          ...(match.name && {
            name: upperCaseFirstLetter(match.name + " counters"),
          }),
        },
      ];
  }
  return undefined;
}

function getIcons(card) {
  const icons = [
    ...Array(card.scheme_acceleration || 0).fill("Acceleration"),
    ...Array(card.scheme_amplify || 0).fill("Amplify"),
    ...Array(card.scheme_crisis || 0).fill("Crisis"),
    ...Array(card.scheme_hazard || 0).fill("Hazard"),
  ];
  return icons.length ? icons : undefined;
}

const sideSchemesHinderREs = [
  /Hinder (?<start>\d+)\[per_hero\]/,
  /Place an additional (?<start>\d+)( )?\[per_hero\] threat here/,
];

function getSchemeStart(card) {
  const start = [];
  if (!card.base_threat_fixed) {
    if (card.base_threat) start.push(`${card.base_threat}p`);
  } else if (card.base_threat_fixed === true) {
    if (card.base_threat) start.push(card.base_threat);
  } else if (typeof card.base_threat_fixed === "number") {
    start.push(card.base_threat_fixed);
  }
  if (card.text) {
    const match = findMatch(sideSchemesHinderREs, card.text);
    if (match) start.push(`${match[0].start}p`);
  }
  return start.length > 1 ? start : start.length === 1 ? start[0] : undefined;
}

module.exports = {
  findMatch,
  getIcons,
  getSchemeStart,
};
