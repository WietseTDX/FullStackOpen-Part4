const userRouter = require("express").Router();
const User = require("../models/user");
const argon2 = require("argon2");

userRouter.get("/", async (request, response) => {
  const userResponse = await User.find({}).populate("blogs");
  response.json(userResponse);
});

userRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;
  const passwordHash = await argon2.hash(password);


  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

userRouter.get("/:id", async (request, response, next) => {
  const userId = await User.findById(request.params.id);
  if (userId) {
    response.status(200).json(userId);
  } else {
    const error = new Error("User does not exsist");
    error.name = "Key not in DB";
    error.status = 404;
    next(error);
  }
});

userRouter.delete("/:id", async (request, response, next) => {
  const deletedUser = await User.findByIdAndDelete(request.params.id);
  if (deletedUser) {
    response.status(200).json(deletedUser);
  } else {
    const error = new Error("User does not exsist");
    error.name = "Key not in DB";
    error.status = 404;
    next(error);
  }
});

userRouter.put("/:id", async (request, response, next) => {
  const updatedUser = await User.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });
  if (updatedUser) {
    response.status(200).json(updatedUser);
  } else {
    const error = new Error("User does not exsist");
    error.name = "Key not in DB";
    error.status = 404;
    next(error);
  }
});

module.exports = userRouter;
