const db = require('../../config');

module.exports = {

	async getAllPosts(req, res){
		try{
			let count = await db.query(`SELECT COUNT(*) FROM post`)
			if(req.query.offset && req.query.limit){
				if(req.query.offset < 0){
					req.query.offset = 0
				}
				let items = await db.query(`SELECT * FROM post LIMIT ${req.query.limit} OFFSET ${req.query.offset}`);
				res.status(200).send({ posts:items.rows, count: count.rows[0].count });
			}else{
				let items = await db.query(`SELECT * FROM post`);
				res.status(200).send({ posts:items.rows, count: count.rows[0].count });
			}
		}catch(err){
			console.log(err)
		}
	},

	async getPost({ params: { id } }, res){
		try{
			const item = await db.query(`SELECT * FROM post WHERE _id = '${id}'`);
			let { rows } = await db.query(`select * from comment WHERE post_id = '${item.rows[0]._id}' `);
			item.rows[0].comments = rows;
			res.status(200).send(item.rows[0]);
		}catch(err){
			console.log(err)
		}
	},

	async getCategoryPosts({ params: { category }, query }, res){
		try {	
			let count = await db.query(`SELECT COUNT(*) FROM post join post_to_category on post._id = post_to_category.post_id 
					and ('${category}' = post_to_category.category_id or '${category}' = post_to_category.child_category_id)`)
			if(query.offset && query.limit){

				if(query.offset < 0){
					query.offset = 0
				}

				let items = await db.query(`
					select post.* from post join post_to_category on post._id = post_to_category.post_id 
					and ('${category}' = post_to_category.category_id or '${category}' = post_to_category.child_category_id)
					LIMIT ${query.limit} OFFSET ${query.offset}
					`);

				res.status(200).send({ posts:items.rows, count:count.rows[0].count });
			}else{
				let items = await db.query(`
					select post.* from post join post_to_category on post._id = post_to_category.post_id 
					and ('${category}' = post_to_category.category_id or '${category}' = post_to_category.child_category_id)
					`);
				res.status(200).send({ posts:items.rows, count:count.rows[0].count });
			}
		}catch(err){
			console.log(err);
		}
	},

	async createPostComments({ body }, res){
		try {
			
			for(let key in body){
				if(body[key].trim() == ''){
					return res.status(403).send({
						message:'Заполните все поля'
					});
				} 
			}

			const item = db.query(`INSERT INTO comment (post_id, name, content) VALUES ('${body.post_id}', '${body.name}', '${body.content}')`);
			res.status(200).send({c:1});
		}catch(err){
			console.log(err);
		}
	},

	async addFavoritePost({ body : { postId, userId } }, res){
		try {
			
			const find = await db.query(`SELECT * FROM post JOIN post_to_user ON '${postId}' = post_to_user.post_id 
				AND '${userId}' = post_to_user.user_id`)

			if(find.rows[0]){
				return 
			}

			await db.query(`INSERT INTO post_to_user (post_id, user_id) VALUES ('${postId}', '${userId}')`) 

			res.status(200).send({
				message:'Запись успешно сохранена!'
			});
		}catch(err){
			res.status(200).send({
				message:'Ошибка!',
				err
			});
		}
	},

	async deleteFavoritePost({ body : { postId, userId } }, res){
		try {
			console.log(postId, userId)
			await db.query(`DELETE FROM post_to_user WHERE post_id = '${postId}' AND user_id = '${userId}'`)
			res.status(200).send({
				message:'Запись успешно удалена!'
			});
		}catch(err){
			res.status(200).send({
				message:'Ошибка!',
				err
			});
		}
	},
	
	async getFavoritePosts({ params:{ id } }, res){
		try {	
			const items = await db.query(`SELECT post.* FROM post JOIN post_to_user ON post._id = post_to_user.post_id 
				AND '${id}' = post_to_user.user_id`)
			res.status(200).send(items.rows);
		}catch(err){
			console.log(err);
		}
	},

	async getPopularPosts(req, res){
		try {	
			const items = await db.query(`SELECT post._id, post.title, COUNT(post_to_user.user_id) as cou 
				FROM post JOIN post_to_user ON post._id = post_to_user.post_id 
				GROUP BY post._id, post.title 
				ORDER BY cou DESC`)	
			res.status(200).send(items.rows);
		}catch(err){
			console.log(err);
		}
	},    
	
	async getTargetPosts({ params:{ category } }, res){
		try {	
			const items = await db.query(`SELECT * FROM post ORDER BY RANDOM() LIMIT 3`)
			res.status(200).send(items.rows);
		}catch(err){
			console.log(err);
		}
	},
}