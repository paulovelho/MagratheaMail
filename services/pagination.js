"use strict";

class Paginate {

	constructor(limit) {
		if(!limit) limit = 20;
		this.limit = limit;
	}
	
	getSkip(page) {
		return page * this.limit;
	}

	paginate(page, object, query) {
		return new Promise((resolve, reject) => {
			object.find(query)
				.limit(this.limit + 1)
				.skip(this.getSkip(page))
				.then((data) => {
					let last_page = (data.length <= this.limit);
					if(!last_page) data.pop();
					resolve({
						page: page,
						has_more: !last_page,
						data: data
					});
				})
				.catch(err => reject(err));
		});
	}

}

module.exports = Paginate;
