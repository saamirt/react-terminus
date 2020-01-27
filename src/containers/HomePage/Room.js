export default class Room {
	constructor(
		key,
		desc,
		img = null,
		map_loc = null,
		parent = null,
		children = [],
		items = [],
		isPermitted = true
	) {
		this.key = key;
		this.desc = desc;
		this.img = img;
		this.map_loc = map_loc;
		this.parent = parent;
		this.children = children;
		this.items = items;
		this.isPermitted = isPermitted;
	}

	addParent(parent) {
		this.parent = parent;
	}

	addChild(newChild) {
		this.children.push(newChild);
		newChild.parent = this;
	}

	addItem(newItem) {
		this.items.push(newItem);
		newItem.location = this;
	}

	toString() {
		return this.key;
	}

	ls() {
		let s = ["Locations:"];
		s.push(...this.children.map(i => `\t${i}`));

		s.push("Items");
		s.push(...this.items.map(i => `\t${i}`));

		return s;
	}

	pwd() {
		let path = "";
		let current = this;
		while (current) {
			path = "/" + current.key + path;
			current = current.parent;
		}
		return `Your location is ${path}\n${this.desc}`;
	}
}
