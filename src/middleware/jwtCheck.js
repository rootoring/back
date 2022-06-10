const { verify } = require('jsonwebtoken');
 
const checkJwtSign = (req, res, next ) => {
	const { headers: { authorization } } = req;

	if(!authorization) return res.sendStatus(403);

	if(authorization.split(' ')[1] != 'undefined'){
		const token = authorization.split(' ')[1];

		verify(token, 'FindAzsxdcfv200312Hub', (err, decoded) => {
			if(err){
			  return  res.sendStatus(403);
			}
			next();
		});
		return	
	}
 	return res.sendStatus(403);

}


module.exports = { checkJwtSign }