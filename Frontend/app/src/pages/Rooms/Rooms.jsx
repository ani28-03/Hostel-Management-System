import react,{useState,useEffect} from 'react';
import { DashboardServices } from '../DashboardServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import './Rooms.css';
import Tenants from '../Tenants/Tenants';

export default function Rooms(){

    const [rooms,setRooms] = useState([]);
    const [statistics, setStatistics] = useState({
        totalRooms:0,
        occupiedRooms:0
    });

    const [showForm, setShowForm] = useState(false); //Toggle Add button

    // Pie chart 
    const data =[
        {name:"Occupied Rooms", value:statistics.occupiedRooms},
        {name:"Vacant Rooms", value:statistics.totalRooms-statistics.occupiedRooms}
    ];
    const colors = ["#1e90ff", "#ff6b6b"];

    const [roomForm, setroomForm] = useState({
        room_no:"", 
        floor:"", 
        type:"", 
        rent:"", 
        deposit:"", 
        ac:0, 
        wifi:0, 
        tv:0,
        parking:0, 
        meals:0
    });

    useEffect(() => {
        showRooms();
    }, []);

    useEffect(() => {
        if (rooms.length > 0) {
            const total = rooms.length;
            const occupied = rooms.filter(r => r.guest_name).length;
            setStatistics({ totalRooms: total, occupiedRooms: occupied });
        }
    }, [rooms]);

    const showRooms= async()=>{
        const data = await DashboardServices.getRooms();
        setRooms(data);
    };

    const handleChange=async(event)=>{
        setroomForm({...roomForm, [event.target.name]:event.target.value});
    };

    const handleAdd=async(roomForm)=>{
        const {room_no, floor, type, rent, deposit} =roomForm;
        if(!room_no||!floor||!type||!rent||!deposit){
            alert("Enter All Fields!!");
            return;
        }

        await DashboardServices.addRoom(roomForm);
        await showRooms();

        setroomForm({
            room_no:"", 
            floor:"", 
            type:"", 
            rent:"", 
            deposit:"", 
            ac:0, 
            wifi:0, 
            tv:0,
            parking:0, 
            meals:0
        });

        setShowForm(false);
    };

    const handleUpdate=async(room)=>{
        if(!window.confirm("Proceed with Update? This will delete the Room temporarily!!")){
            return;
        }

        setShowForm(true);

        setroomForm({
            room_no:room.room_no, 
            floor:room.floor, 
            type:room.type, 
            rent:room.rent, 
            deposit:room.deposit, 
            ac:room.ac, 
            wifi:room.wifi, 
            tv:room.tv,
            parking:room.parking, 
            meals:room.meals
        });

        await DashboardServices.removeRoom(room.room_no);
        setRooms((prev)=>prev.filter((r)=>r.room_no!==room.room_no));
        await showRooms();
    };

    const handleDelete=async(room_no)=>{
        if(!window.confirm("Proceed with Delete?")){
            return;
        }

        await DashboardServices.removeRoom(room_no);
        alert("Room Deleted!!!")
        setRooms((prev)=>prev.filter((r)=>r.room_no!==room_no));
        await showRooms();        
    };

    const handleAmenityChange = (e) => {
        const { name, checked } = e.target;

        setroomForm(prev => ({
            ...prev,
            [name]: checked ? 1 : 0
        }));
    };

    // const goToTenants=()=>{
    //     return(<Tenants />);
    // }

    return(
        <>
        <div className='container-fluid'>

            <div className="row">
                <div className="col-md-8">
                    <h1>Rooms</h1>
                    <h5>Manage PG Rooms and their Details</h5><hr/>
                </div>
                <div className="col-md-2">
                    <button id="room-add-button" 
                        className="btn btn-primary mb-3"
                        onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Close Form" : "Add a Room"}
                    </button>
                </div>
            </div>

            <div className="row">
                <PieChart width={300} height={300}>
                <Pie
                    data={data}
                    cx={150}
                    cy={150}
                    outerRadius={120}
                    dataKey="value"
                    label
                >
                    {data.map((entry, index) => (
                    <Cell key={index} fill={colors[index]} />
                    ))}
                </Pie>

                <Tooltip />
                <Legend />
                </PieChart>
            </div>
            <div className="row">
                <div className='col-md-12'>
                    <div className='row'>
                    {/* Room card  */}
                    
                    <div id='room-col-card' className='col-md-12'>
                        <div id='room-card' className='row'>
                            {rooms.map((room) => (
                                <div key={room.room_no} className="col-md-5 mb-4">
                                <div className="card shadow">
                                    <div className="room-card-body">

                                        {/* Card details */}   
                                        <div className='row'>
                                                
                                                <div id='room-photo' className="col-md-6">
                                                    <img src={`Rooms/${room.room_no}.jpg`} 
                                                    onError={(e) => {e.target.onerror = null;e.target.src = "Rooms/blank.jpg";}} //For backup photo
                                                    className="img-fluid room-img" width={250} />
                                                </div>
                                                <div id='room_no' className="col-md-3"><h4>Room {room.room_no}</h4></div>
                                                <div id='room-status' className="col-md-3">
                                                {room.guest_name?(<span className='alert alert-danger room-status'><span>Occupied</span></span>
                                                    ):(<span className='alert alert-success room-status'><span>Vacant</span></span>)}</div>
                                                <div id='room-info' className="col-md-10 text-secondary">Description of the room. Description of the room. Description of the room. Description of the room. Description of the room<hr/></div>
                                        </div>

                                        <div className='row'>
                                            <div className="col-md-6 mb-3 room-type"><p>Type</p><b>{room.type}</b></div>
                                            <div className="col-md-6 mb-3 room-type"><p>Floor</p><b>{room.floor}</b></div>
                                        </div>

                                        <div className='row'>
                                            <div className="col-md-6 text-center">
                                                <div className='room-rent'> Rent</div><div className='room-rent'><b>₹{room.rent}</b></div>
                                            </div>
                                            <div className="col-md-6 text-center">
                                                <div className='room-deposit'> Deposit</div><div className='room-deposit'><b>₹{room.deposit}</b></div>
                                            </div>
                                        </div>
                                        
                                        <div className='row mb-2 mt-2'>
                                            {room.guest_name?( <div className='room-tenant-details'><FontAwesomeIcon icon={['far', 'user']} /*onClick={()=>goToTenants()}*//> {room.guest_name}</div>
                                        ):(
                                            <div className='room-tenant-details'><FontAwesomeIcon icon={['far', 'user']}/> ________________</div>
                                        )}
                                        </div>

                                        <div className="row">
                                            <div id='amenities' className="d-flex gap-3">
                                                {room.ac === 1 && (
                                                    <div className="room-amenities">
                                                        <FontAwesomeIcon icon={['fas', 'wind']} /> AC
                                                    </div>
                                                )}

                                                {room.wifi === 1 && (
                                                    <div className="room-amenities">
                                                        <FontAwesomeIcon icon={['fas', 'wifi']} /> Wifi
                                                    </div>
                                                )}

                                                {room.tv === 1 && (
                                                    <div className="room-amenities">
                                                        <FontAwesomeIcon icon={['fas', 'tv']} /> TV
                                                    </div>
                                                )}

                                                {room.parking === 1 && (
                                                    <div className="room-amenities">
                                                        <FontAwesomeIcon icon={['fas', 'square-parking']} /> Parking
                                                    </div>
                                                )}

                                                {room.meals === 1 && (
                                                    <div className="room-amenities">
                                                        <FontAwesomeIcon icon={['fas', 'utensils']} /> Meals
                                                    </div>
                                                )}

                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-10">
                                                <button id='room-edit-btn' className='btn btn-primary btn-sm ms-3' 
                                                        onClick={()=>handleUpdate(room)}>
                                                        <FontAwesomeIcon icon={['far', 'pen-to-square']}/>
                                                        Edit
                                                </button>
                                            </div>
                                            <div className="col-md-2">
                                                <button id='room-delete-btn' className='btn btn-danger btn-sm ms-3' 
                                                        onClick={()=>handleDelete(room.room_no)}>
                                                        <FontAwesomeIcon icon={['far', 'trash-can']}/>
                                                </button>
                                            </div>
                                        </div>
                                                                                
                                    </div>
                                </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div id='col-form' className={`collapse-form ${showForm ? "open" : ""} col-md-2`}>
                        <h2>Add New Room</h2><hr/>
                        {/* Testing  */}
                        <h5>Total: {statistics.totalRooms}</h5>
                        <h5>Occupied: {statistics.occupiedRooms}</h5>
                        <input className='form-control mb-3' placeholder='Room No' name='room_no' value={roomForm.room_no} onChange={handleChange}/>
                        <input className='form-control mb-3' placeholder='Floor' name='floor' value={roomForm.floor} onChange={handleChange}/>
                        
                        <select className='form-control mb-3' name='type' value={roomForm.type} onChange={handleChange}>
                            <option value="">-- Select Type --</option>
                            <option value="Single">Single</option>
                            <option value="Double">Double</option>
                        </select>
                        <input className='form-control mb-3' placeholder='Rent' name='rent' value={roomForm.rent} onChange={handleChange}/>
                        <input className='form-control mb-3' placeholder='Deposit' name='deposit' value={roomForm.deposit} onChange={handleChange}/>
                        
                        {/* Radio buttons for Amenaties */}
                        <div className="form-check mb-2">
                            <input className="form-check-input" type="checkbox" name="ac" checked={roomForm.ac === 1} onChange={handleAmenityChange}/>
                            <label className="form-check-label">AC</label>
                        </div>

                        <div className="form-check mb-2">
                            <input className="form-check-input" type="checkbox" name="wifi" checked={roomForm.wifi === 1} onChange={handleAmenityChange}/>
                            <label className="form-check-label">Wifi</label>
                        </div>

                        <div className="form-check mb-2">
                            <input className="form-check-input" type="checkbox" name="tv" checked={roomForm.tv === 1} onChange={handleAmenityChange}/>
                            <label className="form-check-label">TV</label>
                        </div>

                        <div className="form-check mb-2">
                            <input className="form-check-input" type="checkbox" name="parking" checked={roomForm.parking === 1} onChange={handleAmenityChange}/>
                            <label className="form-check-label">Parking</label>
                        </div>

                        <div className="form-check mb-4">
                            <input className="form-check-input" type="checkbox" name="meals" checked={roomForm.meals === 1} onChange={handleAmenityChange}/>
                            <label className="form-check-label">Meals</label>
                        </div>

                        <button className='btn btn-danger btn-sm' onClick={()=>handleAdd(roomForm)}>ADD</button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}