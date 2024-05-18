const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const cors  = require('cors');
const { signup, login } = require('./controllers/userContoller');
const User = require('./models/userModels');
const cookieParser = require('cookie-parser');



const jwt = require('jsonwebtoken');
const { createProduct, getAllProducts, getProductDetails, editProduct, updateProduct, deleteProduct } = require('./controllers/productController');
const authenticate = require('./utils/authMiddleware');

const app = express();
const port = process.env.PORT ||  8080;


// importan middlewares


app.use(cors());
app.use( "/" , express.static('/public'));
app.use('/', express.static(__dirname + '/public'));

app.set("view engine" , "ejs")

app.use(cookieParser());




/// file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    },
});


const upload = multer({ storage: storage });

module.exports = {upload}





// Middleware to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/" , express.static("/public"))
app.use(bodyParser.json());



// MongoDB connection string
const mongoDB = 'mongodb+srv://ahmed:K99hw4AVdcDLMsP6@aasimshah.hvncbvh.mongodb.net/ahmed?retryWrites=true&w=majority'
// const mongoDB = 'mongodb://127.0.0.1:27017/ahmed?retryWrites=true&w=majority';



// Connect to MongoDB
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connection successful'))
    .catch(err => console.error('MongoDB connection error:', err));




const fetchUser = async (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, 'mySuperSecret');

            const user = await User.findById(decoded.userId);
            console.log({user})

            res.locals.user = user;
        } catch (error) {
            console.error(error);
        }
    }

    next(); 
}

app.use(fetchUser)

app.get('/', getAllProducts);


app.get('/login', (req, res) => {
    res.render("login", { error : null})
});
app.get('/signup', (req, res) => {
    res.render("signup" , { error : null})
});
app.get('/product/add', (req, res) => {
    res.render("newProduct", { error : null})
});


app.get('/product/details/:id',getProductDetails);

app.get('/product/edit/:id', authenticate, editProduct);
app.put('/product/update/:id' ,  upload.single("image"),updateProduct);

app.delete('/product/delete/:id' , authenticate,deleteProduct);


app.post("/signup",   signup )


app.post("/products/upload", upload.single("image") , authenticate,   createProduct )

app.post("/login", login)


  




app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
