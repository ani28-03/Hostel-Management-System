import react,{useState,useEffect} from 'react';
import { DashboardServices } from '../DashboardServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid} from "recharts";
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

    useEffect(() => {
    console.log("Rooms data:", rooms);
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

    const RADIAN = Math.PI / 180;

    const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#000000"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                style={{ fontSize: "12px", fontWeight: 600 }}
            >
                {(percent * 100).toFixed(0)}%
            </text>
        );
    };

    const roomTypeData = [
        {
            type: "Single",
            occupied: rooms.filter(
                r =>
                    r.type?.toLowerCase() === "single" &&
                    r.guest_name !== null &&
                    r.guest_name !== ""
            ).length
        },
        {
            type: "Double",
            occupied: rooms.filter(
                r =>
                    r.type?.toLowerCase() === "double" &&
                    r.guest_name !== null &&
                    r.guest_name !== ""
            ).length
        },
        {
            type: "Ensuite",
            occupied: rooms.filter(
                r =>
                    r.type?.toLowerCase() === "ensuite" &&
                    r.guest_name !== null &&
                    r.guest_name !== ""
            ).length
        }
    ];



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

            {/* Pie chart  */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card shadow-sm p-3">
                        <h5 className="text-center mb-2">Room Occupancy</h5>

                        <div style={{ width: "100%", height: 280 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <defs>
                                        {colors.map((color, index) => (
                                            <linearGradient
                                                key={index}
                                                id={`grad-${index}`}
                                                x1="0"
                                                y1="0"
                                                x2="1"
                                                y2="1"
                                            >
                                                <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                                                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                                            </linearGradient>
                                        ))}
                                    </defs>

                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        paddingAngle={4}
                                        dataKey="value"
                                        labelLine={false}
                                        label={renderLabel}
                                        animationDuration={800}
                                        activeOuterRadius={120}
                                    >
                                        {data.map((_, index) => (
                                            <Cell key={index} fill={`url(#grad-${index})`} />
                                        ))}
                                    </Pie>

                                    {/* Center text */}
                                    <text
                                        x="50%"
                                        y="50%"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        style={{ fontSize: "18px", fontWeight: 700 }}
                                    >
                                        {statistics.totalRooms}
                                    </text>
                                    <text
                                        x="50%"
                                        y="57%"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        style={{ fontSize: "12px", fill: "#666" }}
                                    >
                                        Total Rooms
                                    </text>

                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            {/* bar chart  */}
                <div className="col-md-6">
                    <div className="card shadow-sm p-3">
                        <h5 className="text-center mb-3">
                            Occupied Rooms by Type
                        </h5>

                        <div style={{ width: "100%", height: 273 }}>
                            <ResponsiveContainer>
                                <BarChart data={roomTypeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="type" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />

                                    <Bar
                                        dataKey="occupied"
                                        name="Occupied Rooms"
                                        radius={[6, 6, 0, 0]}
                                        fill="#1e90ff"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
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