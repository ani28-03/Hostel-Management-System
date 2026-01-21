const express = require('express');
const cors = require('cors');
const sql = require('mysql2');
const multer = require("multer");
const path = require("path");

const app= express();
const port= 3000;

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());

const db = sql.createConnection({
    host:"localhost",
    user:"root",
    password:"qwerty",
    database:"project",
    dateStrings:true
});

db.connect((err)=>{
    err?console.log(err.message):console.log(`Connected to database!!!`);
});

//Upload photo
const sanitize = (name) =>
  name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/Students");
  },
  filename: (req, file, cb) => {
    const guestName = req.body.guest_name
      ? sanitize(req.body.guest_name)
      : "student";

    const ext = path.extname(file.originalname);

    cb(null, `${guestName}${ext}`);
  }
});

const upload = multer({ storage });

app.post("/upload-student-photo", upload.single("profilePic"), (req, res) => {
  console.log("Saved file:", req.file.filename);
  res.send("Student photo saved");
});




const getAll = "select booking_info.*,rooms.rent,rooms.deposit from booking_info join rooms on booking_info.room_no = rooms.room_no";
const getRooms = "select rooms.*,booking_info.guest_name, booking_info.check_out_date from rooms left join booking_info on booking_info.room_no=rooms.room_no";
const getUserInfo = "select * from user_info where guest_name=?";
const getPassword = "select guest_name, username, password, isAdmin from user_info where username=?";
const getPayments = "select payments.*, tenant.rent, tenant.deposit, tenant.guest_name FROM payments left join (select rooms.room_no,rooms.rent,rooms.deposit,booking_info.guest_name from rooms left join booking_info on booking_info.room_no=rooms.room_no) as tenant on payments.room_no=tenant.room_no";

const changePassword = "update user_info set password=? where username=?";
const changePaid = "update payments set isPaid=1,paid_date=? where payment_id=?";

const add = "insert into booking_info(booking_id,guest_name, room_no, check_in_date, check_out_date,email,mobile,designation) values(?,?,?,?,?,?,?,?)";
const addRoom = "insert into rooms(room_no, floor, type, rent, deposit, ac, wifi, tv, parking, meals) values(?,?,?,?,?,?,?,?,?,?)";
const addNewStudent = "insert into booking_info(guest_name,email,mobile,designation) values(?,?,?,?);";
const addUserInfo = "insert into user_info(guest_name, username, password, gender, dob, aadhar, address, city, state, pincode, org_name, org_id, temp_check_in, isAdmin) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
const addNewUsername = "insert into user_info(guest_name,username,password,isAdmin) values (?,?,?,?)";
const addPayment = "insert into payments(payment_id, room_no, type, amount, due_date, isPaid) values(?,?,?,?,?,?)";

const delID = "delete from booking_info where booking_id=?";
const delRoom = "delete from rooms where room_no=?";
const delPayment = "delete from payments where payment_id=?";


app.get("/tenants",(req,res)=>{
    db.query(getAll,(err,results)=>{
        if(err){
            return res.status(500).json({error:err.message});
        }

        return res.json(results);
    })
})

app.get("/rooms",(req,res)=>{
    db.query(getRooms,(err,results)=>{
        if(err){
            return res.status(500).json({error:err.message});
        }

        return res.json(results);
    })
})

app.get("/getPassword/:username", (req, res) => {
    const { username } = req.params;

    db.query(getPassword, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        return res.json(results);
    });
});

app.get("/payments", (req, res) => {

    db.query(getPayments, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        return res.json(results);
    });
});

app.put("/changePassword/:username",(req,res)=>{
    const { username }=req.params;
    const {password}=req.body;
    db.query(changePassword,[password,username],(err,results)=>{
        if (err)
            return res.status(500).json({error:err.message});
        else
            res.json({"message":"Password updated successfully :)"});
    })
})

app.put("/payments/:payment_id",(req,res)=>{
    console.log("Received body:", req.body);
    const { payment_id }=req.params;
    const { paid_date } = req.body;
    db.query(changePaid,[paid_date,payment_id],(err,results)=>{
        if (err)
            return res.status(500).json({error:err.message});
        else{
            console.log("Paid Successfully!!");
            res.json({"message":"Payment is Paid!!"});
        }
    })
})

app.post("/tenants", (req, res) => {
    const { booking_id, guest_name, room_no, check_in_date, check_out_date,email,mobile,designation} = req.body;

    db.query(add, [booking_id, guest_name, room_no, check_in_date, check_out_date,email,mobile,designation], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        return res.json({ booking_id, guest_name, room_no, check_in_date, check_out_date,email,mobile,designation });
    });
});

app.post("/rooms", (req, res) => {
    const { room_no, floor, type, rent, deposit, ac, wifi, tv, parking, meals} = req.body;

    db.query(addRoom, [room_no, floor, type, rent, deposit, ac, wifi, tv, parking, meals], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        return res.json({ room_no, floor, type, rent, deposit, ac, wifi, tv, parking, meals });
    });
});

app.post("/student", (req, res) => {
    const { guest_name,email,mobile,designation } = req.body;

    db.query(addNewStudent, [guest_name,email,mobile,designation], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        return res.json({ guest_name,email,mobile,designation });
    });
});

app.post("/newuser", (req, res) => {
    const { guest_name,username,password, isAdmin } = req.body;

    db.query(addNewUsername, [guest_name,username,password, isAdmin], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        return res.json({ guest_name,username,password, isAdmin });
    });
});

app.post("/payments", (req, res) => {
    const { payment_id, room_no, type, amount, due_date, isPaid } = req.body;

    db.query(addPayment, [payment_id, room_no, type, amount, due_date, isPaid], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        return res.json({ payment_id, room_no, type, amount, due_date, isPaid });
    });
});

app.delete("/tenants/:booking_id",(req,res)=>{
    const {booking_id} = req.params;
    db.query(delID,[booking_id],(err,results)=>{
        if(err){
            return res.status(500).json({error:err.message});
        }
        console.log("Deleted!!")
        return res.status(200).json({message:"Successfully Deleted"});
    })
})

app.delete("/rooms/:room_no",(req,res)=>{
    const {room_no} = req.params;
    db.query(delRoom,[room_no],(err,results)=>{
        if(err){
            return res.status(500).json({error:err.message});
        }
        console.log("Deleted!!")
        return res.status(200).json({message:"Successfully Deleted"});
    })
})

app.delete("/payments/:payment_id",(req,res)=>{
    const {payment_id} = req.params;
    db.query(delPayment,[payment_id],(err,results)=>{
        if(err){
            return res.status(500).json({error:err.message});
        }
        console.log("Deleted!!")
        return res.status(200).json({message:"Successfully Deleted"});
    })
})

app.listen((port),()=>{
    console.log(`Listening on ${port}!!!`)
})