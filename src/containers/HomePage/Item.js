export default class Item {
	constructor(
		key,
		desc,
		img = null,
		location = null,
		moveableTo = [],
		isRemovable = false
	) {
		this.key = key;
		this.desc = desc;
		this.img = img;
		this.location = location;
		this.moveableTo = moveableTo;
		if (location) {
			this.moveableTo = [location, ...moveableTo];
		}
		this.isRemovable = isRemovable;
	}

	mv = destRoom => {
		this.location.removeItem(this.key);
		this.location = destRoom;
		destRoom.addItem(this);
	};

	less() {
		return this.desc;
	}

	toString() {
		return this.key;
	}
}
