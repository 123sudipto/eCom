const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
// const authController = require("../controllers/authController");
const { protect, restrictTo } = require("../middleware/auth");

router
  .route("/")
  .post(protect, restrictTo("admin"), productController.createProduct)
  .get(protect, restrictTo("admin"), productController.getAllProducts);

router
  .route("/:id")
  .get(protect, restrictTo("admin"), productController.getProductById)
  .patch(protect, restrictTo("admin"), productController.updateProduct)
  .delete(protect, restrictTo("admin"), productController.deleteProduct);

module.exports = router;
