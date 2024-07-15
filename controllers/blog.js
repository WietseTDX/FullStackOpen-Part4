const jwt = require("jsonwebtoken");
const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const authHelper = require("../utils/auth");

blogRouter.get("/", async (request, response) => {
  const blogResponse = await Blog.find({}).populate("user", { "username": 1, "name": 1 });
  response.json(blogResponse);
});

blogRouter.post("/", async (request, response) => {
  const { title, author, url, likes } = request.body;
  const decodedToken = jwt.verify(authHelper.getTokenFrom(request), process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }
  const user = await User.findById(decodedToken.id);

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    "user": user.id,
  });

  const savedBlog = await blog.save();

  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogRouter.get("/:id", async (request, response, next) => {
  const blogId = await Blog.findById(request.params.id);
  if (blogId) {
    response.status(200).json(blogId);
  } else {
    const error = new Error("Blog does not exsist");
    error.name = "Key not in DB";
    error.status = 404;
    next(error);
  }
});

blogRouter.delete("/:id", async (request, response, next) => {
  const deletedBlog = await Blog.findByIdAndDelete(request.params.id);
  if (deletedBlog) {
    response.status(200).json(deletedBlog);
  } else {
    const error = new Error("Blog does not exsist");
    error.name = "Key not in DB";
    error.status = 404;
    next(error);
  }
});

blogRouter.put("/:id", async (request, response, next) => {
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });
  if (updatedBlog) {
    response.status(200).json(updatedBlog);
  } else {
    const error = new Error("Blog does not exsist");
    error.name = "Key not in DB";
    error.status = 404;
    next(error);
  }
});

module.exports = blogRouter;
