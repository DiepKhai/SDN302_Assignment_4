const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
	{
		text: {
			type: String,
			required: true,
			trim: true,
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		options: {
			type: [String],
			required: true,
			validate: {
				validator: (arr) => Array.isArray(arr) && arr.length >= 2,
				message: 'options must contain at least 2 items',
			},
		},
		keywords: {
			type: [String],
			default: [],
		},
		correctAnswerIndex: {
			type: Number,
			required: true,
			min: 0,
		},
	},
	{ timestamps: true }
);

QuestionSchema.pre('validate', function () {
	if (Array.isArray(this.options) && typeof this.correctAnswerIndex === 'number') {
		if (this.correctAnswerIndex >= this.options.length) {
			this.invalidate('correctAnswerIndex', 'correctAnswerIndex must be within options range');
		}
	}
});

module.exports = mongoose.model('Question', QuestionSchema);

