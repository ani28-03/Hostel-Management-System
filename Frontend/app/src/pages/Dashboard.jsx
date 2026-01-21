import react,{useState,useEffect} from 'react';
import './Dashboard.css'
import Rooms from './Rooms/Rooms';
import Tenants from './Tenants/Tenants';
import Payments from './Payments/Payments';
import Settings from './Settings/Settings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


export default function Dashboard(){
    
    const [activeTab, setActiveTab] = useState("tab1");
    const [username, setUsername] = useState("");

    useEffect(() => {
        const savedUser = localStorage.getItem("userName");
        if (savedUser) setUsername(savedUser);
    }, []);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.body.className = savedTheme + "-theme";
    }, []);

    const handleLogout = () => {
        const currentTheme = localStorage.getItem("theme");
        localStorage.clear();
        localStorage.setItem("theme", currentTheme); 
        window.location.href = "/";
    };
    
    return(
        <>
        
        {/* TOP BAR */}
            <div className="topbar d-flex align-items-center gap-4 px-4">
                <h4 id='title' className="mt-3 mb-4">HOSTEL MANAGER</h4>
                <input 
                    type="text" 
                    className="form-control searchbox" 
                    placeholder="Search rooms, tenants, payments..." 
                />

                <div className="loggeduser d-flex align-items-center gap-3">
                    <span>👤 Logged in as <b> {username.toUpperCase()}</b></span>

                    <button
                        className="btn btn-danger btn-sm"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="d-flex">

            {/* SIDEBAR */}
                <div className="sidebar">

                    <ul className="side-menu">
                        <li onClick={() => setActiveTab("tab1")}><FontAwesomeIcon icon={['far', 'house']} /> Dashboard</li>
                        <li onClick={() => setActiveTab("tab2")}><FontAwesomeIcon icon={['fas', 'bed']} /> Rooms</li>
                        <li onClick={() => setActiveTab("tab3")}><FontAwesomeIcon icon={['far', 'user']} /> Tenants</li>
                        <li onClick={() => setActiveTab("tab4")}><FontAwesomeIcon icon={['fas', 'receipt']} /> Payments</li>
                        <li onClick={() => setActiveTab("tab5")}><FontAwesomeIcon icon={['fas', 'wrench']} /> Maintenance</li>
                        <li onClick={() => setActiveTab("tab6")}><FontAwesomeIcon icon={['far', 'comment-dots']} /> Complaints</li>
                        <li onClick={() => setActiveTab("tab7")}><FontAwesomeIcon icon={['fas', 'gear']} /> Settings</li>
                    </ul>
                </div>

                <div className="content-area">
                    {activeTab === "tab1" && <div className="tabContent"> <h1>DashBoard</h1> </div>}
                    {activeTab === "tab2" && <div className="tabContent"> <div><Rooms/></div> </div>}
                    {activeTab === "tab3" && <div className="tabContent"> <div><Tenants/></div> </div>}
                    {activeTab === "tab4" && <div className="tabContent"> <div><Payments/></div> </div>}
                    {activeTab === "tab5" && <div className="tabContent"> <h1>Maintenance</h1> </div>}
                    {activeTab === "tab6" && <div className="tabContent"> <h1>Complaints</h1> </div>}
                    {activeTab === "tab7" && <div className="tabContent"> <div><Settings/></div> </div>}
                </div>
            </div>
        </>
    )
}