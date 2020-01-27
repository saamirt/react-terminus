export default class Cmd {
	constructor(
		key,
		desc,
		func = params => {
			return;
		}
	) {
		this.key = key;
		this.desc = desc;
		this.func = func;
	}
}
