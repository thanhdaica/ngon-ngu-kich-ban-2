// backend/routes/books.js
import express from 'express';
import BooksController from '../controllers/booksControllers.js';
// Phải thêm import middleware
import { protect } from '../middleware/authMiddleware.js'; 
import { admin } from '../middleware/adminMiddleware.js'; // Giả sử đã tạo

const routerBooks = express.Router();
const bookscontroller = new BooksController();

// GET (Công khai)
routerBooks.get('/', (req, res) => bookscontroller.index(req, res));

// POST (Chỉ Admin)
routerBooks.post('/', protect, admin, (req, res) => bookscontroller.store(req, res)); // <== BẢO VỆ

// GET by ID (Công khai)
routerBooks.get('/:id', (req, res) => bookscontroller.show(req, res));

// PUT (Chỉ Admin)
routerBooks.put('/:id', protect, admin, (req, res) => bookscontroller.update(req, res)); // <== BẢO VỆ

// DELETE (Chỉ Admin)
routerBooks.delete('/:id', protect, admin, (req, res) => bookscontroller.delete(req, res)); // <== BẢO VỆ

routerBooks.get('/category/:id', (req, res) => bookscontroller.getBooksByCategory(req, res));

export default routerBooks;