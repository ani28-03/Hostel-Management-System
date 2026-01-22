import react,{useState,useEffect, use} from 'react';
import Dashboard from "./pages/Dashboard";
import './Homepage.css';
import { DashboardServices } from './pages/DashboardServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Profile from './pages/Profile/Profile';


export default function Homepage(){

    const [userName,setUserName] = useState("");
    const [password,setPassword] = useState("");
    const [confirmPassword,setconfirmPassword] = useState("");
    const pg_name = "HOSTELLER";

    const [activeTab, setActiveTab] = useState("home");
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
    const [savedGuest_name, setsavedGuest_name] = useState("");

    const [rooms,setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null); //for booking a room by student
    const [photo, setPhoto] = useState(null);
    const [transactionId, setTransactionId] = useState("");
    const [bankName, setBankName] = useState("");


    const [student,setStudent] = useState({
      guest_name:"",
      email:"",
      mobile:"",
      designation:"",
    });

    const [newuser, setNewuser] = useState({
      guest_name:"",
      newUsername:"",
      newPassword:"",
      gender:"", 
      dob:"", 
      aadhar:"", 
      address:"", 
      city:"", 
      state:"", 
      pincode:"", 
      org_name:"", 
      org_id:"",
      isAdmin:0
    })

    //complaints useState: Report an issue
    const [complaint, setComplaint] = useState({
    guest_name: "",
    room_no: "",
    comp_type: "",
    complaint: ""
    })

    const [receiptData, setReceiptData] = useState(null);


    useEffect(() => {
    const admin = localStorage.getItem("isAdminLoggedIn");
    const Student = localStorage.getItem("isStudentLoggedIn");
    const savedUser = localStorage.getItem("userName");
    const savedPassword = localStorage.getItem("password");
    const student_name = localStorage.getItem("student_name");

    if (admin === "true") 
      setIsAdminLoggedIn(true);

    if (Student === "true") {
      setIsStudentLoggedIn(true);
      setsavedGuest_name(student_name);
    }

    if (savedUser) {
      setUserName(savedUser);
      setPassword(savedPassword);
    }

    showRooms();
    }, []);

    const showRooms= async()=>{
        const data = await DashboardServices.getRooms();
        setRooms(data);
    };

     //handle complaints: Report an issue
  const handleComplaintChange = (e) => {
  setComplaint({ ...complaint, [e.target.name]: e.target.value });
  };

  const submitComplaint = async () => {

  try {
    if (
      !complaint.comp_type ||
      !complaint.complaint
    ) {
      alert("Please fill all fields");
      return;
    }

    const data = {
      ...complaint,
      comp_date: new Date().toISOString().split("T")[0],
      is_resolved: false
    };

  
    await DashboardServices.addComplaint(data);

    alert("Complaint submitted successfully");

    
    bootstrap.Modal.getInstance(
      document.getElementById("complaintModal")
    ).hide();

  } catch (err) {
    console.error(err);
    alert("Failed to submit complaint");
    console.log(err);
  }
};



    // Sign-Up handles

    const handleStudentChange = (e) => {
      const { name, value } = e.target;
      setStudent(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleUserChange = (e) => {
      setNewuser({ ...newuser, [e.target.name]: e.target.value });
    };


    // Login handles
    const handlelogin = async()=>{
    try{
      const rightPassword = await DashboardServices.getPassword(userName);
      const guestName = rightPassword[0].guest_name;

      if (rightPassword[0].isAdmin && password == rightPassword[0].password) {
        alert("Login admin Successful!!");
        setIsAdminLoggedIn(true);

        localStorage.setItem("isAdminLoggedIn", "true");
        localStorage.setItem("userName", userName);
        localStorage.setItem("password", password);

        // console.log(rightPassword);
      }

      else if (password == rightPassword[0].password) {
            alert("Login Successful!!");
            setIsStudentLoggedIn(true);

            localStorage.setItem("isStudentLoggedIn", "true");
            localStorage.setItem("userName", userName);
            localStorage.setItem("password", password);

            setsavedGuest_name(guestName);
            localStorage.setItem("student_name", guestName);
            
            console.log(rightPassword);
            console.log(savedGuest_name);
      }

      else{
          console.log(rightPassword);
          console.log("Match?", password === rightPassword[0].password);
          alert("Invalid username or password!");
      }
      const LoginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
      LoginModal.hide();

      // SignUpModal.hide();

    }catch (err) {
        alert("User not found!");
    }
    }


    const handleAadharChange = (e) => {
    let value = e.target.value;

    value = value.replace(/\D/g, '');

    if (value.length > 4 && value.length <= 8) {
      value = value.replace(/(\d{4})(\d+)/, '$1-$2');
    } else if (value.length > 8) {
      value = value.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
    }

    setNewuser({
      ...newuser,
      aadhar: value
    });
  };

    //For signUp
  const handleRegister=async()=>{
      const {guest_name,newUsername,newPassword,isAdmin} =newuser;
      if(!guest_name||!newUsername||!newPassword){
          alert("Enter All Fields!!");
          return;
      }
      if(newuser.newPassword!=confirmPassword){
        alert("Password not matching!!");
        return;
      }
      // converting variable names as required for the api addNewUsername 
      const newuser_details = {
          guest_name,
          username: newUsername,
          password: newPassword,
          isAdmin
      };

      console.log(newuser_details);

      await DashboardServices.addNewUsername(newuser_details);
      
      setNewuser({
        guest_name:"",
        newUsername:"",
        newPassword:"",
        isAdmin:0
      })

      setconfirmPassword("");

      alert(`Welcome ${newuser.guest_name}!! Login in again to Sign-In!!`);
  };

  //prefilled guest_name for Booking Model
  const handleOpenBooking = (room) => {
    setSelectedRoom(room);
    localStorage.setItem("student_room", room.room_no);
    console.log(localStorage.getItem("student_room"));
    localStorage.setItem("room_deposit", room.deposit);
    console.log(localStorage.getItem("room_deposit"));


    const storedName = localStorage.getItem("student_name") || "";

    setNewuser(prev => ({
      ...prev,
      guest_name: storedName
    }));
  };
  //prefilled guest_name for Complaint Model
  const handleOpenComplaintModal = () => {
  const storedName = localStorage.getItem("student_name") || "";
  const storedRoom = localStorage.getItem("student_room") || "";

  setComplaint(prev => ({
    ...prev,
    guest_name: storedName,
    room_no:storedRoom
  }));
};


  //confirm booking after proceed
 const openConfirmModal = () => {
  const { email, mobile, designation } = student;

  const {
    gender,
    dob,
    aadhar,
    address,
    city,
    state,
    pincode,
    org_name,
    org_id,
  } = newuser;

  if (
    !email ||
    !mobile ||
    !gender ||
    !dob ||
    !aadhar ||
    !address ||
    !city ||
    !state ||
    !pincode ||
    !org_name ||
    !org_id ||
    !designation
  ) {
    alert("Please fill all mandatory fields");
    return;
  }

  const currentModal = bootstrap.Modal.getInstance(
    document.getElementById("userInfoModal")
  );
  currentModal.hide();

  const confirmModal = new bootstrap.Modal(
    document.getElementById("confirmBookingModal")
  );
  confirmModal.show();
};


const openPaymentModal = () => {
  const confirmModal = bootstrap.Modal.getInstance(

    document.getElementById("confirmBookingModal")
  );
  confirmModal.hide();

  const paymentModal = new bootstrap.Modal(
    document.getElementById("paymentModal")
  );
  paymentModal.show();
};




const handleBooking = async () => {
  if (!transactionId || !bankName) {11
    alert("Please enter transaction details");
    return;
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3);
  const formattedDueDate = dueDate.toISOString().split("T")[0];

  const out_Date = new Date();
  out_Date.setDate(out_Date.getDate() + 31);
  const check_o_Date = out_Date.toISOString().split("T")[0];

  localStorage.setItem("due_date",formattedDueDate);
  localStorage.setItem("check_out_Date",check_o_Date);


  try {
    console.log(localStorage.getItem("room_deposit"));
    console.log(formattedDueDate);

    await DashboardServices.addPayment({
      room_no: localStorage.getItem("student_room"),  
      type: "deposit",
      amount: localStorage.getItem("room_deposit"),
      due_date: formattedDueDate,
      isPaid: "false",
      transaction_id: transactionId,
      bank_name: bankName
    });

    

    await DashboardServices.add({
      guest_name:localStorage.getItem("student_name"), 
      room_no:localStorage.getItem("student_room"), 
      check_in_date:formattedDueDate, 
      check_out_date:check_o_Date,
      email:student.email,
      mobile:student.mobile,
      designation:student.designation
    });
    // await DashboardServices.addStudent(student);
    await DashboardServices.addUserInfo(newuser);

    alert("Payment successful & booking confirmed!");

    
    const paymentModal = bootstrap.Modal.getInstance(
      document.getElementById("paymentModal")
    );
    paymentModal.hide();


     new bootstrap.Modal(
     document.getElementById("receiptModal")).show();

  } catch (err) {
    console.error(err);
    alert("Payment Successfull");
  }
};

const printReceipt = () => {
  const receiptContent = document.getElementById("receiptContent").innerHTML;

  const printWindow = window.open("", "", "width=800,height=600");
  printWindow.document.write(`
    <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h3 { text-align: center; }
          p { font-size: 14px; }
        </style>
      </head>
      <body>
        ${receiptContent}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
};


    if (isAdminLoggedIn) {
        return <Dashboard />;
    }

    return (
    <>
      {/* Title bar */}
      
      <div id='homepage-title' className="container-fluid p-3">
        <div className="d-flex justify-content-between align-items-center">
          <h4 onClick={()=>setActiveTab("home")} style={{ cursor: "pointer" }} >
             {pg_name} <img src='logo.jpg' width={30}/>
          </h4>

          {/* Search & Login */}
          <div className="d-flex">
            <input id='search' className="form-control me-3 " type="text" placeholder="Search..." />

            {isStudentLoggedIn || isAdminLoggedIn ? (
              <div className="d-flex align-items-center gap-3"> 
                <span>👤 <b>{savedGuest_name?.toUpperCase() || "Error"}</b></span>
                <button className="btn btn-danger me-2" onClick={() => {
                  localStorage.clear();
                  setIsAdminLoggedIn(false);
                  setIsStudentLoggedIn(false);
                  setUserName("");
                  setPassword("");
                  setActiveTab("home");
                  
                }}>
                  Logout
                </button>
              </div>
            ) : (
              <button id='loginBtn' className="btn me-3" data-bs-toggle="modal" data-bs-target="#loginModal">
                <FontAwesomeIcon icon={['fas', 'user']}></FontAwesomeIcon> Login
              </button>
            )}

            {/* Hamburger */}
            <div className="dropdown">
              <button
                className="btn btn-light border"
                type="button"
                data-bs-toggle="dropdown"
              >
                &#9776;
              </button>

              {isStudentLoggedIn?(
                <ul className="dropdown-menu dropdown-menu-end animated-dropdown">
                  <li className="dropdown-animate"><a className="dropdown-item" onClick={()=>setActiveTab("profile")}>Profile</a></li>
                  
                    <li className="dropdown-animate"><a className="dropdown-item" href="#"data-bs-toggle="modal" data-bs-target="#complaintModal" onClick={handleOpenComplaintModal}>Report an Issue </a></li>
    
                  <li className="dropdown-animate"><a className="dropdown-item" href="#">Student Life</a></li>
                  <li className="dropdown-animate"><a className="dropdown-item" href="#footer_col4">Contact us</a></li>
                </ul>
            ):(
                <ul className="dropdown-menu dropdown-menu-end animated-dropdown">
                  <li className="dropdown-animate"><a className="dropdown-item" href="#rooms-header">Rooms</a></li>
                  <li className="dropdown-animate"><a className="dropdown-item" href="#facilities">Facilities</a></li>
                  {/* <li className="dropdown-animate"><a className="dropdown-item" href="#facilities">Student Life</a></li> */}
                  <li className="dropdown-animate"><a className="dropdown-item" href="#footer_col4">Contact us</a></li>
                </ul>
            )}
              
            </div>
            
          </div>

        </div>
      </div>

      <div className="homepage-content-area">
      
          {activeTab === "home" && <div className="tabContent">
            
            {/* Top image  */}
              <div className="row">
                <img src="./Homepage/top.png"/>
              </div>
              
              {/* Room Selection  */}
                {/* Header */}
                <div className="row mb-4">
                  <div className="col-12 text-center">
                    <h2 id='rooms-header' className="rooms-header">Our Rooms</h2>
                  </div>
                </div>

                {/* Room Categories */}
                <div id="select-room-type" className="row">

                  {/* left image */}
                  <div className="col-md-3 d-flex justify-content-start overflow-hidden">
                    <img id='left-side-photo' src="./Homepage/2-left.png" className="side-photo" />
                  </div>

                  {/* Single */}
                  <div className="col-md-2 room-card" onClick={()=>setActiveTab("single")} style={{ cursor: "pointer" }}>
                    <div className="card homepage-room-card">

                      <div className="room-title bg-secondary text-white">Single</div>

                      <img
                        src="Rooms/103.jpg"
                        onError={(e) => { e.target.src = "Rooms/blank.png"; }}
                        className="room-photo"
                      />

                      <p className="room-desc">
                        Description of the room. Description of the room. Description of the
                        room. Description of the room. Description of the room.
                      </p>

                      <hr />

                      <div className="amenities">
                        {/* <span className="amenity"><FontAwesomeIcon icon={['fas', 'wind']} /> AC</span> */}
                        <span className="amenity"><FontAwesomeIcon icon={['fas', 'wifi']} /> Wifi</span>
                        <span className="amenity"><FontAwesomeIcon icon={['fas', 'tv']} /> TV</span>
                        {/* <span className="amenity"><FontAwesomeIcon icon={['fas', 'square-parking']} /> Parking</span> */}
                        {/* <span className="amenity"><FontAwesomeIcon icon={['fas', 'utensils']} /> Meals</span> */}
                        <span>+3</span>
                      </div>

                    </div>
                  </div>

                  {/* Double */}
                  <div className="col-md-2 room-card" onClick={()=>setActiveTab("double")} style={{ cursor: "pointer" }}>
                    <div className="card homepage-room-card">

                      <div className="room-title bg-info text-white">Double</div>

                      <img
                        src="Rooms/105.jpg"
                        onError={(e) => { e.target.src = "Rooms/blank.png"; }}
                        className="room-photo"
                      />

                      <p className="room-desc">
                        Description of the room. Description of the room. Description of the
                        room. Description of the room. Description of the room.
                      </p>

                      <hr />

                      <div className="amenities">
                        <span className="amenity"><FontAwesomeIcon icon={['fas', 'wind']} /> AC</span>
                        <span className="amenity"><FontAwesomeIcon icon={['fas', 'wifi']} /> Wifi</span>
                        <span className="amenity"><FontAwesomeIcon icon={['fas', 'tv']} /> TV</span>
                        {/* <span className="amenity"><FontAwesomeIcon icon={['fas', 'square-parking']} /> Parking</span> */}
                        <span className="amenity"><FontAwesomeIcon icon={['fas', 'utensils']} /> Meals</span>
                        <span>+6</span>
                      </div>

                    </div>
                  </div>

                  {/* Ensuite */}
                  <div className="col-md-2 room-card" onClick={()=>setActiveTab("ensuite")} style={{ cursor: "pointer" }}>
                    <div className="card homepage-room-card">

                      <div className="room-title bg-warning text-white">Ensuite</div>

                      <img
                        src="Rooms/202.jpg"
                        onError={(e) => { e.target.src = "Rooms/blank.png"; }}
                        className="room-photo"
                      />

                      <p className="room-desc">
                        Description of the room. Description of the room. Description of the
                        room. Description of the room. Description of the room.
                      </p>

                      <hr />

                      <div className="amenities">
                        <span className="amenity"><FontAwesomeIcon icon={['fas', 'wind']} /> AC</span>
                        <span className="amenity"><FontAwesomeIcon icon={['fas', 'wifi']} /> Wifi</span>
                        <span className="amenity"><FontAwesomeIcon icon={['fas', 'tv']} /> TV</span>
                        <span className="amenity"><FontAwesomeIcon icon={['fas', 'square-parking']} /> Parking</span>
                        <span className="amenity"><FontAwesomeIcon icon={['fas', 'utensils']} /> Meals</span>
                        <span>+8</span>
                      </div>

                    </div>
                  </div>

                  {/* Right photo  */}
                  <div className="col-md-3 d-flex justify-content-end overflow-hidden">
                    <img id='right-side-photo' src="./Homepage/2-right.png" className="side-photo" />
                  </div>

                </div>

                {/* Amenities */}
                <br></br><br></br>
                <div className="col-12 text-center">
                <h2 id='facilities' className="rooms-header">Our Facilities</h2>
                </div>
                <div className="row">

                  <div className="col-md-4 ">
                    <img src="./Homepage/amenities.png" width={550}/>
                  </div>

                  <div  className="col-md-8">
                    <p className='fs-2'><br></br>Our hostel offers a comfortable, modern, and student-friendly living environment designed to support both academic focus and an active lifestyle. <br></br>
                    Residents enjoy well-maintained common facilities including secure cycle parking, a fully equipped laundry area, a spacious common kitchen, dedicated study spaces, a gym, and indoor recreation areas for games such as table tennis, cards, and snooker.  <br></br>
                    High-speed free Wi-Fi is available throughout the hostel to support uninterrupted learning and connectivity. <br></br> <br></br> 
                    For added convenience, nutritious meals and air-conditioned rooms are available at an additional cost, allowing students to choose the level of comfort that best suits their needs. This combination of convenience, flexibility, and community makes our hostel an ideal home away from home for students.</p>
                  </div>
                </div>
            
          </div>}


          {activeTab === "single" && <div className="tabContent"> 
              <div className="row">
                <h4 className='mt-4 ms-4' onClick={()=>setActiveTab("home")} style={{ cursor: "pointer" }}><FontAwesomeIcon icon={['fas', 'circle-left']}/> Back</h4>
              </div>
              {/* <div className="row">
                <img src='./Homepage/2.jpg'></img>
              </div> */}

              {/* Single Rooms */}
              <div id='card-row' className="row">
                {rooms.filter(room => room.type === "single").map((room) => (
                  <div key={room.room_no} className="col-md-8">
                    <div id='homepage-col-card' className="card border-0 rounded-4 p-3 homepage-card-body">

                      <div className="row">

                        <div className="col-md-4">

                          {/* img carousel */}
                          <div id={`roomCarousel${room.room_no}`} className="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">

                            <div className="carousel-indicators">
                                <button
                                    type="button"
                                    data-bs-target={`#roomCarousel${room.room_no}`}
                                    data-bs-slide-to="0"
                                    className="active">
                                  </button>

                                <button
                                    type="button"
                                    data-bs-target={`#roomCarousel${room.room_no}`}
                                    data-bs-slide-to="1">
                                  </button>

                                <button
                                    type="button"
                                    data-bs-target={`#roomCarousel${room.room_no}`}
                                    data-bs-slide-to="2">
                                </button>
                            </div>

                            <div id='homepage-room-photo' className="carousel-inner">

                              {/* image:1 */}
                              <div className="carousel-item active">
                                <img
                                  src={`Rooms/${room.room_no}.jpg`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "Rooms/blank.png"; //Backup photo
                                  }}
                                  className="d-block w-100 rounded"
                                  style={{ height: "300px", objectFit: "cover" }}
                                />
                              </div>

                              {/* image:2 */}
                              <div className="carousel-item">
                                <img
                                  src={`Rooms/${room.room_no}.jpg`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "Rooms/blank.png"; //Backup photo
                                  }}
                                  className="d-block w-100 rounded"
                                  style={{ height: "300px", objectFit: "cover" }}
                                />
                              </div>

                              {/* image:3 */}
                              <div className="carousel-item">
                                <img
                                  src={`Rooms/${room.room_no}.jpg`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "Rooms/blank.png"; //Backup photo
                                  }}
                                  className="d-block w-100 rounded"
                                  style={{ height: "300px", objectFit: "cover" }}
                                />
                              </div>

                            </div>

                            {/* Carousel Controls */}
                            <button className="carousel-control-prev" type="button" data-bs-target={`#roomCarousel${room.room_no}`} data-bs-slide="prev">
                              <span className="carousel-control-prev-icon"></span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target={`#roomCarousel${room.room_no}`} data-bs-slide="next">
                              <span className="carousel-control-next-icon"></span>
                            </button>
                          </div>

                        </div>

                        <div className="col-md-8">

                          {/* Room number/type */}
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="fw-bold">Room {room.room_no}
                              {(room.type=="single")?(
                              <span id='room-type' className='badge bg-info ms-3 px-3 py-2 fs-6'>{room.type.toUpperCase()}</span> 
                            ):(
                              <span id='room-type' className='badge bg-warning ms-3 px-3 py-2 fs-6'>{room.type.toUpperCase()}</span> 
                            )}
                            </h3>
                            
                            {/* Available status  */}
                            {!room.guest_name ? (
                              <span className="badge bg-success px-3 py-2 fs-6">Vacant</span>
                            ) : (
                              <span className="badge bg-primary px-3 py-2 fs-6">
                                Available from: <b>{room.check_out_date || "N/A"}</b>
                              </span>
                            )}
                          </div>

                          {/* basic room details */}
                          <div className="row text-center mb-4">
                            <div className="col-md-4">
                              <p className="text-muted mb-0">Floor</p>
                              <h5 className="fw-bold">{room.floor}</h5>
                            </div>

                            <div className="col-md-4">
                              <p className="text-muted mb-0">Rent</p>
                              <h5 className="fw-bold">₹{room.rent}</h5>
                            </div>

                            <div className="col-md-4">
                              <p className="text-muted mb-0">Deposit</p>
                              <h5 className="fw-bold">₹{room.deposit}</h5>
                            </div>
                          </div>

                          {/* amenities */}
                          <div className="d-flex flex-wrap gap-3">

                            {room.ac === 1 && (
                              <span className="badge bg-light text-dark px-3 py-2 shadow-sm">
                                <FontAwesomeIcon icon={['fas', 'wind']} /> AC
                              </span>
                            )}

                            {room.wifi === 1 && (
                              <span className="badge bg-light text-dark px-3 py-2 shadow-sm">
                                <FontAwesomeIcon icon={['fas', 'wifi']} /> Wifi
                              </span>
                            )}

                            {room.tv === 1 && (
                              <span className="badge bg-light text-dark px-3 py-2 shadow-sm">
                                <FontAwesomeIcon icon={['fas', 'tv']} /> TV
                              </span>
                            )}

                            {room.parking === 1 && (
                              <span className="badge bg-light text-dark px-3 py-2 shadow-sm">
                                <FontAwesomeIcon icon={['fas', 'square-parking']} /> Parking
                              </span>
                            )}

                            {room.meals === 1 && (
                              <span className="badge bg-light text-dark px-3 py-2 shadow-sm">
                                <FontAwesomeIcon icon={['fas', 'utensils']} /> Meals
                              </span>
                            )}

                          </div>

                          <hr className="my-4" />

                          {/* About room */}
                          <p className="text-muted">
                            Description of the room. Description of the room. Description of the room. 
                            Description of the room. Description of the room.
                          </p>

                          {/* Book the room */}
                          {room.guest_name ? (
                            <div className="row">
                              <div className="col-md-9"></div>
                              <button className="col-md-2 bg-danger text-black">
                                Unavailable
                              </button>
                            </div>
                          ) : isStudentLoggedIn ? (
                            <div className="row">
                              <div className="col-md-9"></div>
                              <button
                                className="col-md-2 bg-warning text-black"
                                data-bs-toggle="modal"
                                data-bs-target="#userInfoModal"
                                onClick={() => handleOpenBooking(room)}
                              >
                                Select Room
                              </button>
                            </div>
                          ) : (
                            <div className="row">
                              <div className="col-md-9"></div>
                              <button
                                className="col-md-2 bg-warning text-black"
                                data-bs-toggle="modal"
                                data-bs-target="#loginModal"
                              >
                                Select Room
                              </button>
                            </div>
                          )}

                          
                          
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
              
          </div>}


          {activeTab === "double" && <div className="tabContent"> 
              
              <div className="row">
                <h4 className='mt-4 ms-4' onClick={()=>setActiveTab("home")} style={{ cursor: "pointer" }}><FontAwesomeIcon icon={['fas', 'circle-left']}/> Back</h4>
              </div>
              
              {/* Double Rooms  */}
              <div id='card-row' className="row">
                {rooms.filter(room => room.type === "double").map((room) => (
                  <div key={room.room_no} className="col-md-8">
                    <div id='homepage-col-card' className="card border-0 rounded-4 p-3 homepage-card-body">

                      <div className="row">

                        <div className="col-md-4">

                          {/* img carousel */}
                          <div id={`roomCarousel${room.room_no}`} className="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">

                            <div className="carousel-indicators">
                                <button
                                    type="button"
                                    data-bs-target={`#roomCarousel${room.room_no}`}
                                    data-bs-slide-to="0"
                                    className="active">
                                  </button>

                                <button
                                    type="button"
                                    data-bs-target={`#roomCarousel${room.room_no}`}
                                    data-bs-slide-to="1">
                                  </button>

                                <button
                                    type="button"
                                    data-bs-target={`#roomCarousel${room.room_no}`}
                                    data-bs-slide-to="2">
                                </button>
                            </div>

                            <div id='homepage-room-photo' className="carousel-inner">

                              {/* image:1 */}
                              <div className="carousel-item active">
                                <img
                                  src={`Rooms/${room.room_no}.jpg`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "Rooms/blank.png"; //Backup photo
                                  }}
                                  className="d-block w-100 rounded"
                                  style={{ height: "300px", objectFit: "cover" }}
                                />
                              </div>

                              {/* image:2 */}
                              <div className="carousel-item">
                                <img
                                  src={`Rooms/${room.room_no}.jpg`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "Rooms/blank.png"; //Backup photo
                                  }}
                                  className="d-block w-100 rounded"
                                  style={{ height: "300px", objectFit: "cover" }}
                                />
                              </div>

                              {/* image:3 */}
                              <div className="carousel-item">
                                <img
                                  src={`Rooms/${room.room_no}.jpg`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "Rooms/blank.png"; //Backup photo
                                  }}
                                  className="d-block w-100 rounded"
                                  style={{ height: "300px", objectFit: "cover" }}
                                />
                              </div>

                            </div>

                            {/* Carousel Controls */}
                            <button className="carousel-control-prev" type="button" data-bs-target={`#roomCarousel${room.room_no}`} data-bs-slide="prev">
                              <span className="carousel-control-prev-icon"></span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target={`#roomCarousel${room.room_no}`} data-bs-slide="next">
                              <span className="carousel-control-next-icon"></span>
                            </button>
                          </div>

                        </div>

                        <div className="col-md-8">

                          {/* Room number/type */}
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="fw-bold">Room {room.room_no}
                              {(room.type=="double")?(
                              <span id='room-type' className='badge bg-info ms-3 px-3 py-2 fs-6'>{room.type.toUpperCase()}</span> 
                            ):(
                              <span id='room-type' className='badge bg-warning ms-3 px-3 py-2 fs-6'>{room.type.toUpperCase()}</span> 
                            )}
                            </h3>
                            
                            {/* Available status  */}
                            {!room.guest_name ? (
                              <span className="badge bg-success px-3 py-2 fs-6">Vacant</span>
                            ) : (
                              <span className="badge bg-primary px-3 py-2 fs-6">
                                Available from: <b>{room.check_out_date || "N/A"}</b>
                              </span>
                            )}
                          </div>

                          {/* basic room details */}
                          <div className="row text-center mb-4">
                            <div className="col-md-4">
                              <p className="text-muted mb-0">Floor</p>
                              <h5 className="fw-bold">{room.floor}</h5>
                            </div>

                            <div className="col-md-4">
                              <p className="text-muted mb-0">Rent</p>
                              <h5 className="fw-bold">₹{room.rent}</h5>
                            </div>

                            <div className="col-md-4">
                              <p className="text-muted mb-0">Deposit</p>
                              <h5 className="fw-bold">₹{room.deposit}</h5>
                            </div>
                          </div>

                          {/* amenities */}
                          <div className="d-flex flex-wrap gap-3">

                            {room.ac === 1 && (
                              <span className="badge bg-light text-dark px-3 py-2 shadow-sm">
                                <FontAwesomeIcon icon={['fas', 'wind']} /> AC
                              </span>
                            )}

                            {room.wifi === 1 && (
                              <span className="badge bg-light text-dark px-3 py-2 shadow-sm">
                                <FontAwesomeIcon icon={['fas', 'wifi']} /> Wifi
                              </span>
                            )}

                            {room.tv === 1 && (
                              <span className="badge bg-light text-dark px-3 py-2 shadow-sm">
                                <FontAwesomeIcon icon={['fas', 'tv']} /> TV
                              </span>
                            )}

                            {room.parking === 1 && (
                              <span className="badge bg-light text-dark px-3 py-2 shadow-sm">
                                <FontAwesomeIcon icon={['fas', 'square-parking']} /> Parking
                              </span>
                            )}

                            {room.meals === 1 && (
                              <span className="badge bg-light text-dark px-3 py-2 shadow-sm">
                                <FontAwesomeIcon icon={['fas', 'utensils']} /> Meals
                              </span>
                            )}

                          </div>

                          <hr className="my-4" />

                          {/* About room */}
                          <p className="text-muted">
                            Description of the room. Description of the room. Description of the room. 
                            Description of the room. Description of the room.
                          </p>

                          {/* Book the room */}
                          {isStudentLoggedIn?(
                            <div className="row">
                            <div className="col-md-9"></div>
                            <button
                              className='col-md-2 bg-warning text-black'
                              data-bs-toggle="modal"
                              data-bs-target="#userInfoModal"
                              onClick={() => handleOpenBooking(room)}>
                              Select Room
                            </button>
                          </div>
                          ):(
                            <div className="row">
                            <div className="col-md-9"></div>
                            {/* <button className='col-md-2 bg-warning text-black'>Select Room</button> */}
                            <button className='col-md-2 bg-warning text-black' data-bs-toggle="modal" data-bs-target="#loginModal">
                              Select Room
                            </button>
                          </div>
                          )}
                          
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            
          </div>}

          {/* Ensuite Rooms  */}
          {activeTab === "ensuite" && <div className="tabContent"> 
            <div className="row">
                <h4 className='mt-4 ms-4' onClick={()=>setActiveTab("home")} style={{ cursor: "pointer" }}><FontAwesomeIcon icon={['fas', 'circle-left']}/> Back</h4>
              </div>
            <div id='card-row' className="row">
                {rooms.filter(room => room.type === "ensuite").map((room) => (
                  <div key={room.room_no} className="col-md-8">
                    <div id='homepage-col-card' className="card border-0 rounded-4 p-3 homepage-card-body">

                      <div className="row">

                        <div className="col-md-4">

                          {/* img carousel */}
                          <div id={`roomCarousel${room.room_no}`} className="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">

                            <div className="carousel-indicators">
                                <button
                                    type="button"
                                    data-bs-target={`#roomCarousel${room.room_no}`}
                                    data-bs-slide-to="0"
                                    className="active">
                                  </button>

                                <button
                                    type="button"
                                    data-bs-target={`#roomCarousel${room.room_no}`}
                                    data-bs-slide-to="1">
                                  </button>

                                <button
                                    type="button"
                                    data-bs-target={`#roomCarousel${room.room_no}`}
                                    data-bs-slide-to="2">
                                </button>
                            </div>

                            <div id='homepage-room-photo' className="carousel-inner">

                              {/* image:1 */}
                              <div className="carousel-item active">
                                <img
                                  src={`Rooms/${room.room_no}.jpg`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "Rooms/blank.png"; //Backup photo
                                  }}
                                  className="d-block w-100 rounded"
                                  style={{ height: "300px", objectFit: "cover" }}
                                />
                              </div>

                              {/* image:2 */}
                              <div className="carousel-item">
                                <img
                                  src={`Rooms/${room.room_no}.jpg`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "Rooms/blank.png"; //Backup photo
                                  }}
                                  className="d-block w-100 rounded"
                                  style={{ height: "300px", objectFit: "cover" }}
                                />
                              </div>

                              {/* image:3 */}
                              <div className="carousel-item">
                                <img
                                  src={`Rooms/${room.room_no}.jpg`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "Rooms/blank.png"; //Backup photo
                                  }}
                                  className="d-block w-100 rounded"
                                  style={{ height: "300px", objectFit: "cover" }}
                                />
                              </div>

                            </div>

                            {/* Carousel Controls */}
                            <button className="carousel-control-prev" type="button" data-bs-target={`#roomCarousel${room.room_no}`} data-bs-slide="prev">
                              <span className="carousel-control-prev-icon"></span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target={`#roomCarousel${room.room_no}`} data-bs-slide="next">
                              <span className="carousel-control-next-icon"></span>
                            </button>
                          </div>

                        </div>

                        <div className="col-md-8">

                          {/* Room number/type */}
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="fw-bold">Room {room.room_no}
                              {(room.type=="ensuite")?(
                              <span id='room-type' className='badge bg-info ms-3 px-3 py-2 fs-6'>{room.type.toUpperCase()}</span> 
                            ):(
                              <span id='room-type' className='badge bg-warning ms-3 px-3 py-2 fs-6'>{room.type.toUpperCase()}</span> 
                            )}
                            </h3>
                            
                            {/* Available status  */}
                            {!room.guest_name ? (
                              <span className="badge bg-success px-3 py-2 fs-6">Vacant</span>
                            ) : (
                              <span className="badge bg-primary px-3 py-2 fs-6">
                                Available from: <b>{room.check_out_date || "N/A"}</b>
                              </span>
                            )}
                          </div>

                          {/* basic room details */}
                          <div className="row text-center mb-4">
                            <div className="col-md-4">
                              <p className="text-muted mb-0">Floor</p>
                              <h5 className="fw-bold">{room.floor}</h5>
                            </div>

                            <div className="col-md-4">
                              <p className="text-muted mb-0">Rent</p>
                              <h5 className="fw-bold">₹{room.rent}</h5>
                            </div>

                            <div className="col-md-4">
                              <p className="text-muted mb-0">Deposit</p>
                              <h5 className="fw-bold">₹{room.deposit}</h5>
                            </div>
                          </div>

                          {/* amenities */}
                          <div className="d-flex flex-wrap gap-3">

                            {room.ac === 1 && (
                              <span className="badge bg-light text-dark px-3 py-2 shadow-sm">
                                <FontAwesomeIcon icon={['fas', 'wind']} /> AC
                              </span>
                            )}

                            {room.wifi === 1 && (
                              <span className="badge bg-light text-dark px-3 py-2 shadow-sm">
                                <FontAwesomeIcon icon={['fas', 'wifi']} /> Wifi
                              </span>
                            )}

                            {room.tv === 1 && (
                              <span className="badge bg-light text-dark px-3 py-2 shadow-sm">
                                <FontAwesomeIcon icon={['fas', 'tv']} /> TV
                              </span>
                            )}

                            {room.parking === 1 && (
                              <span className="badge bg-light text-dark px-3 py-2 shadow-sm">
                                <FontAwesomeIcon icon={['fas', 'square-parking']} /> Parking
                              </span>
                            )}

                            {room.meals === 1 && (
                              <span className="badge bg-light text-dark px-3 py-2 shadow-sm">
                                <FontAwesomeIcon icon={['fas', 'utensils']} /> Meals
                              </span>
                            )}

                          </div>

                          <hr className="my-4" />

                          {/* About room */}
                          <p className="text-muted">
                            Description of the room. Description of the room. Description of the room. 
                            Description of the room. Description of the room.
                          </p>

                          {/* Book the room */}
                          {isStudentLoggedIn?(
                            <div className="row">
                            <div className="col-md-9"></div>
                            <button
                              className='col-md-2 bg-warning text-black'
                              data-bs-toggle="modal"
                              data-bs-target="#userInfoModal"
                              onClick={() => handleOpenBooking(room)}>
                              Select Room
                            </button>
                          </div>
                          ):(
                            <div className="row">
                            <div className="col-md-9"></div>
                            {/* <button className='col-md-2 bg-warning text-black'>Select Room</button> */}
                            <button className='col-md-2 bg-warning text-black' data-bs-toggle="modal" data-bs-target="#loginModal">
                              Select Room
                            </button>
                          </div>
                          )}
                          
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>}


          {activeTab === "profile" && <div className="tabContent"> <div><Profile/></div> </div>}
      
      </div>
      

      {/* This is a footer. */}
      <footer className="p-4 mt-5">
        <div className="container">
        <div className='row'>
            <div id='footer_col1' className='col md-3'>
                <h5>Contact Information</h5>
                <p>Email: cdacblr@gmail.com</p>
                <p>Phone: +91-9284404447</p>
                <img src="/src/assets/Trustpilot.jpg" className='trustpilot w-75'/>
            </div>
            <div id='footer_col2' className='col md-3'>
                <h6 className="mt-3">Company</h6>
                <ul className='list-unstyled'>
                    <li>About</li>
                    <li>How it works</li>
                    <li>Refer a Friend</li>
                    <li>Universities</li>
                    <li>Careers</li>
                </ul>
            </div>
            <div id='footer_col3' className='col md-3'>
                <h6 className="mt-3">Support</h6>
                <ul className='list-unstyled'>
                    <li>Help center</li>
                    <li>Contact</li>
                    <li>T&C</li>
                    <li>Privacy policy</li>
                    <li>Sitemap</li>
                </ul>
            </div>
            <div id='footer_col4' className='col md-3'>
                <h6 className="mt-3">Contact us</h6>
                <ul className='list-unstyled'>
                    <li><button className='contact_button'>Whatsapp</button></li>
                    <li><button className='contact_button'>Instagram</button></li>
                    <li><button className='contact_button'>Twitter</button></li>
                    <li><button className='contact_button'>Facebook</button></li>
                </ul>
            </div>
        </div>
        </div>
      </footer>

      {/* Modals  */}
      {/* This is for login*/}
      <div id="loginModal" className="modal fade"  tabIndex="-1">
        <div id='modal' className="modal-dialog">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">Login</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <input type="text" className="form-control mb-2" value={userName} placeholder="Username" onChange={(e) => setUserName(e.target.value)}/>
              <input type="password" className="form-control" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
            </div>

            <div className="modal-footer">
              <button id='signupBtn' className="btn me-3 text-primary" data-bs-toggle="modal" data-bs-target="#signupModal">
                  Sign up
              </button>
              <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button className="btn btn-primary" onClick={handlelogin}>Login</button>
            </div>

          </div>
        </div>
      </div>

      {/* This is for Signup*/}
       <div id="signupModal" className="modal fade"  tabIndex="-1">
        <div id='modal' className="modal-dialog">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title text-primary">Sign Up</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <br/>
              <h5>Your Details</h5><hr/>
              Name<span className='text-danger'>*</span><input type="text" className="form-control mb-2" name='guest_name' value={newuser.guest_name} placeholder="Name" onChange={handleUserChange}/>
              {/* Email<span className='text-danger'>*</span><input type="email" className="form-control mb-2" name='email' value={student.email} placeholder="Email" onChange={handleStudentChange}/>
              Mobile<span className='text-danger'>*</span><input type="text" className="form-control mb-2" name='mobile' value={student.mobile} placeholder="Mobile No" onChange={handleStudentChange}/>
              Desgnation<span className='text-danger'>*</span><input type="text" className="form-control mb-4" name='designation' value={student.designation} placeholder="Designation" onChange={handleStudentChange}/> */}
              <br/><br/>
              <h6>Set User Name and Password</h6><hr/>
              <input type="text" className="form-control mb-4" name='newUsername' value={newuser.newUsername} placeholder="Username*" onChange={handleUserChange}/>
              <input type="password" className="form-control mb-2" name='newPassword' value={newuser.newPassword} placeholder="Password*" onChange={handleUserChange}/>
              <input type="password" className="form-control" name='confirmPassword' value={confirmPassword} placeholder="Confirm Password*" onChange={(e) => setconfirmPassword(e.target.value)}/>
              
              {/* checking if password is matching  */}
              {newuser.newPassword==confirmPassword?(
                <span className='text-danger fs-6 ms-2'></span>
              ):(
                (newuser.newPassword!=confirmPassword && !confirmPassword) ?(
                <span className='text-danger fs-6 ms-2'></span>):(
                  <span className='text-danger fs-6 ms-2'>password not matching</span>
                )
              )}
              
            </div>

            <div className="modal-footer">
              <button id='signupBtn' className="btn me-3 text-primary" data-bs-toggle="modal" data-bs-target="#loginModal">
                  Sign in
              </button>
              <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button className="btn btn-primary" onClick={handleRegister}>Submit</button>
            </div>

          </div>
        </div>
      </div>

      {/* This is for User info*/}
       <div id="userInfoModal" className="modal fade"  tabIndex="-1">
        <div id='modal' className="modal-dialog">
          <div id='userModal' className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title text-primary">Confirm your details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              
              <div className="row">
                <h6>Your Details</h6><hr/>
                <div className="col-md-6">
                  
                  Name<span className='text-danger'>*</span><input type="text" className="form-control mb-2" name='guest_name' value={newuser.guest_name} disabled onChange={handleUserChange}/>
                  Email<span className='text-danger'>*</span><input type="email" className="form-control mb-2" name='email' value={student.email} placeholder="Email" onChange={handleStudentChange}/>
                  Mobile<span className='text-danger'>*</span><input type="text" className="form-control mb-2" name='mobile' value={student.mobile} placeholder="Mobile No" onChange={handleStudentChange}/>
                  {/* Desgnation<span className='text-danger'>*</span><input type="text" className="form-control mb-4" name='designation' value={student.designation} placeholder="Designation" onChange={handleStudentChange}/> */}
                </div>

                <div className="col-md-6">
                  {/*Need to add handleupload and save*/}
                  {/* Upload your photo<input type="file" name="profilePic" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])}/> */}
                  {/* <hr/> */}
                  {/* <br></br> */}
                  Gender<span className='text-danger'>*</span><br/>
                       Male
                    <input className='ms-1 me-3' type="radio" name="gender" value="Male" checked={newuser.gender === "Male"} onChange={handleUserChange}/>

                    Female
                    <input className='ms-1 me-3' type="radio" name="gender" value="Female" checked={newuser.gender === "Female"} onChange={handleUserChange}/>

                    Others
                    <input className='ms-1 me-3' type="radio" name="gender" value="Others" checked={newuser.gender === "Others"} onChange={handleUserChange}/>
                  <hr/>
                  Date of Birth<span className='text-danger'>*</span><input type="date" className="form-control mb-2" name='dob' value={newuser.dob} onChange={handleUserChange}/>
                  Aadhar<span className='text-danger'>*</span><input type="text" className="form-control mb-2" name="aadhar" value={newuser.aadhar} placeholder="XXXX-XXXX-XXXX" maxLength={14} onChange={handleAadharChange}/>                
                </div>
              </div>
                {/* <hr/> */}
              <div className="row">
                <div className="col-md-6">
                  <h6>Address</h6><hr/>
                  Address<span className='text-danger'>*</span><textarea name='address' className='form-control mb-2' value={newuser.address} onChange={handleUserChange}></textarea>
                  City<span className='text-danger'>*</span><input type="text" className="form-control mb-2" name='city' value={newuser.city} placeholder="City" onChange={handleUserChange}/>
                  State<span className='text-danger'>*</span><input type="text" className="form-control mb-2" name='state' value={newuser.state} placeholder="State" onChange={handleUserChange}/>
                  Pincode<span className='text-danger'>*</span><input type="text" className="form-control mb-2" name='pincode' value={newuser.pincode} placeholder="Pincode" onChange={handleUserChange}/>

                </div>
                <div className="col-md-6">
                  <h6>Occupation</h6><hr/>
                  Company Id<span className='text-danger'>*</span><input type="text" className="form-control mb-2" name='org_id' value={newuser.org_id} placeholder="Company ID" onChange={handleUserChange}/>
                  Designation<span className='text-danger'>*</span><input type="text" className="form-control mb-2" name='designation' value={student.designation} placeholder="Designation" onChange={handleStudentChange}/>
                  Company name<span className='text-danger'>*</span><input type="text" className="form-control mb-2" name='org_name' value={newuser.org_name} placeholder="Company name" onChange={handleUserChange}/>
                  <br></br>
                  {/* Expected Move-in Date<span className='text-danger'>*</span><input type="date" className="form-control mb-2" name='temp_check_in' value={newuser.temp_check_in} min={selectedRoom.check_out_date} max={selectedRoom.check_out_date+15} onChange={handleUserChange}/> */}
                </div>
              </div>
              
             <br/><br/>
              
              
            </div>

            <div className="modal-footer">
              
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button className="btn btn-primary" onClick={openConfirmModal}> Proceed </button>

            </div>

          </div>
        </div>
      </div>


      {/* Complaint / Report an issue Modal */}
     <div id="complaintModal" className="modal fade" tabIndex="-1">
     <div className="modal-dialog modal-lg">
     <div className="modal-content">

      <div className="modal-header">
        <h5 className="modal-title text-danger">Report an Issue</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <div className="modal-body">

        <div className="row">
          <div className="col-md-6">
            Guest Name<span className="text-danger">*</span>
            <input
              type="text"
              className="form-control mb-2"
              name="guest_name"
              value={complaint.guest_name} disabled
              onChange={handleComplaintChange}
            />

            Room No<span className="text-danger">*</span>
            <input
              type="number"
              className="form-control mb-2"
              name="room_no"
              value={complaint.room_no}
              onChange={handleComplaintChange} 
            />

            Complaint Type<span className="text-danger">*</span>
            <select
              className="form-control mb-2"
              name="comp_type"
              value={complaint.comp_type}
              onChange={handleComplaintChange}
            >
              <option value="">--Select--</option>
              <option value="Amenities">Amenities</option>
              <option value="Food">Food</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Pest">Pest</option>
              <option value="Bed">Bed</option>
               <option value="Room">Room</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Internet">Internet</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-md-6">
            Complaint<span className="text-danger">*</span>
            <textarea
              className="form-control mb-2"
              rows="6"
              name="complaint"
              value={complaint.complaint}
              onChange={handleComplaintChange}
              placeholder="Describe your issue"
            ></textarea>
          </div>
        </div>

      </div>

        <div className="modal-footer">
        <button className="btn btn-secondary" data-bs-dismiss="modal">
          Cancel
        </button>
        <button className="btn btn-danger" onClick={submitComplaint}>
          Submit Complaint
        </button>
         </div>
       </div>
     </div>
    </div>

    {/* after proceed we go to confirm booking*/}
    {/* Confirm Booking Modal */}
<div className="modal fade" id="confirmBookingModal" tabIndex="-1">
  <div className="modal-dialog modal-lg modal-dialog-centered">
    <div className="modal-content">

      <div className="modal-header">
        <h5 className="modal-title">Confirm Booking Details</h5>
        <button className="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <div className="modal-body">
        <p><b>Name:</b> {localStorage.getItem("student_name")}</p>
        <p><b>Room No.:</b> {localStorage.getItem("student_room")}</p>
        <p><b>Email:</b> {student.email}</p>
        <p><b>Mobile:</b> {student.mobile}</p>
        <p><b>Address:</b> {newuser.address}</p>
        <hr/>
        <p><b>Amount:</b> {localStorage.getItem("room_deposit")}</p>
        
      </div>

      <div className="modal-footer">
        <button className="btn btn-secondary" data-bs-dismiss="modal">
          Edit
        </button>

        <button className="btn btn-primary" onClick={openPaymentModal}>
          Confirm & Continue
        </button>
      </div>

    </div>
  </div>
</div>

    {/* Payment Modal */}
<div
  className="modal fade"
  id="paymentModal"
  tabIndex="-1"
  aria-hidden="true"
>
  <div className="modal-dialog modal-lg modal-dialog-centered">
    <div className="modal-content">

      {/* Header */}
      <div className="modal-header">
        <h5 className="modal-title">Payment Details</h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
        ></button>
      </div>

      {/* Body */}
      <div className="modal-body">

        <h6 className="fw-bold mb-2">Bank Account Details</h6>
        <table className="table table-bordered">
          <tbody>
            <tr>
              <th>Bank Name</th>
              <td>State Bank of India</td>
            </tr>
            <tr>
              <th>Account Number</th>
              <td>123456789012</td>
            </tr>
            <tr>
              <th>IFSC Code</th>
              <td>SBIN0001234</td>
            </tr>
            <tr>
              <th>Branch</th>
              <td>Kurla West</td>
            </tr>
          </tbody>
        </table>

        <div className="mb-3">
        <label className="form-label fw-bold">Transaction ID</label>
       <input type="text" className="form-control" value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
      placeholder="Enter transaction ID" /></div>

        <div className="mb-3">
        <label className="form-label fw-bold">Bank Name</label>
       <input
       type="text"
       className="form-control"
       value={bankName}
       onChange={(e) => setBankName(e.target.value)}
       placeholder="Enter bank name"
       />
      </div>

      </div>

      {/* Footer */}
      <div className="modal-footer">
        <button
          className="btn btn-secondary"
          data-bs-dismiss="modal"
        >
          Cancel
        </button>
        <button className="btn btn-success" onClick={handleBooking}> Confirm Payment</button>
      </div>
    </div>
  </div>
</div>

    <div className="modal fade" id="receiptModal">
  <div className="modal-dialog">
    <div className="modal-content">

      <div className="modal-header">
        <h5 className="modal-title">Payment Receipt</h5>
      </div>

      <div className="modal-body" id="receiptContent">
        <p><b>Room No:</b> {localStorage.getItem("student_room")}</p>
        <p><b>Transaction ID:</b> {transactionId}</p>
        <p><b>Bank Name:</b> {bankName}</p>
        <p><b>Amount:</b> ₹{localStorage.getItem("room_deposit")}</p>
        <p><b>Status:</b> Paid</p>
      </div>

      <div className="modal-footer">
        <button className="btn btn-primary" onClick={printReceipt}>
          Print Receipt
        </button>
        <button className="btn btn-secondary" data-bs-dismiss="modal">
          Close
        </button>
      </div>

    </div>
  </div>
</div>



    </>
    )
}