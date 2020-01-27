export default class Item {
	constructor(key, desc, img = null, location = null, isMoveable = false) {
		this.key = key;
		this.desc = desc;
		this.img = img;
		this.location = location;
		this.isMoveable = isMoveable;
	}

	less() {
		return this.desc;
	}

	toString() {
		return this.key;
	}
}
