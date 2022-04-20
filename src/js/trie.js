class Node {
  constructor(string) {
    this.letter = string[0] ?? "";
    this.children = {};
    this.completeWord = false;
  }

  _createNode(letter) {
    const node = new Node(letter);
    this.children[letter] = node;
    return node;
  }

  add(string) {
    if (!string.length) return;

    const firstLetter = string[0].toLowerCase();
    const remains = string.substring(1);
    const nextNode =
      this.children[firstLetter] ?? this._createNode(firstLetter);
    if (remains.length) nextNode.add(remains);
    else nextNode.completeWord = true;
  }

  _findLastNode(string) {
    if (!string.length) return null;
    const nextNode = this.children[string[0]];
    return nextNode
      ? string.length === 1
        ? nextNode
        : nextNode._findLastNode(string.substring(1))
      : null;

    // if (string.length === 1) {
    //   return nextNode ? nextNode : null;
    // } else {
    //   return nextNode
    //     ? nextNode._findLastNode(string.substring(1))
    //     : null;
    // }
  }

  _possibilities(string) {
    const possibilities = [];

    if (this.completeWord) possibilities.push(string);

    if (!this.children) {
      return possibilities;
    } else {
      Object.values(this.children).forEach((node) => {
        possibilities.push(...node._possibilities(`${string}${node.letter}`));
      });
    }
    return possibilities;
  }

  complete(string) {
    // find last node of string
    const node = this._findLastNode(string);
    if (!node) return null;
    // call function that return all possibilities on said node
    const suggestions = node._possibilities(string);

    return suggestions;
  }
}

export class Trie{
  constructor(words){
    this.root = new Node("");
    words.forEach((word) => {
      this.root.add(word);
    });
  }

  getPossibilities(string){
    return this.root.complete(string.toLowerCase());
  }
}
