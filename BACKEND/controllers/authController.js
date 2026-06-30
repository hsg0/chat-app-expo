// BACKEND/controllers/authController.js

import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import multerLoader from "multer";
dotenv.config();

import User from "../models/user.js";

function createToken(user) {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      handle: user.handle,
    },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn,
    }
  );
}

function buildSafeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    handle: user.handle,
    avatar: user.avatar,
    bio: user.bio,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function createBaseHandle(name, email) {
  const emailName = email.split("@")[0];

  const rawHandle = name || emailName;

  return rawHandle
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
}

async function createUniqueHandle(name, email) {
  const baseHandle = createBaseHandle(name, email) || "user";

  let handle = baseHandle;
  let count = 1;

  while (await User.findOne({ handle })) {
    handle = `${baseHandle}_${count}`;
    count += 1;
  }

  return handle;
}


//------------------------------------------------------------------------
// register user


export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!cleanPassword) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    if (cleanPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await argon2.hash(cleanPassword);

    const handle = await createUniqueHandle(cleanName, cleanEmail);

    const user = await User.create({
      _id: crypto.randomUUID(),
      name: cleanName,
      email: cleanEmail,
      handle,
      passwordHash,
      avatar: "",
      bio: "",
      isOnline: true,
      lastSeen: new Date(),
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating your account.",
    });
  }
}


//-----------------------------------------------------------------------
// login user


export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!cleanPassword) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordIsCorrect = await argon2.verify(
      user.passwordHash,
      cleanPassword
    );

    if (!passwordIsCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in.",
    });
  }
}


//-----------------------------------------------------------------------
// get current user


export async function getCurrentUser(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Current user loaded.",
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while loading the current user.",
    });
  }
}

//----------------------------------------------------------------------
// logout user

export async function logoutUser(req, res) {
  try {
    const userId = req.user?.id;

    if (userId) {
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging out.",
    });
  }
}
//-----------------------------------------------------------------------
// get all users

export async function getUsers(req, res) {
  try {
    const users = await User.find({}, "-passwordHash").sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: "Users loaded successfully.",
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while loading users.",
    });
  }
}

//-----------------------------------------------------------------------
// search users by name, email or handle

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function searchUsers(req, res) {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query parameter is required.",
      });
    }

    const cleanQuery = query.trim();

    if (!cleanQuery) {
      return res.status(400).json({
        success: false,
        message: "Search cannot be empty.",
      });
    }

    const safeRegex = new RegExp(escapeRegex(cleanQuery), "i");

    const users = await User.find(
      {
        $or: [
          { name: safeRegex },
          { email: safeRegex },
          { handle: safeRegex },
        ],
      },
      "-passwordHash"
    ).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: "Search results loaded successfully.",
      users,
    });
  } catch (error) {
    console.error("Search users error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while searching for users.",
    });
  }
}

//-----------------------------------------------------------------------
// update user profile

export async function updateUserProfile(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });
    }

    const { name, avatar, bio } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (name) user.name = String(name).trim();
    if (avatar) user.avatar = String(avatar).trim();
    if (bio) user.bio = String(bio).trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the profile.",
    });
  }
} 

//-----------------------------------------------------------------------
// update profile name bio handle avatar

export async function updateProfile(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });
    }

    const { name, handle, bio } = req.body;
    const file = req.file;

    // ------------------------------------------------------
    // 1. Check handle safely
    // ------------------------------------------------------

    if (handle) {
      try {
        const cleanHandle = String(handle).trim().toLowerCase();

        const existingUserWithHandle = await User.findOne({
          handle: cleanHandle,
          _id: { $ne: userId },
        });

        if (existingUserWithHandle) {
          return res.status(400).json({
            success: false,
            message: "Handle is already taken.",
          });
        }
      } catch (handleError) {
        console.error("Handle check error:", handleError);

        return res.status(500).json({
          success: false,
          message: "Something went wrong while checking the handle.",
        });
      }
    }

    // ------------------------------------------------------
    // 2. Find user
    // ------------------------------------------------------

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ------------------------------------------------------
    // 3. Upload avatar safely
    // ------------------------------------------------------

    let avatarUrl = "";

    if (file) {
      try {
        const uploadedImage = await imageKitClient.upload({
          file: file.buffer,
          fileName: `avatar-${userId}-${Date.now()}.jpg`,
          folder: "/chatapp/avatars",
        });

        avatarUrl = uploadedImage.url;
      } catch (uploadError) {
        console.error("Avatar upload error:", uploadError);

        return res.status(500).json({
          success: false,
          message: "Something went wrong while uploading the avatar.",
        });
      }
    }

    // ------------------------------------------------------
    // 4. Update user fields
    // ------------------------------------------------------

    if (name) {
      user.name = String(name).trim();
    }

    if (handle) {
      user.handle = String(handle).trim().toLowerCase();
    }

    if (bio) {
      user.bio = String(bio).trim();
    }

    if (avatarUrl) {
      user.avatar = avatarUrl;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the profile.",
    });
  }
}

