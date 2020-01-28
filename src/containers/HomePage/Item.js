export default class Item {
	constructor(key, desc, img = null, location = null, moveableTo = []) {
		this.key = key;
		this.desc = desc;
		this.img = img;
		this.location = location;
		this.moveableTo = moveableTo;
		if (location) {
			this.moveableTo = [location, ...moveableTo];
		}
	}

	less() {
		return this.desc;
	}

	toString() {
		return this.key;
	}
}
