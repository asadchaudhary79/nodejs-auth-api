const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, 'First name must be at least 3 characters long'],
        },
        lastname: {
            type: String,
            minlength: [3, 'Last name must be at least 3 characters long'],
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: [5, 'Email must be at least 5 characters long'],
    },
    password: {
        type: String,
        required: true,
        select: false,
    },

    isEmailVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        sparse: true  // This allows the field to be undefined
    },
    verificationCodeExpires: {
        type: Date,
        sparse: true  // This allows the field to be undefined
    }
})

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token;
}

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}

userSchema.methods.generateVerificationCode = function () {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    this.verificationCode = code;
    this.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    return code;
};


const userModel = mongoose.model('user', userSchema);


module.exports = userModel;