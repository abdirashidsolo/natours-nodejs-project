const crypto = require('crypto');

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A User must have a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
  },

  liked: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      unique: [
        true,
        'User can not have single tour multible times as liked tour ',
      ],
    },
  ],
  photo: { type: String, default: 'default.jpg' },

  password: {
    type: String,
    required: [true, 'Please provide your password'],
    minLength: 8,
    select: false,
  },
  passwordChangedAt: Date,
  passwordConfirm: {
    type: String,
    required: [true, 'Please conform your password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password must be same',
    },
  },
  passwordResetToken: String,
  passwordResetExpires: Date,

  signupVerificationToken: String,
  signupVerificationExpires: Date,

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  role: {
    type: String,
    default: 'user',
  },
});

userSchema.pre('save', async function (next) {
  // only this runs if password would modified
  if (!this.isModified('password')) return next();

  if (process.env.NODE_ENV === 'LOADER') {
    this.isNew = true;
    return next();
  }
  //  hash the password with cost of 12  hash means encryt and cost is the measure of cpu intensive operation of this encryption simply how hard this encryption
  this.password = await bcrypt.hash(this.password, 12);

  //delete cofirm password field in the database
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  password
) {
  return await bcrypt.compare(candidatePassword, password);
};

// create /instance method that checks if the password changed after token created
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // console.log(token);
  // console.log(this.passwordResetToken);

  return token;
};

userSchema.methods.createSignupVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  this.signupVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.signupVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  return token;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
