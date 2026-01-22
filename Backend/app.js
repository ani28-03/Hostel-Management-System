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
const getComplaints = "select * from complaints";
const getMaintenance = "SELECT * FROM maintenance";

const changePassword = "update user_info set password=? where username=?";
const changePaid = "update payments set isPaid=1,paid_date=? where payment_id=?";
const changeComplaint = "update complaints set is_resolved=1  where comp_id=?";

const changeMaintain ="UPDATE maintenance SET status=? WHERE main_id=?";


const add = "insert into booking_info(guest_name, room_no, check_in_date, check_out_date,email,mobile,designation) values(?,?,?,?,?,?,?)";
const addRoom = "insert into rooms(room_no, floor, type, rent, deposit, ac, wifi, tv, parking, meals) values(?,?,?,?,?,?,?,?,?,?)";
const addNewStudent = "insert into booking_info(guest_name,email,mobile,designation) values(?,?,?,?);";
const addUserInfo = "UPDATE user_info SET gender = ?, dob = ?,aadhar = ?, address = ?, city = ?, state = ?, pincode = ?, org_name = ?, org_id = ? WHERE guest_name = ?";
const addNewUsername = "insert into user_info(guest_name,username,password,isAdmin) values (?,?,?,?)";
const addPayment = "INSERT INTO payments(room_no, type, amount, due_date, paid_date, isPaid, transaction_id, bank_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

const addComplaints = "insert into complaints(comp_id, guest_name, room_no, comp_type, complaint, comp_date, is_resolved) values(?,?,?,?,?,?,?)";
const addMaintenance = "INSERT INTO maintenance(main_type, amount, main_date, main_description,status) VALUES (?,?,?,?,'pending')";



const delID = "delete from booking_info where booking_id=?";
const delRoom = "delete from rooms where room_no=?";
const delPayment = "delete from payments where payment_id=?";
const delComplaints = "delete from complaints where comp_id=?";
const deleteMaintenance = "DELETE FROM maintenance WHERE main_id=?";

const addComplaint = "insert into complaints(guest_name, room_no, comp_type, complaint, comp_date, is_resolved) values (?, ?, ?, ?, ?, ?)";



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

app.get("/users/:guest_name",(req,res)=>{
    const { guest_name } = req.params;
    db.query(getUserInfo,[guest_name],(err,results)=>{
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


// Complaints

app.get("/complaints",(req, res) => {
    db.query(getComplaints, (err, results) => {
        if(err) {
            return res.status(500).json({ errror: err.message});
        }
        
        return res.json(results);
    });
});

//maintainance

app.get("/maintenance", (req, res) => {
  db.query(getMaintenance, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
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

app.put("/complaints/:comp_id",(req,res)=>{
    const {comp_id} = req.params;
    db.query(changeComplaint,[comp_id],(err,results) =>{
        if (err)
            return res.status(500).json({error:err.message});
        else{
            
            res.json({"message":"complaint marked as resolved!!"});
        }
    })
})

app.put("/maintenance/status/:id", (req, res) => {
  const { status } = req.body;

  db.query(changeMaintain,[status, req.params.id],(err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Status updated" });
    }
  );
});


app.post("/tenants", (req, res) => {
    const { guest_name, room_no, check_in_date, check_out_date,email,mobile,designation} = req.body;
    console.log(req.body);
    db.query(add, [guest_name, room_no, check_in_date, check_out_date,email,mobile,designation], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        return res.json({guest_name, room_no, check_in_date, check_out_date,email,mobile,designation });
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

app.post("/users", (req, res) => {
  const {guest_name,gender,dob,aadhar,address,city,state,pincode,org_name,org_id} = req.body;

  db.query(
    addUserInfo,
    [gender, dob, aadhar, address, city, state, pincode, org_name, org_id,guest_name],
    (err, results) => {
      if (err) {
        console.error("MYSQL ERROR:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
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
  const {
    room_no,
    type,
    amount,
    due_date,
    isPaid,
    transaction_id,
    bank_name
  } = req.body;
  console.log(req.body);
  const paid_date = isPaid ? new Date() : null;

  db.query(
    addPayment,
    [
      room_no,
      type,
      amount,
      due_date,
      paid_date,
      isPaid,
      transaction_id,
      bank_name
    ],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      return res.json({
        payment_id: results.insertId,
        room_no,
        type,
        amount,
        due_date,
        paid_date,
        isPaid,
        transaction_id,
        bank_name
      });
    }
  );
});


app.post("/complaints" ,(req, res) => {
    const {comp_id, guest_name, room_no, comp_type, complaint, comp_date, is_resolved} = req.body;

    db.query(addComplaints,[comp_id, guest_name, room_no, comp_type, complaint, comp_date, is_resolved], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        return res.json({ comp_id, guest_name, room_no, comp_type, complaint, comp_date, is_resolved });

    });
});

// maintainance
app.post("/maintenance", (req, res) => {
  const { main_type, amount, main_date, main_description, status } = req.body;

  db.query(
    addMaintenance,
    [main_type, amount, main_date, main_description,status],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: "Maintenance record added successfully",
      });
    }
  );
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
//Report an issue
app.post("/complaints", (req, res) => {
  const { guest_name, room_no, comp_type, complaint, comp_date, is_resolved } = req.body;

  db.query(
    addComplaint,
    [guest_name, room_no, comp_type, complaint, comp_date, is_resolved],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ message: "Complaint added" });
    }
  );
})

app.post("/maintenance", (req, res) => {
  const { main_type, amount, main_date, main_description } = req.body;

  db.query( addMaintenance,[main_type, amount, main_date, main_description, "pending"],(err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Maintenance added successfully" });
    }
  );
});



app.delete("/complaints/:comp_id", (req,res) => {
    const {comp_id} = req.params;
    db.query(delComplaints, [comp_id],(err, results) =>{
        if(err){
            return res.status(500).json({error:err.message});
        }
        console.log("Deleted!!")
        return res.status(200).json({message:"Successfully Deleted"});
    })
})

// maintainance
app.delete("/maintenance/:main_id", (req, res) => {
  const { main_id } = req.params;

  db.query(deleteMaintenance, [main_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Maintenance record deleted" });
  });
});
app.listen((port),()=>{
    console.log(`Listening on ${port}!!!`)
})