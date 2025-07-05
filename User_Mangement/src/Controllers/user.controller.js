import { User } from "../Models/user.mode";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asynchandler";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken(); // ✅ Call the method
    const refreshToken = user.generateRefreshToken(); // ✅ Call the method

    user.refreshToken = refreshToken; // ✅ Fix typo and assign correctly
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};


const registerUser = asyncHandler(async (req, res) => {
    const { username, fullName, Phone, email, password } = req.body;
    if ([username, email, password, fullName, Phone].some((field) => !field?.trim())) {
        throw new ApiError(400, 'All fields are required');
    }

    const existedUser = await User.findOne({ $or: [{ name }, { email }] })
    if (!existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const user = await User.create({
        fullName,
        username,
        Phone,
        email,
        password,

    })

    const createUser = await User.findById(user._id).select("-password");
    if (!createUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(new ApiResponse(201, createUser, "User Registered Successfully"))


})

const loginUser = asyncHandler(async (req, res, next) => {
  console.log("Request Body:", req.body);

  const { email, username, password } = req.body;

  if (!username && !email) {
    return next(new ApiError(400, "Username or email is required"));
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    return next(new ApiError(404, "User does not exist"));
  }

  if (!password || !user.password) {
    return next(new ApiError(400, "Password is missing or invalid"));
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return next(new ApiError(401, "Invalid user credentials"));
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

  const options = { httpOnly: true, secure: true, sameSite: "Strict" };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: user.toObject({ getters: true }),
        accessToken,
        refreshToken,
      }, "User logged in successfully")
    );
});

const logout = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            return res.status(2000
                .clearCookie("token")
                .json(new ApiResponse(200, {}, "User logged out Successfully"))
            )

            await User.findByIdAndDelete(
                req.user._id,
                {
                    $unset: {
                        token: 1,
                    },

                },
                {

                    new: true,

                }

            );

            return res.status(200)
                .clearCookie("token", {
                    httpOnly: true,
                    sameSite: true,
                    secure: true,

                })
                .json(new ApiResponse(200, {}, "User loggedOut successfully"));



        }
    } catch (error) {
        next(error);

    }
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.ACCESS_TOKEN_SECRET,
      process.env.REFRESH_TOKEN_SECRET,
    )
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true
    }

    const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed"
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token")
  }
})


export {
    registerUser,
    loginUser,
    logout,
    refreshAccessToken,
}