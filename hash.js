const bcrypt = require("bcrypt");

bcrypt.hash("200813", 10).then((hash) => {
    console.log("HASH:", hash);
});