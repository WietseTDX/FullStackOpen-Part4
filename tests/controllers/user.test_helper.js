const User = require("../../models/user");

const multipleUser = [
  {
    "username": "Fake name",
    "name": "Real name",
    "password": "My password",
  },
  {
    "username": "Fake name 2",
    "name": "Real name 2",
    "password": "My password 2",
  },
];

const getMultipleUser = () => {
  return [...multipleUser];
};

const singleUser = {
  "username": "Henk",
  "name": "Steen",
  "password": "Passcard",
};

const getSingleUser = () => {
  return JSON.parse(JSON.stringify(singleUser));
};

const getAllDbData = async () => {
  const users = await User.find({});
  return users.map(user => user.toJSON());
};

const addUserToDb = async (body) => {
  const user = new User(body);
  return (await user.save()).toJSON();
};

module.exports = {
  getAllDbData, getMultipleUser, getSingleUser, addUserToDb,
};
