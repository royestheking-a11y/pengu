import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import Expert from '../models/expertModel.js';
import { OAuth2Client } from 'google-auth-library';
import { v2 as cloudinary } from 'cloudinary';

const client = new OAuth2Client("506229543851-c8i37j7p5ic786lff3b05ids8rffql9g.apps.googleusercontent.com");

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', email, password); // DEBUG

    const user = await User.findOne({ email });
    console.log('User found:', user ? user.email : 'No user'); // DEBUG

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            avatar: user.avatar,
            onboardingCompleted: user.onboardingCompleted
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'student'
    });

    if (user) {
        // If user is an expert, create their profile immediately
        if (user.role === 'expert') {
            try {
                console.log('Creating expert profile for user:', user._id);
                const expert = await Expert.create({
                    userId: user._id,
                    specialty: 'General Specialist', // Default
                    status: 'Pending',
                    onboardingCompleted: false
                });
                console.log('Expert profile created successfully:', expert._id);
            } catch (error) {
                console.error('Error creating expert profile:', error);

                // Rollback: Delete user so they can try again
                await User.findByIdAndDelete(user._id);
                res.status(500);
                throw new Error('Failed to create expert profile. Please try again.');
            }
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            avatar: user.avatar,
            onboardingCompleted: user.onboardingCompleted
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }
        user.bio = req.body.bio || user.bio;
        user.phone = req.body.phone || user.phone;
        // Avatar handled by separate upload, but can be set here if URL provided
        if (req.body.avatar) {
            user.avatar = req.body.avatar;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser._id),
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
            phone: updatedUser.phone,
            onboardingCompleted: updatedUser.onboardingCompleted
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.email === 'admin@pengu.com') {
            res.status(400);
            throw new Error('Master admin account cannot be deleted');
        }
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user status
// @route   PUT /api/auth/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.status = req.body.status || user.status;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            status: updatedUser.status
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Auth with Google
// @route   POST /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
    const { idToken, accessToken, role } = req.body;
    let payload;

    if (idToken) {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: "506229543851-c8i37j7p5ic786lff3b05ids8rffql9g.apps.googleusercontent.com",
        });
        payload = ticket.getPayload();
    } else if (accessToken) {
        // First try to get token info
        const tokenInfo = await client.getTokenInfo(accessToken);
        payload = {
            email: tokenInfo.email,
            sub: tokenInfo.sub,
        };

        // Always fetch full user info to get name and picture
        try {
            const userInfo = await client.request({
                url: 'https://www.googleapis.com/oauth2/v3/userinfo',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            payload.name = userInfo.data.name;
            payload.picture = userInfo.data.picture;
        } catch (err) {
            console.error('Failed to fetch Google userinfo:', err);
        }
    } else {
        res.status(400);
        throw new Error('No token provided');
    }

    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (user) {
        // Role Enforcement: If user exists and a different role is requested during signup, block it.
        if (role && user.role !== role) {
            res.status(400);
            throw new Error(`This email is already registered as a ${user.role}. Please log in to your existing account.`);
        }
    } else {
        // Create new user if not exists
        const userRole = role || 'student';

        // Sync Google profile picture to Cloudinary
        let avatarUrl = picture;
        if (picture) {
            try {
                const uploadRes = await cloudinary.uploader.upload(picture, {
                    folder: 'pengu_avatars',
                    use_filename: true,
                    unique_filename: true
                });
                avatarUrl = uploadRes.secure_url;
            } catch (err) {
                console.error('Cloudinary upload failed for Google avatar:', err);
                // Fallback to Google's original URL
            }
        }

        user = await User.create({
            name: name || email.split('@')[0],
            email,
            password: Math.random().toString(36).slice(-16), // Secure-ish dummy password
            avatar: avatarUrl,
            role: userRole
        });

        // If user is an expert, create their profile immediately for the onboarding flow
        if (userRole === 'expert') {
            try {
                await Expert.create({
                    userId: user._id,
                    email: user.email,
                    name: user.name,
                    specialty: 'General Specialist',
                    status: 'Pending',
                    onboardingCompleted: false
                });
            } catch (error) {
                console.error('Error creating expert profile during Google Auth:', error);
                // We don't rollback here as the user is still a valid authenticated user, 
                // but they'll need manual profile creation if this failed.
            }
        }
    }

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        avatar: user.avatar,
        onboardingCompleted: user.onboardingCompleted
    });
});

export { authUser, registerUser, updateUserProfile, getUsers, deleteUser, updateUserStatus, googleAuth };
