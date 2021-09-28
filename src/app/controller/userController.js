
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const handleErrors = require('../../errors/errors');
const { watch } = require('../models/User');

const EMAIL_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

class UserController {

	// [POST] api/v1/user/register
	async register(req, res, next) {
		try {
			const { email, username, password, displayName, gender } = req.body;

			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			const newUser = new User({
				email,
				username,
				password: hashedPassword,
				displayName,
				gender
			});

			const user = await newUser.save();

			const accessToken = await jwt.sign(
				{ userId: user._id },
				process.env.SECRET_JSON_WEB
			)
			res.json({
				success: true,
				user,
				accessToken
			})

		} catch (error) {
			console.log(error);
			res.status(500).json({
				success: false,
				message: 'Internal server'
			})
		}
	}

	//[GET] api/v1/user/login
	async login(req, res, next) {
		try {
			const { username, password } = req.body;
			const isEmail = EMAIL_PATTERN.test(String(username).toLowerCase());
			// console.log(username, password);
			let user = null;
			if (isEmail) {
				user = await User.findOne({ email: username });
				if (!user) return handleErrors(req, res, 404, "Username or password is incorrect");
			}
			else {
				user = await User.findOne({ username: username });
				if (!user) return handleErrors(req, res, 404, "Username or password is incorrect!");
			}

			const checkPassword = await bcrypt.compare(password, user.password);
			if (!checkPassword) return handleErrors(req, res, 404, "Username or password is incorrect!");

			const accessToken = await jwt.sign(
				{ userId: user._id },
				process.env.SECRET_JSON_WEB
			)

			res.json({ success: true, user, accessToken });

		} catch (error) {
			handleErrors(req, res, 404, error.message);
		}
	}
	// [PATCH] api/v1/user/update-avatar
	async updateAvatar(req, res, next) {
		try {
			const { avatar } = req.body;
			let user = await User.findByIdAndUpdate(req.userId, { avatar });
			if (!user) return handleErrors(req, res, 404, "Not Found User");

			user = await User.findById(req.userId);
			const accessToken = await jwt.sign({ userId: user._id }, process.env.SECRET_JSON_WEB)
			res.json({ success: true, user, accessToken })

		} catch (error) {
			handleErrors(req, res, 404, error.message)
		}
	}
	// [GET] api/v1/user/:id
	async getUser(req, res, next) {
		try {
			const { id } = req.params;
			const user = await User.findById(id);
			if (!user) return handleErrors(req, res, 404, "Not Found User");

			res.json({
				success: true, user: {
					avatar: user.avatar,
					displayName: user.displayName
				}
			})
		} catch (error) {
			handleErrors(req, res, 404, error.message)
		}
	}

	// [PATCH] api/v1/user/update    Update password and username
	async updateUser(req, res, next) {
		try {
			const { username, currentPassword, displayName, newPassword, email } = req.body;

			let user = null;
			let id = null;
			if (username && displayName && email) {
				user = await User.findByIdAndUpdate(req.userId, { username, displayName, email });
				// user = await user.save();
				id = user._id;
				user = await User.findOne({ _id: id });
				res.json({
					success: true,
					user: {
						username: user.username,
						displayName: user.displayName,
						avatar: user.avatar,
						email: user.email,
						gender: user.gender
					}
				})
			}

			if (currentPassword && newPassword) {
				user = await User.findById(req.userId);
				// console.log(currentPassword)
				const isCheck = await bcrypt.compare(currentPassword, user.password);
				if (isCheck) {

					const salt = await bcrypt.genSalt(10);
					const hash = await bcrypt.hash(newPassword, salt);
					user.password = hash;
					await user.save();
					id = user._id;

					user = await User.findOne({ _id: id });
					res.json({
						success: true, message: "Đổi mât khẩu thành công!"
					})
				}
				else {
					res.json({
						success: false, message: "Mật khẩu hiên tại không chính xác"
					})
				}
			}
		} catch (error) {
			handleErrors(req, res, 501, error.message)
		}
	}
	// [PUT] /api/v1/user/action   Update user action 
	async updateAction(req, res, next) {
		try {
			const { watch } = req.body;

			let user = await User.findById(req.userId);
			user.liked = [...watch.liked];
			user.following = [...watch.following];
			user.viewed = [...watch.viewed];
			await user.save();

			user = await User.findById(req.userId);

			res.json({
				success: true,
				watch: { like: user.liked, following: user.following, viewed: user.viewed }
			})

		} catch (error) {
			handleErrors(req, res, 501, error.message)
		}
	}
	// [GET] /api/v1/user/action   Update user action 
	async getAction(req, res, next) {
		try {
			const user = await User.findById(req.userId);

			res.json({
				success: true,
				watch: { like: user.liked, following: user.following, viewed: user.viewed }
			})

		} catch (error) {
			handleErrors(req, res, 501, error.message)
		}
	}
};

module.exports = new UserController;