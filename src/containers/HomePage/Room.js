export default class Room {
	constructor(key, desc, img = null, map_loc = null, isEnterable = true) {
		this.key = key;
		this.desc = desc;
		this.img = img;
		this.map_loc = map_loc;
		this.parent = null;
		this.children = {};
		this.items = {};
		this.isEnterable = isEnterable;
	}

	addParent = parent => {
		this.parent = parent;
	};

	addChild = newChild => {
		this.children[newChild.key] = newChild;
		newChild.parent = this;
	};

	removeChild = key => {
		if (this.children[key]) {
			this.children[key].parent = null;
			delete this.children[key];
		}
	};

	addItem = newItem => {
		this.items[newItem.key] = newItem;
		newItem.location = this;
		if (!newItem.moveableTo.includes(this)) {
			newItem.moveableTo.push(this);
		}
	};

	removeItem = key => {
		delete this.items[key];
	};

	toString = () => {
		return this.key;
	};

	ls() {
		let s = ["Locations:"];
		s.push(...Object.keys(this.children).map(i => `\t${i}`));

		s.push("Items");
		s.push(...Object.keys(this.items).map(i => `\t${i}`));

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
