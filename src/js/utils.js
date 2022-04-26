/**
 *
 * @param {array} arrays - array of arrays.
 * @returns {array} items shared between arrays
 */
export function intersection(arrays) {
  let sharedItems = arrays[0];
  for (let i = 1; i < arrays.length; i++) {
    sharedItems = sharedItems.filter(Set.prototype.has, new Set(arrays[i]));
  }
  return sharedItems;
}
