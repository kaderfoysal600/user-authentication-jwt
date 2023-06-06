const jwt = require("jsonwebtoken");
const secretKey = "manarat600";

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  console.log("token is", token);

  if (!token) {
    res.status(403).send("A token is required for authentication");
  } else {
    // try {
    //   const decodeToken = jwt.verify(token, secretKey);
    //   req.decodeToken = decodeToken;
    // } catch {
    //   res.json({ status: "error", data: "Invalid token" });
    // }

    jwt.verify(token, secretKey, (err, decodeToken) => {
      if (!err) {
        req.decodeToken = decodeToken;
      } else if (err) {
        res.status(403).send(err);
      }
    });
  }
  return next();
};

module.exports = verifyToken;
