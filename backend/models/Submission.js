const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    code: { type: String, required: true },
    language: { type: String, enum: ['javascript', 'python', 'cpp', 'java'], required: true },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded', 'Compilation Error'],
      default: 'Pending',
    },
    output: { type: String, default: '' },
    executionTimeMs: { type: Number, default: 0 },
    passedTestCases: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    aiHint: { type: String, default: '' },
  },
  { timestamps: true }
);

submissionSchema.index({ user: 1, problem: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
