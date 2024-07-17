const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

blogRouter.get("/", async (request, response) => {
  const blogResponse = await Blog.find({}).populate("user", { "username": 1, "name": 1 });
  response.json(blogResponse);
});

blogRouter.post("/", async (request, response) => {
  const { title, author, url, likes } = request.body;
  if (request.user === null) {
    return response.status(401).json({ error: "token invalid" });
  }
  const user = await User.findById(request.user.id);

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
  const blog = await Blog.findById(request.params.id);
  if (blog) {
    response.status(200).json(blog);
  } else {
    const error = new Error("Blog does not exsist");
    error.name = "Key not in DB";
    error.status = 404;
    next(error);
  }
});

blogRouter.delete("/:id", async (request, response, next) => {
  const user = await User.findById((await Blog.findById(request.params.id)).user);
  if (user.id !== request.user.id) {
    return response.status(401).json({ error: "Invalid user" });
  }

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
