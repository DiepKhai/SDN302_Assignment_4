const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			default: '',
			trim: true,
		},
		questions: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Question',
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Quiz', QuizSchema);

