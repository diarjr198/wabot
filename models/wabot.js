const mongoose = require('mongoose');
const { Schema } = mongoose;

const wabotSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true,
			max: 20
		},
		status: {
			type: String,
			enum: [ 'active', 'sold', 'disabled' ],
			default: 'active'
		}
	},
	{
		timestamps: true,
		versionKey: false
	}
);

const Wabot = mongoose.model('wabot', wabotSchema);

module.exports = Wabot;
