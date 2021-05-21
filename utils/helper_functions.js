const compareIdToString = (id, string) => {
  const serializedId = JSON.parse(JSON.stringify(id));
  return serializedId === string;
};

module.exports = {
  compareIdToString,
};
