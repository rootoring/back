const db = require('../../config');
const jwt = require('jsonwebtoken');

module.exports = {

	async signUp({ body }, res){
		try{

			const email = body.email;
			const foundUser = await db.query(`SELECT * FROM users WHERE email = '${email}'`);

			if(foundUser.rows.length > 0){
				return res.status(403).send({
					message:'Аккаунт с таким email уже существует'
				});				
			}

			for(let key in body){
				if(body[key].trim() == ''){
					return res.status(403).send({
						message:'Заполните все поля'
					});
				} 
			}

			const newUser = await db.query(`INSERT INTO users (name, email, password) VALUES ('${body.name}', '${body.email}', '${body.password}')`);

			return res.status(200).send({
				message:'Пользователь создан успешно'
			});

		}catch(err){
			return res.status(403).send({
				message:'Что то пошло не так:('
			})
		}
	},

	async signIn({body:{ email , password }}, res){
		try{

			let foundUser = await db.query(`SELECT * FROM users WHERE email = '${email}'`);

			if(foundUser.rows.length <= 0){
				return res.status(403).send({
					message:'Извините но логин или пароль не подходят'
				});				
			}

			foundUser = foundUser.rows[0];

			const isPasswordCorrect = foundUser.password == password;

			if(!isPasswordCorrect){
				return res.status(403).send({
					message:'Извините но логин или пароль не подходят'
				});
			} 

			delete foundUser['password']

			const acsessToken = jwt.sign({
				_id: foundUser._id,
				email: foundUser.email
			},'FindAzsxdcfv200312Hub',{
				expiresIn: '120m',
			});

			const refreshToken = jwt.sign({
				_id: foundUser._id,
				email: foundUser.email,
				name: foundUser.name
			},'FindAzsxdcfv200312Hubrefresh200312');

			let foundToken = await db.query(`SELECT * FROM token WHERE user_id = '${foundUser._id}'`);

			if(foundToken.rows.length > 0){


				foundToken = foundToken.rows[0];

				await db.query(`UPDATE token SET token = '${acsessToken}' WHERE _id = '${foundToken._id}'`);

				return res.status(200).send({
					acsessToken,
					refreshToken,
					...foundUser._doc,
					message:'Вы вошли в сисетему'
				});
			}
			
			const newUser = await db.query(`INSERT INTO token (user_id, token) VALUES ('${foundUser._id}', '${acsessToken}')`);

			return res.status(200).send({
				acsessToken,
				refreshToken,
				...foundUser._doc,
				message:'Вы вошли в сисетему'
			});

		}catch(err){
			return res.status(403).send({
				message:'Извините но логин или пароль не подходят',
				err
			})
		}
	},

	async logout(req, res){
		try{
			let foundToken = await db.query(`SELECT * FROM token WHERE token = '${ req.headers["authorization"].replace("Bearer ", "") }'`);

			if(foundToken.rows.length <= 0){
				return res.status(403).send({
					message: 'Пользователь не авторизован',	
				});
			}

			foundToken = foundToken.rows[0]

			await db.query(`DELETE FROM token WHERE _id = '${foundToken._id}';`)
		
			return res.status(200).send({
				message: 'Вы вышли из системы',
			});	

		}catch(err){
			return res.status(403).send({
				message:'При выходе произошла ошибка',
				err
			})
		}

		// if(!foundToken){
		// 	return res.status(403).send({
		// 		message: 'Пользователь не авторизован',	
		// 	});
		// }

		// await token.findByIdAndDelete(foundToken._id);
		
		// return res.status(200).send({
		// 	message: 'Вы вышли из системы',
		// });		
	},

	async refreshToken({ body: { refreshToken } }, res){

		if(!refreshToken){
			return res.status(403).send({
				message: 'Действие запрещено',
			});	
		}

		const currentToken = await token.findOne({ token: refreshToken });

		if(!currentToken){
			return res.status(403).send({
				message: 'Действие запрещено',
			});	
		}

		jwt.verify(refreshToken, 'FindAzsxdcfv200312Hubrefresh200312', (err, user) => {
			if(err){
				return res.status(403).send({
					message: 'Действие запрещено',
				});	
			}

			const acsessToken = jwt.sign({
				_id: user._id,
				email: user.email
			},'FindAzsxdcfv200312Hub',{
				expiresIn: '30m',
			}); 

			return res.status(200).send({
				acsessToken, 
				refreshToken,
				...user,
			});
		});
	},

	async user(req, res){
		try {	
			const headToken = req.headers["authorization"];

			if(headToken){
				const newToken = headToken.replace("Bearer ", "");

				let foundToken = await db.query(`SELECT * FROM token WHERE token = '${ newToken }'`);
				
				if(foundToken.rows[0]){
					const item = await db.query(`SELECT * FROM users WHERE _id = '${foundToken.rows[0].user_id}'`);

					res.status(200).send({
						user:item.rows[0],
					});
				}else{
					res.status(200).send({
						message:'Пользователь не найден'
					});
				}
			}else{
				res.status(403).send({
					message: 'Действие запрещено',
				});	
			}
		}catch(err){
			res.status(403).send({
				message: 'Действие запрещено',
				err
			});	
		}
	},

	// async signIn({body:{ email , password }}, res){
	// 	try{
	// 		const foundUser = await user.findOne({email});

	// 		if(!foundUser){
	// 			return res.status(403).send({
	// 				message:'Извините но логин или пароль не подходят'
	// 			});
	// 		} 

	// 		const isPasswordCorrect = foundUser.password == password;

	// 		if(!isPasswordCorrect){
	// 			return res.status(403).send({
	// 				message:'Извините но логин или пароль не подходят'
	// 			});
	// 		} 

	// 		delete foundUser._doc['password']

	// 		const acsessToken = jwt.sign({
	// 			_id: foundUser._id,
	// 			email: foundUser.email
	// 		},'FindAzsxdcfv200312Hub',{
	// 			expiresIn: '30m',
	// 		});

	// 		const refreshToken = jwt.sign({
	// 			_id: foundUser._id,
	// 			email: foundUser.email,
	// 			name: foundUser.name
	// 		},'FindAzsxdcfv200312Hubrefresh200312');

	// 		const foundToken = await token.findOne({
	// 			user: foundUser._id
	// 		});

	// 		if(foundToken){
	// 			await token.findByIdAndUpdate(foundToken._id,{
	// 				token:acsessToken
	// 			});
	// 			return res.status(200).send({
	// 				acsessToken,
	// 				refreshToken,
	// 				...foundUser._doc,
	// 				message:'Вы вошли в сисетему'
	// 			});
	// 		}

	// 		const newToken = await new token({token: acsessToken, user: foundUser._id});
	// 		await newToken.save();

	// 		return res.status(200).send({
	// 			acsessToken,
	// 			refreshToken,
	// 			...foundUser._doc,
	// 			message:'Вы вошли в сисетему'
	// 		});

	// 	}catch(err){
	// 		return res.status(403).send({
	// 			message:'Извините но логин или пароль не подходят',
	// 			err
	// 		})
	// 	}
	// },
	// async signUp({ body }, res){
	// 	try{

	// 		const email = body.email;
	// 		const foundUser = await user.findOne({ email });

	// 		if(foundUser){
	// 			return res.status(403).send({
	// 				message:'Аккаунт с таким email уже существует'
	// 			});
	// 		} 

	// 		for(let key in body){
	// 			if(body[key].trim() == ''){
	// 				return res.status(403).send({
	// 					message:'Заполните все поля'
	// 				});
	// 			} 
	// 		}

	// 		const newUser = await new user(body)
	// 		await newUser.save();

	// 		return res.status(200).send({
	// 			message:'Пользователь создан успешно'
	// 		});

	// 	}catch(err){
	// 		return res.status(403).send({
	// 			message:'Что то пошло не так:('
	// 		})
	// 	}
	// },
	// async refreshToken({ body: { refreshToken } }, res){

	// 	if(!refreshToken){
	// 		return res.status(403).send({
	// 			message: 'Действие запрещено',
	// 		});	
	// 	}

	// 	const currentToken = await token.findOne({ token: refreshToken });

	// 	if(!currentToken){
	// 		return res.status(403).send({
	// 			message: 'Действие запрещено',
	// 		});	
	// 	}

	// 	jwt.verify(refreshToken, 'FindAzsxdcfv200312Hubrefresh200312', (err, user) => {
	// 		if(err){
	// 			return res.status(403).send({
	// 				message: 'Действие запрещено',
	// 			});	
	// 		}

	// 		const acsessToken = jwt.sign({
	// 			_id: user._id,
	// 			email: user.email
	// 		},'FindAzsxdcfv200312Hub',{
	// 			expiresIn: '30m',
	// 		}); 

	// 		return res.status(200).send({
	// 			acsessToken, 
	// 			refreshToken,
	// 			...user,
	// 		});
	// 	});
	// },
	
	// async logout(req, res){
	// 	const foundToken = await token.findOne({ token: req.headers["authorization"].replace("Bearer ", "") });

	// 	if(!foundToken){
	// 		return res.status(403).send({
	// 			message: 'Пользователь не авторизован',	
	// 		});
	// 	}

	// 	await token.findByIdAndDelete(foundToken._id);
		
	// 	return res.status(200).send({
	// 		message: 'Вы вышли из системы',
	// 	});		
	// },

	// async user(req, res){
	// 	try {	
	// 		const headToken = req.headers["authorization"];
	// 		if(headToken){
	// 			const newToken = headToken.replace("Bearer ", "");
				
	// 			const foundToken = await token.findOne({ token: newToken });

	// 			const item = await user.findById(foundToken.user);

	// 			res.status(200).send({
	// 				user:item,
	// 			});
	// 		}else{
	// 			res.status(403).send({
	// 				message: 'Действие запрещено',
	// 			});	
	// 		}
	// 	}catch(err){
	// 		res.status(403).send({
	// 			message: 'Действие запрещено',
	// 		});	
	// 	}
	// },
}