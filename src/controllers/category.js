const db = require('../../config');

module.exports = {

	async getAllCategory(req, res){
		try{
			let items = await db.query('SELECT * FROM category');
			for(let item of items.rows){
				let { rows } = await db.query(`select * from child_category WHERE category_id = '${item._id}' `);
				item.childCategories = rows; 
			}
			res.status(200).send(items.rows);
		}catch(err){
			console.log(err)
		}
	},

	async getCategory({ params:{ id } }, res){
		try{
			let item = await db.query(`SELECT * FROM category WHERE _id = '${id}'`);
			if(item.rows.length <= 0){
				item = await db.query(`SELECT * FROM child_category WHERE _id = '${id}' `);
			}
			res.status(200).send(item.rows[0]);
		}catch(err){
			console.log(err)
		}
	},

}