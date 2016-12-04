function TreeNode() {
    this.slug = '';
    this.level = 1;
    this.title = 'The Placeholder Root';
    this.children = [];
    this.contents = [];
}

TreeNode.prototype.toString = function() {
    return `${this.slug}(${this.title}), level: ${this.level}`;
};

// skip the placeholder root
TreeNode.prototype.preOrderTraversal = function(cb) {
    this.children.forEach((node, i) => node.doPreOrderTraversal(cb, [], i));
};

TreeNode.prototype.doPreOrderTraversal = function(cb, parents, i) {
    cb(this, parents, i);

    parents.push(this);
    this.children.forEach(function(node, idx) {
        node.doPreOrderTraversal(cb, parents, idx);
    });
    parents.pop();
};

module.exports = TreeNode;
