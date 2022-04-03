const mongoose = require('mongoose');
const connectDB = async () => {
	try {
		const dbName = 'wabot';
		const dbPathUrl = `mongodb://wabot:adminwabot@wabot-gmail-shard-00-00.ygpny.mongodb.net:27017,wabot-gmail-shard-00-01.ygpny.mongodb.net:27017,wabot-gmail-shard-00-02.ygpny.mongodb.net:27017/${dbName}?ssl=true&replicaSet=atlas-oiafxd-shard-0&authSource=admin&retryWrites=true&w=majority`;
		await mongoose.connect(`${dbPathUrl}`);
		console.log('DB Connected');
	} catch (error) {
		console.log(error);
	}
};

module.exports = connectDB;
