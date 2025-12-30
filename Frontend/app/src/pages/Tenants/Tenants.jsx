import react,{useState,useEffect} from 'react';
import { DashboardServices } from '../DashboardServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Tenants.css';

export default function Tenants(){

    const [tenants,setTenants] = useState([]);
    const [showForm, setShowForm] = useState(false); //Toggle Add button

    const [form,setForm] = useState({
        booking_id:"",
        guest_name:"", 
        room_no:"", 
        check_in_date:"", 
        check_out_date:"",
        email:"",
        mobile:"",
        designation:""
    });

    useEffect(() => {
      showTenants();
    }, []);

    const showTenants=async()=>{
        const data = await DashboardServices.getAll();
        console.log(data);
        setTenants(data);
    }; 
    
    const handleChange=async(event)=>{
        setForm({...form,[event.target.name]:event.target.value});
    };

    const handleAdd=async()=>{
        const {booking_id,guest_name, room_no, check_in_date, check_out_date, email, mobile, designation} = form;
        if(!booking_id||!guest_name||!room_no||!check_in_date||!check_out_date||!email||!mobile||!designation){
            alert("Please fill all fields!!!");
            return;
        }

        await DashboardServices.add(form);  
        await showTenants();
        setForm({
            booking_id:"",
            guest_name:"", 
            room_no:"", 
            check_in_date:"", 
            check_out_date:"",
            email:"",
            mobile:"",
            designation:""
        });

        setShowForm(false);
    };

    const handleDelete=async(booking_id)=>{
        if(!window.confirm("Proceed with Delete?")){
            return;
        }

        await DashboardServices.remove(booking_id);
        alert("Tenant Deleted!!!")
        setTenants((prev)=>prev.filter((t)=>t.booking_id!==booking_id));
        await showTenants();
    };

    const handleUpdate=async(tenant)=>{
        if(!window.confirm("Proceed with Update? This will delete Tenant info temporarily!!")){
            return;
        }

        setShowForm(true);

        setForm({
            booking_id:tenant.booking_id,
            guest_name:tenant.guest_name, 
            room_no:tenant.room_no, 
            check_in_date:tenant.check_in_date, 
            check_out_date:tenant.check_out_date,
            email:tenant.email,
            mobile:tenant.mobile,
            designation:tenant.designation
        });

        await DashboardServices.remove(tenant.booking_id);
        setTenants((prev)=>prev.filter((t)=>t.booking_id!==tenant.booking_id));
        await showTenants();
    };

    return(
        <>
        <div className='container-fluid'>
                    <div className="row">
                        <div className="col-md-8">
                            <h1>Tenants</h1>
                            <h5>Manage PG Tenants and thier information</h5>
                        </div>
                        <div className="col-md-2">
                            <button id="tenant-add-button" 
                                className="btn btn-primary mb-3"
                                onClick={() => setShowForm(!showForm)}>
                                {showForm ? "Close Form" : "Add Tenant"}
                            </button>
                        </div><hr/>
                    </div>
                    
                    <div id='row1' className='row'>

                            <div id='tenant-col-card' className='col-md-10'>
                                <div className='row'>
                                    {tenants.map((tenant) => (
                                        <div key={tenant.booking_id} className="col-md-4 mb-5">
                                        <div>
                                            <div id='tenant-card-body' className="card-body">

                                            {/* Card details */}   
                                            <div className='row'>
                                                <div className="col-md-4">
                                                    <img src={`/Tenants/${tenant.guest_name}.jpg`} 
                                                                onError={(e) => {e.target.onerror = null;e.target.src = "/Tenants/blank.png";}} //For backup photo
                                                                className="img-fluid profile" width={250} />
                                                </div>
                                                
                                                <div className="col-md-4">
                                                    <div id='tenant-name'><b>{tenant.guest_name}</b></div>
                                                    <span id='payment-status' className='alert alert-danger'>active</span>
                                                    <div id='tenant-room-no'>Room {tenant.room_no}</div>
                                                </div>
                                                <div id='tenant-id' className="col-md-4 text-secondary">
                                                    <h5># ID: {tenant.booking_id}</h5>
                                                </div>
                                                
                                            </div>
                                            <div className='row'>
                                                <div className='tenant-details'><FontAwesomeIcon icon={['far', 'calendar']}/> {tenant.check_in_date}</div>
                                                <div className='tenant-details'><FontAwesomeIcon icon={['far', 'envelope']}/> {tenant.email} </div>
                                                <div className='tenant-details'><FontAwesomeIcon icon={['fas', 'phone']}/> +91 {tenant.mobile} </div>
                                                <div className='tenant-details'><FontAwesomeIcon icon={['far', 'user']}/> {tenant.designation} </div>
                                            </div>
                                            <div className='row'>
                                                <div className="col-md-6 text-center price">
                                                    <div className='tenant-rent'> Rent</div><div className='tenant-rent'><b>₹{tenant.rent}</b></div>
                                                </div>
                                                <div className="col-md-6 text-center price">
                                                    <div className='tenant-deposit'> Deposit</div><div className='tenant-deposit'><b>₹{tenant.deposit}</b></div>
                                                </div>
                                            </div>
                                            <div className='row'>
                                                <div className="col-md-10">
                                                    <button id='tenant-edit-btn' className='btn btn-primary btn-sm ms-3' 
                                                            onClick={()=>handleUpdate(tenant)}>
                                                            <FontAwesomeIcon icon={['far', 'pen-to-square']}/>
                                                            Edit
                                                    </button>
                                                </div>
                                                <div className="col-md-2">
                                                    <button id='tenant-delete-btn' className='btn btn-danger btn-sm ms-3' 
                                                            onClick={()=>handleDelete(tenant.booking_id)}>
                                                            <FontAwesomeIcon icon={['far', 'trash-can']}/>
                                                    </button>

                                                </div>
                                            </div>

                                                        {/* <div><b>Check out: </b> {tenant.check_out_date}</div> */}
                                                                                        
                                            </div>
                                            </div>
                                        </div>
                                        
                                    ))}
                                </div>
                            </div>

                            <div id='col-form' className={`collapse-form ${showForm ? "open" : ""} col-md-2`}>
                                <h2>New Entry</h2><hr/>
                                <input className='form-control mb-3' placeholder='Booking Id' name='booking_id' value={form.booking_id} onChange={handleChange}/>
                                <input className='form-control mb-3' placeholder='Guest Name' name='guest_name' value={form.guest_name} onChange={handleChange}/>
                                <input className='form-control mb-3' placeholder='Room No' name='room_no' value={form.room_no} onChange={handleChange}/>
                                <input type='date' className='form-control mb-3' placeholder='Check-In' name='check_in_date' value={form.check_in_date} onChange={handleChange}/>
                                <input type='date' className='form-control mb-3' placeholder='Check-Out' name='check_out_date' value={form.check_out_date} onChange={handleChange}/>
                                <input type='email' className='form-control mb-3' placeholder='Email' name='email' value={form.email} onChange={handleChange}/>
                                <input className='form-control mb-3' placeholder='Mobile' name='mobile' value={form.mobile} onChange={handleChange}/>
                                <input className='form-control mb-3' placeholder='Designation' name='designation' value={form.designation} onChange={handleChange}/>
                                
                                <button className='btn btn-danger btn-sm' onClick={handleAdd}>ADD</button>
                            </div>

                        </div>
                    </div>
        </>
    )
}