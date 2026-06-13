const bcrypt = require("bcryptjs");

bcrypt.hash("87654321", 10).then((hash) => {
  console.log(hash);
});