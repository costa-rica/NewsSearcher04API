var express = require("express");
var router = express.Router();
const os = require("os");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/ca-marche", function (req, res, next) {
  const machineName = os.hostname();
  res.json({ result: true, status: "oui 🚀", machineName });
});

module.exports = router;
