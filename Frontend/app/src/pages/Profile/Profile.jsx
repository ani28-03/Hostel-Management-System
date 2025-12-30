import react,{useState,useEffect} from 'react';
import { DashboardServices } from '../DashboardServices';
import '../Settings/Settings.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
{/* <FontAwesomeIcon icon={['far', 'pen-to-square']}/> */}


export default function Profile(){

    const [password,setPassword] = useState("");                    //Original Password
    const [username, setUsername] = useState("");                   //Original Username
    const [newPassword,setnewPassword] = useState("");              //to change password
    const [confirmPassword,setconfirmPassword] = useState("");      //to change password
    
    const [changePassword, setchangePassword] = useState(false);    //Change password toggle state
    const [showPassword, setshowPassword] = useState(false);        //SHow/Hide password eye icon
    const [theme,setTheme] = useState("");                          //Theme toggle state


    useEffect(() => {
    const fetchData = async () => {
        const savedUser = localStorage.getItem("userName");

        if (savedUser) {
            setUsername(savedUser);
            console.log(username);
            const result = await DashboardServices.getPassword(savedUser);
            setPassword(result[0].password);
        }
    };

        fetchData();
    }, []);



    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        setTheme(savedTheme);
        document.body.className = savedTheme + "-theme";
    }, []);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.body.className = newTheme + "-theme";
    };

    const handlePasswordChange = async()=>{
        if(newPassword=="" || confirmPassword==""){
            alert("Please enter new Password first!!");
        }
        else if(newPassword===confirmPassword){
            // calling API to change password 
            await DashboardServices.changePassword(username, newPassword);

            // Updating the password of the user
            const result = await DashboardServices.getPassword(username);
            setPassword(result[0].password);

            // Clear Update form
            setnewPassword("");
            setconfirmPassword("");

            // Close the Password Tab
            setchangePassword(false);

            alert("Password updated successfully!");
        }
        else{
            alert("Password not Matching!!");
        }
    }
    
    return(
        <>
        <h1 id='setting-title'>Settings</h1><hr/>

        <div className="container-fluid">
            <div className="Settings-tabs">
                <div className="col-md-6">
                
                {/* Profile tab */}
                <div id='profile-tab' className="settings-item"><h3>Profile</h3>
                    <img id="profile" src={`../public/Students/${username}.jpg`}/>
                </div>

                {/*My Room*/}
                <div className="settings-item"><h3>My Room</h3>

                </div>

                {/* Theme tab */}
                <div className="settings-item">
                    <h3>Theme</h3>
                    <div className='theme-div'>
                        <label className='theme-opt'>
                            light <input type="radio" 
                                        name="theme" 
                                        value="light" 
                                        checked={theme === "light"}
                                        onChange={() => handleThemeChange("light")}/>
                        </label>

                        <label className='theme-opt'>
                            Dark <input type="radio" 
                                        name="theme" 
                                        value="dark" 
                                        checked={theme === "dark"}
                                        onChange={() => handleThemeChange("dark")}/>
                        </label>

                    </div>
                </div>

                {/* Change Password tab */}
                <div className={`settings-item-password ${changePassword ? "expanded" : ""}`}>
                    <div className="password-header">
                         <h3>Password</h3>          {/* Display Password */}
                        <input id='currPassword' type={showPassword?"text":"password"} value={password} disabled/>
                        {/* Eye icon  */}
                        {showPassword?(
                            <FontAwesomeIcon icon={['far', 'eye-slash']} className="show-password" onMouseLeave={() => setshowPassword(false)}/>
                        ):(
                            <FontAwesomeIcon icon={['far', 'eye']} className="show-password" onMouseEnter={() => setshowPassword(true)}/>
                        )
                        }
                        {/*Change Password */}
                        <span id='changePassword' onClick={() => setchangePassword(!changePassword)}>Change Password</span> 
                        <span>
                        <FontAwesomeIcon icon={['far', 'pen-to-square']} className="edit-icon" onClick={() => setchangePassword(!changePassword)}/>
                        </span>
                    </div>
                    {/* New Password form */}
                    <div className="password-content">
                        <div className='setting-password'>
                            Enter New Password
                            <input id='newPassword' type='password' name='newPassword' value={newPassword} onChange={(e)=>setnewPassword(e.target.value)} placeholder='Enter New Password'/>
                        </div>

                        <div className='setting-password'>
                            Confirm Password
                            <input id='confirmPassword' type='password' name='confirmPassword' value={confirmPassword} onChange={(e)=>setconfirmPassword(e.target.value)} placeholder='Confirm New Password'/>
                        </div>

                        <button id='updateButton' className="btn btn-primary mt-2" onClick={handlePasswordChange}>Update</button>
                    </div>
                </div>

                 {/* others => yet to be written */}   
                
                <div className="settings-item"><h3>Loading . . .</h3></div>
                </div>
            </div>
        </div>
        </>
    )
}