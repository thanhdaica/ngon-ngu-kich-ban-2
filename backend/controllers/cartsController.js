import Cart from '../model/Cart.js';
import Book from '../model/Book.js';

class CartController {

  // GET /api/cart
  async getMyCart(req, res) {
    try {
      const userId = req.user._id;
      const cart = await Cart.findOne({ user: userId })
                             .populate('items.product', 'name price coverUrl');

      if (!cart) {
        return res.json({ user: userId, items: [] });
      }
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Lỗi lấy giỏ hàng", error: error.message });
    }
  }

  // POST /api/cart: THÊM VÀO GIỎ (CỘNG DỒN)
  async addToCart(req, res) {
    try {
      const userId = req.user._id;
      const { productId, quantity } = req.body;

      if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
      }

      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
      }

      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        // QUAN TRỌNG: Cộng dồn số lượng cũ + mới
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity: quantity });
      }

      await cart.save();
      
      const updatedCart = await Cart.findById(cart._id)
                                    .populate('items.product', 'name price coverUrl');
      
      res.status(200).json(updatedCart);

    } catch (error) {
      res.status(500).json({ message: "Lỗi thêm vào giỏ hàng", error: error.message });
    }
  }

  // PUT /api/cart: CẬP NHẬT SỐ LƯỢNG (SET GIÁ TRỊ MỚI)
  async updateCartItem(req, res) {
    try {
      const userId = req.user._id;
      const { productId, quantity } = req.body;

      if (!productId || quantity < 1) {
          return res.status(400).json({ message: "Số lượng phải lớn hơn 0" });
      }

      const cart = await Cart.findOne({ user: userId });
      if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
      
      if (itemIndex > -1) {
          // Gán đè số lượng mới
          cart.items[itemIndex].quantity = quantity;
          await cart.save();
          
          const updatedCart = await Cart.findById(cart._id)
                                        .populate('items.product', 'name price coverUrl');
          res.status(200).json(updatedCart);
      } else {
          res.status(404).json({ message: "Sản phẩm không có trong giỏ" });
      }
    } catch (error) {
      res.status(500).json({ message: "Lỗi cập nhật giỏ hàng", error: error.message });
    }
  }

  // DELETE /api/cart/:productId
  async removeFromCart(req, res) {
    try {
      const userId = req.user._id;
      const { productId } = req.params; 

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
      }

      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );

      await cart.save();
      
      const updatedCart = await Cart.findById(cart._id)
                                    .populate('items.product', 'name price coverUrl');

      res.status(200).json(updatedCart);
    } catch (error) {
      res.status(500).json({ message: "Lỗi xóa khỏi giỏ hàng", error: error.message });
    }
  }
}

export default CartController;